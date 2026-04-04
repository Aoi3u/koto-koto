export type { Sentence } from './types';
export { natsumeSosekiSentences } from './natsume-soseki';
export { dazaiOsamuSentences } from './dazai-osamu';
export { miyazawaKenjiSentences } from './miyazawa-kenji';
export { akutagawaRyunosukeSentences } from './akutagawa-ryunosuke';
export { modernAuthorsSentences } from './modern-authors';
export { poetrySentences } from './poetry';
export { classicsSentences } from './classics';

import type { Sentence } from './types';
import { natsumeSosekiSentences } from './natsume-soseki';
import { dazaiOsamuSentences } from './dazai-osamu';
import { miyazawaKenjiSentences } from './miyazawa-kenji';
import { akutagawaRyunosukeSentences } from './akutagawa-ryunosuke';
import { modernAuthorsSentences } from './modern-authors';
import { poetrySentences } from './poetry';
import { classicsSentences } from './classics';

export const sentences: Sentence[] = [
  ...natsumeSosekiSentences,
  ...dazaiOsamuSentences,
  ...miyazawaKenjiSentences,
  ...akutagawaRyunosukeSentences,
  ...modernAuthorsSentences,
  ...poetrySentences,
  ...classicsSentences,
];
