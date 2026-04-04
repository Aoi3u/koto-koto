import 'dotenv/config';
import { sentences } from '../src/data/sentences';
import { WORD_POOL } from '../src/data/words';
import { validateProblemSeedRecords, type ProblemSeedRecord } from '../src/lib/problemPool';
import { randomUUID } from 'node:crypto';

const isValidateOnly = process.argv.includes('--validate-only');

async function importPrismaClient() {
  const { prisma } = await import('../src/lib/prisma');
  return prisma;
}

let prismaClient: Awaited<ReturnType<typeof importPrismaClient>> | null = null;

const buildSeedRecords = (): ProblemSeedRecord[] => {
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
};

async function main() {
  const rawRecords = buildSeedRecords();
  const records = validateProblemSeedRecords(rawRecords);

  const classicCount = records.filter((record) => record.mode === 'classic').length;
  const endlessCount = records.filter((record) => record.mode === 'word-endless').length;

  console.log(`Validated problem pool: classic=${classicCount}, word-endless=${endlessCount}`);

  if (isValidateOnly) {
    console.log('Validation-only mode: no database changes were made.');
    return;
  }

  prismaClient = await importPrismaClient();

  await prismaClient.$transaction(
    async (tx) => {
      for (const record of records) {
        const dbMode = record.mode === 'classic' ? 'CLASSIC' : 'WORD_ENDLESS';
        await tx.$executeRawUnsafe(
          `
        INSERT INTO "TypingProblem" (
          "id", "mode", "problemKey", "display", "reading", "author", "title", "contentHash", "isActive", "createdAt", "updatedAt"
        )
        VALUES (
          $1, $2::"ProblemMode", $3, $4, $5, $6, $7, $8, true, NOW(), NOW()
        )
        ON CONFLICT ("problemKey")
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
          record.contentHash
        );
      }

      await tx.$executeRawUnsafe(
        `
      UPDATE "TypingProblem"
      SET "isActive" = false,
          "updatedAt" = NOW()
      WHERE "problemKey" NOT IN (${records.map((_, index) => `$${index + 1}`).join(', ')})
      `,
        ...records.map((record) => record.problemKey)
      );
    },
    {
      maxWait: 10_000,
      timeout: 120_000,
    }
  );

  const [activeClassicRows, activeEndlessRows] = await Promise.all([
    prismaClient.$queryRawUnsafe<Array<{ count: number }>>(
      `
      SELECT COUNT(*)::int AS count
      FROM "TypingProblem"
      WHERE "mode" = 'CLASSIC'::"ProblemMode"
        AND "isActive" = true
      `
    ),
    prismaClient.$queryRawUnsafe<Array<{ count: number }>>(
      `
      SELECT COUNT(*)::int AS count
      FROM "TypingProblem"
      WHERE "mode" = 'WORD_ENDLESS'::"ProblemMode"
        AND "isActive" = true
      `
    ),
  ]);

  const activeClassic = activeClassicRows[0]?.count ?? 0;
  const activeEndless = activeEndlessRows[0]?.count ?? 0;

  console.log(
    `Synced problem pool: active classic=${activeClassic}, active word-endless=${activeEndless}`
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    if (prismaClient) {
      await prismaClient.$disconnect();
    }
  });
