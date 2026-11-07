import { handler } from '@/cms/server/http';
import { requireUser, can } from '@/cms/server/auth';
import { listItems, recentActivity, itemStatus, adminHrefForSingleton, getSingleton } from '@/cms/server/content';
import { getStore } from '@/cms/server/store';
import { listMedia, mediaStorage } from '@/cms/server/media';
import { emailConfigured } from '@/cms/server/mail';
import { COLLECTIONS, SINGLETONS } from '@/cms/schema';
import type { SingletonDoc } from '@/cms/types';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

const ITEM_HREF: Record<string, (id: string) => string> = {
  courses: (id) => `/admin/courses/${id}`,
  blogs: (id) => `/admin/blogs/${id}`,
  courseCategories: () => '/admin/course-categories',
  blogCategories: () => '/admin/blogs?tab=categories',
  gallery: () => '/admin/gallery',
  galleryCategories: () => '/admin/gallery?tab=categories',
  testimonials: () => '/admin/testimonials',
  videoTestimonials: () => '/admin/testimonials?tab=videos',
  faqs: () => '/admin/faq',
  accreditations: () => '/admin/accreditation',
};

export const GET = handler(async () => {
  const user = await requireUser();
  const store = getStore();
  const [singletonDocs, activity, media, about] = await Promise.all([
    store.all<SingletonDoc>('singletons'),
    recentActivity(400),
    listMedia(),
    getSingleton('about'),
  ]);
  const collections: Record<string, Awaited<ReturnType<typeof listItems>>> = {};
  for (const name of Object.keys(COLLECTIONS)) collections[name] = await listItems(name);

  // --- pending changes -----------------------------------------------------
  const pending: { label: string; kind: string; href: string; updatedAt: string; updatedBy?: string; state: 'changed' | 'draft' }[] = [];
  for (const s of singletonDocs) {
    if (!SINGLETONS[s.id]) continue;
    if (!same(s.draft, s.published)) pending.push({ label: SINGLETONS[s.id].label, kind: 'Section', href: adminHrefForSingleton(s.id), updatedAt: s.updatedAt, updatedBy: s.updatedBy, state: 'changed' });
  }
  for (const [name, items] of Object.entries(collections)) {
    const def = COLLECTIONS[name];
    for (const it of items) {
      const st = itemStatus(it);
      if (!st.live || st.hasChanges)
        pending.push({ label: String(it.draft?.[def.titleField] || 'Untitled'), kind: def.singular, href: ITEM_HREF[name](it.id), updatedAt: it.updatedAt, updatedBy: it.updatedBy, state: st.live ? 'changed' : 'draft' });
    }
  }
  pending.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  // --- website pages -------------------------------------------------------
  const live = (n: string) => collections[n].filter((i) => i.published);
  const aboutLive = !!(about.published?.enabled);
  const staticPages = [
    { name: 'Home', path: '/', href: '/admin/pages/home', live: true },
    { name: 'Courses', path: '/courses', href: '/admin/pages/courses', live: true },
    { name: 'Blogs', path: '/blogs', href: '/admin/blogs', live: true },
    { name: 'Portfolio', path: '/portfolio', href: '/admin/pages/portfolio', live: true },
    { name: 'Contact', path: '/contact', href: '/admin/contact', live: true },
    { name: 'Quick contact', path: '/quick-contact', href: '/admin/pages/quick-contact', live: true },
    { name: 'About', path: '/about', href: '/admin/pages/about', live: aboutLive },
  ];
  const coursePages = collections.courses.length;
  const blogPages = collections.blogs.length;
  const totalPages = staticPages.length + coursePages + blogPages;
  const publishedPages = staticPages.filter((p) => p.live).length + live('courses').length + live('blogs').length;

  // --- activity chart (last 14 days) ----------------------------------------
  const days: { date: string; label: string; saved: number; published: number }[] = [];
  const today = new Date();
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    days.push({ date: key, label: d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }), saved: 0, published: 0 });
  }
  const byDay = new Map(days.map((d) => [d.date, d]));
  for (const a of activity) {
    if (a.action === 'signed-in') continue;
    const d = byDay.get(a.at.slice(0, 10));
    if (!d) continue;
    if (a.action === 'published' || a.action === 'unpublished') d.published++;
    else d.saved++;
  }

  // --- recently edited -------------------------------------------------------
  const edited: { label: string; kind: string; href: string; updatedAt: string; updatedBy?: string; live: boolean; changed: boolean }[] = [];
  for (const s of singletonDocs) if (SINGLETONS[s.id]) edited.push({ label: SINGLETONS[s.id].label, kind: 'Section', href: adminHrefForSingleton(s.id), updatedAt: s.updatedAt, updatedBy: s.updatedBy, live: true, changed: !same(s.draft, s.published) });
  for (const [name, items] of Object.entries(collections))
    for (const it of items)
      if (it.updatedBy) edited.push({ label: String(it.draft?.[COLLECTIONS[name].titleField] || 'Untitled'), kind: COLLECTIONS[name].singular, href: ITEM_HREF[name](it.id), updatedAt: it.updatedAt, updatedBy: it.updatedBy, live: !!it.published, changed: itemStatus(it).hasChanges });
  edited.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));

  // --- notifications ---------------------------------------------------------
  const notifications: { level: 'warning' | 'info'; title: string; text: string; href?: string }[] = [];
  const prod = process.env.NODE_ENV === 'production';
  if (store.kind === 'file')
    notifications.push({ level: prod ? 'warning' : 'info', title: 'Development content storage', text: 'Content is saved to local files on this computer. Connect MongoDB (MONGODB_URI) before going live.' });
  if (mediaStorage().kind === 'local')
    notifications.push({ level: prod ? 'warning' : 'info', title: 'Development image storage', text: 'Uploaded images are stored on this computer. Connect Cloudinary before going live.' });
  if (pending.length) notifications.push({ level: 'info', title: `${pending.length} unpublished change${pending.length > 1 ? 's' : ''}`, text: 'Saved drafts are not visible on the website until you publish them.', href: '/admin#pending' });
  const noAlt = media.filter((m) => m.provider !== 'static' && !m.alt).length;
  if (noAlt) notifications.push({ level: 'info', title: `${noAlt} image${noAlt > 1 ? 's' : ''} without a description`, text: 'Alt text helps Google and visitors using screen readers.', href: '/admin/media?filter=noalt' });
  if (can(user.role, 'users') && !emailConfigured())
    notifications.push({ level: 'info', title: 'Password-reset emails are off', text: 'Set RESEND_API_KEY and CMS_EMAIL_FROM to send reset links by email.' });

  return {
    stats: {
      totalPages,
      publishedPages,
      drafts: pending.length,
      courses: { total: collections.courses.length, live: live('courses').length },
      blogs: { total: collections.blogs.length, live: live('blogs').length },
      media: { total: media.length, uploaded: media.filter((m) => m.provider !== 'static').length },
      testimonials: live('testimonials').length + live('videoTestimonials').length,
      gallery: live('gallery').length,
      faqs: live('faqs').length,
    },
    pages: [
      ...staticPages,
      { name: `Course pages (${coursePages})`, path: '/courses', href: '/admin/courses', live: live('courses').length > 0 },
      { name: `Blog posts (${blogPages})`, path: '/blogs', href: '/admin/blogs', live: live('blogs').length > 0 },
    ],
    pending: pending.slice(0, 12),
    chart: days,
    recentlyEdited: edited.slice(0, 8),
    activity: activity.filter((a) => a.action !== 'signed-in').slice(0, 12),
    notifications,
    recentMedia: media.filter((m) => m.provider !== 'static').slice(0, 6).concat(media.filter((m) => m.provider === 'static').slice(0, 6)).slice(0, 6).map((m) => ({ id: m.id, url: m.url, alt: m.alt })),
  };
});
