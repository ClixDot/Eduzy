import { handler, body } from '@/cms/server/http';
import { createUser, hasAnyUser, startSession } from '@/cms/server/auth';
import { CmsError, logActivity } from '@/cms/server/content';
import { toPublicUser } from '@/cms/types';

/** First-run only: creates the first owner account. Disabled once any admin exists. */
export const GET = handler(async () => ({ needsSetup: !(await hasAnyUser()), requiresCode: !!process.env.CMS_SETUP_TOKEN }));

/** “faheem.av@gmail.com” → “Faheem Av” (can be changed later in Admin Profile). */
const nameFromEmail = (email: string) =>
  String(email || '').split('@')[0].split(/[._-]+/).filter(Boolean).map((w) => w[0].toUpperCase() + w.slice(1)).join(' ') || 'Admin';

export const POST = handler(async (req) => {
  if (await hasAnyUser()) throw new CmsError('Setup has already been completed. Please sign in.', 403);
  const setupToken = process.env.CMS_SETUP_TOKEN;
  const input = await body(req);
  if (setupToken && input.setupToken !== setupToken) throw new CmsError('The setup code is incorrect.', 403, { setupToken: 'Incorrect setup code.' });
  if (!setupToken && process.env.NODE_ENV === 'production')
    throw new CmsError('For security, set CMS_SETUP_TOKEN on the server before creating the first admin in production.', 403);
  const user = await createUser({ email: input.email, name: String(input.name || '').trim() || nameFromEmail(input.email), password: input.password, role: 'owner' });
  await startSession(user, false);
  await logActivity({ id: user.id, name: user.name, email: user.email, role: user.role }, { action: 'created', kind: 'user', target: user.id, label: 'Admin account created (first owner)' });
  return { user: toPublicUser(user) };
});
