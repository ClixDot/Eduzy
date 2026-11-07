#!/usr/bin/env node
/**
 * Upload every image the website USES to Cloudinary (unused files are skipped).
 *
 *   node scripts/migrate-images-to-cloudinary.mjs           dry run: shows the plan
 *   node scripts/migrate-images-to-cloudinary.mjs --upload  uploads + verifies, writes the mapping
 *
 * - Originals are uploaded unchanged (no transformation, no compression), so quality, size,
 *   transparency and format are preserved.
 * - Identical files (same SHA-1) are uploaded once.
 * - Deterministic public IDs + overwrite=false → safe to re-run, never creates duplicates.
 * - Each upload is verified: HTTP 200 from the delivery URL and byte size equal to the local file.
 * Output: scripts/output/cloudinary-map.json  { "<reference as written in code/CMS>": { url, publicId, ... } }
 * Secrets are read server-side from CLOUDINARY_URL (or the 3 separate variables) and never printed.
 */
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { loadEnv } from './lib/env.mjs';
import { ROOT, findRefs } from './lib/image-refs.mjs';

loadEnv();
const UPLOAD = process.argv.includes('--upload');
const ROOT_FOLDER = process.env.CLOUDINARY_FOLDER || 'eduzy';

function config() {
  const m = (process.env.CLOUDINARY_URL || '').match(/^cloudinary:\/\/([^:]+):([^@]+)@(.+)$/);
  if (m) return { key: m[1], secret: m[2], cloud: m[3] };
  const { CLOUDINARY_CLOUD_NAME: cloud, CLOUDINARY_API_KEY: key, CLOUDINARY_API_SECRET: secret } = process.env;
  return cloud && key && secret ? { cloud, key, secret } : null;
}
const cfg = config();
if (!cfg) {
  console.error('FAIL  Cloudinary is not configured (CLOUDINARY_URL)');
  process.exit(1);
}

/** Which Cloudinary sub-folder an image belongs in, based on where it is used. */
function category(file, usedIn) {
  const f = file.replace(/\\/g, '/').toLowerCase();
  const u = usedIn.join(' ').toLowerCase();
  if (/\/logo\d*\.png$/.test(f)) return 'logo';
  if (f.includes('/gellery/') || u.includes('gallery')) return 'gallery';
  if (u.includes('accreditation') || /badge\d|logo|seal|emblem/.test(f)) return 'accreditation';
  if (/_bg\.|bg\./.test(f) || u.includes('.css')) return 'backgrounds';
  if (u.includes('courses')) return 'courses';
  if (f.endsWith('/the.png') || f.includes('director')) return 'directors';
  if (f.includes('new website') || f.includes('hero')) return 'hero';
  if (u.includes('testimonial')) return 'testimonials';
  return 'general';
}
const slug = (name) =>
  name.replace(/\.[a-z0-9]+$/i, '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 90) || 'image';

// ── plan ───────────────────────────────────────────────────────────────────────
const refs = findRefs();
const byFile = new Map();
for (const r of refs) {
  if (!r.file || !fs.existsSync(r.file)) continue;
  const k = path.normalize(r.file);
  const e = byFile.get(k) || { file: k, refs: new Set(), usedIn: new Set() };
  e.refs.add(r.ref);
  e.usedIn.add(r.where);
  byFile.set(k, e);
}
const byHash = new Map(); // one upload per unique file content
for (const e of byFile.values()) {
  const buf = fs.readFileSync(e.file);
  const h = createHash('sha1').update(buf).digest('hex');
  const g = byHash.get(h) || { hash: h, files: [], refs: new Set(), usedIn: new Set(), bytes: buf.length };
  g.files.push(e.file);
  e.refs.forEach((r) => g.refs.add(r));
  e.usedIn.forEach((w) => g.usedIn.add(w));
  byHash.set(h, g);
}
const taken = new Set();
const plan = [...byHash.values()].map((g) => {
  const primary = g.files.find((f) => f.includes(`${path.sep}public${path.sep}`)) || g.files[0];
  const folder = `${ROOT_FOLDER}/${category(primary, [...g.usedIn])}`;
  let id = slug(path.basename(primary));
  while (taken.has(`${folder}/${id}`)) id += '-2';
  taken.add(`${folder}/${id}`);
  return { ...g, primary, folder, publicIdName: id, publicId: `${folder}/${id}` };
});

console.log(`${UPLOAD ? 'UPLOAD' : 'DRY RUN'} → cloud "${cfg.cloud}", ${byFile.size} used files, ${plan.length} unique images, ${(plan.reduce((a, p) => a + p.bytes, 0) / 1048576).toFixed(1)} MB\n`);
for (const p of plan) console.log(`  ${p.publicId.padEnd(70)} ← ${path.relative(ROOT, p.primary)}${p.files.length > 1 ? `  (+${p.files.length - 1} identical)` : ''}`);
if (!UPLOAD) {
  console.log('\nDry run only. Re-run with --upload.');
  process.exit(0);
}

// ── upload + verify ────────────────────────────────────────────────────────────
const sign = (params) => createHash('sha1').update(Object.keys(params).sort().map((k) => `${k}=${params[k]}`).join('&') + cfg.secret).digest('hex');
const MIME = { png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', webp: 'image/webp', gif: 'image/gif', svg: 'image/svg+xml', avif: 'image/avif' };

async function upload(p) {
  const params = { folder: p.folder, public_id: p.publicIdName, overwrite: 'false', unique_filename: 'false', timestamp: Math.floor(Date.now() / 1000) };
  const buf = fs.readFileSync(p.primary);
  const form = new FormData();
  const ext = p.primary.split('.').pop().toLowerCase();
  form.append('file', new Blob([new Uint8Array(buf)], { type: MIME[ext] || 'application/octet-stream' }), path.basename(p.primary));
  for (const [k, v] of Object.entries(params)) form.append(k, String(v));
  form.append('api_key', cfg.key);
  form.append('signature', sign(params));
  for (let attempt = 1; ; attempt++) {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cfg.cloud}/image/upload`, { method: 'POST', body: form });
    const json = await res.json().catch(() => ({}));
    if (res.ok) return json;
    if (attempt >= 3 || res.status < 500) throw new Error(json?.error?.message || `HTTP ${res.status}`);
    await new Promise((r) => setTimeout(r, 1000 * attempt));
  }
}

const mapPath = path.join(ROOT, 'scripts', 'output', 'cloudinary-map.json');
const map = fs.existsSync(mapPath) ? JSON.parse(fs.readFileSync(mapPath, 'utf8')) : {};
const failed = [];
let i = 0;
for (const p of plan) {
  i++;
  try {
    const r = await upload(p);
    const head = await fetch(r.secure_url, { method: 'HEAD' });
    const len = Number(head.headers.get('content-length'));
    const sizeOk = r.bytes === p.bytes && (!len || len === p.bytes);
    if (!head.ok) throw new Error(`delivery URL returned ${head.status}`);
    const entry = { url: r.secure_url, publicId: r.public_id, folder: p.folder, width: r.width, height: r.height, bytes: r.bytes, format: r.format, filename: path.basename(p.primary), existing: !!r.existing, sameBytes: sizeOk };
    for (const ref of p.refs) map[ref] = entry;
    for (const f of p.files) map[`file:${path.relative(ROOT, f).replace(/\\/g, '/')}`] = entry;
    console.log(`  ${String(i).padStart(2)}/${plan.length} ${sizeOk ? 'OK  ' : 'SIZE?'} ${r.existing ? '(already uploaded) ' : ''}${r.public_id}  ${r.width}×${r.height} ${r.format}`);
    if (!sizeOk) failed.push(`${p.publicId}: stored size ${r.bytes} ≠ local ${p.bytes}`);
  } catch (e) {
    failed.push(`${p.publicId}: ${String(e.message).slice(0, 160)}`);
    console.log(`  ${String(i).padStart(2)}/${plan.length} FAIL ${p.publicId}: ${String(e.message).slice(0, 160)}`);
  }
}
fs.mkdirSync(path.dirname(mapPath), { recursive: true });
fs.writeFileSync(mapPath, JSON.stringify(map, null, 2));
console.log(`\nUploaded/verified ${plan.length - failed.length}/${plan.length}. Mapping: ${path.relative(ROOT, mapPath)}`);
if (failed.length) {
  console.log('Failures:\n  ' + failed.join('\n  '));
  process.exit(2);
}
