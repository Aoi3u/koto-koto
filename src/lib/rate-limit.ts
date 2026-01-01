import { NextResponse } from 'next/server';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// In-memory store for rate limiting (use Redis in production for distributed systems)
const store = new Map<string, RateLimitStore>();

// Cleanup old entries every 10 minutes
setInterval(
  () => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (now > value.resetTime) {
        store.delete(key);
      }
    }
  },
  10 * 60 * 1000
);

export interface RateLimitConfig {
  /** Maximum number of requests allowed within the window */
  maxRequests: number;
  /** Time window in milliseconds */
  windowMs: number;
  /** Custom error message */
  message?: string;
}

/**
 * Rate limiting middleware for API routes
 * @param identifier - Unique identifier (usually IP address)
 * @param config - Rate limit configuration
 * @returns null if allowed, NextResponse with 429 status if rate limit exceeded
 */
export function rateLimit(identifier: string, config: RateLimitConfig): NextResponse | null {
  const now = Date.now();
  const key = identifier;

  const record = store.get(key);

  if (!record || now > record.resetTime) {
    // First request or window has expired
    store.set(key, {
      count: 1,
      resetTime: now + config.windowMs,
    });
    return null;
  }

  if (record.count >= config.maxRequests) {
    // Rate limit exceeded
    const retryAfter = Math.ceil((record.resetTime - now) / 1000);
    return NextResponse.json(
      {
        error: config.message || 'Too many requests, please try again later',
        retryAfter,
      },
      {
        status: 429,
        headers: {
          'Retry-After': retryAfter.toString(),
          'X-RateLimit-Limit': config.maxRequests.toString(),
          'X-RateLimit-Remaining': '0',
          'X-RateLimit-Reset': new Date(record.resetTime).toISOString(),
        },
      }
    );
  }

  // Increment counter
  record.count++;
  return null;
}

/**
 * Extract IP address from request
 * Checks X-Forwarded-For, X-Real-IP headers and falls back to connection IP
 */
export function getClientIp(req: Request): string {
  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }

  const realIp = req.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }

  // Fallback for development
  return 'unknown';
}
