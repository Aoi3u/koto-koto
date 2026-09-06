import 'dotenv/config';
import { Prisma } from '@prisma/client';
import { validateProblemSeedRecords } from '../src/lib/problemPool';
import {
  buildSeedRecords,
  deactivateMissingProblemsInChapter,
  upsertProblemPoolForChapter,
} from '../src/lib/problemPoolSync';

const isValidateOnly = process.argv.includes('--validate-only');

async function importPrismaClient() {
  const { prisma } = await import('../src/lib/prisma');
  return prisma;
}

let prismaClient: Awaited<ReturnType<typeof importPrismaClient>> | null = null;

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

  const currentChapter = await prismaClient.poolChapter.findFirstOrThrow({
    where: { isCurrent: true },
  });

  await prismaClient.$transaction(
    async (tx: Prisma.TransactionClient) => {
      await upsertProblemPoolForChapter(tx, currentChapter.id, records);
      await deactivateMissingProblemsInChapter(
        tx,
        currentChapter.id,
        records.map((record) => record.problemKey)
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
        AND "chapterId" = $1
      `,
      currentChapter.id
    ),
    prismaClient.$queryRawUnsafe<Array<{ count: number }>>(
      `
      SELECT COUNT(*)::int AS count
      FROM "TypingProblem"
      WHERE "mode" = 'WORD_ENDLESS'::"ProblemMode"
        AND "isActive" = true
        AND "chapterId" = $1
      `,
      currentChapter.id
    ),
  ]);

  const activeClassic = activeClassicRows[0]?.count ?? 0;
  const activeEndless = activeEndlessRows[0]?.count ?? 0;

  console.log(
    `Synced problem pool for chapter ${currentChapter.number}: active classic=${activeClassic}, active word-endless=${activeEndless}`
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
