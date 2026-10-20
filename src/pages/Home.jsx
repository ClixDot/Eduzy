import React from 'react';
import Hero from '../components/Hero';
import TrustStats from '../components/TrustStats';
import About from '../components/About';
import Accreditation from '../components/Accreditation';
import WhyChooseUs from '../components/WhyChooseUs';
import LearningJourney from '../components/LearningJourney';
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

      {/* 5. Why Choose Us */}
      <WhyChooseUs />

      {/* 6. Learning Journey Timeline */}
      <LearningJourney />

      {/* 7. Director's Message */}
      <DirectorMessage />

      {/* 8. Student Video Reels Carousel */}
      <VideoTestimonials />

      {/* 9. Student Testimonials */}
      <Testimonials />

      {/* 10. Frequently Asked Questions */}
      <FAQ />

      {/* 11. Final Enrollment CTA */}
      <CTA />
    </main>
  );
}

