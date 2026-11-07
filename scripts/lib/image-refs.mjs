/** Shared helpers: find every local image reference in source files and CMS data. */
import fs from 'fs';
import path from 'path';

export const ROOT = process.cwd();
export const IMG = /\.(png|jpe?g|webp|gif|svg|avif)$/i;
const SRC_EXT = /\.(ts|tsx|js|jsx|mjs|css)$/;

export function walk(dir, filter = () => true, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) walk(full, filter, out);
    else if (filter(full)) out.push(full);
  }
  return out;
}

/** Turn a reference into an absolute file path (or null if not a local image ref). */
export function resolveRef(ref, fromFile) {
  if (ref.startsWith('/assets/')) return path.join(ROOT, 'public', decodeURI(ref));
  if (/^\.\.?\//.test(ref) && fromFile) return path.resolve(path.dirname(fromFile), decodeURI(ref));
  return null;
}

/** [{ ref, file, where }] for every local image reference. */
export function findRefs() {
  const refs = [];
  // 1. source code (excluding the asset folders themselves and admin-only static logo handled the same way)
  const RX = /(["'`(])((?:\/assets\/|\.\.?\/(?:\.\.\/)*assets\/)[^"'`()\n]+?\.(?:png|jpe?g|webp|gif|svg|avif))\1?(?=["'`)])/gi;
  for (const f of walk(path.join(ROOT, 'src'), (p) => SRC_EXT.test(p) && !p.includes(`${path.sep}assets${path.sep}`))) {
    const text = fs.readFileSync(f, 'utf8');
    for (const m of text.matchAll(RX)) refs.push({ ref: m[2], file: resolveRef(m[2], f), where: path.relative(ROOT, f) });
    // gallery seed builds `/assets/gellery/${file}`
    const tpl = text.match(/`\/assets\/([^`$]+)\$\{file\}`/);
    if (tpl) for (const m of text.matchAll(/'([^']+\.(?:jpe?g|png|webp))'/g))
      if (!m[1].includes('/')) refs.push({ ref: `/assets/${tpl[1]}${m[1]}`, file: resolveRef(`/assets/${tpl[1]}${m[1]}`), where: path.relative(ROOT, f) + ' (gallery seed)' });
  }
  // 2. CMS data (drafts + published), excluding the media library index itself
  const dataDir = path.join(ROOT, process.env.CMS_DATA_DIR || '.cms-data');
  for (const f of walk(dataDir, (p) => p.endsWith('.json') && path.dirname(p) === dataDir)) {
    if (path.basename(f) === 'media.json') continue;
    const visit = (v, trail) => {
      if (typeof v === 'string') {
        if (v.startsWith('/assets/') && IMG.test(v)) { refs.push({ ref: v, file: resolveRef(v), where: `${path.relative(ROOT, f)} → ${trail}` }); return; }
        for (const m of v.matchAll(/\/assets\/[^"'<>\s)]+?\.(?:png|jpe?g|webp|gif|svg|avif)/gi)) refs.push({ ref: m[0], file: resolveRef(m[0]), where: `${path.relative(ROOT, f)} → ${trail}` });
      } else if (Array.isArray(v)) v.forEach((x, i) => visit(x, `${trail}[${i}]`));
      else if (v && typeof v === 'object') for (const [k, x] of Object.entries(v)) visit(x, trail ? `${trail}.${k}` : k);
    };
    visit(JSON.parse(fs.readFileSync(f, 'utf8') || '{}'), '');
  }
  return refs;
}
