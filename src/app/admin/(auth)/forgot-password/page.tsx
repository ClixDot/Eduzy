import { Suspense } from 'react';
import { ForgotPage } from '@/admin/pages/Auth';

export const metadata = { title: 'Forgot password' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ForgotPage />
    </Suspense>
  );
}
