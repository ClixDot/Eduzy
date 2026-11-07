import { Suspense } from 'react';
import { ContentProvider } from '@/cms/site/ContentProvider';
import { getSiteContent, isPreview, absoluteUrl } from '@/cms/site/server';
import { SINGLETON_DEFAULTS } from '@/cms/defaults';
import Header from '../Header';
import Footer from '../Footer';
import ScrollToTop from '../ScrollToTop';
import FloatingContact from '../FloatingContact';
import { AnnouncementBar, SitePopup, MaintenancePage } from './SiteExtras';

const DEFAULT_FONTS = ['Inter', 'Plus Jakarta Sans'];

/** Brand colour / font overrides from Global Settings (nothing is emitted while defaults are used). */
function ThemeStyle({ settings }: { settings: any }) {
  const d = SINGLETON_DEFAULTS.settings;
  const c = settings.colors || {};
  const t = settings.typography || {};
  const rules: string[] = [];
  if (c.primary && c.primary !== d.colors.primary) rules.push(`--color-primary:${c.primary}`);
  if (c.primaryDark && c.primaryDark !== d.colors.primaryDark) rules.push(`--color-primary-dark:${c.primaryDark}`);
  if (c.primaryLight && c.primaryLight !== d.colors.primaryLight) rules.push(`--color-primary-light:${c.primaryLight};--color-bg-light:${c.primaryLight}`);
  if (c.text && c.text !== d.colors.text) rules.push(`--color-text:${c.text}`);
  if (t.bodyFont && t.bodyFont !== d.typography.bodyFont) rules.push(`--font-body:'${t.bodyFont}',-apple-system,BlinkMacSystemFont,sans-serif`);
  if (t.headingFont && t.headingFont !== d.typography.headingFont) rules.push(`--font-heading:'${t.headingFont}',-apple-system,BlinkMacSystemFont,sans-serif`);
  const extraFonts = [t.bodyFont, t.headingFont].filter((f) => f && !DEFAULT_FONTS.includes(f));
  const safe = (s: string) => s.replace(/[<>{}]/g, '');
  let css = rules.length ? `:root{${safe(rules.join(';'))}}` : '';
  if (c.text && c.text !== d.colors.text) css += `body{color:${safe(c.text)}}`;
  if (t.headingWeight && t.headingWeight !== d.typography.headingWeight) css += `h1,h2,h3,h4,h5,h6{font-weight:${Number(t.headingWeight) || 800}}`;
  return (
    <>
      {extraFonts.length > 0 && (
        <link
          rel="stylesheet"
          href={`https://fonts.googleapis.com/css2?${Array.from(new Set(extraFonts)).map((f) => `family=${encodeURIComponent(f)}:wght@400;500;600;700;800`).join('&')}&display=swap`}
        />
      )}
      {css && <style dangerouslySetInnerHTML={{ __html: css }} />}
    </>
  );
}

function OrganizationJsonLd({ settings }: { settings: any }) {
  const c = settings.contact || {};
  const data = {
    '@context': 'https://schema.org',
    '@type': 'EducationalOrganization',
    name: settings.siteName,
    alternateName: `${settings.siteName} ${settings.tagline}`.trim(),
    url: settings.siteUrl,
    logo: absoluteUrl(settings.siteUrl, settings.logo || '/logo.png'),
    description: settings.organizationDescription,
    telephone: c.phoneDisplay || c.phone,
    email: c.email,
    address: { '@type': 'PostalAddress', addressRegion: c.region, addressCountry: c.country },
    areaServed: c.areaServed,
  };
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />;
}

/** Everything around a public page: content provider, header, footer, floating buttons. */
export default async function SiteShell({ children }: { children: React.ReactNode }) {
  const [content, preview] = await Promise.all([getSiteContent(), isPreview()]);
  const { settings } = content;

  if (settings.maintenance?.enabled && !preview) {
    return (
      <ContentProvider initial={content}>
        <ThemeStyle settings={settings} />
        <MaintenancePage />
      </ContentProvider>
    );
  }

  return (
    <ContentProvider initial={content}>
      <ThemeStyle settings={settings} />
      <OrganizationJsonLd settings={settings} />
      <AnnouncementBar />
      <Suspense fallback={null}>
        <ScrollToTop />
      </Suspense>
      <div className="site-wrapper">
        <Suspense fallback={null}>
          <Header />
        </Suspense>
        {children}
        <Footer />
        <FloatingContact />
      </div>
      <SitePopup />
    </ContentProvider>
  );
}
