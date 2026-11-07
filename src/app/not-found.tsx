import '../index.css';
import '../App.css';
import SiteShell from '@/components/site/SiteShell';
import NotFound from '../views/NotFound';

export const metadata = {
  title: '404 Page Not Found | EDUZY',
  robots: { index: false, follow: true },
};

export default function NotFoundPage() {
  return (
    <SiteShell>
      <NotFound />
    </SiteShell>
  );
}
