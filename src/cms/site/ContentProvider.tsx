'use client';
import React, { createContext, useContext, useEffect, useState } from 'react';

export type Site = Record<string, any>;

const SiteContext = createContext<Site | null>(null);

/** Normalises an item sent from the admin editor so it matches what the server would send. */
function normaliseItem(collection: string, item: any) {
  if (collection === 'courses') {
    return {
      ...item,
      fullName: item.name,
      categories: Array.from(new Set([item.category, ...(item.categories || [])].filter(Boolean))),
    };
  }
  if (collection === 'blogs') {
    const { content, ...rest } = item;
    return { ...rest, __content: content ?? '' };
  }
  return item;
}

/**
 * Provides CMS content to every public component.
 * In Draft Mode (admin preview) it also listens for unsaved edits sent by the admin editor
 * through `postMessage`, so the preview updates while the admin types.
 */
export function ContentProvider({ initial, children }: { initial: Site; children: React.ReactNode }) {
  const [content, setContent] = useState<Site>(initial);
  const [framed, setFramed] = useState(true);

  useEffect(() => setContent(initial), [initial]);

  useEffect(() => {
    if (!initial.preview) return;
    setFramed(window.parent !== window);
    const onMessage = (e: MessageEvent) => {
      if (e.origin !== window.location.origin) return;
      const m = e.data;
      if (!m || m.source !== 'eduzy-cms') return;
      if (m.type === 'singleton' && typeof m.key === 'string') {
        setContent((c) => ({ ...c, [m.key]: m.data }));
      } else if (m.type === 'item' && typeof m.collection === 'string' && m.item?.id) {
        setContent((c) => {
          const list: any[] = Array.isArray(c[m.collection]) ? c[m.collection] : [];
          const item = normaliseItem(m.collection, m.item);
          const i = list.findIndex((x) => x.id === item.id);
          return { ...c, [m.collection]: i === -1 ? [...list, item] : list.map((x, j) => (j === i ? item : x)) };
        });
      } else if (m.type === 'scroll' && typeof m.anchor === 'string') {
        const el = m.anchor === 'top' ? document.body : document.getElementById(m.anchor);
        if (el) window.scrollTo({ top: m.anchor === 'top' ? 0 : el.getBoundingClientRect().top + window.scrollY - 80, behavior: 'smooth' });
      }
    };
    window.addEventListener('message', onMessage);
    if (window.parent !== window) window.parent.postMessage({ source: 'eduzy-site', type: 'ready', path: location.pathname }, location.origin);
    return () => window.removeEventListener('message', onMessage);
  }, [initial.preview]);

  return (
    <SiteContext.Provider value={content}>
      {children}
      {initial.preview && !framed && (
        <a
          href={`/api/admin/preview/exit?path=${typeof window !== 'undefined' ? encodeURIComponent(location.pathname) : '/'}`}
          style={{
            position: 'fixed', left: 16, bottom: 16, zIndex: 99999, background: '#111', color: '#fff', padding: '10px 16px',
            borderRadius: 999, fontSize: 13, fontWeight: 600, fontFamily: 'Inter, sans-serif', boxShadow: '0 6px 20px rgba(0,0,0,.25)', textDecoration: 'none',
          }}
        >
          Previewing drafts · Exit preview
        </a>
      )}
    </SiteContext.Provider>
  );
}

export function useSite(): Site {
  const ctx = useContext(SiteContext);
  if (!ctx) throw new Error('useSite must be used inside <ContentProvider>');
  return ctx;
}
