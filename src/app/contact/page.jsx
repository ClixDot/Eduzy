import { Suspense } from 'react';
import Contact from '../../views/Contact';

export const metadata = {
  title: 'Contact Us | EDUZY Global Academy',
  description: 'Get in touch with EDUZY campus admissions across Thrissur, Palakkad, Kannur, Trivandrum, Calicut, Kochi, and Idukki.',
};

export default function ContactPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '60vh' }} />}>
      <Contact />
    </Suspense>
  );
}
