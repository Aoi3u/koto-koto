import type { MetadataRoute } from 'next';
import { absoluteUrl } from '@/lib/site-url';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    {
      url: absoluteUrl('/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absoluteUrl('/terms'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/privacy'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.4,
    },
    {
      url: absoluteUrl('/licenses'),
      lastModified: now,
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];
}
