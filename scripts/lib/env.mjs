/** Tiny .env.local loader for the maintenance scripts (does not override real env vars, ignores non KEY=VALUE lines). */
import fs from 'fs';
import path from 'path';

export function loadEnv(file = path.resolve(process.cwd(), '.env.local')) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    let v = m[2];
    if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
    process.env[m[1]] = v;
  }
}

/** MONGODB_URI wins; MONGODB_URI_PENDING is the staged value used before production mode is switched on. */
export function mongoUri() {
  if (process.env.MONGODB_URI) return { uri: process.env.MONGODB_URI, source: 'MONGODB_URI' };
  if (process.env.MONGODB_URI_PENDING) return { uri: process.env.MONGODB_URI_PENDING, source: 'MONGODB_URI_PENDING' };
  return { uri: '', source: '' };
}

/** strip credentials from any text before it is printed */
export function redact(text, uri) {
  let out = text.replace(/(mongodb(?:\+srv)?:\/\/)[^@\s]+@/g, '$1***@');
  try {
    const pw = decodeURIComponent(new URL(uri).password || '');
    if (pw) out = out.split(pw).join('***');
  } catch {
    /* not a URL */
  }
  return out;
}
