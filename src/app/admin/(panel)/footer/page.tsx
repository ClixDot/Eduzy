import { SimpleSingletonPage } from '@/admin/pages/ContentPages';

export const metadata = { title: "Footer" };

export default function Page() {
  return <SimpleSingletonPage docKey="footer" title="Footer" sub="Footer logo, description, links, programmes list, call-to-action and copyright." folder="logos" />;
}
