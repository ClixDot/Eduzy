import { handler } from '@/cms/server/http';
import { requireUser, can } from '@/cms/server/auth';
import { listItems, adminHrefForSingleton } from '@/cms/server/content';
import { listMedia } from '@/cms/server/media';
import { COLLECTIONS, SINGLETONS } from '@/cms/schema';

const ITEM_HREF: Record<string, (id: string) => string> = {
  courses: (id) => `/admin/courses/${id}`,
  blogs: (id) => `/admin/blogs/${id}`,
};
const LIST_HREF: Record<string, string> = {
  courseCategories: '/admin/course-categories', blogCategories: '/admin/blogs?tab=categories', gallery: '/admin/gallery',
  galleryCategories: '/admin/gallery?tab=categories', testimonials: '/admin/testimonials', videoTestimonials: '/admin/testimonials?tab=videos',
  faqs: '/admin/faq', accreditations: '/admin/accreditation',
};

const strip = (s: unknown) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export const GET = handler(async (req) => {
  const user = await requireUser();
  const q = (new URL(req.url).searchParams.get('q') || '').trim().toLowerCase();
  if (q.length < 2) return { results: [] };
  const results: { group: string; title: string; text?: string; href: string; image?: string }[] = [];
  const match = (...vals: unknown[]) => vals.some((v) => strip(v).toLowerCase().includes(q));

  for (const def of Object.values(SINGLETONS)) {
    if (def.permission && !can(user.role, def.permission)) continue;
    if (match(def.label, def.description)) results.push({ group: 'Pages & sections', title: def.label, text: def.description, href: adminHrefForSingleton(def.key) });
  }
  for (const [name, def] of Object.entries(COLLECTIONS)) {
    for (const it of await listItems(name)) {
      if (!match(...def.searchFields.map((f) => it.draft?.[f]))) continue;
      results.push({
        group: def.label,
        title: strip(it.draft?.[def.titleField]) || 'Untitled',
        text: def.subtitleField ? strip(it.draft?.[def.subtitleField]).slice(0, 120) : undefined,
        href: ITEM_HREF[name]?.(it.id) || `${LIST_HREF[name]}${LIST_HREF[name].includes('?') ? '&' : '?'}open=${it.id}`,
        image: def.imageField ? it.draft?.[def.imageField] : undefined,
      });
    }
  }
  for (const m of await listMedia()) if (match(m.filename, m.alt)) results.push({ group: 'Media', title: m.filename, text: m.alt, href: `/admin/media?open=${m.id}`, image: m.url });
  return { results: results.slice(0, 40) };
});
