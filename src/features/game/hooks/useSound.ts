'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

interface SoundProfileConfig {
  name: string;
  folder: string;
  variants: number;
}

const SOUND_PROFILES = {
  alpaca: { name: 'Alpaca', folder: 'alpaca', variants: 5 },
  blackink: { name: 'Black Ink', folder: 'blackink', variants: 5 },
  bluealps: { name: 'Blue Alps', folder: 'bluealps', variants: 5 },
  boxnavy: { name: 'Box Navy', folder: 'boxnavy', variants: 5 },
  buckling: { name: 'Buckling Spring', folder: 'buckling', variants: 5 },
  cream: { name: 'Cream', folder: 'cream', variants: 5 },
  holypanda: { name: 'Holy Panda', folder: 'holypanda', variants: 5 },
  mxblack: { name: 'Cherry MX Black', folder: 'mxblack', variants: 5 },
  mxblue: { name: 'Cherry MX Blue', folder: 'mxblue', variants: 5 },
  mxbrown: { name: 'Cherry MX Brown', folder: 'mxbrown', variants: 5 },
  redink: { name: 'Red Ink', folder: 'redink', variants: 5 },
  topre: { name: 'Topre', folder: 'topre', variants: 5 },
  turquoise: { name: 'Turquoise', folder: 'turquoise', variants: 5 },
} as const satisfies Record<string, SoundProfileConfig>;

export type KeyboardSoundProfile = keyof typeof SOUND_PROFILES;

export default function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<Map<string, AudioBuffer[]>>(new Map());
  const loadedProfilesRef = useRef<Set<string>>(new Set());
  const [currentProfile, setCurrentProfile] = useState<KeyboardSoundProfile>('topre');
  const [isLoading, setIsLoading] = useState(true);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [hasAudioSupport, setHasAudioSupport] = useState(true);

  useEffect(() => {
    // Initialize AudioContext on mount
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
        setHasAudioSupport(false);
        setIsLoading(false);
        return;
      }
      audioContextRef.current = new AudioContextClass();
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      setHasAudioSupport(false);
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

    // Helper: load audio buffers for a single profile
    const loadProfileAudio = async (profileKey: string) => {
      // Skip if already loaded
      if (loadedProfilesRef.current.has(profileKey)) {
        return;
      }

      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
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
          .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
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
    };

    // Preload audio files lazily: current profile first, others after idle
    const loadAudioFiles = async () => {
      if (!audioContextRef.current) {
        setIsLoading(false);
        return;
      }

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

    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close().catch((error) => {
          console.warn('Failed to close AudioContext:', error);
        });
      }
    };
  }, []);

  const changeProfile = useCallback(async (profile: KeyboardSoundProfile) => {
    setCurrentProfile(profile);
    try {
      localStorage.setItem('keyboard-sound-profile', profile);
    } catch (error) {
      console.warn('Failed to save profile to localStorage:', error);
      // Continue with profile change even if saving fails
    }

    // Load the profile audio asynchronously if not already loaded
    if (!loadedProfilesRef.current.has(profile) && audioContextRef.current) {
      setIsProfileLoading(true);
      try {
        await loadProfileAudio(profile);
      } catch (error) {
        console.error('Error loading profile audio:', error);
      } finally {
        setIsProfileLoading(false);
      }
    }
  }, []);

  const playKeySound = useCallback(() => {
    if (!audioContextRef.current || isLoading || isProfileLoading || !hasAudioSupport) return;

    try {
      // Resume context if suspended (browser policy)
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume().catch((error) => {
          console.warn('Failed to resume AudioContext:', error);
        });
      }

      const ctx = audioContextRef.current;
      const buffers = audioBuffersRef.current.get(currentProfile);

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
      const source = ctx.createBufferSource();
      source.buffer = buffer;

      // Add slight volume variation for realism
      const gainNode = ctx.createGain();
      gainNode.gain.value = 2.0 + Math.random() * 0.5;

      source.connect(gainNode);
      gainNode.connect(ctx.destination);

      source.onended = () => {
        source.disconnect();
        gainNode.disconnect();
      };

      source.start(0);
    } catch (error) {
      console.warn('Failed to play key sound:', error);
      // Silently fail - don't interrupt typing experience
    }
  }, [currentProfile, isLoading, isProfileLoading, hasAudioSupport]);

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
