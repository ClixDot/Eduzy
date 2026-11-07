import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE, verifySession } from './cms/server/session';

const PUBLIC_ADMIN = ['/admin/login', '/admin/setup', '/admin/forgot-password', '/admin/reset-password'];

/**
 * First line of defence for the admin area: unauthenticated visitors are sent to the login page.
 * Every admin API route and the admin layout re-check the session against the database as well.
 */
export async function proxy(req: NextRequest) {
  const { pathname, search } = req.nextUrl;

  const session = await verifySession(req.cookies.get(SESSION_COOKIE)?.value);
  const isPublic = PUBLIC_ADMIN.some((p) => pathname === p || pathname.startsWith(p + '/'));

  let res: NextResponse;
  if (!session && !isPublic) {
    const url = req.nextUrl.clone();
    url.pathname = '/admin/login';
    url.search = pathname === '/admin' ? '' : `?next=${encodeURIComponent(pathname + search)}`;
    res = NextResponse.redirect(url);
  } else if (session && pathname === '/admin/login') {
    const url = req.nextUrl.clone();
    url.pathname = '/admin';
    url.search = '';
    res = NextResponse.redirect(url);
  } else {
    res = NextResponse.next();
  }
  res.headers.set('X-Robots-Tag', 'noindex, nofollow');
  res.headers.set('X-Frame-Options', 'DENY');
  res.headers.set('Referrer-Policy', 'same-origin');
  return res;
}

export const config = {
  matcher: ['/admin', '/admin/:path*'],
};
