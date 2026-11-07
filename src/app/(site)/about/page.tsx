import { redirect } from 'next/navigation';
import AboutPage from '../../../views/About';
import { getSiteContent, isPreview, pageMetadata } from '@/cms/site/server';

export const generateMetadata = () => pageMetadata('about', '/about');

/**
 * /about used to redirect to /portfolio. That stays the default until the admin turns the
 * About page on (About Page → “Publish the About page”). Admins can preview it either way.
 */
export default async function About() {
  const [site, preview] = await Promise.all([getSiteContent(), isPreview()]);
  if (!site.about?.enabled && !preview) redirect('/portfolio');
  return <AboutPage />;
}
