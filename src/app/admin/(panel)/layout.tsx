import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { getSessionUser, getUser, can } from '@/cms/server/auth';
import { getStore } from '@/cms/server/store';
import { mediaStorage } from '@/cms/server/media';
import { emailConfigured } from '@/cms/server/mail';
import { toPublicUser } from '@/cms/types';
import { AdminProvider, type Me } from '@/admin/lib/context';
import AdminShell from '@/admin/shell/AdminShell';

export const dynamic = 'force-dynamic';

/** Every admin page requires a valid session (checked against the database, not just the cookie). */
export default async function PanelLayout({ children }: { children: React.ReactNode }) {
  const session = await getSessionUser();
  if (!session) redirect('/admin/login');
  const user = (await getUser(session.id))!;
  const me: Me = {
    user: toPublicUser(user) as Me['user'],
    permissions: { content: true, settings: can(user.role, 'settings'), users: can(user.role, 'users') },
    system: {
      contentStorage: getStore().label,
      contentStorageKind: getStore().kind,
      mediaStorage: mediaStorage().label,
      mediaStorageKind: mediaStorage().kind,
      email: emailConfigured() ? 'Configured' : 'Not configured',
      production: process.env.NODE_ENV === 'production',
    },
  };
  return (
    <AdminProvider initialMe={me}>
      <Suspense fallback={null}>
        <AdminShell>{children}</AdminShell>
      </Suspense>
    </AdminProvider>
  );
}
