import { Suspense } from 'react';
import Contact from '../../../views/Contact';
import { pageMetadata } from '@/cms/site/server';

export const generateMetadata = () => pageMetadata('contact', '/contact');

export default function ContactPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <Contact />
    </Suspense>
  );
}
