jest.mock('next/server', () => ({
  NextResponse: {
    json: (body: unknown, init?: { status?: number; headers?: Record<string, string> }) => ({
      status: init?.status ?? 200,
      headers: init?.headers ?? {},
      json: async () => body,
    }),
  },
}));

import { rateLimit, getClientIp, getClientIpFromHeaders } from '../lib/rate-limit';

describe('rateLimit', () => {
  const config = { maxRequests: 3, windowMs: 1000 };

  test('allows requests under the limit', () => {
    const id = 'test-allow';
    expect(rateLimit(id, config)).toBeNull();
    expect(rateLimit(id, config)).toBeNull();
    expect(rateLimit(id, config)).toBeNull();
  });

  test('blocks requests once the limit is exceeded within the window', async () => {
    const id = 'test-block';
    expect(rateLimit(id, config)).toBeNull();
    expect(rateLimit(id, config)).toBeNull();
    expect(rateLimit(id, config)).toBeNull();

    const blocked = rateLimit(id, config);
    expect(blocked).not.toBeNull();
    expect(blocked?.status).toBe(429);

    const body = (await blocked?.json()) as { error: string; retryAfter: number };
    expect(body.error).toContain('Too many requests');
    expect(body.retryAfter).toBeGreaterThan(0);
  });

  test('uses the custom message when provided', async () => {
    const id = 'test-custom-message';
    const custom = { ...config, message: 'Slow down!' };
    rateLimit(id, custom);
    rateLimit(id, custom);
    rateLimit(id, custom);

    const blocked = rateLimit(id, custom);
    const body = (await blocked?.json()) as { error: string };
    expect(body.error).toBe('Slow down!');
  });

  test('resets the counter after the window expires', () => {
    jest.useFakeTimers();
    try {
      const id = 'test-reset';
      rateLimit(id, config);
      rateLimit(id, config);
      rateLimit(id, config);
      expect(rateLimit(id, config)).not.toBeNull();

      jest.advanceTimersByTime(config.windowMs + 1);

      expect(rateLimit(id, config)).toBeNull();
    } finally {
      jest.useRealTimers();
    }
  });

  test('tracks distinct identifiers independently', () => {
    expect(rateLimit('test-a', config)).toBeNull();
    expect(rateLimit('test-a', config)).toBeNull();
    expect(rateLimit('test-a', config)).toBeNull();
    expect(rateLimit('test-a', config)).not.toBeNull();

    // A different identifier should not be affected by 'test-a' usage.
    expect(rateLimit('test-b', config)).toBeNull();
  });
});

describe('getClientIp', () => {
  // jsdom's test environment does not provide a global `Request`, so use a
  // minimal stand-in exposing the `headers.get` surface that getClientIp needs.
  const makeRequest = (headers: Record<string, string>) =>
    ({
      headers: { get: (key: string) => headers[key.toLowerCase()] ?? null },
    }) as unknown as Request;

  test('prefers X-Forwarded-For and takes the first entry', () => {
    const req = makeRequest({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' });
    expect(getClientIp(req)).toBe('1.2.3.4');
  });

  test('falls back to X-Real-IP', () => {
    const req = makeRequest({ 'x-real-ip': '9.9.9.9' });
    expect(getClientIp(req)).toBe('9.9.9.9');
  });

  test('falls back to "unknown" when no headers are present', () => {
    const req = makeRequest({});
    expect(getClientIp(req)).toBe('unknown');
  });
});

describe('getClientIpFromHeaders', () => {
  test('prefers X-Forwarded-For and takes the first entry', () => {
    expect(getClientIpFromHeaders({ 'x-forwarded-for': '1.2.3.4, 5.6.7.8' })).toBe('1.2.3.4');
  });

  test('falls back to X-Real-IP', () => {
    expect(getClientIpFromHeaders({ 'x-real-ip': '9.9.9.9' })).toBe('9.9.9.9');
  });

  test('falls back to "unknown" for missing or non-string headers', () => {
    expect(getClientIpFromHeaders(undefined)).toBe('unknown');
    expect(getClientIpFromHeaders(null)).toBe('unknown');
    expect(getClientIpFromHeaders({})).toBe('unknown');
    expect(getClientIpFromHeaders({ 'x-forwarded-for': 123 })).toBe('unknown');
  });
});
