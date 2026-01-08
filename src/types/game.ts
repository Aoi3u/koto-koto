/**
 * Core game type definitions
 * Centralized type system for game state, results, and matching logic
 */

/**
 * Game state machine states
 */
export type GameState = 'waiting' | 'playing' | 'finished';

/**
 * Input validation result from romaji matching
 */
export interface MatchResult {
  /** Whether the input partially or fully matches the target */
  isMatch: boolean;
  /** Romaji characters consumed from input */
  consumedInput: string;
  /** Kana characters matched in target */
  consumedTarget: string;
  /** Remaining target kana after match */
  remainingTarget: string;
}

/**
 * Typing engine state
 */
export interface TypingEngineState {
  // Matched characters
  matchedRomaji: string;
  matchedKana: string;

  // Input tracking
  pendingInput: string;
  remainingTarget: string;

  // Statistics
  correctKeyCount: number;
  errorCount: number;
  currentCombo: number;
  maxCombo: number;

  // Visual feedback
  shake: boolean;
  ripple: { x: number; y: number; id: number } | null;
}

/**
 * Game session state
 */
export interface GameSessionState {
  gameState: GameState;
  currentWordIndex: number;
  elapsedTime: number;
}

/**
 * Sentence/word data for typing
 */
export interface Sentence {
  text: string;
  reading: string; // Kana reading
  author?: string;
}

/**
 * Game result payload for API
 */
export interface GameResultPayload {
  wpm: number;
  accuracy: number; // 0-100
  keystrokes: number;
  correctKeystrokes?: number;
  elapsedTime: number; // milliseconds
  difficulty: string;
}

/**
 * Game result from database/API
 */
export interface GameResult {
  id: string;
  wpm: number;
  accuracy: number;
  keystrokes: number;
  correctKeystrokes: number;
  elapsedTime: number;
  difficulty: string;
  createdAt: Date;
  user?: {
    name: string | null;
    email: string;
  };
}

/**
 * Rank calculation result
 */
export interface RankResult {
  grade: string; // 'SSS', 'SS+', 'S', 'A', etc.
  title: string; // 'Nirvana', 'Heaven', etc.
  score: number; // Zen Score (WPM × Accuracy ÷ 100)
  color: string; // Tailwind CSS color class (e.g., 'text-blue-500')
}

/**
 * Ripple effect data for visual feedback
 */
export interface RippleEffect {
  x: number;
  y: number;
  id: number;
}
