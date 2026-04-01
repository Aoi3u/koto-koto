import { useState, useCallback, useRef } from 'react';
import { getRandomSentences, Sentence } from '../../../data/sentences';
import { GAME_CONFIG } from '../../../config/gameConfig';
import { buildRandomWordBatch } from '../../../data/words';
import type { GameState } from '@/types/game';

export type GameMode = 'classic' | 'word-endless';

export default function useGameSession() {
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [gameMode, setGameMode] = useState<GameMode>('classic');
  // Initialize lazily to avoid heavy computation on every render, but ensure valid initial state
  const [wordList, setWordList] = useState<Sentence[]>(() =>
    getRandomSentences(GAME_CONFIG.TOTAL_SENTENCES)
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wordSequenceRef = useRef(0);

  const createWordModeBatch = useCallback((count: number): Sentence[] => {
    const batch = buildRandomWordBatch(count, wordSequenceRef.current);
    wordSequenceRef.current += batch.length;
    return batch;
  }, []);

  // No useEffect for initialization - handled in quitGame/initial state

  const startGame = useCallback(
    (mode: GameMode = 'classic') => {
      setGameMode(mode);
      setCurrentWordIndex(0);

      if (mode === 'word-endless') {
        wordSequenceRef.current = 0;
        setWordList(createWordModeBatch(GAME_CONFIG.ENDLESS_WORD_BATCH_SIZE));
      } else {
        setWordList(getRandomSentences(GAME_CONFIG.TOTAL_SENTENCES));
      }

      setGameState('playing');
      setElapsedTime(0);

      if (timerRef.current) clearInterval(timerRef.current);
      const startTime = Date.now();
      timerRef.current = setInterval(() => {
        const now = Date.now();
        setElapsedTime((now - startTime) / 1000);
      }, GAME_CONFIG.TIMER_INTERVAL_MS);
    },
    [createWordModeBatch]
  );

  const quitGame = useCallback(() => {
    setGameState('waiting');
    // Reset session data
    setGameMode('classic');
    setWordList(getRandomSentences(GAME_CONFIG.TOTAL_SENTENCES));
    setCurrentWordIndex(0);
    setElapsedTime(0);
    wordSequenceRef.current = 0;

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
          setWordList((prevList) => [
            ...prevList,
            ...createWordModeBatch(GAME_CONFIG.ENDLESS_WORD_BATCH_SIZE),
          ]);
        }
        return nextIndex;
      });
      return;
    }

    setCurrentWordIndex((prev) => prev + 1);
  }, [gameMode, wordList.length, createWordModeBatch]);

  return {
    gameState,
    gameMode,
    wordList,
    currentWordIndex,
    currentWord: wordList[currentWordIndex],
    elapsedTime,
    startGame,
    quitGame,
    endGame,
    nextWord,
  };
}
