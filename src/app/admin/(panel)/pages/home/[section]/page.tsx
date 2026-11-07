import { HomeSectionEditor } from '@/admin/pages/ContentPages';

export const metadata = { title: "Home section" };

export default async function Page({ params }: { params: Promise<{ section: string }> }) {
  const { section } = await params;
  return <HomeSectionEditor section={section} />;
}
