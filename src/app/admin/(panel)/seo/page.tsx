import { SimpleSingletonPage } from '@/admin/pages/ContentPages';

export const metadata = { title: "SEO Settings" };

export default function Page() {
  return <SimpleSingletonPage docKey="seo" title="SEO Settings" sub="How the website appears in Google and when shared on WhatsApp, Facebook and LinkedIn. Course and blog SEO is set on each course / post." folder="pages" />;
}
