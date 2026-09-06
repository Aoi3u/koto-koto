import type { Prisma } from '@prisma/client';
import { validateProblemSeedRecords } from '../lib/problemPool';
import {
  buildSeedRecords,
  deactivateMissingProblemsInChapter,
  upsertProblemPoolForChapter,
} from '../lib/problemPoolSync';

const makeTx = () => {
  const $executeRawUnsafe = jest.fn().mockResolvedValue(undefined);
  return { $executeRawUnsafe } as unknown as Prisma.TransactionClient;
};

describe('problemPoolSync', () => {
  describe('buildSeedRecords', () => {
    it('builds valid classic and word-endless records from the canonical data', () => {
      const records = buildSeedRecords();

      const classic = records.filter((r) => r.mode === 'classic');
      const endless = records.filter((r) => r.mode === 'word-endless');
      expect(classic.length).toBeGreaterThan(0);
      expect(endless.length).toBeGreaterThan(0);
      expect(() => validateProblemSeedRecords(records)).not.toThrow();
    });

    it('derives word-endless problemKeys from their position in the pool', () => {
      const records = buildSeedRecords();
      const firstEndless = records.find((r) => r.mode === 'word-endless');
      expect(firstEndless?.problemKey).toBe('word_0001');
    });
  });

  describe('upsertProblemPoolForChapter', () => {
    it('upserts each record scoped to the given chapter', async () => {
      const tx = makeTx();
      const records = validateProblemSeedRecords([
        {
          mode: 'classic',
          problemKey: 'key1',
          display: '吾輩は猫である',
          reading: 'わがはいはねこである',
        },
      ]);

      await upsertProblemPoolForChapter(tx, 'chapter-1', records);

      const executeRawUnsafe = tx.$executeRawUnsafe as jest.Mock;
      expect(executeRawUnsafe).toHaveBeenCalledTimes(1);
      const call = executeRawUnsafe.mock.calls[0];
      expect(call[0]).toContain('ON CONFLICT ("chapterId", "problemKey")');
      expect(call[3]).toBe('key1'); // problemKey
      expect(call[9]).toBe('chapter-1'); // chapterId
    });
  });

  describe('deactivateMissingProblemsInChapter', () => {
    it('scopes deactivation to the chapter and excludes the kept keys', async () => {
      const tx = makeTx();

      await deactivateMissingProblemsInChapter(tx, 'chapter-1', ['key1', 'key2']);

      const executeRawUnsafe = tx.$executeRawUnsafe as jest.Mock;
      expect(executeRawUnsafe).toHaveBeenCalledTimes(1);
      const call = executeRawUnsafe.mock.calls[0];
      expect(call[0]).toContain('WHERE "chapterId" = $1');
      expect(call[1]).toBe('chapter-1');
      expect(call.slice(2)).toEqual(['key1', 'key2']);
    });
  });
});
