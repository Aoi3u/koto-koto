import { useState, useCallback } from "react";
import { checkRomaji, isValidPrefix } from "../../../lib/romaji";
import useSound from "./useSound";

export default function useTypingEngine() {
  const [matchedRomaji, setMatchedRomaji] = useState("");
  const [pendingInput, setPendingInput] = useState("");
  const [remainingTarget, setRemainingTarget] = useState("");
  const [matchedKana, setMatchedKana] = useState("");

  const [shake, setShake] = useState(false);
  const [ripple, setRipple] = useState<{
    x: number;
    y: number;
    id: number;
  } | null>(null);

  const [correctKeyCount, setCorrectKeyCount] = useState(0);
  const [errorCount, setErrorCount] = useState(0);
  const [currentCombo, setCurrentCombo] = useState(0);
  const [maxCombo, setMaxCombo] = useState(0);

  const { playKeySound, currentProfile, changeProfile, availableProfiles } =
    useSound();

  const resetEngine = useCallback(() => {
    setMatchedRomaji("");
    setPendingInput("");
    setRemainingTarget("");
    setMatchedKana("");
    setCorrectKeyCount(0);
    setErrorCount(0);
    setCurrentCombo(0);
    setMaxCombo(0);
    setShake(false);
  }, []);

  const setTarget = useCallback((newTarget: string) => {
    setRemainingTarget(newTarget);
    setMatchedKana("");
    setMatchedRomaji("");
    setPendingInput("");
  }, []);

  const processInput = useCallback(
    (
      currentPending: string,
      currentTarget: string
    ): {
      newPending: string;
      newTarget: string;
      matched: string; // Romaji
      kanaMatched: string; // Kana
      comboIncrement: number;
    } => {
      let pending = currentPending;
      let target = currentTarget;
      let totalMatchedRomaji = "";
      let totalMatchedKana = "";
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
          setRipple({ x: 0, y: 0, id: Date.now() + Math.random() });
        } else {
          break;
        }
        if (target === "" || pending === "") break;
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

      const nextInput = pendingInput + key;

      const { newPending, newTarget, matched, kanaMatched, comboIncrement } =
        processInput(nextInput, remainingTarget);

      if (comboIncrement > 0) {
        setCorrectKeyCount((c) => c + 1);
        setCurrentCombo((prev) => {
          const newCombo = prev + 1;
          setMaxCombo((m) => Math.max(m, newCombo));
          return newCombo;
        });
        setMatchedRomaji((prev) => prev + matched);
        setMatchedKana((prev) => prev + kanaMatched);
        setRemainingTarget(newTarget);
        setPendingInput(newPending);

        return { isWordComplete: newTarget === "" };
      } else {
        if (isValidPrefix(remainingTarget, nextInput)) {
          setCorrectKeyCount((c) => c + 1);
          playKeySound();
          setPendingInput(nextInput);
        } else {
          setShake(true);
          setTimeout(() => setShake(false), 300);
          setErrorCount((c) => c + 1);
          setCurrentCombo(0);
        }
        return { isWordComplete: false };
      }
    },
    [pendingInput, remainingTarget, processInput, playKeySound]
  );

  return {
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
    resetEngine,
    setTarget,
    currentProfile,
    changeProfile,
    availableProfiles,
  };
}
