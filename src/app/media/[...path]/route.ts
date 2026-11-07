import { promises as fs } from 'fs';
import path from 'path';
import { uploadsDir } from '@/cms/server/media';

/** Serves images uploaded with the local (development) media storage. */
const TYPES: Record<string, string> = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', avif: 'image/avif', ico: 'image/x-icon' };

export async function GET(_req: Request, { params }: { params: Promise<{ path: string[] }> }) {
  const parts = (await params).path || [];
  const root = uploadsDir();
  const file = path.resolve(root, ...parts.map((p) => decodeURIComponent(p)));
  if (!file.startsWith(root + path.sep)) return new Response('Not found', { status: 404 });
  const type = TYPES[file.split('.').pop()!.toLowerCase()];
  if (!type) return new Response('Not found', { status: 404 });
  try {
    const buf = await fs.readFile(file);
    return new Response(new Uint8Array(buf), {
      headers: { 'Content-Type': type, 'Cache-Control': 'public, max-age=31536000, immutable', 'X-Content-Type-Options': 'nosniff' },
    });
  } catch {
    return new Response('Not found', { status: 404 });
  }
}
