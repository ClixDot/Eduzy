import 'server-only';
import { cache } from 'react';
import { draftMode } from 'next/headers';
import type { Metadata } from 'next';
import { loadSiteContent, loadSeo, findCourse, findBlog } from '../server/content';

export const isPreview = cache(async () => (await draftMode()).isEnabled);
export const getSiteContent = cache(async () => loadSiteContent(await isPreview()));
export const getSeo = cache(async () => loadSeo(await isPreview()));
export const getCourse = cache(async (slug: string) => findCourse(slug, await isPreview()));
export const getBlog = cache(async (slug: string) => findBlog(slug, await isPreview()));

export function absoluteUrl(siteUrl: string, pathOrUrl: string) {
  if (!pathOrUrl) return undefined;
  try {
    return new URL(encodeURI(decodeURI(pathOrUrl)), siteUrl.replace(/\/?$/, '/')).toString();
  } catch {
    return undefined;
  }
}

export interface SeoInput {
  title?: string;
  description?: string;
  keywords?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noindex?: boolean;
}

/** Builds Next.js metadata from CMS SEO fields with site-wide defaults as fallback. */
export async function buildMetadata(page: SeoInput, path: string, extra: { type?: 'website' | 'article' } = {}): Promise<Metadata> {
  const [seo, site] = await Promise.all([getSeo(), getSiteContent()]);
  const d = seo.defaults || {};
  const siteUrl = site.settings.siteUrl || 'https://eduzycampus.com';
  const title = page.title || d.title;
  const description = page.description || d.description;
  const canonical = page.canonical || absoluteUrl(siteUrl, path);
  const image = absoluteUrl(siteUrl, page.ogImage || d.ogImage);
  return {
    title,
    description,
    keywords: page.keywords || d.keywords || undefined,
    alternates: { canonical },
    openGraph: {
      type: extra.type || 'website',
      url: canonical,
      siteName: site.settings.siteName,
      title: page.ogTitle || title,
      description: page.ogDescription || description,
      images: image ? [{ url: image, alt: page.ogImageAlt || undefined }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: page.ogTitle || title,
      description: page.ogDescription || description,
      images: image ? [image] : undefined,
    },
    robots: page.noindex ? { index: false, follow: true } : undefined,
  };
}

/** Metadata for one of the fixed pages configured in SEO Settings. */
export async function pageMetadata(key: string, path: string): Promise<Metadata> {
  const seo = await getSeo();
  return buildMetadata(seo[key] || {}, path);
}
