'use client';

import { useEffect, useRef, useState } from 'react';

export default function useAudioContext() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [hasAudioSupport, setHasAudioSupport] = useState<boolean | null>(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // Initialize AudioContext on mount - state updates are intentional here
    let success = false;
    try {
      const AudioContextClass =
        window.AudioContext ||
        (
          window as Window & {
            webkitAudioContext?: typeof AudioContext;
          }
        ).webkitAudioContext;
      if (!AudioContextClass) {
        console.warn('AudioContext is not supported in this browser');
      } else {
        audioContextRef.current = new AudioContextClass();
        success = true;
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
    }

    // Schedule state updates to avoid synchronous setState in effect
    Promise.resolve().then(() => {
      setHasAudioSupport(success);
      setIsReady(success);
    });

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch((error) => {
          console.warn('Failed to close AudioContext:', error);
        });
      }
    };
  }, []);

  // Return ref getter function instead of direct ref access
  return {
    getAudioContext: () => audioContextRef.current,
    hasAudioSupport: hasAudioSupport ?? true,
    isReady,
  };
}
