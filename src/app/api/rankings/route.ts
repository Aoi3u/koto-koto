import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { calculateRank } from '@/features/result/utils/rankLogic';
import { calculateZenScore } from '@/lib/gameUtils';
import { authOptions } from '@/lib/auth';

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

// Generate anonymous handle from user ID for privacy
const generateAnonymousHandle = (userId: string): string => {
  // Use first 8 characters of user ID to create a consistent but non-identifiable handle
  const shortId = userId.substring(0, 8);
  return `Player_${shortId}`;
};

export const GET = async (req: Request) => {
  const { searchParams } = new URL(req.url);
  const session = await getServerSession(authOptions);
  const currentUserId = session?.user?.id;

  const limit = parseLimit(searchParams.get('limit'));
  if (!limit) return badRequest('Invalid limit');

  const timeframe = parseTimeframe(searchParams.get('timeframe'));
  if (!timeframe) return badRequest('Invalid timeframe');

  const gte = timeframeToDate(timeframe);

  // Fetch top N results directly using zenScore index
  // Only include records with non-null zenScore to ensure proper ranking
  const results = await prisma.gameResult.findMany({
    where: {
      zenScore: { not: null },
      ...(gte ? { createdAt: { gte } } : {}),
    },
    orderBy: { zenScore: 'desc' },
    take: limit,
    select: {
      wordsPerMinute: true,
      accuracy: true,
      createdAt: true,
      zenScore: true,
      userId: true,
      user: { select: { name: true } },
    },
  });

  const payload = results.map((result, index) => {
    const rankResult = calculateRank(result.wordsPerMinute, result.accuracy);
    // zenScore should always be present due to WHERE clause, but provide fallback for type safety
    const zenScore = result.zenScore ?? calculateZenScore(result.wordsPerMinute, result.accuracy);
    return {
      rank: index + 1,
      wpm: result.wordsPerMinute,
      accuracy: result.accuracy,
      createdAt: result.createdAt,
      zenScore,
      grade: rankResult.grade,
      title: rankResult.title,
      color: rankResult.color,
      user: result.user?.name ?? generateAnonymousHandle(result.userId),
      isSelf: currentUserId ? result.userId === currentUserId : false,
    };
  });

  return NextResponse.json({ results: payload }, { status: 200 });
};
