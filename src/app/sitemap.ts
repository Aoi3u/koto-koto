import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-url';

const LAST_MODIFIED = {
  home: new Date('2026-04-06T00:00:00.000Z'),
  terms: new Date('2026-04-06T00:00:00.000Z'),
  privacy: new Date('2026-04-06T00:00:00.000Z'),
  licenses: new Date('2026-04-06T00:00:00.000Z'),
  about: new Date('2026-04-06T00:00:00.000Z'),
};

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: absoluteUrl('/'),
      lastModified: LAST_MODIFIED.home,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/terms'),
      lastModified: LAST_MODIFIED.terms,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/privacy'),
      lastModified: LAST_MODIFIED.privacy,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/licenses'),
      lastModified: LAST_MODIFIED.licenses,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: absoluteUrl('/about'),
      lastModified: LAST_MODIFIED.about,
      changeFrequency: 'monthly',
      priority: 0.5,
    },
  ];
}
