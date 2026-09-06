-- CreateTable
CREATE TABLE "PoolChapter" (
    "id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "title" TEXT,
    "isCurrent" BOOLEAN NOT NULL DEFAULT false,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),

    CONSTRAINT "PoolChapter_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PoolChapter_number_key" ON "PoolChapter"("number");

-- CreateIndex
CREATE INDEX "PoolChapter_isCurrent_idx" ON "PoolChapter"("isCurrent");

-- Seed "Chapter 1" as the current chapter, backdated to the earliest known
-- activity across existing TypingProblem/GameResult rows (falls back to
-- NOW() on an empty database) so it reads coherently once history is filed
-- under it.
INSERT INTO "PoolChapter" ("id", "number", "title", "isCurrent", "startedAt")
VALUES (
    'chapter0000000000000001',
    1,
    NULL,
    true,
    COALESCE(
        (SELECT MIN(t) FROM (
            SELECT MIN("createdAt") AS t FROM "TypingProblem"
            UNION ALL
            SELECT MIN("createdAt") FROM "GameResult"
        ) AS earliest),
        CURRENT_TIMESTAMP
    )
);

-- AlterTable: add as nullable first so existing rows aren't rejected
ALTER TABLE "TypingProblem" ADD COLUMN "chapterId" TEXT;
ALTER TABLE "GameResult" ADD COLUMN "chapterId" TEXT;

-- Backfill: every pre-existing row belongs to Chapter 1
UPDATE "TypingProblem" SET "chapterId" = 'chapter0000000000000001';
UPDATE "GameResult" SET "chapterId" = 'chapter0000000000000001';

-- AlterTable: now enforce NOT NULL
ALTER TABLE "TypingProblem" ALTER COLUMN "chapterId" SET NOT NULL;
ALTER TABLE "GameResult" ALTER COLUMN "chapterId" SET NOT NULL;

-- DropIndex: replace global problem uniqueness with per-chapter uniqueness so
-- a future chapter can reuse a problemKey scheme (e.g. word_0001) or even
-- identical text without colliding with a retired chapter's frozen rows
DROP INDEX "TypingProblem_problemKey_key";
DROP INDEX "TypingProblem_contentHash_key";

-- CreateIndex
CREATE UNIQUE INDEX "TypingProblem_chapterId_problemKey_key" ON "TypingProblem"("chapterId", "problemKey");

-- CreateIndex
CREATE UNIQUE INDEX "TypingProblem_chapterId_contentHash_key" ON "TypingProblem"("chapterId", "contentHash");

-- CreateIndex
CREATE INDEX "GameResult_chapterId_idx" ON "GameResult"("chapterId");

-- AddForeignKey
ALTER TABLE "TypingProblem" ADD CONSTRAINT "TypingProblem_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "PoolChapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GameResult" ADD CONSTRAINT "GameResult_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "PoolChapter"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
