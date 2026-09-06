import { prisma } from './prisma';
import { getOrSetCache } from './cache';

// Short TTL, unlike the 5-minute pattern used elsewhere (problem-pool,
// rankings): those cache expensive queries where staleness is cheap to
// tolerate. This query is a single indexed lookup on a tiny table
// (essentially free), while staleness here has a real correctness cost —
// right after a chapter cutover, a stale cached id would stamp new
// GameResults with the chapter that was *just* retired.
const CURRENT_CHAPTER_CACHE_TTL_MS = 30_000;

/** Resolves the id of the chapter currently accepting new plays/problems. */
export async function getCurrentChapterId(): Promise<string> {
  return getOrSetCache('chapters:current-id', CURRENT_CHAPTER_CACHE_TTL_MS, async () => {
    const current = await prisma.poolChapter.findFirst({
      where: { isCurrent: true },
      select: { id: true },
    });
    if (!current) {
      throw new Error('No current PoolChapter found');
    }
    return current.id;
  });
}

/** Resolves a chapter's id by its number, or null if no such chapter exists. */
export async function getChapterIdByNumber(number: number): Promise<string | null> {
  const chapter = await prisma.poolChapter.findUnique({
    where: { number },
    select: { id: true },
  });
  return chapter?.id ?? null;
}
