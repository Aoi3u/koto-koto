import 'dotenv/config';
import { Prisma } from '@prisma/client';
import { validateProblemSeedRecords } from '../src/lib/problemPool';
import { buildSeedRecords, upsertProblemPoolForChapter } from '../src/lib/problemPoolSync';

const titleArg = process.argv.find((arg) => arg.startsWith('--title='))?.slice('--title='.length);
const numberArg = process.argv
  .find((arg) => arg.startsWith('--number='))
  ?.slice('--number='.length);

async function importPrismaClient() {
  const { prisma } = await import('../src/lib/prisma');
  return prisma;
}

let prismaClient: Awaited<ReturnType<typeof importPrismaClient>> | null = null;

async function main() {
  // Validate the *new* chapter's content before touching the database at all.
  const rawRecords = buildSeedRecords();
  const records = validateProblemSeedRecords(rawRecords);

  const classicCount = records.filter((record) => record.mode === 'classic').length;
  const endlessCount = records.filter((record) => record.mode === 'word-endless').length;
  console.log(
    `Validated new chapter content: classic=${classicCount}, word-endless=${endlessCount}`
  );

  prismaClient = await importPrismaClient();

  const newChapter = await prismaClient.$transaction(
    async (tx: Prisma.TransactionClient) => {
      const currentChapter = await tx.poolChapter.findFirst({ where: { isCurrent: true } });

      if (currentChapter) {
        await tx.poolChapter.update({
          where: { id: currentChapter.id },
          data: { isCurrent: false, endedAt: new Date() },
        });
      }

      const nextNumber = numberArg
        ? Number.parseInt(numberArg, 10)
        : ((await tx.poolChapter.aggregate({ _max: { number: true } }))._max.number ?? 0) + 1;

      const created = await tx.poolChapter.create({
        data: { number: nextNumber, title: titleArg ?? null, isCurrent: true },
      });

      // Defensive: ensure nothing from an older chapter is left active, even
      // if a previous run or manual edit left something in an inconsistent
      // state. Routine sync (scripts/sync-problem-pool.ts) always scopes its
      // own deactivation to the current chapter only, so this should
      // normally be a no-op.
      await tx.$executeRawUnsafe(
        `UPDATE "TypingProblem" SET "isActive" = false, "updatedAt" = NOW() WHERE "isActive" = true AND "chapterId" != $1`,
        created.id
      );

      // Fresh chapterId namespace: this upsert has no existing rows to
      // conflict with, so it behaves as a plain insert.
      await upsertProblemPoolForChapter(tx, created.id, records);

      return created;
    },
    {
      maxWait: 10_000,
      timeout: 120_000,
    }
  );

  console.log(
    `Started chapter ${newChapter.number}${newChapter.title ? ` (${newChapter.title})` : ''}: classic=${classicCount}, word-endless=${endlessCount}`
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
