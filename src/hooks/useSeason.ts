'use client';

import { useState, useEffect } from 'react';
import { getCombinedTheme, type CombinedTheme } from '@/config/seasons';

/**
 * Hook to get the current seasonal + time-of-day theme
 * Updates whenever the component mounts (in case user keeps the app open across seasons/times)
 */
export function useSeason() {
  const [theme, setTheme] = useState<CombinedTheme>(() => getCombinedTheme());

  useEffect(() => {
    // Check for season/time change every 10 minutes
    const interval = setInterval(
      () => {
        setTheme(getCombinedTheme());
      },
      1000 * 60 * 10
    ); // 10 minutes

    return () => clearInterval(interval);
  }, []);

  return theme;
}
