import { SimpleSingletonPage } from '@/admin/pages/ContentPages';

export const metadata = { title: "Header & Navigation" };

export default function Page() {
  return <SimpleSingletonPage docKey="header" title="Header & Navigation" sub="Logo, menu links (desktop and mobile), the Enroll button and the mobile call button." folder="logos" />;
}
