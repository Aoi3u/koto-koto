import { useReducer, useCallback } from 'react';
import { checkRomaji, isValidPrefix } from '../../../lib/romaji';
import { useSoundContext } from '../../../contexts/SoundContext';
import type { RippleEffect, TypingEngineState } from '@/types/game';

type TypingEngineAction =
  | { type: 'SET_TARGET'; payload: string }
  | {
      type: 'PROCESS_INPUT';
      payload: { key: string; remainingTarget: string; pendingInput: string };
    }
  | { type: 'RESET' }
  | { type: 'SET_SHAKE'; payload: boolean }
  | {
      type: 'MARK_MATCH';
      payload: {
        matched: string;
        kanaMatched: string;
        newTarget: string;
        newPending: string;
        comboIncrement: number;
      };
    }
  | { type: 'MARK_PREFIX'; payload: string }
  | { type: 'MARK_ERROR' }
  | { type: 'SET_RIPPLE'; payload: RippleEffect | null };

const initialState: TypingEngineState = {
  matchedRomaji: '',
  matchedKana: '',
  pendingInput: '',
  remainingTarget: '',
  correctKeyCount: 0,
  errorCount: 0,
  currentCombo: 0,
  maxCombo: 0,
  shake: false,
  ripple: null,
};

function typingEngineReducer(
  state: TypingEngineState,
  action: TypingEngineAction
): TypingEngineState {
  switch (action.type) {
    case 'SET_TARGET':
      return {
        ...state,
        remainingTarget: action.payload,
        matchedKana: '',
        matchedRomaji: '',
        pendingInput: '',
      };

    case 'RESET':
      return initialState;

    case 'MARK_MATCH': {
      const newCombo = state.currentCombo + 1;
      return {
        ...state,
        correctKeyCount: state.correctKeyCount + 1,
        currentCombo: newCombo,
        maxCombo: Math.max(state.maxCombo, newCombo),
        matchedRomaji: state.matchedRomaji + action.payload.matched,
        matchedKana: state.matchedKana + action.payload.kanaMatched,
        remainingTarget: action.payload.newTarget,
        pendingInput: action.payload.newPending,
      };
    }

    case 'MARK_PREFIX':
      return {
        ...state,
        correctKeyCount: state.correctKeyCount + 1,
        pendingInput: action.payload,
      };

    case 'MARK_ERROR':
      return {
        ...state,
        shake: true,
        errorCount: state.errorCount + 1,
        currentCombo: 0,
      };

    case 'SET_SHAKE':
      return {
        ...state,
        shake: action.payload,
      };

    case 'SET_RIPPLE':
      return {
        ...state,
        ripple: action.payload,
      };

    default:
      return state;
  }
}

export default function useTypingEngine() {
  const [state, dispatch] = useReducer(typingEngineReducer, initialState);
  const { playKeySound } = useSoundContext();

  const resetEngine = useCallback(() => {
    dispatch({ type: 'RESET' });
  }, []);

  const setTarget = useCallback((newTarget: string) => {
    dispatch({ type: 'SET_TARGET', payload: newTarget });
  }, []);

  const processInput = useCallback(
    (currentPending: string, currentTarget: string) => {
      let pending = currentPending;
      let target = currentTarget;
      let totalMatchedRomaji = '';
      let totalMatchedKana = '';
      let comboAdd = 0;

      while (true) {
        const result = checkRomaji(target, pending);
        if (result && result.isMatch) {
          playKeySound();
          totalMatchedRomaji += result.consumedInput;
          totalMatchedKana += result.consumedTarget;
          target = result.remainingTarget;
          pending = pending.slice(result.consumedInput.length);
          comboAdd++;
          dispatch({ type: 'SET_RIPPLE', payload: { x: 0, y: 0, id: Date.now() + Math.random() } });
        } else {
          break;
        }
        if (target === '' || pending === '') break;
      }

      return {
        newPending: pending,
        newTarget: target,
        matched: totalMatchedRomaji,
        kanaMatched: totalMatchedKana,
        comboIncrement: comboAdd,
      };
    },
    [playKeySound]
  );

  const handleInput = useCallback(
    (key: string) => {
      if (!/^[a-z0-9\-,\.]$/.test(key)) return;

      const nextInput = state.pendingInput + key;
      const { newPending, newTarget, matched, kanaMatched, comboIncrement } = processInput(
        nextInput,
        state.remainingTarget
      );

      if (comboIncrement > 0) {
        dispatch({
          type: 'MARK_MATCH',
          payload: { matched, kanaMatched, newTarget, newPending, comboIncrement },
        });
        return { isWordComplete: newTarget === '' };
      } else {
        if (isValidPrefix(state.remainingTarget, nextInput)) {
          playKeySound();
          dispatch({ type: 'MARK_PREFIX', payload: nextInput });
        } else {
          dispatch({ type: 'MARK_ERROR' });
          setTimeout(() => dispatch({ type: 'SET_SHAKE', payload: false }), 300);
        }
        return { isWordComplete: false };
      }
    },
    [state.pendingInput, state.remainingTarget, processInput, playKeySound]
  );

  return {
    matchedRomaji: state.matchedRomaji,
    pendingInput: state.pendingInput,
    remainingTarget: state.remainingTarget,
    matchedKana: state.matchedKana,
    shake: state.shake,
    ripple: state.ripple,
    correctKeyCount: state.correctKeyCount,
    errorCount: state.errorCount,
    currentCombo: state.currentCombo,
    maxCombo: state.maxCombo,
    handleInput,
    resetEngine,
    setTarget,
  };
}
