'use client';

import { useCallback } from 'react';

interface UseKeySoundOptions {
  getAudioContext: () => AudioContext | null;
  audioBuffers: Map<string, AudioBuffer[]>;
  currentProfile: string;
  isLoading: boolean;
  isProfileLoading: boolean;
  hasAudioSupport: boolean;
}

export default function useKeySound({
  getAudioContext,
  audioBuffers,
  currentProfile,
  isLoading,
  isProfileLoading,
  hasAudioSupport,
}: UseKeySoundOptions) {
  const playKeySound = useCallback(() => {
    const audioContext = getAudioContext();
    if (!audioContext || isLoading || isProfileLoading || !hasAudioSupport) return;

    try {
      // Resume context if suspended (browser policy)
      if (audioContext.state === 'suspended') {
        audioContext.resume().catch((error) => {
          console.warn('Failed to resume AudioContext:', error);
        });
      }

      const buffers = audioBuffers.get(currentProfile);

      if (!buffers || buffers.length === 0) {
        console.warn(`No audio buffers available for profile: ${currentProfile}`);
        return;
      }

      // Filter out undefined buffers (failed loads)
      const validBuffers = buffers.filter((buffer) => buffer !== undefined);
      if (validBuffers.length === 0) {
        console.warn(`No valid audio buffers for profile: ${currentProfile}`);
        return;
      }

      // Pick a random variant from valid buffers
      const randomIndex = Math.floor(Math.random() * validBuffers.length);
      const buffer = validBuffers[randomIndex];

      if (!buffer) return;

      // Create and play the audio source
      const source = audioContext.createBufferSource();
      source.buffer = buffer;

      // Add slight volume variation for realism
      const gainNode = audioContext.createGain();
      gainNode.gain.value = 2.0 + Math.random() * 0.5;

      source.connect(gainNode);
      gainNode.connect(audioContext.destination);

      source.onended = () => {
        source.disconnect();
        gainNode.disconnect();
      };

      source.start(0);
    } catch (error) {
      console.warn('Failed to play key sound:', error);
      // Silently fail - don't interrupt typing experience
    }
  }, [getAudioContext, audioBuffers, currentProfile, isLoading, isProfileLoading, hasAudioSupport]);

  return { playKeySound };
}
