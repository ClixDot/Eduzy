import { handler, body } from '@/cms/server/http';
import { requireUser, listUsers, createUser } from '@/cms/server/auth';
import { logActivity } from '@/cms/server/content';
import { toPublicUser } from '@/cms/types';

export const GET = handler(async () => {
  await requireUser('users');
  return { users: (await listUsers()).map(toPublicUser) };
});

export const POST = handler(async (req) => {
  const me = await requireUser('users');
  const input = await body(req);
  const user = await createUser({ email: input.email, name: input.name, password: input.password, role: input.role === 'owner' ? 'owner' : 'editor' });
  await logActivity(me, { action: 'created', kind: 'user', target: user.id, label: `Admin added: ${user.name} (${user.role})` });
  return { user: toPublicUser(user) };
});
