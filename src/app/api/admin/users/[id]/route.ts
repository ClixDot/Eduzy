import { handler, body } from '@/cms/server/http';
import { requireUser, getUser, saveUser, listUsers, hashPassword, passwordProblem } from '@/cms/server/auth';
import { CmsError, logActivity } from '@/cms/server/content';
import { getStore } from '@/cms/server/store';
import { toPublicUser } from '@/cms/types';

async function assertAnotherOwner(excludeId: string) {
  const owners = (await listUsers()).filter((u) => u.role === 'owner' && !u.disabled && u.id !== excludeId);
  if (!owners.length) throw new CmsError('There must always be at least one active owner.', 409);
}

export const PUT = handler<{ id: string }>(async (req, { id }) => {
  const me = await requireUser('users');
  const user = await getUser(id);
  if (!user) throw new CmsError('Admin not found.', 404);
  const input = await body(req);

  if (input.role !== undefined && input.role !== user.role) {
    if (!['owner', 'editor'].includes(input.role)) throw new CmsError('Choose a valid role.', 422);
    if (user.role === 'owner') await assertAnotherOwner(user.id);
    user.role = input.role;
    user.sessionVersion += 1;
  }
  if (input.disabled !== undefined && !!input.disabled !== !!user.disabled) {
    if (user.id === me.id) throw new CmsError('You cannot disable your own account.', 409);
    if (input.disabled && user.role === 'owner') await assertAnotherOwner(user.id);
    user.disabled = !!input.disabled;
    user.sessionVersion += 1;
  }
  if (input.password) {
    const problem = passwordProblem(input.password, user.email);
    if (problem) throw new CmsError(problem, 422, { password: problem });
    user.passwordHash = await hashPassword(input.password);
    user.sessionVersion += 1;
  }
  await saveUser(user);
  await logActivity(me, { action: 'updated', kind: 'user', target: user.id, label: `Admin updated: ${user.name}` });
  return { user: toPublicUser(user) };
});

export const DELETE = handler<{ id: string }>(async (_req, { id }) => {
  const me = await requireUser('users');
  const user = await getUser(id);
  if (!user) throw new CmsError('Admin not found.', 404);
  if (user.id === me.id) throw new CmsError('You cannot delete your own account.', 409);
  if (user.role === 'owner') await assertAnotherOwner(user.id);
  await getStore().remove('users', id);
  await logActivity(me, { action: 'deleted', kind: 'user', target: id, label: `Admin removed: ${user.name}` });
  return { ok: true };
});
