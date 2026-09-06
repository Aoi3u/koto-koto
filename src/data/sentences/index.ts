export type { Sentence } from './types';
export { poetrySentences } from './poetry';
export { classicsSentences } from './classics';

import type { Sentence } from './types';
import { poetrySentences } from './poetry';
import { classicsSentences } from './classics';

export const sentences: Sentence[] = [...classicsSentences, ...poetrySentences];
