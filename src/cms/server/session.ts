/**
 * Signed, stateless admin session tokens (HMAC-SHA256 via Web Crypto).
 * Imported by both `proxy.ts` and route handlers, so it must not use Node-only APIs.
 */
export const SESSION_COOKIE = 'eduzy_admin';

export interface SessionPayload {
  uid: string;
  role: 'owner' | 'editor';
  sv: number; // session version — bumping it on the user signs out every device
  exp: number; // unix seconds
}

const DEV_FALLBACK = 'eduzy-dev-only-secret-do-not-use-in-production-0001';

export function sessionSecret(): string | null {
  const s = process.env.CMS_SESSION_SECRET;
  if (s && s.length >= 32) return s;
  if (process.env.NODE_ENV !== 'production') return DEV_FALLBACK;
  return null;
}

const enc = new TextEncoder();

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
function fromB64url(s: string): Uint8Array {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  return Uint8Array.from(b, (c) => c.charCodeAt(0));
}

async function key(secret: string) {
  return crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign', 'verify']);
}

export async function signSession(payload: SessionPayload): Promise<string> {
  const secret = sessionSecret();
  if (!secret) throw new Error('CMS_SESSION_SECRET is not configured (min. 32 characters).');
  const body = b64url(enc.encode(JSON.stringify(payload)));
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', await key(secret), enc.encode(body)));
  return `${body}.${b64url(sig)}`;
}

export async function verifySession(token: string | undefined | null): Promise<SessionPayload | null> {
  try {
    const secret = sessionSecret();
    if (!secret || !token) return null;
    const [body, sig] = token.split('.');
    if (!body || !sig) return null;
    const ok = await crypto.subtle.verify('HMAC', await key(secret), fromB64url(sig) as BufferSource, enc.encode(body));
    if (!ok) return null;
    const payload = JSON.parse(new TextDecoder().decode(fromB64url(body))) as SessionPayload;
    if (!payload.uid || typeof payload.exp !== 'number' || payload.exp < Date.now() / 1000) return null;
    return payload;
  } catch {
    return null;
  }
}
