'use client';

import useAudioContext from './useAudioContext';
import useSoundProfile from './useSoundProfile';
import useKeySound from './useKeySound';
import { SOUND_PROFILES, type KeyboardSoundProfile } from './sound-profiles';

export type { KeyboardSoundProfile };

/**
 * Composition hook that combines audio context, profile management, and sound playback
 */
export default function useSound() {
  const { getAudioContext, hasAudioSupport, isReady } = useAudioContext();

  const { currentProfile, changeProfile, audioBuffers, isLoading, isProfileLoading } =
    useSoundProfile({
      getAudioContext,
      hasAudioSupport,
      isReady,
    });

  const { playKeySound } = useKeySound({
    getAudioContext,
    audioBuffers,
    currentProfile,
    isLoading,
    isProfileLoading,
    hasAudioSupport,
  });

  return {
    playKeySound,
    currentProfile,
    changeProfile,
    availableProfiles: SOUND_PROFILES,
    isLoading,
    isProfileLoading,
    hasAudioSupport,
  };
}
