import { absoluteUrl, getSiteUrl } from '@/lib/site-url';

describe('site-url', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    process.env = { ...originalEnv };
    delete process.env.NEXT_PUBLIC_SITE_URL;
    delete process.env.NEXTAUTH_URL;
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  test('getSiteUrl prioritizes NEXT_PUBLIC_SITE_URL and trims trailing slash', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com/';
    process.env.NEXTAUTH_URL = 'https://auth.example.com';

    expect(getSiteUrl()).toBe('https://example.com');
  });

  test('getSiteUrl falls back to NEXTAUTH_URL when NEXT_PUBLIC_SITE_URL is absent', () => {
    process.env.NEXTAUTH_URL = 'https://auth.example.com///';

    expect(getSiteUrl()).toBe('https://auth.example.com');
  });

  test('getSiteUrl falls back to localhost when both env vars are absent', () => {
    expect(getSiteUrl()).toBe('http://localhost:3000');
  });

  test('absoluteUrl normalizes both prefixed and non-prefixed paths', () => {
    process.env.NEXT_PUBLIC_SITE_URL = 'https://example.com';

    expect(absoluteUrl('/sitemap.xml')).toBe('https://example.com/sitemap.xml');
    expect(absoluteUrl('privacy')).toBe('https://example.com/privacy');
  });
});
