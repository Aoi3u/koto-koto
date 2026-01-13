-- AlterTable
ALTER TABLE "GameResult" ADD COLUMN     "zenScore" DOUBLE PRECISION;

-- Update existing records with calculated zenScore
-- zenScore = wordsPerMinute * accuracy / 100
UPDATE "GameResult" 
SET "zenScore" = "wordsPerMinute" * "accuracy" / 100.0
WHERE "zenScore" IS NULL;

-- CreateIndex
CREATE INDEX "GameResult_zenScore_idx" ON "GameResult"("zenScore" DESC);
