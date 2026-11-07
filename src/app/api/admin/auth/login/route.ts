import { handler, body } from '@/cms/server/http';
import { login } from '@/cms/server/auth';
import { toPublicUser } from '@/cms/types';

export const POST = handler(async (req) => {
  const { email, password, remember } = await body(req);
  const user = await login(email, password, !!remember);
  return { user: toPublicUser(user) };
});
