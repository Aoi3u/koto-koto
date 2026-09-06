import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getOrSetCache } from '@/lib/cache';

// Chapter metadata only changes on a cutover (a rare, manual operation), so
// a longer TTL than getCurrentChapterId() is fine here.
const CHAPTERS_CACHE_TTL_MS = 5 * 60 * 1000;

export const GET = async () => {
  const chapters = await getOrSetCache('chapters:list', CHAPTERS_CACHE_TTL_MS, () =>
    prisma.poolChapter.findMany({
      orderBy: { number: 'asc' },
      select: { number: true, title: true, isCurrent: true, startedAt: true, endedAt: true },
    })
  );

  return NextResponse.json({ chapters }, { status: 200 });
};
