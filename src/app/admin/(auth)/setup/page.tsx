import { Suspense } from 'react';
import { SetupPage } from '@/admin/pages/Auth';

export const metadata = { title: 'Set up' };

export default function Page() {
  return (
    <Suspense fallback={null}>
      <SetupPage />
    </Suspense>
  );
}
