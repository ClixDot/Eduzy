#!/usr/bin/env node
/**
 * Safe MongoDB connectivity check: ping, read, temporary write + delete.
 * Never prints the connection string. Touches only the throw-away collection `cms__conncheck`.
 *
 *   node scripts/mongo-check.mjs            (reads MONGODB_URI, else MONGODB_URI_PENDING, from env / .env.local)
 */
import { loadEnv, mongoUri, redact } from './lib/env.mjs';
import { MongoClient } from 'mongodb';

loadEnv();
const { uri, source } = mongoUri();
const dbName = process.env.MONGODB_DB || 'eduzy_cms';
if (!uri) {
  console.error('FAIL  no MONGODB_URI or MONGODB_URI_PENDING set');
  process.exit(1);
}
if (/[<>]/.test(uri)) {
  console.error('FAIL  connection string still contains <placeholder> brackets');
  process.exit(1);
}

const client = new MongoClient(uri, { serverSelectionTimeoutMS: 10000 });
let ok = true;
const step = async (name, fn) => {
  try {
    const r = await fn();
    console.log(`PASS  ${name}${r ? `: ${r}` : ''}`);
  } catch (e) {
    ok = false;
    console.log(`FAIL  ${name}: ${e.name} - ${redact(String(e.message), uri).slice(0, 240)}`);
    throw e;
  }
};

try {
  console.log(`Using ${source}, database "${dbName}"`);
  await step('connect + TLS', () => client.connect().then(() => ''));
  const db = client.db(dbName);
  await step('ping', async () => JSON.stringify(await db.command({ ping: 1 })));
  await step('read (list collections)', async () => {
    const cols = (await db.listCollections({}, { nameOnly: true }).toArray()).map((c) => c.name).filter((n) => n.startsWith('cms_'));
    return cols.length ? cols.sort().join(', ') : 'no CMS collections yet';
  });
  const t = db.collection('cms__conncheck');
  const id = `probe-${Date.now()}`;
  await step('temporary write', async () => (await t.insertOne({ _id: id, at: new Date() })).acknowledged && '');
  await step('read back', async () => {
    if (!(await t.findOne({ _id: id }))) throw new Error('probe not found');
  });
  await step('delete + cleanup', async () => {
    await t.deleteOne({ _id: id });
    if ((await t.countDocuments()) === 0) await t.drop().catch(() => undefined);
  });
} catch {
  ok = false;
  console.log('\nHint: "SSL alert number 80" / server selection timeout usually means this computer\'s IP is not in Atlas → Network Access.');
} finally {
  await client.close().catch(() => undefined);
}
process.exit(ok ? 0 : 1);
