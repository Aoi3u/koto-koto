import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { prisma } from '@/lib/prisma';
import { calculateRank } from '@/features/result/utils/rankLogic';
import { calculateZenScore } from '@/lib/gameUtils';
import { authOptions } from '@/lib/auth';
import { getOrSetCache } from '@/lib/cache';

const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// Rankings are identical for every requester (aside from the per-viewer
// `isSelf` flag, applied after the cache read below), so the underlying
// query result can be shared across requests for a short window. This
// smooths out DB load during bursts of traffic without letting the board
// go noticeably stale.
const RANKINGS_CACHE_TTL_MS = 20_000;

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

// Cacheable ranking row: everything needed for the response except `isSelf`,
// which depends on the requesting user and is attached after the cache read.
// `userId` is kept only to compute `isSelf` and is stripped before responding.
type CachedRankingRow = {
  rank: number;
  wpm: number;
  accuracy: number;
  createdAt: Date;
  zenScore: number;
  grade: string;
  title: string;
  color: string;
  user: string;
  userId: string;
};

const fetchRunsRanking = async (
  where: Record<string, unknown>,
  limit: number
): Promise<CachedRankingRow[]> => {
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

  // 競技スタイルの順位付け（同点は同順位、次順位は人数ぶん飛ばす）
  let lastZenScore: number | null = null;
  let lastRank = 0;
  let position = 0;

  return results.map((result: (typeof results)[0]) => {
    position += 1;
    // 表示・ランク判定用の ZenScore は常に計算関数から求める
    const zenScore = calculateZenScore(result.wordsPerMinute, result.accuracy);

    let rank: number;
    if (lastZenScore === null || zenScore < lastZenScore) {
      rank = position;
      lastRank = rank;
      lastZenScore = zenScore;
    } else {
      rank = lastRank;
    }

    const rankResult = calculateRank(result.wordsPerMinute, result.accuracy);
    return {
      rank,
      wpm: result.wordsPerMinute,
      accuracy: result.accuracy,
      createdAt: result.createdAt,
      zenScore,
      grade: rankResult.grade,
      title: rankResult.title,
      color: rankResult.color,
      user: result.user?.name ?? generateAnonymousHandle(result.userId),
      userId: result.userId,
    };
  });
};

type UserBestRow = {
  userId: string;
  name: string | null;
  wordsPerMinute: number;
  accuracy: number;
  createdAt: Date;
  zenScore: number;
};

const fetchUsersRanking = async (gte: Date | null, limit: number): Promise<CachedRankingRow[]> => {
  // ユーザーランキング: ユーザーごとのベストランを DB 側で選定して転送量を削減
  const topUsers = gte
    ? await prisma.$queryRawUnsafe<UserBestRow[]>(
        `
      WITH ranked AS (
        SELECT
          gr."userId",
          u."name",
          gr."wordsPerMinute",
          gr."accuracy",
          gr."createdAt",
          gr."zenScore",
          ROW_NUMBER() OVER (
            PARTITION BY gr."userId"
            ORDER BY gr."zenScore" DESC, gr."createdAt" DESC
          ) AS rn
        FROM "GameResult" gr
        LEFT JOIN "User" u ON u."id" = gr."userId"
        WHERE gr."zenScore" IS NOT NULL
          AND gr."createdAt" >= $1
      )
      SELECT
        ranked."userId",
        ranked."name",
        ranked."wordsPerMinute",
        ranked."accuracy",
        ranked."createdAt",
        ranked."zenScore"
      FROM ranked
      WHERE ranked.rn = 1
      ORDER BY ranked."zenScore" DESC
      LIMIT $2
      `,
        gte,
        limit
      )
    : await prisma.$queryRawUnsafe<UserBestRow[]>(
        `
      WITH ranked AS (
        SELECT
          gr."userId",
          u."name",
          gr."wordsPerMinute",
          gr."accuracy",
          gr."createdAt",
          gr."zenScore",
          ROW_NUMBER() OVER (
            PARTITION BY gr."userId"
            ORDER BY gr."zenScore" DESC, gr."createdAt" DESC
          ) AS rn
        FROM "GameResult" gr
        LEFT JOIN "User" u ON u."id" = gr."userId"
        WHERE gr."zenScore" IS NOT NULL
      )
      SELECT
        ranked."userId",
        ranked."name",
        ranked."wordsPerMinute",
        ranked."accuracy",
        ranked."createdAt",
        ranked."zenScore"
      FROM ranked
      WHERE ranked.rn = 1
      ORDER BY ranked."zenScore" DESC
      LIMIT $1
      `,
        limit
      );

  // 競技スタイルの順位付け（同点は同順位、次順位は人数ぶん飛ばす）
  let lastZenScore: number | null = null;
  let lastRank = 0;
  let position = 0;

  return topUsers.map((result: UserBestRow) => {
    position += 1;

    let rank: number;
    if (lastZenScore === null || result.zenScore < lastZenScore) {
      rank = position;
      lastRank = rank;
      lastZenScore = result.zenScore;
    } else {
      rank = lastRank;
    }

    const rankResult = calculateRank(result.wordsPerMinute, result.accuracy);
    const displayName = result.name ?? generateAnonymousHandle(result.userId);

    return {
      rank,
      wpm: result.wordsPerMinute,
      accuracy: result.accuracy,
      createdAt: result.createdAt,
      zenScore: result.zenScore,
      grade: rankResult.grade,
      title: rankResult.title,
      color: rankResult.color,
      user: displayName,
      userId: result.userId,
    };
  });
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

  const cacheKey = `rankings:${mode}:${timeframe}:${limit}`;
  const cachedRows = await getOrSetCache(cacheKey, RANKINGS_CACHE_TTL_MS, () => {
    if (mode === 'runs') {
      const where = {
        zenScore: { not: null },
        ...(gte ? { createdAt: { gte } } : {}),
      } as const;
      return fetchRunsRanking(where, limit);
    }
    return fetchUsersRanking(gte, limit);
  });

  const results = cachedRows.map(({ userId, ...row }) => ({
    ...row,
    isSelf: currentUserId ? userId === currentUserId : false,
  }));

  return NextResponse.json({ results }, { status: 200 });
};
