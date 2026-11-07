#!/usr/bin/env node
/**
 * One-time, idempotent migration of the local CMS data (.cms-data/*.json) into MongoDB.
 *
 *   node scripts/migrate-to-mongo.mjs            dry run: shows what would happen, writes nothing
 *   node scripts/migrate-to-mongo.mjs --apply    backs up, migrates, then verifies
 *
 * Rules (safe to re-run any number of times):
 *  - A document missing in MongoDB is inserted.
 *  - A document present in both is replaced ONLY if it has `updatedAt` and the local copy is strictly
 *    newer. Equal or newer production data is never overwritten.
 *  - users, activity and meta are insert-only: an existing production admin (and their password) is never touched.
 *  - A local admin whose email already belongs to a different production user is skipped and reported.
 * Before writing, the local files AND the current contents of the target Mongo collections are
 * backed up to .cms-data-backups/<timestamp>/ (git-ignored).
 * Uses the same layout as src/cms/server/store/mongo.ts: collection `cms_<name>`, `_id` = document id.
 */
import fs from 'fs';
import path from 'path';
import { MongoClient } from 'mongodb';
import { loadEnv, mongoUri, redact } from './lib/env.mjs';

loadEnv();
const APPLY = process.argv.includes('--apply');
const DATA_DIR = path.resolve(process.env.CMS_DATA_DIR || '.cms-data');
const BACKUP_ROOT = path.resolve('.cms-data-backups');
const INSERT_ONLY = new Set(['users', 'activity', 'meta']);
const { uri, source } = mongoUri();
const dbName = process.env.MONGODB_DB || 'eduzy_cms';

const die = (m) => {
  console.error(`FAIL  ${m}`);
  process.exit(1);
};
if (!uri) die('no MONGODB_URI or MONGODB_URI_PENDING set');
if (/[<>]/.test(uri)) die('connection string still contains <placeholder> brackets');
if (!fs.existsSync(DATA_DIR)) die(`local data folder not found: ${DATA_DIR}`);

/** canonical JSON (sorted keys) so field order never causes a false mismatch */
const canon = (v) =>
  Array.isArray(v) ? `[${v.map(canon).join(',')}]` : v && typeof v === 'object' ? `{${Object.keys(v).sort().map((k) => `${JSON.stringify(k)}:${canon(v[k])}`).join(',')}}` : JSON.stringify(v);
const strip = ({ _id, ...rest }) => rest;

function readLocal() {
  const out = {};
  for (const f of fs.readdirSync(DATA_DIR).filter((f) => f.endsWith('.json')).sort()) {
    const name = f.slice(0, -5);
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) continue;
    const raw = fs.readFileSync(path.join(DATA_DIR, f), 'utf8').trim();
    const data = raw ? JSON.parse(raw) : {};
    const docs = Object.values(data).filter((d) => d && typeof d === 'object' && typeof d.id === 'string');
    out[name] = docs;
  }
  return out;
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
try {
  await client.connect();
} catch (e) {
  die(`cannot connect (${source}): ${redact(String(e.message), uri).slice(0, 200)}\n      Check Atlas → Network Access allows this computer's IP.`);
}
const db = client.db(dbName);
const local = readLocal();
const names = Object.keys(local);
console.log(`${APPLY ? 'APPLY' : 'DRY RUN'} → ${source}, database "${dbName}", ${names.length} collections from ${path.relative(process.cwd(), DATA_DIR)}\n`);

// ── backup ────────────────────────────────────────────────────────────────────
if (APPLY) {
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  const dir = path.join(BACKUP_ROOT, stamp);
  fs.mkdirSync(path.join(dir, 'local'), { recursive: true });
  fs.mkdirSync(path.join(dir, 'mongo-before'), { recursive: true });
  for (const n of names) fs.copyFileSync(path.join(DATA_DIR, `${n}.json`), path.join(dir, 'local', `${n}.json`));
  for (const n of names) {
    const docs = await db.collection(`cms_${n}`).find({}).toArray();
    fs.writeFileSync(path.join(dir, 'mongo-before', `${n}.json`), JSON.stringify(docs, null, 1));
  }
  console.log(`Backup written: ${path.relative(process.cwd(), dir)}\n`);
}

// ── migrate ───────────────────────────────────────────────────────────────────
const report = [];
let problems = 0;
for (const n of names) {
  const col = db.collection(`cms_${n}`);
  const remote = new Map((await col.find({}).toArray()).map((d) => [d._id, d]));
  const r = { name: n, local: local[n].length, inserted: 0, updated: 0, same: 0, keptNewer: 0, skipped: [] };

  for (const doc of local[n]) {
    const prod = remote.get(doc.id);
    if (!prod) {
      if (n === 'users' && doc.email) {
        const clash = await col.findOne({ email: doc.email, _id: { $ne: doc.id } });
        if (clash) {
          r.skipped.push(`${doc.id} (email already used by another production user)`);
          continue;
        }
      }
      if (APPLY) {
        // $setOnInsert + upsert: never overwrites if it appeared in the meantime
        await col.updateOne({ _id: doc.id }, { $setOnInsert: { ...doc, _id: doc.id } }, { upsert: true });
      }
      r.inserted++;
      continue;
    }
    if (canon(strip(prod)) === canon(doc)) {
      r.same++;
      continue;
    }
    const lt = doc.updatedAt, pt = prod.updatedAt;
    if (INSERT_ONLY.has(n) || typeof lt !== 'string' || (typeof pt === 'string' && pt >= lt)) {
      r.keptNewer++; // production copy kept
      continue;
    }
    if (APPLY) {
      // conditional replace: only if production is still older than the local copy
      const res = await col.replaceOne(
        { _id: doc.id, $or: [{ updatedAt: { $lt: lt } }, { updatedAt: { $exists: false } }] },
        { ...doc, _id: doc.id },
      );
      if (!res.modifiedCount) {
        r.keptNewer++;
        continue;
      }
    }
    r.updated++;
  }
  problems += r.skipped.length;
  report.push(r);
}

// indexes the app expects (same as MongoStore)
if (APPLY) {
  await db.collection('cms_users').createIndex({ email: 1 }, { unique: true }).catch(() => undefined);
  await db.collection('cms_activity').createIndex({ at: -1 }).catch(() => undefined);
  await db.collection('cms_media').createIndex({ createdAt: -1 }).catch(() => undefined);
}

console.log('collection            local  insert  update  same  kept-prod  skipped');
for (const r of report)
  console.log(
    `${r.name.padEnd(20)} ${String(r.local).padStart(6)} ${String(r.inserted).padStart(7)} ${String(r.updated).padStart(7)} ${String(r.same).padStart(5)} ${String(r.keptNewer).padStart(10)} ${String(r.skipped.length).padStart(8)}`,
  );
for (const r of report) for (const s of r.skipped) console.log(`  ! ${r.name}: ${s}`);

// ── verify ────────────────────────────────────────────────────────────────────
if (APPLY) {
  console.log('\nVerification');
  for (const n of names) {
    const col = db.collection(`cms_${n}`);
    const remote = new Map((await col.find({}).toArray()).map((d) => [d._id, strip(d)]));
    const missing = local[n].filter((d) => !remote.has(d.id) && !report.find((r) => r.name === n).skipped.some((s) => s.startsWith(d.id)));
    // every local doc must exist; where production was not newer it must match exactly
    let mismatch = 0;
    for (const d of local[n]) {
      const p = remote.get(d.id);
      if (!p) continue;
      const prodNewer = INSERT_ONLY.has(n) ? canon(p) !== canon(d) : typeof p.updatedAt === 'string' && typeof d.updatedAt === 'string' && p.updatedAt > d.updatedAt;
      if (!prodNewer && canon(p) !== canon(d)) mismatch++;
    }
    const ok = !missing.length && !mismatch;
    if (!ok) problems++;
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${n.padEnd(20)} local ${local[n].length}, mongo ${remote.size}${missing.length ? `, MISSING ${missing.length}` : ''}${mismatch ? `, MISMATCH ${mismatch}` : ''}`);
  }
  // sample records
  const sample = async (n, label) => {
    const d = local[n]?.[0];
    if (!d) return;
    const p = await db.collection(`cms_${n}`).findOne({ _id: d.id });
    console.log(`  sample ${n}/${d.id}: ${label(p)}`);
  };
  await sample('courses', (p) => (p ? `found, published=${!!p.published}, version=${p.version}` : 'NOT FOUND'));
  await sample('singletons', (p) => (p ? `found, has draft=${!!p.draft}, published=${!!p.published}` : 'NOT FOUND'));
  await sample('users', (p) => (p ? `found, role=${p.role}, password hash ${p.passwordHash === local.users[0].passwordHash ? 'identical' : 'DIFFERENT (production kept)'}` : 'NOT FOUND'));
  await sample('media', (p) => (p ? `found, url ${p.url ? 'set' : 'missing'}` : 'NOT FOUND'));
}

await client.close();
if (!APPLY) console.log('\nDry run only. Re-run with --apply to back up and migrate.');
else console.log(problems ? `\nFinished with ${problems} problem(s) — see above.` : '\nMigration verified. You can now rename MONGODB_URI_PENDING to MONGODB_URI.');
process.exit(problems ? 2 : 0);
