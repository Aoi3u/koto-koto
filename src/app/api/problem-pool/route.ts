import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { isProblemPayloadValid } from '@/lib/problemPool';
import type { Sentence } from '@/data/sentences';

const DEFAULT_COUNT = 10;
const MAX_COUNT = 100;

type QueryMode = 'classic' | 'word-endless';

type TypingProblemRow = {
  problemKey: string;
  display: string;
  reading: string;
  author: string | null;
  title: string | null;
};

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

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const mode = parseMode(searchParams.get('mode'));
  if (!mode) return badRequest('Invalid mode');

  const count = parseCount(searchParams.get('count'));
  if (!count) return badRequest('Invalid count');

  const dbMode = mode === 'classic' ? 'CLASSIC' : 'WORD_ENDLESS';

  const sampled = await prisma.$queryRawUnsafe<TypingProblemRow[]>(
    `
    SELECT
      tp."problemKey",
      tp."display",
      tp."reading",
      tp."author",
      tp."title"
    FROM "TypingProblem" tp
    WHERE tp."mode" = $1::"ProblemMode"
      AND tp."isActive" = true
    ORDER BY RANDOM()
    LIMIT $2
    `,
    dbMode,
    count
  );

  if (sampled.length === 0) {
    return NextResponse.json({ error: 'Problem pool is empty' }, { status: 503 });
  }

  const problems: Sentence[] = sampled
    .map((problem, index) => {
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
