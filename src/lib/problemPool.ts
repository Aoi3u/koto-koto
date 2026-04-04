import { createHash } from 'node:crypto';

export type ProblemMode = 'classic' | 'word-endless';

export type ProblemSeedRecord = {
  mode: ProblemMode;
  problemKey: string;
  display: string;
  reading: string;
  author?: string;
  title?: string;
};

export type NormalizedProblemSeedRecord = ProblemSeedRecord & {
  contentHash: string;
};

const READING_PATTERN =
  /^[\p{Script=Hiragana}\p{Script=Katakana}ー゛゜々〆〤・、。！？「」『』（）［］【】…\s]+$/u;

const normalizeValue = (value: string) => value.trim().replace(/\s+/g, ' ');

const toContentHash = (mode: ProblemMode, display: string, reading: string) =>
  createHash('sha256').update(`${mode}\u0000${display}\u0000${reading}`, 'utf8').digest('hex');

export const isValidReading = (reading: string) => READING_PATTERN.test(reading);

export function normalizeProblemSeedRecord(record: ProblemSeedRecord): NormalizedProblemSeedRecord {
  const mode = record.mode;
  const problemKey = normalizeValue(record.problemKey);
  const display = normalizeValue(record.display);
  const reading = normalizeValue(record.reading);
  const author = record.author ? normalizeValue(record.author) : undefined;
  const title = record.title ? normalizeValue(record.title) : undefined;

  return {
    mode,
    problemKey,
    display,
    reading,
    author,
    title,
    contentHash: toContentHash(mode, display, reading),
  };
}

export function validateProblemSeedRecords(
  records: ProblemSeedRecord[]
): NormalizedProblemSeedRecord[] {
  const normalized = records.map(normalizeProblemSeedRecord);
  const keySet = new Set<string>();
  const contentSet = new Set<string>();
  const errors: string[] = [];

  normalized.forEach((record, index) => {
    if (!record.problemKey) {
      errors.push(`row ${index + 1}: problemKey is empty`);
    }
    if (!record.display) {
      errors.push(`row ${index + 1}: display is empty`);
    }
    if (!record.reading) {
      errors.push(`row ${index + 1}: reading is empty`);
    }
    if (record.reading && !isValidReading(record.reading)) {
      errors.push(`row ${index + 1}: reading contains unsupported characters (${record.reading})`);
    }

    if (keySet.has(record.problemKey)) {
      errors.push(`row ${index + 1}: duplicate problemKey (${record.problemKey})`);
    }
    keySet.add(record.problemKey);

    if (contentSet.has(record.contentHash)) {
      errors.push(`row ${index + 1}: duplicate content (mode/display/reading)`);
    }
    contentSet.add(record.contentHash);
  });

  if (errors.length > 0) {
    throw new Error(`Problem pool validation failed:\n- ${errors.join('\n- ')}`);
  }

  return normalized;
}

export function isProblemPayloadValid(problem: {
  id: string;
  display: string;
  reading: string;
}): boolean {
  if (!problem.id.trim() || !problem.display.trim() || !problem.reading.trim()) return false;
  return isValidReading(problem.reading.trim());
}
