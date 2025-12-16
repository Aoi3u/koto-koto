"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface SoundProfileConfig {
  name: string;
  folder: string;
  variants: number;
}

const SOUND_PROFILES = {
  alpaca: { name: "Alpaca", folder: "alpaca", variants: 5 },
  blackink: { name: "Black Ink", folder: "blackink", variants: 5 },
  bluealps: { name: "Blue Alps", folder: "bluealps", variants: 5 },
  boxnavy: { name: "Box Navy", folder: "boxnavy", variants: 5 },
  buckling: { name: "Buckling Spring", folder: "buckling", variants: 5 },
  cream: { name: "Cream", folder: "cream", variants: 5 },
  holypanda: { name: "Holy Panda", folder: "holypanda", variants: 5 },
  mxblack: { name: "Cherry MX Black", folder: "mxblack", variants: 5 },
  mxblue: { name: "Cherry MX Blue", folder: "mxblue", variants: 5 },
  mxbrown: { name: "Cherry MX Brown", folder: "mxbrown", variants: 5 },
  redink: { name: "Red Ink", folder: "redink", variants: 5 },
  topre: { name: "Topre", folder: "topre", variants: 5 },
  turquoise: { name: "Turquoise", folder: "turquoise", variants: 5 },
} as const satisfies Record<string, SoundProfileConfig>;

export type KeyboardSoundProfile = keyof typeof SOUND_PROFILES;

export default function useSound() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioBuffersRef = useRef<
    Map<string, AudioBuffer[]>
  >(new Map());
  const [currentProfile, setCurrentProfile] =
    useState<KeyboardSoundProfile>("topre");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize AudioContext on mount
    const AudioContextClass =
      window.AudioContext || (window as Window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioContextRef.current = new AudioContextClass();
    }

    // Load saved profile from localStorage
    const savedProfile = localStorage.getItem(
      "keyboard-sound-profile"
    ) as KeyboardSoundProfile | null;
    if (savedProfile && SOUND_PROFILES[savedProfile]) {
      setCurrentProfile(savedProfile);
    }

    // Preload audio files for all profiles
    const loadAudioFiles = async () => {
      if (!audioContextRef.current) return;

      const ctx = audioContextRef.current;
      const loadPromises: Promise<void>[] = [];

      for (const [profileKey, config] of Object.entries(SOUND_PROFILES)) {
        const buffers: AudioBuffer[] = [];

        for (let i = 0; i < config.variants; i++) {
          const path = `/audio/${config.folder}/press/GENERIC_R${i}.mp3`;

          const promise = fetch(path)
            .then((response) => response.arrayBuffer())
            .then((arrayBuffer) => ctx.decodeAudioData(arrayBuffer))
            .then((audioBuffer) => {
              buffers[i] = audioBuffer;
            })
            .catch((error) => {
              console.warn(`Failed to load ${path}:`, error);
            });

          loadPromises.push(promise);
        }

        audioBuffersRef.current.set(profileKey, buffers);
      }

      await Promise.all(loadPromises);
      setIsLoading(false);
    };

    loadAudioFiles();

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const changeProfile = useCallback((profile: KeyboardSoundProfile) => {
    setCurrentProfile(profile);
    localStorage.setItem("keyboard-sound-profile", profile);
  }, []);

  const playKeySound = useCallback(() => {
    if (!audioContextRef.current || isLoading) return;

    // Resume context if suspended (browser policy)
    if (audioContextRef.current.state === "suspended") {
      audioContextRef.current.resume();
    }

    const ctx = audioContextRef.current;
    const buffers = audioBuffersRef.current.get(currentProfile);

    if (!buffers || buffers.length === 0) return;

    // Pick a random variant
    const randomIndex = Math.floor(Math.random() * buffers.length);
    const buffer = buffers[randomIndex];

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
  }, [currentProfile, isLoading]);

  return {
    playKeySound,
    currentProfile,
    changeProfile,
    availableProfiles: SOUND_PROFILES,
    isLoading,
  };
}
