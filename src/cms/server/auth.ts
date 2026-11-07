import 'server-only';
import { cookies, headers } from 'next/headers';
import { cache } from 'react';
import { randomBytes, randomUUID, scrypt as scryptCb, timingSafeEqual, createHash } from 'crypto';
import { promisify } from 'util';
import { getStore } from './store';
import { SESSION_COOKIE, signSession, verifySession, sessionSecret } from './session';
import { CmsError, logActivity } from './content';
import type { Role, UserDoc } from '../types';
import type { Permission } from '../schema';

const scrypt = promisify(scryptCb) as (pw: string, salt: Buffer, len: number, opts: object) => Promise<Buffer>;

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: Role;
}

const PERMISSIONS: Record<Role, Permission[]> = {
  owner: ['content', 'settings', 'users'],
  editor: ['content'],
};
export const can = (role: Role, p: Permission) => PERMISSIONS[role]?.includes(p) ?? false;

// ---------------------------------------------------------------------------
// Passwords
// ---------------------------------------------------------------------------

const N = 16384, R = 8, P = 1, LEN = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scrypt(password, salt, LEN, { N, r: R, p: P, maxmem: 64 * 1024 * 1024 });
  return `scrypt$${N}$${R}$${P}$${salt.toString('base64')}$${hash.toString('base64')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [algo, n, r, p, salt, hash] = (stored || '').split('$');
  if (algo !== 'scrypt' || !salt || !hash) return false;
  const expected = Buffer.from(hash, 'base64');
  const actual = await scrypt(password, Buffer.from(salt, 'base64'), expected.length, { N: +n, r: +r, p: +p, maxmem: 64 * 1024 * 1024 });
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export function passwordProblem(pw: string, email?: string): string | null {
  if (typeof pw !== 'string' || pw.length < 10) return 'Use at least 10 characters.';
  if (pw.length > 200) return 'Password is too long.';
  if (!/[a-zA-Z]/.test(pw) || !/[0-9]/.test(pw)) return 'Use a mix of letters and numbers.';
  if (email && pw.toLowerCase().includes(email.split('@')[0].toLowerCase())) return 'Do not include your email name in the password.';
  return null;
}

const normEmail = (e: string) => String(e || '').trim().toLowerCase();
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// ---------------------------------------------------------------------------
// Users
// ---------------------------------------------------------------------------

export async function listUsers() {
  return (await getStore().all<UserDoc>('users')).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export async function hasAnyUser() {
  return (await getStore().all<UserDoc>('users')).length > 0;
}

export async function createUser(input: { email: string; name: string; password: string; role: Role }) {
  const email = normEmail(input.email);
  const name = String(input.name || '').trim().slice(0, 80);
  const errors: Record<string, string> = {};
  if (!EMAIL.test(email)) errors.email = 'Enter a valid email address.';
  if (!name) errors.name = 'Enter a name.';
  const pwErr = passwordProblem(input.password, email);
  if (pwErr) errors.password = pwErr;
  if (!['owner', 'editor'].includes(input.role)) errors.role = 'Choose a role.';
  if (Object.keys(errors).length) throw new CmsError('Please fix the highlighted fields.', 422, errors);
  if (await getStore().findOne<UserDoc>('users', 'email', email)) throw new CmsError('An admin with this email already exists.', 409, { email: 'Already in use.' });
  const user: UserDoc = {
    id: `user-${randomUUID().slice(0, 12)}`,
    email,
    name,
    role: input.role,
    passwordHash: await hashPassword(input.password),
    sessionVersion: 1,
    createdAt: new Date().toISOString(),
    lastLoginAt: null,
  };
  await getStore().put('users', user);
  return user;
}

/** Cached per request: the admin layout and the session check would otherwise each fetch the same user. */
export const getUser = cache(async (id: string) => getStore().get<UserDoc>('users', id));
export async function saveUser(user: UserDoc) {
  await getStore().put('users', user);
}

// ---------------------------------------------------------------------------
// Sessions
// ---------------------------------------------------------------------------

export async function startSession(user: UserDoc, remember: boolean) {
  const maxAge = remember ? 60 * 60 * 24 * 30 : 60 * 60 * 12;
  const token = await signSession({ uid: user.id, role: user.role, sv: user.sessionVersion, exp: Math.floor(Date.now() / 1000) + maxAge });
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge,
  });
}

export async function endSession() {
  (await cookies()).set(SESSION_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 0 });
}

/** Full check: signature, expiry, user still exists/enabled and session version matches. */
export async function getSessionUser(): Promise<SessionUser | null> {
  const payload = await verifySession((await cookies()).get(SESSION_COOKIE)?.value);
  if (!payload) return null;
  const user = await getUser(payload.uid);
  if (!user || user.disabled || user.sessionVersion !== payload.sv) return null;
  return { id: user.id, name: user.name, email: user.email, role: user.role };
}

export async function requireUser(permission: Permission = 'content'): Promise<SessionUser> {
  const user = await getSessionUser();
  if (!user) throw new CmsError('Your session has expired. Please sign in again.', 401);
  if (!can(user.role, permission)) throw new CmsError('You do not have permission to do this.', 403);
  return user;
}

// ---------------------------------------------------------------------------
// Login with simple in-memory rate limiting
// ---------------------------------------------------------------------------

const attempts = new Map<string, { count: number; until: number }>();

async function clientKey(email: string) {
  const h = await headers();
  const ip = (h.get('x-forwarded-for') || '').split(',')[0].trim() || h.get('x-real-ip') || 'local';
  return `${ip}|${email}`;
}

export async function login(emailIn: string, password: string, remember: boolean) {
  if (!sessionSecret()) throw new CmsError('Admin sign-in is not configured: set CMS_SESSION_SECRET on the server.', 500);
  const email = normEmail(emailIn);
  const key = await clientKey(email);
  const a = attempts.get(key);
  if (a && a.count >= 5 && a.until > Date.now()) {
    const mins = Math.ceil((a.until - Date.now()) / 60000);
    throw new CmsError(`Too many attempts. Try again in ${mins} minute${mins > 1 ? 's' : ''}.`, 429);
  }
  const user = EMAIL.test(email) ? await getStore().findOne<UserDoc>('users', 'email', email) : null;
  const ok = user && !user.disabled && (await verifyPassword(String(password || ''), user.passwordHash));
  if (!ok || !user) {
    const count = (a && a.until > Date.now() ? a.count : 0) + 1;
    attempts.set(key, { count, until: Date.now() + 15 * 60 * 1000 });
    throw new CmsError('The email or password is incorrect.', 401);
  }
  attempts.delete(key);
  user.lastLoginAt = new Date().toISOString();
  // show the welcome / guided-tour screen after every sign-in, unless the admin turned that off
  if (user.onboarding?.showOnLogin !== false) {
    const prev = user.onboarding ?? { started: false, completed: false, skipped: false, lastStep: 0, showAgain: true, updatedAt: '' };
    user.onboarding = { ...prev, showAgain: true, updatedAt: user.lastLoginAt };
  }
  await startSession(user, remember);
  // both are independent database writes: run them together
  await Promise.all([
    saveUser(user),
    logActivity({ id: user.id, name: user.name, email: user.email, role: user.role }, { action: 'signed-in', kind: 'user', target: user.id, label: 'Signed in' }),
  ]);
  return user;
}

// ---------------------------------------------------------------------------
// Password reset
// ---------------------------------------------------------------------------

const sha256 = (s: string) => createHash('sha256').update(s).digest('hex');

/** Returns the raw token (to be emailed) or null if the email is unknown. */
export async function createResetToken(emailIn: string): Promise<{ user: UserDoc; token: string } | null> {
  const user = await getStore().findOne<UserDoc>('users', 'email', normEmail(emailIn));
  if (!user || user.disabled) return null;
  const token = randomBytes(32).toString('hex');
  user.resetTokenHash = sha256(token);
  user.resetExpires = Date.now() + 30 * 60 * 1000;
  await saveUser(user);
  return { user, token };
}

export async function resetPassword(token: string, password: string) {
  const users = await listUsers();
  const hash = sha256(String(token || ''));
  const user = users.find((u) => u.resetTokenHash && u.resetTokenHash === hash);
  if (!user || !user.resetExpires || user.resetExpires < Date.now()) throw new CmsError('This reset link is invalid or has expired. Request a new one.', 400);
  const problem = passwordProblem(password, user.email);
  if (problem) throw new CmsError(problem, 422, { password: problem });
  user.passwordHash = await hashPassword(password);
  user.resetTokenHash = null;
  user.resetExpires = null;
  user.sessionVersion += 1; // sign out everywhere
  await saveUser(user);
  return user;
}
