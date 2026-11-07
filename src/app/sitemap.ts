import type { MetadataRoute } from 'next';
import { loadSiteContent } from '@/cms/server/content';

/** Generated from published CMS content, so new courses and blog posts are included automatically. */
/** Safety net: even if an on-demand refresh is missed (e.g. server restart), pages refresh from the CMS at least this often (seconds). */
export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = await loadSiteContent(false);
  const base = String(site.settings.siteUrl || 'https://eduzycampus.com').replace(/\/$/, '');
  const url = (p: string) => `${base}${encodeURI(p)}`;
  const entries: MetadataRoute.Sitemap = [
    { url: url('/'), changeFrequency: 'weekly', priority: 1 },
    { url: url('/courses'), changeFrequency: 'weekly', priority: 0.9 },
    { url: url('/portfolio'), changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/blogs'), changeFrequency: 'weekly', priority: 0.8 },
    { url: url('/contact'), changeFrequency: 'monthly', priority: 0.8 },
    { url: url('/quick-contact'), changeFrequency: 'monthly', priority: 0.7 },
  ];
  if (site.about?.enabled) entries.push({ url: url('/about'), changeFrequency: 'monthly', priority: 0.7 });
  for (const c of site.courses) if (!c.seo?.noindex) entries.push({ url: url(`/courses/${c.slug}`), changeFrequency: 'monthly', priority: 0.8 });
  for (const b of site.blogs) entries.push({ url: url(`/blogs/${b.slug}`), lastModified: b.publishDate || undefined, changeFrequency: 'monthly', priority: 0.6 });
  return entries;
}
