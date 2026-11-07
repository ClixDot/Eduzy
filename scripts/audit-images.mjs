#!/usr/bin/env node
/** Image audit: used / unused / duplicate / missing. Writes scripts/output/image-audit.json */
import fs from 'fs';
import path from 'path';
import { createHash } from 'crypto';
import { ROOT, IMG, walk, findRefs } from './lib/image-refs.mjs';

const refs = findRefs();
const files = [...walk(path.join(ROOT, 'public', 'assets')), ...walk(path.join(ROOT, 'src', 'assets'))].filter((f) => IMG.test(f));
const other = walk(path.join(ROOT, 'public', 'assets')).filter((f) => !IMG.test(f));
const hash = (f) => createHash('sha1').update(fs.readFileSync(f)).digest('hex');
const byFile = new Map();
for (const r of refs) {
  if (!r.file) continue;
  const k = path.normalize(r.file);
  if (!byFile.has(k)) byFile.set(k, new Set());
  byFile.get(k).add(r.where);
}
const used = [], missing = [];
for (const [f, where] of byFile) (fs.existsSync(f) ? used : missing).push({ file: path.relative(ROOT, f), bytes: fs.existsSync(f) ? fs.statSync(f).size : 0, usedIn: [...where] });
const usedSet = new Set(used.map((u) => path.join(ROOT, u.file)));
const unused = files.filter((f) => !usedSet.has(path.normalize(f))).map((f) => ({ file: path.relative(ROOT, f), bytes: fs.statSync(f).size }));
const groups = new Map();
for (const f of files) {
  const h = hash(f);
  groups.set(h, [...(groups.get(h) || []), path.relative(ROOT, f)]);
}
const duplicates = [...groups.values()].filter((g) => g.length > 1);
const report = { totals: { imageFiles: files.length, used: used.length, unused: unused.length, missing: missing.length, duplicateGroups: duplicates.length, references: refs.length }, used, unused, duplicates, missing, nonImageFilesInAssets: other.map((f) => path.relative(ROOT, f)) };
fs.mkdirSync(path.join(ROOT, 'scripts', 'output'), { recursive: true });
fs.writeFileSync(path.join(ROOT, 'scripts', 'output', 'image-audit.json'), JSON.stringify(report, null, 2));
console.log(JSON.stringify(report.totals));
const mb = (b) => (b / 1048576).toFixed(2) + 'MB';
console.log('\nUSED:'); for (const u of used) console.log(`  ${mb(u.bytes).padStart(8)}  ${u.file}   ← ${u.usedIn.slice(0, 2).join(' | ')}${u.usedIn.length > 2 ? ` (+${u.usedIn.length - 2})` : ''}`);
console.log('\nMISSING:'); for (const m of missing) console.log(`  ${m.file} ← ${m.usedIn.join(' | ')}`);
console.log('\nDUPLICATES:'); for (const d of duplicates) console.log('  ' + d.join('  ==  '));
console.log('\nUNUSED:'); for (const u of unused) console.log(`  ${mb(u.bytes).padStart(8)}  ${u.file}`);
console.log('\nNON-IMAGE in public/assets:', report.nonImageFilesInAssets.join(', '));
