import 'server-only';
import { lookup } from 'dns/promises';
import { isIP } from 'net';
import { CmsError } from './content';
import { uploadMedia } from './media';
import type { SessionUser } from './auth';

const MAX_BYTES = 10 * 1024 * 1024;
const TIMEOUT_MS = 15000;
const MAX_REDIRECTS = 3;

/** true for loopback, private, link-local, CGNAT, multicast and other non-public addresses */
function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split('.').map(Number);
    return (
      a === 0 || a === 10 || a === 127 || a >= 224 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 192 && b === 0) ||
      (a === 198 && (b === 18 || b === 19))
    );
  }
  const v = ip.toLowerCase();
  if (v.startsWith('::ffff:')) return isPrivateAddress(v.slice(7));
  return v === '::' || v === '::1' || v.startsWith('fc') || v.startsWith('fd') || v.startsWith('fe8') || v.startsWith('fe9') || v.startsWith('fea') || v.startsWith('feb') || v.startsWith('ff');
}

/** Only public http(s) hosts may be fetched (prevents requests into the server's own network). */
async function assertPublicUrl(raw: string): Promise<URL> {
  let url: URL;
  try {
    url = new URL(raw.trim());
  } catch {
    throw new CmsError('That is not a valid link. It should start with https://', 400);
  }
  if (url.protocol !== 'https:' && url.protocol !== 'http:') throw new CmsError('Only http:// and https:// image links can be used.', 400);
  if (url.username || url.password) throw new CmsError('Links with a user name or password are not allowed.', 400);
  const host = url.hostname.replace(/^\[|\]$/g, '');
  if (host === 'localhost' || host.endsWith('.local') || host.endsWith('.internal')) throw new CmsError('That link points to a private address.', 400);
  const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
  if (!addrs.length) throw new CmsError('That website could not be found. Check the link.', 400);
  if (addrs.some((a) => isPrivateAddress(a.address))) throw new CmsError('That link points to a private address.', 400);
  return url;
}

async function download(start: string): Promise<{ buf: Buffer; name: string; type: string }> {
  let current = await assertPublicUrl(start);
  for (let hop = 0; ; hop++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    let res: Response;
    try {
      res = await fetch(current, { redirect: 'manual', signal: ctrl.signal, headers: { Accept: 'image/*', 'User-Agent': 'EDUZY-CMS-image-import/1.0' } });
    } catch (e: any) {
      clearTimeout(timer);
      throw new CmsError(e?.name === 'AbortError' ? 'The image took too long to download.' : 'The image could not be downloaded from that link.', 400);
    }
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      clearTimeout(timer);
      if (hop >= MAX_REDIRECTS) throw new CmsError('That link redirects too many times.', 400);
      current = await assertPublicUrl(new URL(res.headers.get('location')!, current).toString());
      continue;
    }
    try {
      if (!res.ok) throw new CmsError(`The link returned an error (${res.status}). Make sure it opens the image directly.`, 400);
      const len = Number(res.headers.get('content-length') || 0);
      if (len > MAX_BYTES) throw new CmsError('That image is larger than 10 MB.', 413);
      // read with a hard size cap (content-length can be missing or wrong)
      const reader = res.body?.getReader();
      if (!reader) throw new CmsError('The image could not be downloaded from that link.', 400);
      const chunks: Uint8Array[] = [];
      let total = 0;
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        total += value.length;
        if (total > MAX_BYTES) {
          ctrl.abort();
          throw new CmsError('That image is larger than 10 MB.', 413);
        }
        chunks.push(value);
      }
      const last = decodeURIComponent(current.pathname.split('/').pop() || '') || 'image';
      return { buf: Buffer.concat(chunks), name: last.slice(0, 120), type: res.headers.get('content-type') || '' };
    } finally {
      clearTimeout(timer);
    }
  }
}

const EXT: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif', 'image/avif': 'avif', 'image/x-icon': 'ico' };

/**
 * Download an image from a public link and store it in the media library (Cloudinary in production),
 * so the website never depends on someone else's server. The file type is verified by uploadMedia.
 */
export async function importMediaFromUrl(link: string, meta: { alt?: string; folder?: string }, user: SessionUser) {
  const { buf, name, type } = await download(link);
  if (type && !type.startsWith('image/') && !type.startsWith('application/octet-stream') && !type.startsWith('binary/'))
    throw new CmsError('That link does not open an image. Right-click the image and choose “Copy image address”.', 415);
  const mime = type.split(';')[0].trim();
  const filename = /\.[a-z0-9]{2,5}$/i.test(name) ? name : `${name}.${EXT[mime] || 'jpg'}`;
  const file = new File([new Uint8Array(buf)], filename, { type: mime || 'application/octet-stream' });
  return uploadMedia(file, meta, user);
}
