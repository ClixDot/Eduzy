import { BlogEditorPage } from '@/admin/pages/ContentPages';

export const metadata = { title: "Edit blog post" };

export default async function Page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <BlogEditorPage id={id} />;
}
