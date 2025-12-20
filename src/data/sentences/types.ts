export type Sentence = {
  id: string;
  display: string; // The visual text (Kanji/Mixed)
  reading: string; // The phonetic reading (Hiragana)
  meta?: {
    author?: string;
    title?: string;
  };
};
