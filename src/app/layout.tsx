import { Suspense } from 'react';
import '../index.css';
import '../App.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import ScrollToTop from '../components/ScrollToTop';
import FloatingContact from '../components/FloatingContact';

export const metadata = {
  metadataBase: new URL('https://eduzycampus.com'),
  title: 'EDUZY | AI-Integrated International Diplomas & Professional Training',
  description: 'EDUZY offers industry-led AI-Integrated International Diploma programs in Logistics, Accounting, Digital Marketing, Designing, Hospital Administration, and Aviation in Thrissur, Palakkad, Kannur, Trivandrum, Calicut, Kochi, and Idukki.',
  keywords: 'EDUZY, Campus to Career, Logistics diploma, Accounting course, Digital Marketing, Fashion Designing, Interior Designing, Hospital Administration, Aviation, Thrissur, Palakkad, Kannur, Trivandrum, Calicut, Kochi, Idukki, Kerala',
  alternates: {
    canonical: 'https://eduzycampus.com/',
  },
  openGraph: {
    type: 'website',
    url: 'https://eduzycampus.com/',
    title: 'EDUZY | AI-Integrated International Diplomas & Professional Training',
    description: 'EDUZY offers industry-led AI-Integrated International Diploma programs in Logistics, Accounting, Digital Marketing, Designing, Hospital Administration, and Aviation in Thrissur, Palakkad, Kannur, Trivandrum, Calicut, Kochi, and Idukki.',
    images: [
      {
        url: 'https://eduzycampus.com/assets/hero_student.jpg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'EDUZY | AI-Integrated International Diplomas & Professional Training',
    description: 'EDUZY offers industry-led AI-Integrated International Diploma programs in Logistics, Accounting, Digital Marketing, Designing, Hospital Administration, and Aviation in Thrissur, Palakkad, Kannur, Trivandrum, Calicut, Kochi, and Idukki.',
    images: ['https://eduzycampus.com/assets/hero_student.jpg'],
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#FF3B0B',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "EducationalOrganization",
              "name": "EDUZY",
              "alternateName": "EDUZY Campus to Career",
              "url": "https://eduzycampus.com",
              "logo": "https://eduzycampus.com/logo.png",
              "description": "Industry-led AI-Integrated International Diploma programs in Logistics, Accounting, Digital Marketing, Fashion & Interior Designing, Hospital Administration, and Aviation.",
              "telephone": "+91 62352 10100",
              "email": "eduzycampus@gmail.com",
              "address": {
                "@type": "PostalAddress",
                "addressRegion": "Kerala",
                "addressCountry": "IN"
              },
              "areaServed": [
                "Thrissur",
                "Palakkad",
                "Kannur",
                "Trivandrum",
                "Calicut",
                "Kochi",
                "Idukki"
              ]
            })
          }}
        />
      </head>
      <body>
        <Suspense fallback={null}>
          <ScrollToTop />
        </Suspense>
        <div className="site-wrapper">
          <Suspense fallback={null}>
            <Header />
          </Suspense>
          {children}
          <Footer />
          <FloatingContact />
        </div>
      </body>
    </html>
  );
}
