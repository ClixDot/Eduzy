import { SimpleSingletonPage } from '@/admin/pages/ContentPages';

export const metadata = { title: "Global Settings" };

export default function Page() {
  return <SimpleSingletonPage docKey="settings" title="Global Settings" sub="Website name, logo, contact details, social links, announcement bar, popup and maintenance mode." folder="logos" />;
}
