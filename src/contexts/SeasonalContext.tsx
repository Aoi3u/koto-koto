'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSeason } from '../hooks/useSeason';
import type { CombinedTheme } from '../config/seasons';

interface SeasonalContextValue {
  theme: CombinedTheme;
}

const SeasonalContext = createContext<SeasonalContextValue | null>(null);

interface SeasonalProviderProps {
  children: ReactNode;
}

/**
 * Provides seasonal + time-of-day theme to all child components
 * Prevents unnecessary re-fetching of seasonal data across the component tree
 */
export function SeasonalProvider({ children }: SeasonalProviderProps) {
  const theme = useSeason();

  return <SeasonalContext.Provider value={{ theme }}>{children}</SeasonalContext.Provider>;
}

/**
 * Hook to access the current seasonal + time-of-day theme
 * Must be used within SeasonalProvider
 */
export function useSeasonalTheme(): CombinedTheme {
  const context = useContext(SeasonalContext);
  if (!context) {
    throw new Error('useSeasonalTheme must be used within SeasonalProvider');
  }
  return context.theme;
}
