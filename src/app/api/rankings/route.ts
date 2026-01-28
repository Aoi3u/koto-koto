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

const parseMode = (value: string | null) => {
  if (!value) return 'users' as const;
  const normalized = value.toLowerCase();
  if (normalized === 'users' || normalized === 'runs') return normalized as 'users' | 'runs';
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

  const mode = parseMode(searchParams.get('mode'));
  if (!mode) return badRequest('Invalid mode');

  const gte = timeframeToDate(timeframe);

  // 共通の where 句
  const where = {
    zenScore: { not: null },
    ...(gte ? { createdAt: { gte } } : {}),
  } as const;

  if (mode === 'runs') {
    // 戦績ランキング: 1プレイ = 1行
    const results = await prisma.gameResult.findMany({
      where,
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
      // 表示・ランク判定用の ZenScore は常に計算関数から求める
      const zenScore = calculateZenScore(result.wordsPerMinute, result.accuracy);
      const rankResult = calculateRank(result.wordsPerMinute, result.accuracy);
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
  }

  // ユーザーランキング: 各ユーザーについて「1つの実際のプレイ」を代表値として選ぶ
  // ここでは timeframe 内の全プレイを対象にして、ZenScore（計算関数）ベースで「そのユーザーのベストラン」を選ぶ。
  const allResults = await prisma.gameResult.findMany({
    where,
    select: {
      wordsPerMinute: true,
      accuracy: true,
      createdAt: true,
      userId: true,
      user: { select: { name: true } },
    },
  });

  type UserBest = {
    userId: string;
    name: string | null;
    wpm: number;
    accuracy: number;
    createdAt: Date;
    zenScore: number;
  };

  const bestByUser = new Map<string, UserBest>();

  for (const result of allResults) {
    const zenScore = calculateZenScore(result.wordsPerMinute, result.accuracy);
    const existing = bestByUser.get(result.userId);

    if (!existing) {
      bestByUser.set(result.userId, {
        userId: result.userId,
        name: result.user?.name ?? null,
        wpm: result.wordsPerMinute,
        accuracy: result.accuracy,
        createdAt: result.createdAt,
        zenScore,
      });
      continue;
    }

    if (
      zenScore > existing.zenScore ||
      (zenScore === existing.zenScore && result.createdAt > existing.createdAt)
    ) {
      bestByUser.set(result.userId, {
        userId: result.userId,
        name: result.user?.name ?? null,
        wpm: result.wordsPerMinute,
        accuracy: result.accuracy,
        createdAt: result.createdAt,
        zenScore,
      });
    }
  }

  const sortedBest = Array.from(bestByUser.values()).sort((a, b) => b.zenScore - a.zenScore);

  const topUsers = sortedBest.slice(0, limit);

  const payload = topUsers.map((result, index) => {
    const rankResult = calculateRank(result.wpm, result.accuracy);
    const displayName = result.name ?? generateAnonymousHandle(result.userId);

    return {
      rank: index + 1,
      wpm: result.wpm,
      accuracy: result.accuracy,
      createdAt: result.createdAt,
      zenScore: result.zenScore,
      grade: rankResult.grade,
      title: rankResult.title,
      color: rankResult.color,
      user: displayName,
      isSelf: currentUserId ? result.userId === currentUserId : false,
    };
  });

  return NextResponse.json({ results: payload }, { status: 200 });
};
