import { Suspense } from 'react';
import { LoginPage } from '@/admin/pages/Auth';

export const metadata = { title: 'Sign in' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <LoginPage />
    </Suspense>
  );
}
