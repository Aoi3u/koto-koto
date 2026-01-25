'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useSeason } from '../hooks/useSeason';
import type { CombinedTheme } from '../config/seasons';

export type PaletteMode = 'stable' | 'dynamic';

type Palette = CombinedTheme['colors'];

interface ThemePalettes {
  stable: Palette;
  dynamic: Palette;
}

interface SeasonalContextValue {
  theme: CombinedTheme;
  palettes: ThemePalettes;
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

  const palettes: ThemePalettes = {
    stable: theme.colors,
    dynamic: { ...theme.colors, ...theme.adjustedColors },
  };

  return (
    <SeasonalContext.Provider value={{ theme, palettes }}>{children}</SeasonalContext.Provider>
  );
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

/**
 * Provides a normalized palette selection API to avoid ad-hoc access to colors/adjustedColors.
 * stable  : season-based palette (no time-of-day adjustments)
 * dynamic : time-of-day adjusted palette (matches previous adjustedColors)
 */
export function useThemePalette(mode: PaletteMode = 'dynamic'): {
  palette: Palette;
  mode: PaletteMode;
} {
  const context = useContext(SeasonalContext);
  if (!context) {
    throw new Error('useThemePalette must be used within SeasonalProvider');
  }

  const palette = mode === 'stable' ? context.palettes.stable : context.palettes.dynamic;
  return { palette, mode };
}
