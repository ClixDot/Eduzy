import 'server-only';
import { NextResponse } from 'next/server';
import { CmsError } from './content';

/** Rejects cross-site write requests (CSRF defence in addition to SameSite cookies). */
function sameOrigin(req: Request): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return true;
  const origin = req.headers.get('origin');
  const host = req.headers.get('x-forwarded-host') || req.headers.get('host');
  if (origin) {
    try {
      return new URL(origin).host === host;
    } catch {
      return false;
    }
  }
  const site = req.headers.get('sec-fetch-site');
  return !site || site === 'same-origin' || site === 'none';
}

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status, headers: { 'Cache-Control': 'no-store' } });
}

type Ctx<P> = { params: Promise<P> };

export function handler<P = Record<string, string>>(fn: (req: Request, params: P) => Promise<unknown>) {
  return async (req: Request, ctx: Ctx<P>) => {
    try {
      if (!sameOrigin(req)) return json({ error: 'Request blocked: it did not come from the admin dashboard.' }, 403);
      const result = await fn(req, ctx?.params ? await ctx.params : ({} as P));
      if (result instanceof Response) return result;
      return json(result ?? { ok: true });
    } catch (e: any) {
      if (e instanceof CmsError) return json({ error: e.message, errors: e.errors }, e.status);
      console.error('[EDUZY CMS] API error', e);
      const msg = /ECONNREFUSED|ServerSelection|MongoNetwork|querySrv/.test(String(e?.message || e?.name))
        ? 'The content database is unreachable. Check the MongoDB connection and try again.'
        : 'Something went wrong on the server. Your changes were not saved — please try again.';
      return json({ error: msg }, 500);
    }
  };
}

export async function body<T = any>(req: Request): Promise<T> {
  try {
    return (await req.json()) as T;
  } catch {
    throw new CmsError('Invalid request.', 400);
  }
}
