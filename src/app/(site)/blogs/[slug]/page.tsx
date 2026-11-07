import { notFound } from 'next/navigation';
import BlogPost from '../../../../views/BlogPost';
import { listItems } from '@/cms/server/content';
import { buildMetadata, getBlog } from '@/cms/site/server';

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const items = await listItems('blogs');
  return items.filter((b) => b.published).map((b) => ({ slug: b.published!.slug }));
}

export async function generateMetadata({ params }: Props) {
  const post = await getBlog((await params).slug);
  if (!post) return { title: 'Article not found | EDUZY' };
  const seo = post.seo || {};
  return buildMetadata(
    { ...seo, title: seo.title || `${post.title} | EDUZY`, description: seo.description || post.excerpt, ogImage: seo.ogImage || post.coverImage, ogImageAlt: seo.ogImageAlt || post.coverAlt },
    `/blogs/${post.slug}`,
    { type: 'article' },
  );
}

export default async function BlogPostPage({ params }: Props) {
  const post = await getBlog((await params).slug);
  if (!post) notFound();
  return <BlogPost post={post} />;
}
