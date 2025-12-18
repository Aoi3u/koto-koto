import { useState, useCallback, useRef } from 'react';
import { getRandomSentences, Sentence } from '../../../data/sentences';
import { GAME_CONFIG } from '../../../config/gameConfig';

export type GameState = 'waiting' | 'playing' | 'finished';

export default function useGameSession() {
  const [gameState, setGameState] = useState<GameState>('waiting');
  // Initialize lazily to avoid heavy computation on every render, but ensure valid initial state
  const [wordList, setWordList] = useState<Sentence[]>(() =>
    getRandomSentences(GAME_CONFIG.TOTAL_SENTENCES)
  );
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // No useEffect for initialization - handled in quitGame/initial state

  const startGame = useCallback(() => {
    setGameState('playing');
    setElapsedTime(0);

    if (timerRef.current) clearInterval(timerRef.current);
    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const now = Date.now();
      setElapsedTime((now - startTime) / 1000);
    }, GAME_CONFIG.TIMER_INTERVAL_MS);
  }, []);

  const quitGame = useCallback(() => {
    setGameState('waiting');
    // Reset session data
    setWordList(getRandomSentences(GAME_CONFIG.TOTAL_SENTENCES));
    setCurrentWordIndex(0);
    setElapsedTime(0);

    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const endGame = useCallback(() => {
    setGameState('finished');
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const nextWord = useCallback(() => {
    setCurrentWordIndex((prev) => prev + 1);
  }, []);

  return {
    gameState,
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
