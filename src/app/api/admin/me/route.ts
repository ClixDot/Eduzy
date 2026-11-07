import { handler, body } from '@/cms/server/http';
import { requireUser, getUser, saveUser, verifyPassword, hashPassword, passwordProblem, startSession, can } from '@/cms/server/auth';
import { CmsError, logActivity } from '@/cms/server/content';
import { getStore } from '@/cms/server/store';
import { mediaStorage } from '@/cms/server/media';
import { emailConfigured } from '@/cms/server/mail';
import { toPublicUser, type UserDoc } from '@/cms/types';

export const GET = handler(async () => {
  const u = await requireUser();
  const user = await getUser(u.id);
  return {
    user: toPublicUser(user!),
    permissions: { content: true, settings: can(u.role, 'settings'), users: can(u.role, 'users') },
    system: {
      contentStorage: getStore().label,
      contentStorageKind: getStore().kind,
      mediaStorage: mediaStorage().label,
      mediaStorageKind: mediaStorage().kind,
      email: emailConfigured() ? 'Configured' : 'Not configured',
      production: process.env.NODE_ENV === 'production',
    },
  };
});

/** Update own profile, change password, or sign out of all devices. */
export const PUT = handler(async (req) => {
  const u = await requireUser();
  const input = await body(req);
  const user = (await getUser(u.id))!;

  if (input.action === 'profile') {
    const name = String(input.name || '').trim().slice(0, 80);
    const email = String(input.email || '').trim().toLowerCase();
    const errors: Record<string, string> = {};
    if (!name) errors.name = 'Enter your name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errors.email = 'Enter a valid email address.';
    const other = await getStore().findOne<UserDoc>('users', 'email', email);
    if (other && other.id !== user.id) errors.email = 'Another admin already uses this email.';
    if (Object.keys(errors).length) throw new CmsError('Please fix the highlighted fields.', 422, errors);
    user.name = name;
    user.email = email;
    await saveUser(user);
    await logActivity(u, { action: 'updated', kind: 'user', target: u.id, label: 'Updated profile' });
    return { user: toPublicUser(user) };
  }

  if (input.action === 'password') {
    if (!(await verifyPassword(String(input.current || ''), user.passwordHash)))
      throw new CmsError('Your current password is incorrect.', 422, { current: 'Incorrect password.' });
    const problem = passwordProblem(input.password, user.email);
    if (problem) throw new CmsError(problem, 422, { password: problem });
    user.passwordHash = await hashPassword(input.password);
    user.sessionVersion += 1; // other devices are signed out
    await saveUser(user);
    await startSession(user, false); // keep this device signed in
    await logActivity(u, { action: 'updated', kind: 'user', target: u.id, label: 'Changed password' });
    return { ok: true };
  }

  if (input.action === 'onboarding') {
    // Partial update of this admin's own guided-tour progress. Only known fields, coerced to safe types.
    const prev = user.onboarding ?? { started: false, completed: false, skipped: false, lastStep: 0, showAgain: false, updatedAt: '' };
    const flag = (k: 'started' | 'completed' | 'skipped' | 'showAgain') => (typeof input[k] === 'boolean' ? input[k] : prev[k]);
    const step = Number.isInteger(input.lastStep) ? Math.min(Math.max(input.lastStep, 0), 50) : prev.lastStep;
    user.onboarding = {
      started: flag('started'),
      completed: flag('completed'),
      skipped: flag('skipped'),
      showAgain: flag('showAgain'),
      lastStep: step,
      updatedAt: new Date().toISOString(),
    };
    await saveUser(user);
    return { onboarding: user.onboarding };
  }

  if (input.action === 'signout-all') {
    user.sessionVersion += 1;
    await saveUser(user);
    await startSession(user, false);
    return { ok: true };
  }
  throw new CmsError('Unknown action.', 400);
});
