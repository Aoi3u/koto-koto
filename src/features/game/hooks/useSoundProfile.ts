'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { SOUND_PROFILES, type KeyboardSoundProfile } from './sound-profiles';

interface UseSoundProfileOptions {
  getAudioContext: () => AudioContext | null;
  hasAudioSupport: boolean;
  isReady: boolean;
}

export default function useSoundProfile({
  getAudioContext,
  hasAudioSupport,
  isReady,
}: UseSoundProfileOptions) {
  const audioBuffersRef = useRef<Map<string, AudioBuffer[]>>(new Map());
  const loadedProfilesRef = useRef<Set<string>>(new Set());
  const [currentProfile, setCurrentProfile] = useState<KeyboardSoundProfile>('topre');
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);

  // Helper: load audio buffers for a single profile
  const loadProfileAudio = useCallback(
    async (profileKey: string) => {
      // Skip if already loaded
      if (loadedProfilesRef.current.has(profileKey)) {
        return;
      }

      const audioContext = getAudioContext();
      if (!audioContext) return;
      const config = SOUND_PROFILES[profileKey as KeyboardSoundProfile];
      if (!config) return;

      const buffers: AudioBuffer[] = [];
      const promises: Promise<void>[] = [];
      for (let i = 0; i < config.variants; i++) {
        const path = `/audio/${config.folder}/press/GENERIC_R${i}.mp3`;
        const p = fetch(path)
          .then((response) => {
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return response.arrayBuffer();
          })
          .then((arrayBuffer) => audioContext.decodeAudioData(arrayBuffer))
          .then((audioBuffer) => {
            buffers[i] = audioBuffer;
          })
          .catch((error) => {
            console.warn(`Failed to load ${path}:`, error);
          });
        promises.push(p);
      }
      await Promise.allSettled(promises);
      audioBuffersRef.current.set(profileKey, buffers);
      loadedProfilesRef.current.add(profileKey);
    },
    [getAudioContext]
  );

  useEffect(() => {
    if (!hasAudioSupport || !isReady) {
      setIsLoading(false);
      return;
    }

    // Resolve initial profile (from localStorage) without depending on state
    let initialProfile: KeyboardSoundProfile = 'topre';
    try {
      const savedProfile = localStorage.getItem(
        'keyboard-sound-profile'
      ) as KeyboardSoundProfile | null;
      if (savedProfile && SOUND_PROFILES[savedProfile]) {
        initialProfile = savedProfile;
        setCurrentProfile(savedProfile);
      }
    } catch (error) {
      console.warn('Failed to access localStorage:', error);
      // Continue with default profile
    }

    // Preload audio files lazily: current profile first, others after idle
    const loadAudioFiles = async () => {
      // 1) Load initial profile only for initial interactivity
      try {
        await loadProfileAudio(initialProfile);
      } catch (error) {
        console.error('Error loading current profile audio:', error);
      } finally {
        setIsLoading(false);
      }

      // 2) Defer loading of other profiles until idle (won't affect LCP)
      const loadRest = () => {
        const others = Object.keys(SOUND_PROFILES).filter((k) => k !== initialProfile);
        others.reduce<Promise<void>>(async (prev, key) => {
          await prev;
          await loadProfileAudio(key);
        }, Promise.resolve());
      };

      // Prefer requestIdleCallback when available with safe type narrowing
      const ric = (
        window as Window & {
          requestIdleCallback?: (cb: IdleRequestCallback, options?: IdleRequestOptions) => number;
        }
      ).requestIdleCallback;
      if (typeof ric === 'function') {
        ric(() => loadRest());
      } else {
        setTimeout(loadRest, 0);
      }
    };

    loadAudioFiles();
  }, [loadProfileAudio, hasAudioSupport, isReady]);

  const changeProfile = useCallback(
    async (profile: KeyboardSoundProfile) => {
      setCurrentProfile(profile);
      try {
        localStorage.setItem('keyboard-sound-profile', profile);
      } catch (error) {
        console.warn('Failed to save profile to localStorage:', error);
        // Continue with profile change even if saving fails
      }

      // Load the profile audio asynchronously if not already loaded
      if (!loadedProfilesRef.current.has(profile)) {
        setIsProfileLoading(true);
        try {
          await loadProfileAudio(profile);
        } catch (error) {
          console.error('Error loading profile audio:', error);
        } finally {
          setIsProfileLoading(false);
        }
      }
    },
    [loadProfileAudio]
  );

  return {
    currentProfile,
    changeProfile,
    audioBuffers: audioBuffersRef.current,
    isLoading,
    isProfileLoading,
  };
}
