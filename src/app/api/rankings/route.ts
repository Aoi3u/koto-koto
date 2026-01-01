import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { calculateRank } from '@/features/result/utils/rankLogic';

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
  if (normalized === 'all' || normalized === 'week' || normalized === 'month') return normalized;
  return null;
};

const timeframeToDate = (timeframe: 'all' | 'week' | 'month') => {
  if (timeframe === 'all') return null;
  const days = timeframe === 'week' ? 7 : 30;
  const now = Date.now();
  return new Date(now - days * 24 * 60 * 60 * 1000);
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
    zenScore: result.wordsPerMinute * (result.accuracy / 100),
  }));

  withZenScore.sort((a, b) => b.zenScore - a.zenScore);

  const payload = withZenScore.map((result, index) => {
    const rankResult = calculateRank(result.wordsPerMinute, result.accuracy);
    return {
      rank: index + 1,
      wpm: result.wordsPerMinute,
      accuracy: result.accuracy,
      createdAt: result.createdAt,
      zenScore: Math.round(result.zenScore * 100) / 100,
      grade: rankResult.grade,
      title: rankResult.title,
      color: rankResult.color,
      user: result.user?.name ?? result.user?.email ?? 'Anonymous',
    };
  });

  return NextResponse.json({ results: payload }, { status: 200 });
};
