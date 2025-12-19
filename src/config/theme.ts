import { getCurrentSeasonalTheme } from './seasons';

export const THEME = {
  colors: {
    zenDark: '#1a1a1a', // Approximate from usage
    offWhite: '#f5f5f7',
    subtleGray: '#a1a1aa',
    sakura: '#fbcfe8',
    matcha: '#a7f3d0',
    gold: '#fde047',
    charcoal: '#27272a',
    cyan: '#22d3ee',
  },
  fonts: {
    zenOldMincho: "'Zen Old Mincho', serif",
    inter: "'Inter', sans-serif",
    mono: "'JetBrains Mono', monospace",
  },
  rankColors: {
    SSS: 'text-amber-300 drop-shadow-[0_0_25px_rgba(253,224,71,0.4)]',
    SS: 'text-amber-200/90 drop-shadow-[0_0_15px_rgba(253,224,71,0.3)]',
    S_PLUS: 'text-amber-100/80 drop-shadow-[0_0_10px_rgba(253,224,71,0.2)]',
    S: 'text-amber-100/70 drop-shadow-sm',
    S_MINUS: 'text-amber-50/60 drop-shadow-sm',
    A_PLUS: 'text-zinc-200',
    A: 'text-zinc-300',
    A_MINUS: 'text-zinc-300/90',
    B_PLUS: 'text-stone-400',
    B: 'text-stone-400/90',
    B_MINUS: 'text-stone-500',
    C_PLUS: 'text-zinc-600',
    C: 'text-zinc-700',
  },
  seasonal: getCurrentSeasonalTheme,
} as const;
