import { prisma } from '../lib/prisma';
import { __clearCacheForTests } from '../lib/cache';
import { getChapterIdByNumber, getCurrentChapterId } from '../lib/chapters';

jest.mock('../lib/prisma', () => ({
  prisma: {
    poolChapter: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
    },
  },
}));

describe('chapters lib', () => {
  const mockFindFirst = () => prisma.poolChapter.findFirst as jest.Mock;
  const mockFindUnique = () => prisma.poolChapter.findUnique as jest.Mock;

  beforeEach(() => {
    mockFindFirst().mockReset();
    mockFindUnique().mockReset();
    __clearCacheForTests();
  });

  describe('getCurrentChapterId', () => {
    it('resolves the id of the current chapter', async () => {
      mockFindFirst().mockResolvedValueOnce({ id: 'chapter-1' });

      await expect(getCurrentChapterId()).resolves.toBe('chapter-1');
      expect(mockFindFirst()).toHaveBeenCalledWith({
        where: { isCurrent: true },
        select: { id: true },
      });
    });

    it('caches the result for subsequent calls', async () => {
      mockFindFirst().mockResolvedValueOnce({ id: 'chapter-1' });

      await getCurrentChapterId();
      await getCurrentChapterId();

      expect(mockFindFirst()).toHaveBeenCalledTimes(1);
    });

    it('throws when there is no current chapter', async () => {
      mockFindFirst().mockResolvedValueOnce(null);

      await expect(getCurrentChapterId()).rejects.toThrow('No current PoolChapter found');
    });
  });

  describe('getChapterIdByNumber', () => {
    it('resolves an id for an existing chapter number', async () => {
      mockFindUnique().mockResolvedValueOnce({ id: 'chapter-2' });

      await expect(getChapterIdByNumber(2)).resolves.toBe('chapter-2');
      expect(mockFindUnique()).toHaveBeenCalledWith({
        where: { number: 2 },
        select: { id: true },
      });
    });

    it('resolves null when the chapter does not exist', async () => {
      mockFindUnique().mockResolvedValueOnce(null);

      await expect(getChapterIdByNumber(99)).resolves.toBeNull();
    });
  });
});
