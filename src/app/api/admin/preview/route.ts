import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/cms/server/auth';

/** Turns on Draft Mode for a signed-in admin, then opens the requested public page. */
export async function GET(req: Request) {
  const user = await getSessionUser();
  if (!user) return new Response('Sign in to the admin to preview drafts.', { status: 401 });
  const url = new URL(req.url);
  const target = url.searchParams.get('path') || '/';
  const safe = target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/admin') ? target : '/';
  (await draftMode()).enable();
  redirect(safe);
}
