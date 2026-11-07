import type { Metadata, Viewport } from 'next';
import '../../admin/admin.css';
import { FeedbackProvider } from '@/admin/ui/feedback';

export const metadata: Metadata = {
  title: { default: 'EDUZY Admin', template: '%s · EDUZY Admin' },
  robots: { index: false, follow: false },
  icons: { icon: '/favicon.svg' },
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1, themeColor: '#f2f1ed' };

export default function AdminRootLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm">
      <FeedbackProvider>{children}</FeedbackProvider>
    </div>
  );
}
