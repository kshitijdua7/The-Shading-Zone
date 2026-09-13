import type { MetadataRoute } from 'next';
import { site } from '@/lib/site';
import { products, collections } from '@/lib/content';

export const dynamic = 'force-static';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  const staticRoutes: { path: string; priority: number; changeFrequency: MetadataRoute.Sitemap[number]['changeFrequency'] }[] = [
    { path: '', priority: 1.0, changeFrequency: 'monthly' },
    { path: '/blinds', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/curtains', priority: 0.9, changeFrequency: 'monthly' },
    { path: '/collections', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/motorized', priority: 0.8, changeFrequency: 'monthly' },
    { path: '/manufacturing', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/process', priority: 0.7, changeFrequency: 'yearly' },
    { path: '/gallery', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/before-after', priority: 0.6, changeFrequency: 'monthly' },
    { path: '/about', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/consultation', priority: 0.95, changeFrequency: 'monthly' },
    { path: '/quote', priority: 0.95, changeFrequency: 'monthly' },
    { path: '/contact', priority: 0.8, changeFrequency: 'yearly' },
    { path: '/faq', priority: 0.7, changeFrequency: 'monthly' },
    { path: '/commercial', priority: 0.6, changeFrequency: 'yearly' },
    { path: '/trade', priority: 0.6, changeFrequency: 'yearly' },
  ];

  return [
    ...staticRoutes.map((r) => ({
      url: `${site.url}${r.path}`,
      lastModified: now,
      changeFrequency: r.changeFrequency,
      priority: r.priority,
    })),
    ...products.map((p) => ({
      url: `${site.url}/blinds/${p.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...collections.map((c) => ({
      url: `${site.url}/collections/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
  ];
}
