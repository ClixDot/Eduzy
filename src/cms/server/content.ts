import 'server-only';
import { randomUUID } from 'crypto';
import { revalidatePath } from 'next/cache';
import { getStore } from './store';
import { SINGLETONS, COLLECTIONS, HOME_SECTION_TYPES, richTextBlockFields, getCollectionDef, getSingletonDef } from '../schema';
import { SINGLETON_DEFAULTS, COLLECTION_SEEDS } from '../defaults';
import { validateFields, deepMerge, Errors, slugify } from '../validate';
import { cleanHtml } from './sanitize';
import type { ItemDoc, SingletonDoc, ActivityDoc } from '../types';
import type { SessionUser } from './auth';

export class CmsError extends Error {
  constructor(message: string, public status = 400, public errors?: Errors) {
    super(message);
  }
}

const now = () => new Date().toISOString();
const same = (a: unknown, b: unknown) => JSON.stringify(a ?? null) === JSON.stringify(b ?? null);
const sanitize = { sanitizeHtml: cleanHtml };

/** Invalidate every statically rendered public page (they all read CMS content). */
export function revalidateSite() {
  try {
    revalidatePath('/', 'layout');
  } catch {
    /* not inside a request (scripts/tests) */
  }
}

// ---------------------------------------------------------------------------
// Activity log
// ---------------------------------------------------------------------------

export async function logActivity(user: SessionUser | null, entry: Omit<ActivityDoc, 'id' | 'at' | 'userId' | 'userName'>) {
  const store = getStore();
  const doc: ActivityDoc = { id: `${Date.now()}-${randomUUID().slice(0, 8)}`, at: now(), userId: user?.id, userName: user?.name, ...entry };
  await store.put('activity', doc);
  if (Math.random() < 0.05) await store.prune('activity', 'at', 3000);
}

export async function recentActivity(limit = 50) {
  return getStore().recent<ActivityDoc>('activity', 'at', limit);
}

// ---------------------------------------------------------------------------
// Singletons
// ---------------------------------------------------------------------------

export function singletonDefaults(key: string) {
  return SINGLETON_DEFAULTS[key] ?? {};
}

export async function getSingleton(key: string): Promise<SingletonDoc> {
  if (!getSingletonDef(key)) throw new CmsError('Unknown content section.', 404);
  const doc = await getStore().get<SingletonDoc>('singletons', key);
  const defaults = singletonDefaults(key);
  if (!doc) return { id: key, draft: defaults, published: defaults, version: 0, updatedAt: '', publishedAt: null };
  return {
    ...doc,
    draft: deepMerge(defaults, doc.draft),
    published: doc.published ? deepMerge(defaults, doc.published) : null,
  };
}

function validateHome(data: any): { value: any; errors: Errors } {
  const errors: Errors = {};
  const seen = new Set<string>();
  const sections = (Array.isArray(data?.sections) ? data.sections : [])
    .filter((s: any) => s && typeof s.id === 'string' && /^[a-zA-Z0-9_-]{1,60}$/.test(s.id) && HOME_SECTION_TYPES[s.type])
    .filter((s: any) => (seen.has(s.id) ? false : (seen.add(s.id), true)))
    .slice(0, 40)
    .map((s: any) => ({ id: s.id, type: s.type, enabled: s.enabled !== false, ...(s.type === 'richText' ? { label: String(s.label || '').slice(0, 80) } : {}) }));
  const types = new Set<string>();
  for (const s of sections) {
    if (!HOME_SECTION_TYPES[s.type].repeatable) {
      if (types.has(s.type)) errors.sections = `“${HOME_SECTION_TYPES[s.type].label}” can only appear once.`;
      types.add(s.type);
    }
  }
  const blocks: Record<string, any> = {};
  for (const s of sections.filter((x: any) => x.type === 'richText')) {
    const r = validateFields(richTextBlockFields, data?.blocks?.[s.id], sanitize, `blocks.${s.id}`);
    blocks[s.id] = r.value;
    Object.assign(errors, r.errors);
  }
  return { value: { sections, blocks }, errors };
}

export function validateSingleton(key: string, data: any) {
  if (key === 'home') return validateHome(data);
  const def = getSingletonDef(key)!;
  return validateFields(def.fields, data, sanitize);
}

export async function saveSingleton(
  key: string,
  data: any,
  opts: { version?: number; publish?: boolean; user: SessionUser },
): Promise<SingletonDoc> {
  const def = getSingletonDef(key);
  if (!def) throw new CmsError('Unknown content section.', 404);
  const current = await getSingleton(key);
  if (opts.version !== undefined && opts.version !== current.version)
    throw new CmsError('This content was changed by someone else since you opened it. Reload to get the latest version.', 409);
  const { value, errors } = validateSingleton(key, data);
  if (Object.keys(errors).length) throw new CmsError('Please fix the highlighted fields.', 422, errors);

  const doc: SingletonDoc = {
    id: key,
    draft: value,
    published: opts.publish ? value : current.version === 0 ? singletonDefaults(key) : current.published,
    version: current.version + 1,
    updatedAt: now(),
    updatedBy: opts.user.name,
    publishedAt: opts.publish ? now() : current.publishedAt ?? null,
    publishedBy: opts.publish ? opts.user.name : current.publishedBy,
  };
  await getStore().put('singletons', doc);
  await logActivity(opts.user, { action: opts.publish ? 'published' : 'saved', kind: 'section', target: key, label: def.label, href: adminHrefForSingleton(key) });
  if (opts.publish) revalidateSite();
  return getSingleton(key);
}

export async function discardSingletonDraft(key: string, user: SessionUser) {
  const current = await getSingleton(key);
  if (!current.published) throw new CmsError('Nothing has been published yet.', 400);
  await getStore().put('singletons', { ...current, draft: current.published, version: current.version + 1, updatedAt: now(), updatedBy: user.name });
  await logActivity(user, { action: 'discarded', kind: 'section', target: key, label: SINGLETONS[key].label, href: adminHrefForSingleton(key) });
  return getSingleton(key);
}

export function adminHrefForSingleton(key: string): string {
  const map: Record<string, string> = {
    settings: '/admin/settings', seo: '/admin/seo', header: '/admin/header', footer: '/admin/footer', home: '/admin/pages/home',
    about: '/admin/pages/about', contact: '/admin/contact', coursesPage: '/admin/pages/courses', portfolio: '/admin/pages/portfolio',
    quickContact: '/admin/pages/quick-contact', journal: '/admin/blogs?tab=page', stats: '/admin/achievements?tab=stats',
    achievements: '/admin/achievements?tab=trust', placementAchievements: '/admin/pages/portfolio?tab=achievements',
    accreditationSection: '/admin/accreditation', faqSection: '/admin/faq', testimonialsSection: '/admin/testimonials',
    videoSection: '/admin/testimonials?tab=videos',
  };
  return map[key] || `/admin/pages/home/${key}`;
}

// ---------------------------------------------------------------------------
// Collections
// ---------------------------------------------------------------------------

const seeding = new Map<string, Promise<void>>();

async function ensureSeeded(name: string) {
  if (!seeding.has(name)) {
    seeding.set(
      name,
      (async () => {
        const store = getStore();
        if (await store.get('meta', `seed:${name}`)) return;
        const seed = COLLECTION_SEEDS[name]?.() || [];
        const t = now();
        await store.insertIfAbsent<ItemDoc>(
          name,
          seed.map((s, i) => ({ id: s.id, order: (i + 1) * 10, draft: s.data, published: s.enabled === false ? null : s.data, version: 1, createdAt: t, updatedAt: t, publishedAt: t })),
        );
        await store.put('meta', { id: `seed:${name}`, at: t, count: seed.length });
      })().catch((e) => {
        seeding.delete(name);
        throw e;
      }),
    );
  }
  return seeding.get(name);
}

export async function listItems(name: string): Promise<ItemDoc[]> {
  if (!getCollectionDef(name)) throw new CmsError('Unknown collection.', 404);
  await ensureSeeded(name);
  const items = await getStore().all<ItemDoc>(name);
  return items.sort((a, b) => a.order - b.order || a.createdAt.localeCompare(b.createdAt));
}

export async function getItem(name: string, id: string): Promise<ItemDoc> {
  if (!getCollectionDef(name)) throw new CmsError('Unknown collection.', 404);
  await ensureSeeded(name);
  const item = await getStore().get<ItemDoc>(name, id);
  if (!item) throw new CmsError('This item no longer exists.', 404);
  return item;
}

export const itemStatus = (item: ItemDoc) => ({
  live: !!item.published,
  hasChanges: !!item.published && !same(item.draft, item.published),
});

const itemLabel = (name: string, data: Record<string, any>) => {
  const def = COLLECTIONS[name];
  const t = data?.[def.titleField];
  return `${def.singular}: ${typeof t === 'string' && t ? t : 'Untitled'}`;
};
const itemHref = (name: string, id: string) =>
  ({ courses: `/admin/courses/${id}`, blogs: `/admin/blogs/${id}` } as Record<string, string>)[name] ||
  ({ courseCategories: '/admin/course-categories', gallery: '/admin/gallery', galleryCategories: '/admin/gallery?tab=categories', testimonials: '/admin/testimonials', videoTestimonials: '/admin/testimonials?tab=videos', faqs: '/admin/faq', accreditations: '/admin/accreditation', blogCategories: '/admin/blogs?tab=categories' } as Record<string, string>)[name];

async function validateItem(name: string, data: any, selfId: string | null) {
  const def = COLLECTIONS[name];
  const input = { ...(data || {}) };
  if (def.slugField && def.slugFrom && !input[def.slugField] && input[def.slugFrom]) input[def.slugField] = slugify(input[def.slugFrom]);
  const { value, errors } = validateFields(def.fields, input, sanitize);

  if (def.slugField && value[def.slugField] && !errors[def.slugField]) {
    const slug = value[def.slugField];
    const others = (await listItems(name)).filter((i) => i.id !== selfId);
    const clash = others.find((o) =>
      [o.draft, o.published].some((d) => d && (d[def.slugField!] === slug || (Array.isArray(d.aliases) && d.aliases.includes(slug)))),
    );
    if (clash) errors[def.slugField] = `Another ${def.singular.toLowerCase()} already uses “${slug}”.`;
    if (name === 'courses' && Array.isArray(value.aliases)) {
      value.aliases = value.aliases.map((a: string) => slugify(a)).filter((a: string) => a && a !== slug);
      const aliasClash = value.aliases.find((a: string) => others.some((o) => [o.draft, o.published].some((d) => d && (d.slug === a || d.aliases?.includes(a)))));
      if (aliasClash) errors.aliases = `“${aliasClash}” is already used by another course.`;
    }
  }
  if (name === 'courses' && Array.isArray(value.categories)) value.categories = value.categories.filter((c: string) => c !== value.category);
  if (Object.keys(errors).length) throw new CmsError('Please fix the highlighted fields.', 422, errors);
  return value;
}

export async function createItem(name: string, data: any, opts: { publish?: boolean; user: SessionUser }) {
  const def = getCollectionDef(name);
  if (!def) throw new CmsError('Unknown collection.', 404);
  const value = await validateItem(name, data, null);
  const items = await listItems(name);
  const t = now();
  const item: ItemDoc = {
    id: `${name.replace(/[A-Z]/g, (c) => '-' + c.toLowerCase())}-${randomUUID().slice(0, 8)}`,
    order: (items.at(-1)?.order ?? 0) + 10,
    draft: value,
    published: opts.publish ? value : null,
    version: 1,
    createdAt: t,
    updatedAt: t,
    updatedBy: opts.user.name,
    publishedAt: opts.publish ? t : null,
  };
  await getStore().put(name, item);
  await logActivity(opts.user, { action: opts.publish ? 'published' : 'created', kind: 'item', target: `${name}/${item.id}`, label: itemLabel(name, value), href: itemHref(name, item.id) });
  if (opts.publish) revalidateSite();
  return item;
}

export async function updateItem(
  name: string,
  id: string,
  data: any,
  opts: { version?: number; publish?: boolean; user: SessionUser },
) {
  const current = await getItem(name, id);
  if (opts.version !== undefined && opts.version !== current.version)
    throw new CmsError('This item was changed by someone else since you opened it. Reload to get the latest version.', 409);
  const value = await validateItem(name, data, id);
  const t = now();
  const item: ItemDoc = {
    ...current,
    draft: value,
    published: opts.publish ? value : current.published,
    version: current.version + 1,
    updatedAt: t,
    updatedBy: opts.user.name,
    publishedAt: opts.publish ? t : current.publishedAt,
  };
  await getStore().put(name, item);
  await logActivity(opts.user, { action: opts.publish ? 'published' : 'saved', kind: 'item', target: `${name}/${id}`, label: itemLabel(name, value), href: itemHref(name, id) });
  if (opts.publish || name.endsWith('ategories')) revalidateSite();
  return item;
}

export async function setItemPublished(name: string, id: string, publish: boolean, user: SessionUser) {
  const current = await getItem(name, id);
  if (publish) {
    // re-validate the draft before it goes live
    const value = await validateItem(name, current.draft, id);
    current.draft = value;
  }
  const t = now();
  const item: ItemDoc = { ...current, published: publish ? current.draft : null, version: current.version + 1, updatedAt: t, updatedBy: user.name, publishedAt: publish ? t : current.publishedAt };
  await getStore().put(name, item);
  await logActivity(user, { action: publish ? 'published' : 'unpublished', kind: 'item', target: `${name}/${id}`, label: itemLabel(name, item.draft), href: itemHref(name, id) });
  revalidateSite();
  return item;
}

export async function discardItemDraft(name: string, id: string, user: SessionUser) {
  const current = await getItem(name, id);
  if (!current.published) throw new CmsError('This item has never been published, so there is nothing to revert to.', 400);
  const item = { ...current, draft: current.published, version: current.version + 1, updatedAt: now(), updatedBy: user.name };
  await getStore().put(name, item);
  await logActivity(user, { action: 'discarded', kind: 'item', target: `${name}/${id}`, label: itemLabel(name, item.draft), href: itemHref(name, id) });
  return item;
}

async function assertNotInUse(name: string, item: ItemDoc) {
  const usedBy: Record<string, { collection: string; field: string; multi?: string }> = {
    courseCategories: { collection: 'courses', field: 'category', multi: 'categories' },
    galleryCategories: { collection: 'gallery', field: 'category' },
    blogCategories: { collection: 'blogs', field: 'category' },
  };
  const rule = usedBy[name];
  if (!rule) return;
  const slug = item.draft.slug;
  const users = (await listItems(rule.collection)).filter((i) =>
    [i.draft, i.published].some((d) => d && (d[rule.field] === slug || (rule.multi && Array.isArray(d[rule.multi]) && d[rule.multi].includes(slug)))),
  );
  if (users.length)
    throw new CmsError(`This category is used by ${users.length} ${COLLECTIONS[rule.collection].label.toLowerCase()}. Move them to another category first.`, 409);
}

export async function deleteItem(name: string, id: string, user: SessionUser) {
  const current = await getItem(name, id);
  await assertNotInUse(name, current);
  await getStore().remove(name, id);
  await logActivity(user, { action: 'deleted', kind: 'item', target: `${name}/${id}`, label: itemLabel(name, current.draft) });
  if (current.published) revalidateSite();
}

export async function duplicateItem(name: string, id: string, user: SessionUser) {
  const def = COLLECTIONS[name];
  const current = await getItem(name, id);
  const data = JSON.parse(JSON.stringify(current.draft));
  if (def.titleField && typeof data[def.titleField] === 'string') data[def.titleField] = `${data[def.titleField]} (copy)`;
  if (def.slugField) {
    const existing = new Set((await listItems(name)).flatMap((i) => [i.draft?.[def.slugField!], i.published?.[def.slugField!]]));
    let n = 2;
    let slug = `${data[def.slugField] || 'item'}-copy`;
    while (existing.has(slug)) slug = `${data[def.slugField] || 'item'}-copy-${n++}`;
    data[def.slugField] = slug;
  }
  if (Array.isArray(data.aliases)) data.aliases = [];
  const item = await createItem(name, data, { user });
  await logActivity(user, { action: 'duplicated', kind: 'item', target: `${name}/${item.id}`, label: itemLabel(name, data), href: itemHref(name, item.id) });
  return item;
}

export async function reorderItems(name: string, ids: string[], user: SessionUser) {
  const items = await listItems(name);
  const byId = new Map(items.map((i) => [i.id, i]));
  if (ids.length !== items.length || ids.some((id) => !byId.has(id))) throw new CmsError('The list changed while you were reordering. Reload and try again.', 409);
  const updated = ids.map((id, i) => ({ ...byId.get(id)!, order: (i + 1) * 10 }));
  await getStore().putMany(name, updated);
  await logActivity(user, { action: 'reordered', kind: 'item', target: name, label: `${COLLECTIONS[name].label} order`, href: itemHref(name, '') });
  revalidateSite();
}

// ---------------------------------------------------------------------------
// Public website content
// ---------------------------------------------------------------------------

export type SiteContent = Record<string, any> & {
  courses: any[];
  courseCategories: any[];
  testimonials: any[];
  videoTestimonials: any[];
  faqs: any[];
  accreditations: any[];
  gallery: any[];
  galleryCategories: any[];
  blogs: any[];
  blogCategories: any[];
  preview: boolean;
};

/** Collections exposed to the website. Blog bodies are excluded (loaded per post). */
const PUBLIC_COLLECTIONS = ['courses', 'courseCategories', 'testimonials', 'videoTestimonials', 'faqs', 'accreditations', 'gallery', 'galleryCategories', 'blogs', 'blogCategories'];

export function publicItem(name: string, item: ItemDoc, draft: boolean) {
  const data = draft ? item.draft : item.published;
  if (!data) return null;
  const out: Record<string, any> = { id: item.id, ...data };
  if (name === 'courses') {
    out.categories = Array.from(new Set([data.category, ...(data.categories || [])].filter(Boolean)));
    out.fullName = data.name;
  }
  if (name === 'blogs') delete out.content;
  return out;
}

export async function loadSiteContent(draft: boolean): Promise<SiteContent> {
  const store = getStore();
  const [singletonDocs, ...lists] = await Promise.all([
    store.all<SingletonDoc>('singletons'),
    ...PUBLIC_COLLECTIONS.map((n) => listItems(n)),
  ]);
  const byKey = new Map(singletonDocs.map((d) => [d.id, d]));
  const content: Record<string, any> = { preview: draft };
  for (const key of Object.keys(SINGLETONS)) {
    if (key === 'seo') continue;
    const doc = byKey.get(key);
    const data = doc ? (draft ? doc.draft : doc.published) : null;
    content[key] = deepMerge(singletonDefaults(key), data);
  }
  PUBLIC_COLLECTIONS.forEach((name, i) => {
    content[name] = lists[i].map((it) => publicItem(name, it, draft)).filter(Boolean);
  });
  content.courses.forEach((c: any, i: number) => (c.orderNum = String(i + 1).padStart(2, '0')));
  content.blogs.sort((a: any, b: any) => String(b.publishDate || '').localeCompare(String(a.publishDate || '')));
  return content as SiteContent;
}

export async function loadSeo(draft: boolean) {
  const doc = await getStore().get<SingletonDoc>('singletons', 'seo');
  return deepMerge(singletonDefaults('seo'), doc ? (draft ? doc.draft : doc.published) : null);
}

export async function findCourse(slug: string, draft: boolean) {
  const s = String(slug || '').toLowerCase();
  const items = await listItems('courses');
  for (const it of items) {
    const d = draft ? it.draft : it.published;
    if (d && (String(d.slug).toLowerCase() === s || (d.aliases || []).map((a: string) => a.toLowerCase()).includes(s))) return publicItem('courses', it, draft);
  }
  return null;
}

export async function findBlog(slug: string, draft: boolean) {
  const items = await listItems('blogs');
  for (const it of items) {
    const d = draft ? it.draft : it.published;
    if (d && d.slug === slug) return { id: it.id, ...d, updatedAt: it.updatedAt } as Record<string, any>;
  }
  return null;
}

/** API shape of a collection item. */
export const shapeItem = (it: ItemDoc) => ({
  id: it.id,
  data: it.draft,
  order: it.order,
  version: it.version,
  createdAt: it.createdAt,
  updatedAt: it.updatedAt,
  updatedBy: it.updatedBy,
  publishedAt: it.publishedAt,
  ...itemStatus(it),
});
