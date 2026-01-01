'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import useSound from '../features/game/hooks/useSound';

// Return type of useSound
type SoundContextType = ReturnType<typeof useSound>;

const SoundContext = createContext<SoundContextType | null>(null);

export function SoundProvider({ children }: { children: ReactNode }) {
  const sound = useSound();
  return <SoundContext.Provider value={sound}>{children}</SoundContext.Provider>;
}

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within SoundProvider');
  }
  return context;
}
