#!/usr/bin/env node
/**
 * Replace local image references (/assets/..., ../assets/...) with their Cloudinary URLs,
 * using scripts/output/cloudinary-map.json produced by migrate-images-to-cloudinary.mjs.
 *
 *   node scripts/replace-image-refs.mjs           dry run
 *   node scripts/replace-image-refs.mjs --apply   backup (outside the project) + replace
 *
 * Updates: source files (components, CSS, seed/default content) and local CMS data (.cms-data:
 * drafts AND published content, plus the media library records). MongoDB receives the updated
 * content through scripts/migrate-to-mongo.mjs.
 */
import fs from 'fs';
import path from 'path';
import { ROOT, walk, findRefs } from './lib/image-refs.mjs';

const APPLY = process.argv.includes('--apply');
const map = JSON.parse(fs.readFileSync(path.join(ROOT, 'scripts', 'output', 'cloudinary-map.json'), 'utf8'));
const DATA = path.join(ROOT, process.env.CMS_DATA_DIR || '.cms-data');
const now = new Date().toISOString();
const urlFor = (ref) => map[ref]?.url;

// ── backup ─────────────────────────────────────────────────────────────────────
if (APPLY) {
  const dir = path.resolve(ROOT, '..', `eduzy-image-backup-${now.slice(0, 19).replace(/[:T]/g, '-')}`);
  const copy = (from, to) => fs.existsSync(from) && fs.cpSync(from, to, { recursive: true });
  copy(path.join(ROOT, 'public', 'assets'), path.join(dir, 'public-assets'));
  copy(path.join(ROOT, 'src', 'assets'), path.join(dir, 'src-assets'));
  copy(DATA, path.join(dir, 'cms-data'));
  for (const f of ['src/cms/defaults.ts', 'src/data/courses.js', 'src/data/videoTestimonials.js'])
    copy(path.join(ROOT, f), path.join(dir, 'source', f));
  fs.copyFileSync(path.join(ROOT, 'scripts', 'output', 'cloudinary-map.json'), path.join(dir, 'cloudinary-map.json'));
  console.log(`Backup: ${dir}\n`);
}

// ── 1. source files ────────────────────────────────────────────────────────────
const refs = findRefs();
const srcFiles = [...new Set(refs.filter((r) => !r.where.startsWith('.cms-data')).map((r) => r.where.replace(/ \(gallery seed\)$/, '')))];
let srcCount = 0;
const missing = new Set();
for (const rel of srcFiles) {
  const file = path.join(ROOT, rel);
  let text = fs.readFileSync(file, 'utf8');
  const before = text;
  // gallery seed: `/assets/gellery/${file}` + bare file names → full URLs
  const tpl = text.match(/`\/assets\/([^`$]+)\$\{file\}`/);
  if (tpl) {
    text = text.replace(tpl[0], 'file');
    text = text.replace(/'([^'/]+\.(?:jpe?g|png|webp))'/g, (m, name) => {
      const u = urlFor(`/assets/${tpl[1]}${name}`);
      if (!u) return m;
      srcCount++;
      return `'${u}'`;
    });
  }
  for (const r of refs.filter((x) => x.where === rel)) {
    const u = urlFor(r.ref);
    if (!u) {
      missing.add(r.ref);
      continue;
    }
    const n = text.split(r.ref).length - 1;
    if (n) {
      srcCount += n;
      text = text.split(r.ref).join(u);
    }
  }
  if (text !== before) {
    console.log(`  source  ${rel}`);
    if (APPLY) fs.writeFileSync(file, text);
  }
}

// ── 2. CMS content (.cms-data) ─────────────────────────────────────────────────
let cmsCount = 0;
const swap = (v) => {
  if (typeof v === 'string') {
    if (urlFor(v)) {
      cmsCount++;
      return urlFor(v);
    }
    if (v.includes('/assets/') && v.includes('<')) {
      // rich text: replace embedded src="/assets/..."
      return v.replace(/\/assets\/[^"'<>)]+?\.(?:png|jpe?g|webp|gif|svg|avif)/gi, (m) => (urlFor(m) ? (cmsCount++, urlFor(m)) : m));
    }
    return v;
  }
  if (Array.isArray(v)) return v.map(swap);
  if (v && typeof v === 'object') return Object.fromEntries(Object.entries(v).map(([k, x]) => [k, swap(x)]));
  return v;
};
for (const f of walk(DATA, (p) => p.endsWith('.json') && path.dirname(p) === DATA)) {
  const name = path.basename(f, '.json');
  if (name === 'media') continue;
  const data = JSON.parse(fs.readFileSync(f, 'utf8') || '{}');
  let changed = 0;
  for (const [id, doc] of Object.entries(data)) {
    const before = JSON.stringify(doc);
    const next = swap(doc);
    if (JSON.stringify(next) !== before) {
      changed++;
      if ('updatedAt' in next) next.updatedAt = now; // so the Mongo migration treats it as the newer copy
      data[id] = next;
    }
  }
  if (changed) {
    console.log(`  cms     ${name}.json (${changed} documents)`);
    if (APPLY) fs.writeFileSync(f, JSON.stringify(data, null, 1));
  }
}

// ── 3. media library records ───────────────────────────────────────────────────
const mediaFile = path.join(DATA, 'media.json');
let mediaConverted = 0, mediaRemoved = 0;
if (fs.existsSync(mediaFile)) {
  const media = JSON.parse(fs.readFileSync(mediaFile, 'utf8') || '{}');
  const seenUrl = new Set();
  for (const [id, m] of Object.entries(media)) {
    if (m.provider !== 'static') continue;
    const e = map[m.url];
    if (!e || seenUrl.has(e.url)) {
      // the local file is not used by the website and will be removed with the asset folder
      delete media[id];
      mediaRemoved++;
      continue;
    }
    seenUrl.add(e.url);
    media[id] = { ...m, url: e.url, provider: 'cloudinary', storageKey: e.publicId, filename: e.filename, size: e.bytes, width: e.width, height: e.height, folder: e.folder.split('/').slice(1).join('/') || 'general', updatedAt: now };
    mediaConverted++;
  }
  console.log(`  media   ${mediaConverted} records → Cloudinary, ${mediaRemoved} records for unused local files removed`);
  if (APPLY) fs.writeFileSync(mediaFile, JSON.stringify(media, null, 1));
}

console.log(`\nReferences replaced: ${srcCount} in source, ${cmsCount} in CMS content.`);
if (missing.size) console.log(`No Cloudinary URL for: ${[...missing].join(', ')}`);
if (!APPLY) console.log('Dry run only. Re-run with --apply.');
process.exit(missing.size ? 2 : 0);
