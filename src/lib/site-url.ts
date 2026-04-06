const LOCALHOST_URL = 'http://localhost:3000';

function normalizeUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export function getSiteUrl(): string {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? process.env.NEXTAUTH_URL ?? LOCALHOST_URL;
  return normalizeUrl(url);
}

export function absoluteUrl(path: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${getSiteUrl()}${normalizedPath}`;
}
