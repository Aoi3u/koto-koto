-- CreateEnum
CREATE TYPE "ProblemMode" AS ENUM ('CLASSIC', 'WORD_ENDLESS');

-- CreateTable
CREATE TABLE "TypingProblem" (
    "id" TEXT NOT NULL,
    "mode" "ProblemMode" NOT NULL,
    "problemKey" TEXT NOT NULL,
    "display" TEXT NOT NULL,
    "reading" TEXT NOT NULL,
    "author" TEXT,
    "title" TEXT,
    "contentHash" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TypingProblem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TypingProblem_problemKey_key" ON "TypingProblem"("problemKey");

-- CreateIndex
CREATE UNIQUE INDEX "TypingProblem_contentHash_key" ON "TypingProblem"("contentHash");

-- CreateIndex
CREATE INDEX "TypingProblem_mode_isActive_idx" ON "TypingProblem"("mode", "isActive");

-- CreateIndex
CREATE INDEX "TypingProblem_mode_updatedAt_idx" ON "TypingProblem"("mode", "updatedAt" DESC);
