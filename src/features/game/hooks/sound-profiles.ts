export interface SoundProfileConfig {
  name: string;
  folder: string;
  variants: number;
}

export const SOUND_PROFILES = {
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
