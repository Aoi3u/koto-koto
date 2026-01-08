import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRank } from '@/features/result/utils/rankLogic';
import { calculateZenScore } from '@/lib/gameUtils';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

const badRequest = (message: string) => NextResponse.json({ error: message }, { status: 400 });

const parseLimit = (value: string | null) => {
  if (!value) return DEFAULT_LIMIT;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return Math.min(parsed, MAX_LIMIT);
};

const parseTimeframe = (value: string | null) => {
  if (!value) return 'all' as const;
  const normalized = value.toLowerCase();
  if (
    normalized === 'all' ||
    normalized === 'week' ||
    normalized === 'month' ||
    normalized === 'day'
  )
    return normalized as 'all' | 'week' | 'month' | 'day';
  return null;
};

const timeframeToDate = (timeframe: 'all' | 'week' | 'month' | 'day') => {
  if (timeframe === 'all') return null;
  const now = Date.now();
  if (timeframe === 'day') return new Date(now - 24 * 60 * 60 * 1000);
  if (timeframe === 'week') return new Date(now - 7 * 24 * 60 * 60 * 1000);
  if (timeframe === 'month') return new Date(now - 30 * 24 * 60 * 60 * 1000);
  return null;
};

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);

  const limit = parseLimit(searchParams.get('limit'));
  if (!limit) return badRequest('Invalid limit');

  const timeframe = parseTimeframe(searchParams.get('timeframe'));
  if (!timeframe) return badRequest('Invalid timeframe');

  const gte = timeframeToDate(timeframe);

  const results = await prisma.gameResult.findMany({
    where: gte ? { createdAt: { gte } } : undefined,
    orderBy: { createdAt: 'desc' },
    take: limit,
    select: {
      wordsPerMinute: true,
      accuracy: true,
      createdAt: true,
      user: { select: { name: true, email: true } },
    },
  });

  // Calculate Zen Score and sort
  const withZenScore = results.map((result) => ({
    ...result,
    zenScore: calculateZenScore(result.wordsPerMinute, result.accuracy),
  }));

  withZenScore.sort((a, b) => b.zenScore - a.zenScore);

  const payload = withZenScore.map((result, index) => {
    const rankResult = calculateRank(result.wordsPerMinute, result.accuracy);
    return {
      rank: index + 1,
      wpm: result.wordsPerMinute,
      accuracy: result.accuracy,
      createdAt: result.createdAt,
      zenScore: result.zenScore,
      grade: rankResult.grade,
      title: rankResult.title,
      color: rankResult.color,
      user: result.user?.name ?? result.user?.email ?? 'Anonymous',
    };
  });

  return NextResponse.json({ results: payload }, { status: 200 });
};
