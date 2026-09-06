import { randomUUID } from 'node:crypto';
import type { Prisma } from '@prisma/client';
import { sentences } from '../data/sentences';
import { WORD_POOL } from '../data/words';
import type { NormalizedProblemSeedRecord, ProblemSeedRecord } from './problemPool';

/**
 * Builds the raw (unvalidated) seed records from the canonical TS data
 * sources. Shared by both the routine sync script and the chapter-cutover
 * script so they always read the same current-content snapshot.
 */
export function buildSeedRecords(): ProblemSeedRecord[] {
  const classicRecords: ProblemSeedRecord[] = sentences.map((sentence) => ({
    mode: 'classic',
    problemKey: sentence.id,
    display: sentence.display,
    reading: sentence.reading,
    author: sentence.meta?.author,
    title: sentence.meta?.title,
  }));

  const endlessRecords: ProblemSeedRecord[] = WORD_POOL.map((word, index) => ({
    mode: 'word-endless',
    problemKey: `word_${String(index + 1).padStart(4, '0')}`,
    display: word.display,
    reading: word.reading,
  }));

  return [...classicRecords, ...endlessRecords];
}

/**
 * Upserts each record into `chapterId`'s namespace. Uniqueness is scoped per
 * chapter (chapterId, problemKey), so calling this against a brand-new
 * chapter (zero existing rows) degenerates into plain inserts, and calling
 * it repeatedly against the current chapter (the routine sync case) updates
 * in place.
 */
export async function upsertProblemPoolForChapter(
  tx: Prisma.TransactionClient,
  chapterId: string,
  records: NormalizedProblemSeedRecord[]
): Promise<void> {
  for (const record of records) {
    const dbMode = record.mode === 'classic' ? 'CLASSIC' : 'WORD_ENDLESS';
    await tx.$executeRawUnsafe(
      `
      INSERT INTO "TypingProblem" (
        "id", "mode", "problemKey", "display", "reading", "author", "title", "contentHash", "isActive", "chapterId", "createdAt", "updatedAt"
      )
      VALUES (
        $1, $2::"ProblemMode", $3, $4, $5, $6, $7, $8, true, $9, NOW(), NOW()
      )
      ON CONFLICT ("chapterId", "problemKey")
      DO UPDATE SET
        "mode" = EXCLUDED."mode",
        "display" = EXCLUDED."display",
        "reading" = EXCLUDED."reading",
        "author" = EXCLUDED."author",
        "title" = EXCLUDED."title",
        "contentHash" = EXCLUDED."contentHash",
        "isActive" = true,
        "updatedAt" = NOW()
      `,
      randomUUID(),
      dbMode,
      record.problemKey,
      record.display,
      record.reading,
      record.author ?? null,
      record.title ?? null,
      record.contentHash,
      chapterId
    );
  }
}

/** Deactivates rows in `chapterId` whose problemKey is no longer present in the seed set. Never touches other chapters. */
export async function deactivateMissingProblemsInChapter(
  tx: Prisma.TransactionClient,
  chapterId: string,
  keepKeys: string[]
): Promise<void> {
  await tx.$executeRawUnsafe(
    `
    UPDATE "TypingProblem"
    SET "isActive" = false,
        "updatedAt" = NOW()
    WHERE "chapterId" = $1
      AND "problemKey" NOT IN (${keepKeys.map((_, index) => `$${index + 2}`).join(', ')})
    `,
    chapterId,
    ...keepKeys
  );
}
