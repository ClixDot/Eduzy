'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import CTA from '../components/CTA';
import { useSite } from '@/cms/site/ContentProvider';
import '../components/site/SiteExtras.css';

/** A single blog / journal article (Admin → Blogs / Journal). Content HTML is sanitised on save. */
export default function BlogPost({ post: initial }: { post: any }) {
  const { journal, blogCategories, blogs } = useSite();
  // In admin preview the editor sends live edits for the post; prefer them when present.
  const live = blogs.find((b: any) => b.id === initial.id);
  const post = live && live.__content !== undefined ? { ...initial, ...live, content: live.__content } : initial;
  const category = blogCategories.find((c: any) => c.slug === post.category)?.label;
  const date = post.publishDate ? new Date(post.publishDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' }) : '';

  return (
    <main className="blog-post-page" id="main-content">
      <article className="blog-post">
        <div className="blog-post__inner">
          <Link to="/blogs" className="blog-post__back">← {journal.backLabel}</Link>
          <p className="blog-post__meta">{[category, date, post.author].filter(Boolean).join(' · ')}</p>
          <h1 className="blog-post__title">{post.title}</h1>
          {post.coverImage && <img src={post.coverImage} alt={post.coverAlt || post.title} className="blog-post__cover" />}
          <div className="blog-post__content" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
          {(post.tags || []).length > 0 && (
            <div className="blog-post__tags">
              {post.tags.map((t: string) => (
                <span className="blog-post__tag" key={t}>#{t}</span>
              ))}
            </div>
          )}
        </div>
      </article>
      <CTA />
    </main>
  );
}
