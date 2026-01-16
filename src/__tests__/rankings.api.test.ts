import { prisma } from '../lib/prisma';
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
    gameResult: {
      findMany: jest.fn(),
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

  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-12-30T12:00:00.000Z'));
    mockFindMany().mockReset();
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

  it('uses defaults (timeframe=all, limit=50) and ranks results', async () => {
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
    const req = makeReq('http://localhost/api/rankings');
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

  it('applies timeframe=week and limit', async () => {
    mockFindMany().mockResolvedValueOnce([]);
    const GET = await getHandler();
    const req = new Request('http://localhost/api/rankings?timeframe=week&limit=10');
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
});
