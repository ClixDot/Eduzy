import React from 'react';
import Hero from '../components/Hero';
import TrustStats from '../components/TrustStats';
import About from '../components/About';
import Accreditation from '../components/Accreditation';
import DirectorMessage from '../components/DirectorMessage';
import VideoTestimonials from '../components/VideoTestimonials';
import Testimonials from '../components/Testimonials';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';

export default function Home() {
  return (
    <main id="main-content">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Trust Stats */}
      <TrustStats />

      {/* 3. About Section */}
      <About />

      {/* 4. International Accreditations & Certifications */}
      <Accreditation />

      {/* 5. Director's Message */}
      <DirectorMessage />

      {/* 6. Student Video Reels Carousel */}
      <VideoTestimonials />

      {/* 7. Student Testimonials */}
      <Testimonials />

      {/* 8. Frequently Asked Questions */}
      <FAQ />

      {/* 9. Final Enrollment CTA */}
      <CTA />
    </main>
  );
}

