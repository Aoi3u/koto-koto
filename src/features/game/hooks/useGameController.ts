import { useEffect, useCallback } from 'react';
import useGameSession from './useGameSession';
import useTypingEngine from './useTypingEngine';
import { GAME_CONFIG } from '../../../config/gameConfig';

export default function useGameController() {
  const {
    gameState,
    currentWord,
    elapsedTime,
    startGame,
    quitGame,
    nextWord,
    currentWordIndex,
    wordList,
    endGame,
  } = useGameSession();

  const {
    matchedRomaji,
    pendingInput,
    remainingTarget,
    matchedKana,
    shake,
    ripple,
    correctKeyCount,
    errorCount,
    currentCombo,
    maxCombo,
    handleInput,
    setTarget,
    resetEngine,
  } = useTypingEngine();

  // Sync Engine with Session Word
  useEffect(() => {
    if (gameState === 'playing' && currentWord) {
      // Only set the target - don't reset stats (they should persist across words)
      setTarget(currentWord.reading);
    } else if (gameState === 'waiting') {
      // Only reset when game stops, not between words
      resetEngine();
    }
  }, [gameState, currentWord, setTarget, resetEngine]);

  // Input Handler Wrapper
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (gameState === 'waiting') {
        if (e.key === 'Enter') {
          startGame();
        }
        return;
      }

      if (gameState !== 'playing') return;

      if (e.key.length !== 1 || e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();

      const result = handleInput(e.key.toLowerCase());

      if (result && result.isWordComplete) {
        // Check for Game Over immediately
        if (currentWordIndex + 1 >= wordList.length) {
          endGame();
        } else {
          // Delay for visual smoothness
          setTimeout(() => nextWord(), GAME_CONFIG.WORD_TRANSITION_DELAY_MS);
        }
      }
    },
    [gameState, startGame, handleInput, nextWord, endGame, currentWordIndex, wordList.length]
  );

  // Attach Listeners
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  return {
    // Session
    gameState,
    currentWord,
    elapsedTime,
    startGame,
    quitGame,
    currentWordIndex,
    totalSentences: wordList.length,

    // Engine / Stats
    matchedRomaji,
    pendingInput,
    remainingTarget,
    matchedKana,
    shake,
    ripple,
    correctKeyCount,
    errorCount,
    currentCombo,
    maxCombo,
  };
}
