import type { MetadataRoute } from 'next';
import { loadSiteContent } from '@/cms/server/content';

/** Safety net: even if an on-demand refresh is missed (e.g. server restart), pages refresh from the CMS at least this often (seconds). */
export const revalidate = 300;

export default async function robots(): Promise<MetadataRoute.Robots> {
  const site = await loadSiteContent(false);
  const base = String(site.settings.siteUrl || 'https://eduzycampus.com').replace(/\/$/, '');
  return {
    rules: { userAgent: '*', allow: '/', disallow: ['/admin', '/api/'] },
    sitemap: `${base}/sitemap.xml`,
  };
}
