const LOCALHOST_URL = 'http://localhost:3000';

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function getSiteUrl(): string {
  const candidates = [process.env.NEXT_PUBLIC_SITE_URL, process.env.NEXTAUTH_URL, LOCALHOST_URL];

  for (const candidate of candidates) {
    if (!candidate) continue;
    const normalized = normalizeUrl(candidate);
    if (!normalized) continue;

    try {
      // Validate URL format and return normalized value when valid.
      new URL(normalized);
      return normalized;
    } catch {
      // Try next candidate.
    }
  }

  return LOCALHOST_URL;
}

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
