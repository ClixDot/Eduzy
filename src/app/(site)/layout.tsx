import type { Metadata, Viewport } from 'next';
import '../../index.css';
import '../../App.css';
import SiteShell from '@/components/site/SiteShell';
import { getSeo, getSiteContent, absoluteUrl } from '@/cms/site/server';

/** Safety net: even if an on-demand refresh is missed (e.g. server restart), pages refresh from the CMS at least this often (seconds). */
export const revalidate = 300;

export async function generateMetadata(): Promise<Metadata> {
  const [seo, site] = await Promise.all([getSeo(), getSiteContent()]);
  const d = seo.defaults;
  const siteUrl = site.settings.siteUrl || 'https://eduzycampus.com';
  const image = absoluteUrl(siteUrl, d.ogImage);
  let metadataBase: URL | undefined;
  try {
    metadataBase = new URL(siteUrl);
  } catch {
    metadataBase = undefined;
  }
  return {
    metadataBase,
    title: d.title,
    description: d.description,
    keywords: d.keywords,
    openGraph: { type: 'website', url: absoluteUrl(siteUrl, '/'), title: d.title, description: d.description, images: image ? [{ url: image }] : undefined },
    twitter: { card: 'summary_large_image', title: d.title, description: d.description, images: image ? [image] : undefined },
    icons: { icon: site.settings.favicon || '/favicon.svg' },
  };
}

export async function generateViewport(): Promise<Viewport> {
  const seo = await getSeo();
  return { width: 'device-width', initialScale: 1, themeColor: seo.defaults.themeColor || '#FF3B0B' };
}

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteShell>{children}</SiteShell>;
}
