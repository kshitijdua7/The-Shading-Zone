import type { MetadataRoute } from 'next';
import { site } from '@/lib/live';

export const dynamic = 'force-dynamic';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [{ userAgent: '*', allow: '/', disallow: ['/privacy', '/terms'] }],
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
