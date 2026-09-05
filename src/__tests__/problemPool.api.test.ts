import { prisma } from '../lib/prisma';
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

jest.mock('../lib/prisma', () => ({
  prisma: {
    typingProblem: {
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
  const mod = await import('../app/api/problem-pool/route');
  return mod.GET;
};

const sampleRow = (problemKey: string) => ({
  problemKey,
  display: '吾輩は猫である',
  reading: 'わがはいはねこである',
  author: null,
  title: null,
});

describe('Problem Pool API', () => {
  const mockFindMany = () => prisma.typingProblem.findMany as jest.Mock;

  beforeEach(() => {
    mockFindMany().mockReset();
    __clearCacheForTests();
  });

  it('returns 400 for invalid mode', async () => {
    const GET = await getHandler();
    const res = await GET(makeReq('http://localhost/api/problem-pool?mode=unknown'));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Invalid mode/);
  });

  it('returns 400 for invalid count', async () => {
    const GET = await getHandler();
    const res = await GET(makeReq('http://localhost/api/problem-pool?count=abc'));
    expect(res.status).toBe(400);
    expect((await res.json()).error).toMatch(/Invalid count/);
  });

  it('returns 503 when the active pool is empty', async () => {
    mockFindMany().mockResolvedValueOnce([]);
    const GET = await getHandler();
    const res = await GET(makeReq('http://localhost/api/problem-pool?mode=classic'));
    expect(res.status).toBe(503);
  });

  it('queries CLASSIC/isActive rows and returns them under the classic problemKey', async () => {
    mockFindMany().mockResolvedValueOnce([sampleRow('classic_001'), sampleRow('classic_002')]);

    const GET = await getHandler();
    const res = await GET(makeReq('http://localhost/api/problem-pool?mode=classic&count=2'));

    expect(mockFindMany()).toHaveBeenCalledWith({
      where: { mode: 'CLASSIC', isActive: true },
      select: { problemKey: true, display: true, reading: true, author: true, title: true },
    });

    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.problems).toHaveLength(2);
    const ids = body.problems.map((p: { id: string }) => p.id).sort();
    expect(ids).toEqual(['classic_001', 'classic_002']);
  });

  it('suffixes ids with a runtime-unique token in word-endless mode', async () => {
    mockFindMany().mockResolvedValueOnce([sampleRow('word_0001')]);

    const GET = await getHandler();
    const res = await GET(makeReq('http://localhost/api/problem-pool?mode=word-endless&count=1'));

    expect(mockFindMany()).toHaveBeenCalledWith({
      where: { mode: 'WORD_ENDLESS', isActive: true },
      select: { problemKey: true, display: true, reading: true, author: true, title: true },
    });

    const body = await res.json();
    expect(body.problems[0].id).toMatch(/^word_0001-\d+-0$/);
  });

  it('caches the active pool per mode instead of re-querying every request', async () => {
    mockFindMany().mockResolvedValueOnce([sampleRow('classic_001'), sampleRow('classic_002')]);

    const GET = await getHandler();
    await GET(makeReq('http://localhost/api/problem-pool?mode=classic&count=1'));
    await GET(makeReq('http://localhost/api/problem-pool?mode=classic&count=2'));

    expect(mockFindMany()).toHaveBeenCalledTimes(1);
  });

  it('does not share the cache between classic and word-endless pools', async () => {
    mockFindMany().mockResolvedValueOnce([sampleRow('classic_001')]);
    mockFindMany().mockResolvedValueOnce([sampleRow('word_0001')]);

    const GET = await getHandler();
    await GET(makeReq('http://localhost/api/problem-pool?mode=classic'));
    await GET(makeReq('http://localhost/api/problem-pool?mode=word-endless'));

    expect(mockFindMany()).toHaveBeenCalledTimes(2);
  });

  it('never returns more problems than requested, even from a larger cached pool', async () => {
    mockFindMany().mockResolvedValueOnce([
      sampleRow('classic_001'),
      sampleRow('classic_002'),
      sampleRow('classic_003'),
      sampleRow('classic_004'),
      sampleRow('classic_005'),
    ]);

    const GET = await getHandler();
    const res = await GET(makeReq('http://localhost/api/problem-pool?mode=classic&count=2'));
    const body = await res.json();

    expect(body.problems).toHaveLength(2);
    // Sampled without replacement: no duplicate ids in a single response.
    expect(new Set(body.problems.map((p: { id: string }) => p.id)).size).toBe(2);
  });
});
