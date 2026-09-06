import { prisma } from '../lib/prisma';
import { getServerSession } from 'next-auth';
import { __clearCacheForTests } from '../lib/cache';
const makeReq = (url: string) => ({ url }) as unknown as Request;

jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number }) => ({
      status: init?.status ?? 200,
      json: async () => body,
    }),
  },
}));

// Avoid pulling in real NextAuth ESM dependencies during tests
jest.mock('next-auth', () => ({
  getServerSession: jest.fn().mockResolvedValue(null),
}));

jest.mock('@/lib/auth', () => ({
  authOptions: {},
}));

jest.mock('../lib/prisma', () => ({
  prisma: {
    $queryRawUnsafe: jest.fn(),
    gameResult: {
      findMany: jest.fn(),
    },
    poolChapter: {
      findUnique: jest.fn(),
    },
  },
}));

// Provide a minimal global Request so Next's request polyfill can load
if (!(global as unknown as { Request?: unknown }).Request) {
  class MinimalRequest {
    url: string;
    constructor(url: string) {
      this.url = url;
    }
  }
  (global as unknown as { Request: unknown }).Request = MinimalRequest as unknown;
}

const getHandler = async () => {
  const mod = await import('../app/api/rankings/route');
  return mod.GET;
};

describe('Rankings API', () => {
  const mockFindMany = () => prisma.gameResult.findMany as jest.Mock;
  const mockQueryRawUnsafe = () => prisma.$queryRawUnsafe as jest.Mock;
  const mockFindUniqueChapter = () => prisma.poolChapter.findUnique as jest.Mock;

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-12-30T12:00:00.000Z'));
    mockFindMany().mockReset();
    mockQueryRawUnsafe().mockReset();
    mockFindUniqueChapter().mockReset();
    __clearCacheForTests();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('returns 400 for invalid limit', async () => {
    const GET = await getHandler();
    const req = makeReq('http://localhost/api/rankings?limit=abc');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid limit/);
  });

  it('returns 400 for invalid timeframe', async () => {
    const GET = await getHandler();
    const req = makeReq('http://localhost/api/rankings?timeframe=year');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid timeframe/);
  });

  it('returns 400 for invalid mode', async () => {
    const GET = await getHandler();
    const req = makeReq('http://localhost/api/rankings?mode=unknown');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid mode/);
  });

  it('returns 400 for a non-numeric chapter', async () => {
    const GET = await getHandler();
    const req = makeReq('http://localhost/api/rankings?chapter=abc');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid chapter/);
  });

  it('returns 400 for a chapter number that does not exist', async () => {
    mockFindUniqueChapter().mockResolvedValueOnce(null);
    const GET = await getHandler();
    const req = makeReq('http://localhost/api/rankings?chapter=99');
    const res = await GET(req);
    expect(res.status).toBe(400);
    const json = await res.json();
    expect(json.error).toMatch(/Invalid chapter/);
  });

  it('scopes runs mode to the given chapter', async () => {
    mockFindUniqueChapter().mockResolvedValueOnce({ id: 'chapter-2-id' });
    mockFindMany().mockResolvedValueOnce([]);

    const GET = await getHandler();
    const req = makeReq('http://localhost/api/rankings?mode=runs&chapter=2');
    await GET(req);

    expect(mockFindUniqueChapter()).toHaveBeenCalledWith({
      where: { number: 2 },
      select: { id: true },
    });
    const call = mockFindMany().mock.calls[0]?.[0];
    expect(call.where.chapterId).toBe('chapter-2-id');
  });

  it('does not filter by chapter when chapter=all (default)', async () => {
    mockFindMany().mockResolvedValueOnce([]);

    const GET = await getHandler();
    const req = makeReq('http://localhost/api/rankings?mode=runs&chapter=all');
    await GET(req);

    expect(mockFindUniqueChapter()).not.toHaveBeenCalled();
    const call = mockFindMany().mock.calls[0]?.[0];
    expect(call.where.chapterId).toBeUndefined();
  });

  it('uses runs mode (timeframe=all, limit=50) and ranks results', async () => {
    mockFindMany().mockResolvedValueOnce([
      {
        wordsPerMinute: 200,
        accuracy: 95,
        zenScore: 190,
        createdAt: new Date('2025-12-01T00:00:00.000Z'),
        userId: 'user-alice-12345',
        user: { name: 'Alice' },
      },
      {
        wordsPerMinute: 180,
        accuracy: 96,
        zenScore: 172.8,
        createdAt: new Date('2025-12-02T00:00:00.000Z'),
        userId: 'user-bob-67890',
        user: { name: null },
      },
    ]);

    const GET = await getHandler();
    const req = makeReq('http://localhost/api/rankings?mode=runs');
    const res = await GET(req);

    expect(mockFindMany()).toHaveBeenCalledWith({
      where: { zenScore: { not: null } },
      orderBy: { zenScore: 'desc' },
      take: 50,
      select: {
        wordsPerMinute: true,
        accuracy: true,
        createdAt: true,
        zenScore: true,
        userId: true,
        user: { select: { name: true } },
      },
    });

    expect(res.status).toBe(200);
    const json = await res.json();
    expect(json.results).toHaveLength(2);
    expect(json.results[0]).toMatchObject({
      rank: 1,
      wpm: 200,
      accuracy: 95,
      user: 'Alice',
    });
    expect(json.results[1]).toMatchObject({
      rank: 2,
      wpm: 180,
      accuracy: 96,
      user: 'Player_user-bob',
    });
  });

  it('aggregates best result per user when mode=users', async () => {
    mockQueryRawUnsafe().mockResolvedValueOnce([
      {
        userId: 'user-alice-12345',
        name: 'Alice',
        wordsPerMinute: 210,
        accuracy: 97,
        createdAt: new Date('2025-12-03T00:00:00.000Z'),
        zenScore: 203.7,
      },
      {
        userId: 'user-bob-67890',
        name: null,
        wordsPerMinute: 180,
        accuracy: 96,
        createdAt: new Date('2025-12-01T00:00:00.000Z'),
        zenScore: 172.8,
      },
    ]);

    const GET = await getHandler();
    const req = makeReq('http://localhost/api/rankings?mode=users');
    const res = await GET(req);

    expect(mockQueryRawUnsafe()).toHaveBeenCalledTimes(1);
    expect(res.status).toBe(200);
    const json = await res.json();
    // ユーザーごとに 1 件ずつになっていること
    expect(json.results).toHaveLength(2);
    // Alice が 210 / 97 のプレイで 1 位になっている
    expect(json.results[0]).toMatchObject({
      user: 'Alice',
      wpm: 210,
      accuracy: 97,
    });
    // Bob は匿名ハンドルで 2 位
    expect(json.results[1]).toMatchObject({
      user: 'Player_user-bob',
      wpm: 180,
      accuracy: 96,
    });
  });

  it('applies timeframe=week and limit', async () => {
    mockFindMany().mockResolvedValueOnce([]);
    const GET = await getHandler();
    const req = new Request('http://localhost/api/rankings?timeframe=week&limit=10&mode=runs');
    await GET(req);

    const call = mockFindMany().mock.calls[0]?.[0];
    expect(call.take).toBe(10);
    expect(call.orderBy).toEqual({ zenScore: 'desc' });
    expect(call.where).toBeDefined();
    expect(call.where.zenScore).toEqual({ not: null });
    const gte: Date | undefined = call.where?.createdAt?.gte;
    expect(gte).toBeInstanceOf(Date);
    // 7日分引いた日時になっていること（多少の誤差を許容）
    const expected = Date.now() - 7 * 24 * 60 * 60 * 1000;
    expect(Math.abs(gte!.getTime() - expected)).toBeLessThan(1000); // ±1s
  });

  it('passes timeframe and limit to users query', async () => {
    mockQueryRawUnsafe().mockResolvedValueOnce([]);

    const GET = await getHandler();
    const req = makeReq('http://localhost/api/rankings?timeframe=week&limit=10&mode=users');
    const res = await GET(req);

    expect(res.status).toBe(200);
    expect(mockQueryRawUnsafe()).toHaveBeenCalledTimes(1);
  });

  describe('response caching', () => {
    it('serves a repeat request for the same mode/timeframe/limit from cache', async () => {
      mockFindMany().mockResolvedValueOnce([
        {
          wordsPerMinute: 200,
          accuracy: 95,
          zenScore: 190,
          createdAt: new Date('2025-12-01T00:00:00.000Z'),
          userId: 'user-alice-12345',
          user: { name: 'Alice' },
        },
      ]);

      const GET = await getHandler();
      const first = await GET(makeReq('http://localhost/api/rankings?mode=runs'));
      const second = await GET(makeReq('http://localhost/api/rankings?mode=runs'));

      expect(mockFindMany()).toHaveBeenCalledTimes(1);
      expect((await first.json()).results).toEqual((await second.json()).results);
    });

    it('does not reuse the cache across different mode/timeframe/limit combinations', async () => {
      mockFindMany().mockResolvedValueOnce([]);
      mockFindMany().mockResolvedValueOnce([]);

      const GET = await getHandler();
      await GET(makeReq('http://localhost/api/rankings?mode=runs&limit=10'));
      await GET(makeReq('http://localhost/api/rankings?mode=runs&limit=20'));

      expect(mockFindMany()).toHaveBeenCalledTimes(2);
    });

    it('does not reuse the cache across different chapter selections', async () => {
      mockFindUniqueChapter().mockResolvedValueOnce({ id: 'chapter-2-id' });
      mockFindMany().mockResolvedValueOnce([]);
      mockFindMany().mockResolvedValueOnce([]);

      const GET = await getHandler();
      await GET(makeReq('http://localhost/api/rankings?mode=runs&chapter=all'));
      await GET(makeReq('http://localhost/api/rankings?mode=runs&chapter=2'));

      expect(mockFindMany()).toHaveBeenCalledTimes(2);
    });

    it('still computes isSelf per requester even when the row data is cached', async () => {
      mockFindMany().mockResolvedValueOnce([
        {
          wordsPerMinute: 200,
          accuracy: 95,
          zenScore: 190,
          createdAt: new Date('2025-12-01T00:00:00.000Z'),
          userId: 'user-alice-12345',
          user: { name: 'Alice' },
        },
      ]);

      const GET = await getHandler();

      (getServerSession as jest.Mock).mockResolvedValueOnce(null);
      const anonRes = await GET(makeReq('http://localhost/api/rankings?mode=runs'));
      expect((await anonRes.json()).results[0].isSelf).toBe(false);

      (getServerSession as jest.Mock).mockResolvedValueOnce({
        user: { id: 'user-alice-12345' },
      });
      const selfRes = await GET(makeReq('http://localhost/api/rankings?mode=runs'));
      expect((await selfRes.json()).results[0].isSelf).toBe(true);

      // Row data itself came from the cache both times.
      expect(mockFindMany()).toHaveBeenCalledTimes(1);
    });
  });
});
