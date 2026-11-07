import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import { createHash, randomUUID } from 'crypto';
import { getStore } from './store';
import { CmsError, logActivity, revalidateSite } from './content';
import { imageSize } from './image-size';
import { SINGLETON_DEFAULTS, COLLECTION_SEEDS } from '../defaults';
import type { MediaDoc, SingletonDoc, ItemDoc } from '../types';
import type { SessionUser } from './auth';
import { COLLECTIONS, SINGLETONS } from '../schema';

// ---------------------------------------------------------------------------
// Storage providers
// ---------------------------------------------------------------------------

interface SavedFile { url: string; storageKey: string; width?: number | null; height?: number | null }

interface MediaStorage {
  kind: 'local' | 'cloudinary';
  label: string;
  save(buf: Buffer, meta: { filename: string; mime: string; folder: string }): Promise<SavedFile>;
  remove(storageKey: string): Promise<void>;
}

const DATA_DIR = () => path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.CMS_DATA_DIR || '.cms-data');
export const uploadsDir = () => path.join(DATA_DIR(), 'uploads');

const safeName = (n: string) =>
  n.toLowerCase().replace(/\.[a-z0-9]+$/, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 60) || 'image';
const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'image/x-icon': 'ico' };

/** DEVELOPMENT: files in .cms-data/uploads served by /media/[...path]. Not for serverless hosting. */
class LocalStorage implements MediaStorage {
  kind = 'local' as const;
  label = 'Local disk (.cms-data/uploads) — development storage';
  async save(buf: Buffer, meta: { filename: string; mime: string; folder: string }) {
    const folder = meta.folder.replace(/[^a-z0-9-]/gi, '').toLowerCase() || 'general';
    const name = `${randomUUID().slice(0, 8)}-${safeName(meta.filename)}.${EXT[meta.mime]}`;
    const dir = path.join(uploadsDir(), folder);
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, name), buf);
    return { url: `/media/${folder}/${name}`, storageKey: `${folder}/${name}` };
  }
  async remove(storageKey: string) {
    const target = path.resolve(uploadsDir(), storageKey);
    if (!target.startsWith(uploadsDir())) return;
    await fs.rm(target, { force: true });
  }
}

/** PRODUCTION: Cloudinary signed uploads from the server. Secrets never reach the browser. */
class CloudinaryStorage implements MediaStorage {
  kind = 'cloudinary' as const;
  label: string;
  constructor(private cloud: string, private key: string, private secret: string) {
    this.label = `Cloudinary (cloud “${cloud}”)`;
  }
  private sign(params: Record<string, string | number>) {
    const str = Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&');
    return createHash('sha1').update(str + this.secret).digest('hex');
  }
  async save(buf: Buffer, meta: { filename: string; mime: string; folder: string }) {
    const params: Record<string, string | number> = {
      folder: `${process.env.CLOUDINARY_FOLDER || 'eduzy'}/${meta.folder || 'general'}`,
      public_id: `${safeName(meta.filename)}-${randomUUID().slice(0, 6)}`,
      timestamp: Math.floor(Date.now() / 1000),
    };
    const form = new FormData();
    form.append('file', new Blob([new Uint8Array(buf)], { type: meta.mime }), meta.filename);
    for (const [k, v] of Object.entries(params)) form.append(k, String(v));
    form.append('api_key', this.key);
    form.append('signature', this.sign(params));
    const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloud}/image/upload`, { method: 'POST', body: form });
    const json: any = await res.json().catch(() => ({}));
    if (!res.ok) throw new CmsError(`Cloudinary upload failed: ${json?.error?.message || res.status}`, 502);
    return { url: json.secure_url, storageKey: json.public_id, width: json.width, height: json.height };
  }
  async remove(publicId: string) {
    const params = { public_id: publicId, invalidate: 'true', timestamp: Math.floor(Date.now() / 1000) };
    const form = new FormData();
    for (const [k, v] of Object.entries(params)) form.append(k, String(v));
    form.append('api_key', this.key);
    form.append('signature', this.sign(params));
    const res = await fetch(`https://api.cloudinary.com/v1_1/${this.cloud}/image/destroy`, { method: 'POST', body: form });
    if (!res.ok) throw new CmsError('Cloudinary could not delete the file.', 502);
  }
}

function cloudinaryConfig() {
  const url = process.env.CLOUDINARY_URL;
  if (url) {
    const m = url.match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
    if (m) return { key: m[1], secret: m[2], cloud: m[3] };
  }
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  return cloud && key && secret ? { cloud, key, secret } : null;
}

let storage: MediaStorage | null = null;
export function mediaStorage(): MediaStorage {
  if (!storage) {
    const c = cloudinaryConfig();
    storage = c ? new CloudinaryStorage(c.cloud, c.key, c.secret) : new LocalStorage();
  }
  return storage;
}

// ---------------------------------------------------------------------------
// Library
// ---------------------------------------------------------------------------

const IMAGE_EXT = /\.(png|jpe?g|webp|gif|svg|avif|ico)$/i;
const staticId = (url: string) => `static-${createHash('sha1').update(url).digest('hex').slice(0, 14)}`;
const mimeOf = (f: string) => ({ png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif', ico: 'image/x-icon' } as Record<string, string>)[f.split('.').pop()!.toLowerCase()] || 'image/*';

const CLOUDINARY_URL_RX = /^https:\/\/res\.cloudinary\.com\/[^/]+\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i;

function collectUrls(value: unknown, out: Set<string>) {
  if (typeof value === 'string') {
    if ((value.startsWith('/assets/') || CLOUDINARY_URL_RX.test(value)) && IMAGE_EXT.test(value)) out.add(value);
  } else if (Array.isArray(value)) value.forEach((v) => collectUrls(v, out));
  else if (value && typeof value === 'object') Object.values(value).forEach((v) => collectUrls(v, out));
}

let seeded: Promise<void> | null = null;
/** Registers the images that ship with the website (public/assets) in the library, once. */
async function ensureStaticMedia() {
  if (!seeded) {
    seeded = (async () => {
      const store = getStore();
      if (await store.get('meta', 'seed:media')) return;
      const urls = new Set<string>();
      collectUrls(SINGLETON_DEFAULTS, urls);
      for (const seed of Object.values(COLLECTION_SEEDS)) collectUrls(seed().map((s) => s.data), urls);
      const pub = path.join(/* turbopackIgnore: true */ process.cwd(), 'public');
      const walk = async (dir: string) => {
        let entries: import('fs').Dirent[] = [];
        try { entries = await fs.readdir(dir, { withFileTypes: true }); } catch { return; }
        for (const e of entries) {
          const full = path.join(dir, e.name);
          if (e.isDirectory()) await walk(full);
          else if (IMAGE_EXT.test(e.name)) urls.add('/' + path.relative(pub, full).split(path.sep).join('/'));
        }
      };
      await walk(path.join(pub, 'assets'));
      const t = new Date().toISOString();
      const docs: MediaDoc[] = [];
      for (const url of urls) {
        // website images hosted on Cloudinary (shipped in the default content)
        const cloud = url.match(CLOUDINARY_URL_RX);
        if (cloud) {
          const filename = decodeURIComponent(url.split('/').pop()!);
          const parts = cloud[1].split('/');
          docs.push({ id: staticId(url), url, provider: 'cloudinary', storageKey: decodeURIComponent(cloud[1]), filename, mimeType: mimeOf(filename), size: 0, width: null, height: null, alt: '', folder: parts.length > 2 ? parts.slice(1, -1).join('/') : 'general', createdAt: t, updatedAt: t });
          continue;
        }
        let size = 0, dims: { width: number; height: number } | null = null;
        try {
          const buf = await fs.readFile(path.join(pub, decodeURI(url)));
          size = buf.length;
          dims = imageSize(buf);
        } catch { /* file not readable on this host */ }
        const filename = url.split('/').pop()!;
        docs.push({ id: staticId(url), url, provider: 'static', filename, mimeType: mimeOf(filename), size, width: dims?.width ?? null, height: dims?.height ?? null, alt: '', folder: url.split('/').slice(2, -1).join('/') || 'assets', createdAt: t, updatedAt: t });
      }
      await store.insertIfAbsent('media', docs);
      await store.put('meta', { id: 'seed:media', at: t, count: docs.length });
    })().catch((e) => { seeded = null; throw e; });
  }
  return seeded;
}

export async function listMedia(): Promise<MediaDoc[]> {
  await ensureStaticMedia();
  return (await getStore().all<MediaDoc>('media')).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.filename.localeCompare(b.filename));
}

/** Where each URL is used: [{label, href}] keyed by URL. */
export async function mediaUsage(): Promise<Map<string, { label: string; href?: string }[]>> {
  await ensureStaticMedia(); // the library must be complete before usage is computed
  const store = getStore();
  const usage = new Map<string, { label: string; href?: string }[]>();
  const docs: { label: string; href?: string; json: string }[] = [];
  const singletons = await store.all<SingletonDoc>('singletons');
  const stored = new Set(singletons.map((s) => s.id));
  for (const s of singletons) docs.push({ label: SINGLETONS[s.id]?.label || s.id, json: JSON.stringify([s.draft, s.published]) });
  for (const [key, def] of Object.entries(SINGLETON_DEFAULTS)) if (!stored.has(key)) docs.push({ label: SINGLETONS[key]?.label || key, json: JSON.stringify(def) });
  const { listItems } = await import('./content');
  const names = Object.keys(COLLECTIONS);
  const [lists, media] = await Promise.all([Promise.all(names.map((n) => listItems(n))), store.all<MediaDoc>('media')]);
  names.forEach((name, i) => {
    const def = COLLECTIONS[name];
    for (const it of lists[i]) docs.push({ label: `${def.singular}: ${it.draft?.[def.titleField] || 'Untitled'}`, json: JSON.stringify([it.draft, it.published]) });
  });
  for (const m of media) {
    const needle = JSON.stringify(m.url).slice(1, -1);
    const hits = docs.filter((d) => d.json.includes(needle)).map(({ label, href }) => ({ label, href }));
    usage.set(m.url, hits);
  }
  return usage;
}

const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/avif', 'image/x-icon'];
const MAX_BYTES = 10 * 1024 * 1024;

function sniff(buf: Buffer): string | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'image/jpeg';
  if (buf.readUInt32BE(0) === 0x89504e47) return 'image/png';
  if (buf.toString('ascii', 0, 3) === 'GIF') return 'image/gif';
  if (buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'image/webp';
  if (buf.toString('ascii', 4, 12) === 'ftypavif') return 'image/avif';
  if (buf.readUInt32BE(0) === 0x00000100) return 'image/x-icon';
  return null;
}

async function readUpload(file: File) {
  if (!file || typeof file.arrayBuffer !== 'function') throw new CmsError('Choose an image to upload.', 400);
  if (file.size > MAX_BYTES) throw new CmsError(`“${file.name}” is larger than 10 MB. Please compress it first.`, 413);
  const buf = Buffer.from(await file.arrayBuffer());
  const mime = sniff(buf);
  if (!mime || !ALLOWED.includes(mime)) throw new CmsError(`“${file.name}” is not a supported image. Use JPG, PNG, WebP, GIF, AVIF or ICO.`, 415);
  return { buf, mime };
}

export async function uploadMedia(file: File, meta: { alt?: string; folder?: string }, user: SessionUser) {
  const { buf, mime } = await readUpload(file);
  const folder = String(meta.folder || 'general').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'general';
  const saved = await mediaStorage().save(buf, { filename: file.name, mime, folder });
  const dims = imageSize(buf);
  const t = new Date().toISOString();
  const doc: MediaDoc = {
    id: `media-${randomUUID().slice(0, 12)}`,
    url: saved.url,
    provider: mediaStorage().kind,
    storageKey: saved.storageKey,
    filename: file.name.slice(0, 200),
    mimeType: mime,
    size: buf.length,
    width: saved.width ?? dims?.width ?? null,
    height: saved.height ?? dims?.height ?? null,
    alt: String(meta.alt || '').slice(0, 240),
    folder,
    createdAt: t,
    updatedAt: t,
    uploadedBy: user.name,
  };
  await getStore().put('media', doc);
  await logActivity(user, { action: 'uploaded', kind: 'media', target: doc.id, label: `Image: ${doc.filename}`, href: '/admin/media' });
  return doc;
}

export async function updateMedia(id: string, patch: { alt?: string; folder?: string }) {
  const doc = await getStore().get<MediaDoc>('media', id);
  if (!doc) throw new CmsError('This image no longer exists.', 404);
  if (patch.alt !== undefined) doc.alt = String(patch.alt).slice(0, 240);
  if (patch.folder !== undefined && doc.provider !== 'static') doc.folder = String(patch.folder).toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40) || 'general';
  doc.updatedAt = new Date().toISOString();
  await getStore().put('media', doc);
  return doc;
}

/** Replace a URL everywhere it is used (drafts and live content). */
function replaceDeep(v: any, from: string, to: string): any {
  if (typeof v === 'string') return v === from ? to : v.includes(from) && v.includes('<') ? v.split(from).join(to) : v;
  if (Array.isArray(v)) return v.map((x) => replaceDeep(x, from, to));
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, replaceDeep(x, from, to)]));
  return v;
}

export async function replaceReferences(from: string, to: string) {
  const store = getStore();
  const { getSingleton, listItems } = await import('./content');
  let changed = 0;
  for (const key of Object.keys(SINGLETONS)) {
    const doc = await getSingleton(key);
    const json = JSON.stringify([doc.draft, doc.published]);
    if (!json.includes(JSON.stringify(from).slice(1, -1))) continue;
    changed++;
    await store.put('singletons', { ...doc, draft: replaceDeep(doc.draft, from, to), published: doc.published ? replaceDeep(doc.published, from, to) : null, version: doc.version + 1, updatedAt: new Date().toISOString() });
  }
  for (const name of Object.keys(COLLECTIONS)) {
    const updates: ItemDoc[] = [];
    for (const it of await listItems(name)) {
      if (!JSON.stringify([it.draft, it.published]).includes(JSON.stringify(from).slice(1, -1))) continue;
      updates.push({ ...it, draft: replaceDeep(it.draft, from, to), published: it.published ? replaceDeep(it.published, from, to) : null, version: it.version + 1, updatedAt: new Date().toISOString() });
    }
    if (updates.length) { changed += updates.length; await store.putMany(name, updates); }
  }
  return changed;
}

export async function replaceMedia(id: string, file: File, user: SessionUser) {
  const store = getStore();
  const doc = await store.get<MediaDoc>('media', id);
  if (!doc) throw new CmsError('This image no longer exists.', 404);
  const { buf, mime } = await readUpload(file);
  const saved = await mediaStorage().save(buf, { filename: file.name, mime, folder: doc.provider === 'static' ? 'replaced' : doc.folder });
  const dims = imageSize(buf);
  const oldUrl = doc.url;
  const oldKey = doc.provider !== 'static' && doc.provider === mediaStorage().kind ? doc.storageKey : undefined;
  const updated: MediaDoc = {
    ...doc,
    url: saved.url,
    provider: mediaStorage().kind,
    storageKey: saved.storageKey,
    filename: file.name.slice(0, 200),
    mimeType: mime,
    size: buf.length,
    width: saved.width ?? dims?.width ?? null,
    height: saved.height ?? dims?.height ?? null,
    folder: doc.provider === 'static' ? 'replaced' : doc.folder,
    updatedAt: new Date().toISOString(),
  };
  await store.put('media', updated);
  const changed = await replaceReferences(oldUrl, saved.url);
  if (oldKey) await mediaStorage().remove(oldKey).catch(() => undefined);
  await logActivity(user, { action: 'replaced', kind: 'media', target: id, label: `Image: ${updated.filename} (${changed} place${changed === 1 ? '' : 's'})`, href: '/admin/media' });
  revalidateSite();
  return { doc: updated, changed };
}

export async function deleteMedia(id: string, user: SessionUser) {
  const store = getStore();
  const doc = await store.get<MediaDoc>('media', id);
  if (!doc) throw new CmsError('This image no longer exists.', 404);
  const used = (await mediaUsage()).get(doc.url) || [];
  if (used.length) throw new CmsError(`This image is still used in: ${used.slice(0, 5).map((u) => u.label).join(', ')}${used.length > 5 ? '…' : ''}. Replace or remove it there first.`, 409);
  if (doc.provider !== 'static' && doc.storageKey && doc.provider === mediaStorage().kind) await mediaStorage().remove(doc.storageKey);
  await store.remove('media', id);
  await logActivity(user, { action: 'deleted', kind: 'media', target: id, label: `Image: ${doc.filename}` });
}
