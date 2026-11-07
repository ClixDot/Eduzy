import { Suspense } from 'react';
import { ResetPage } from '@/admin/pages/Auth';

export const metadata = { title: 'Reset password' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <ResetPage />
    </Suspense>
  );
}
