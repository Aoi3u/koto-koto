import { useState, useCallback, useRef } from 'react';
import type { Sentence } from '../../../data/sentences';
import { GAME_CONFIG } from '../../../config/gameConfig';
import type { GameState } from '@/types/game';

export type GameMode = 'classic' | 'word-endless';

const DEFAULT_LOAD_ERROR = 'Failed to load problem pool. Please try again.';

const modeToQueryValue = (mode: GameMode) => (mode === 'classic' ? 'classic' : 'word-endless');

async function fetchProblemBatch(mode: GameMode, count: number): Promise<Sentence[]> {
  const query = new URLSearchParams({
    mode: modeToQueryValue(mode),
    count: String(count),
  });

  const response = await fetch(`/api/problem-pool?${query.toString()}`, {
    method: 'GET',
    cache: 'no-store',
  });

  const payload = (await response.json().catch(() => null)) as {
    problems?: Sentence[];
    error?: string;
  } | null;

  if (!response.ok) {
    throw new Error(payload?.error ?? DEFAULT_LOAD_ERROR);
  }

  if (!payload?.problems || !Array.isArray(payload.problems) || payload.problems.length === 0) {
    throw new Error(DEFAULT_LOAD_ERROR);
  }

  return payload.problems;
}

export default function useGameSession() {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  const [wordList, setWordList] = useState<Sentence[]>([]);
  const [isProblemLoading, setIsProblemLoading] = useState(false);
  const [problemLoadError, setProblemLoadError] = useState<string | null>(null);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const refillInFlightRef = useRef(false);

  const refillEndlessBatch = useCallback(async () => {
    if (refillInFlightRef.current) return;
    refillInFlightRef.current = true;

    try {
      const batch = await fetchProblemBatch('word-endless', GAME_CONFIG.ENDLESS_WORD_BATCH_SIZE);
      setWordList((prevList) => [...prevList, ...batch]);
    } catch {
      setProblemLoadError(DEFAULT_LOAD_ERROR);
    } finally {
      refillInFlightRef.current = false;
    }
  }, []);

  const startGame = useCallback(
    async (mode: GameMode = 'classic') => {
      if (isProblemLoading) return;

      setIsProblemLoading(true);
      setProblemLoadError(null);
      setGameMode(mode);
      setCurrentWordIndex(0);
      setElapsedTime(0);

      try {
        const initialCount =
          mode === 'word-endless'
            ? GAME_CONFIG.ENDLESS_WORD_BATCH_SIZE
            : GAME_CONFIG.TOTAL_SENTENCES;
        const batch = await fetchProblemBatch(mode, initialCount);
        setWordList(batch);
      } catch {
        setGameState('waiting');
        setWordList([]);
        setIsProblemLoading(false);
        setProblemLoadError(DEFAULT_LOAD_ERROR);
        return;
      }

      setGameState('playing');

      if (timerRef.current) clearInterval(timerRef.current);
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setElapsedTime((now - startTime) / 1000);
      }, GAME_CONFIG.TIMER_INTERVAL_MS);

      setIsProblemLoading(false);
    },
    [isProblemLoading]
  );

  const quitGame = useCallback(() => {
    setGameState('waiting');
    // Reset session data
    setGameMode('classic');
    setWordList([]);
    setCurrentWordIndex(0);
    setElapsedTime(0);
    setProblemLoadError(null);
    setIsProblemLoading(false);

    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const endGame = useCallback(() => {
    setGameState('finished');
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const nextWord = useCallback(() => {
    if (gameMode === 'word-endless') {
      setCurrentWordIndex((prev) => {
        const nextIndex = prev + 1;
        if (nextIndex >= wordList.length - GAME_CONFIG.ENDLESS_WORD_REFILL_THRESHOLD) {
          void refillEndlessBatch();
        }
        return nextIndex;
      });
      return;
    }

    setCurrentWordIndex((prev) => prev + 1);
  }, [gameMode, wordList.length, refillEndlessBatch]);

  return {
    gameState,
    gameMode,
    wordList,
    isProblemLoading,
    problemLoadError,
    currentWordIndex,
    currentWord: wordList[currentWordIndex],
    elapsedTime,
    startGame,
    quitGame,
    endGame,
    nextWord,
  };
}
