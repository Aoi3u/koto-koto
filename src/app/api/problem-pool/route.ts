import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isProblemPayloadValid } from '@/lib/problemPool';
import { getOrSetCache } from '@/lib/cache';
import type { Sentence } from '@/data/sentences';

const DEFAULT_COUNT = 10;
const MAX_COUNT = 100;

type QueryMode = 'classic' | 'word-endless';
type DbMode = 'CLASSIC' | 'WORD_ENDLESS';

type TypingProblemRow = {
  problemKey: string;
  display: string;
  reading: string;
  author: string | null;
  title: string | null;
};

// The active pool per mode only changes when someone runs the sync script
// (npm run db:sync-problem-pool), so it's safe to share it across requests
// for a few minutes. Every classic game start and every endless refill
// previously re-ran an ORDER BY RANDOM() scan over the whole table; now
// that scan happens at most once per mode per TTL window, and the random
// sample is drawn from the cached pool in memory instead.
const POOL_CACHE_TTL_MS = 5 * 60 * 1000;

const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });

const parseCount = (value: string | null) => {
  if (!value) return DEFAULT_COUNT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.min(parsed, MAX_COUNT);
};

const parseMode = (value: string | null): QueryMode | null => {
  if (!value) return 'classic';
  const normalized = value.toLowerCase();
  if (normalized === 'classic' || normalized === 'word-endless') return normalized;
  return null;
};

const getActivePool = (dbMode: DbMode): Promise<TypingProblemRow[]> =>
  getOrSetCache(`problem-pool:${dbMode}`, POOL_CACHE_TTL_MS, () =>
    prisma.typingProblem.findMany({
      where: { mode: dbMode, isActive: true },
      select: {
        problemKey: true,
        display: true,
        reading: true,
        author: true,
        title: true,
      },
    })
  );

/** Fisher-Yates partial shuffle: picks up to `count` distinct items without mutating `pool`. */
function sampleRandom<T>(pool: readonly T[], count: number): T[] {
  const picked = [...pool];
  const n = Math.min(count, picked.length);

  for (let i = 0; i < n; i++) {
    const j = i + Math.floor(Math.random() * (picked.length - i));
    [picked[i], picked[j]] = [picked[j], picked[i]];
  }

  return picked.slice(0, n);
}

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const mode = parseMode(searchParams.get('mode'));
  if (!mode) return badRequest('Invalid mode');

  const count = parseCount(searchParams.get('count'));
  if (!count) return badRequest('Invalid count');

  const dbMode: DbMode = mode === 'classic' ? 'CLASSIC' : 'WORD_ENDLESS';

  const pool = await getActivePool(dbMode);
  if (pool.length === 0) {
    return NextResponse.json({ error: 'Problem pool is empty' }, { status: 503 });
  }

  const sampled = sampleRandom(pool, count);

  const problems: Sentence[] = sampled
    .map((problem: TypingProblemRow, index: number) => {
      const id =
        mode === 'classic' ? problem.problemKey : `${problem.problemKey}-${Date.now()}-${index}`;
      const payload: Sentence = {
        id,
        display: problem.display,
        reading: problem.reading,
      };

      if (problem.author || problem.title) {
        payload.meta = {
          author: problem.author ?? undefined,
          title: problem.title ?? undefined,
        };
      }

      return payload;
    })
    .filter(isProblemPayloadValid);

  if (problems.length === 0) {
    return NextResponse.json({ error: 'Problem pool contains invalid records' }, { status: 500 });
  }

  return NextResponse.json({ problems }, { status: 200 });
};
