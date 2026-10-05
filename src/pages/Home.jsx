import React from 'react';
import Hero from '../components/Hero';
import TrustStats from '../components/TrustStats';
import About from '../components/About';
import WhyChooseUs from '../components/WhyChooseUs';
import LearningJourney from '../components/LearningJourney';
import DirectorMessage from '../components/DirectorMessage';
import Testimonials from '../components/Testimonials';
import VideoTestimonials from '../components/VideoTestimonials';
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

      {/* 4. Why Choose Us */}
      <WhyChooseUs />

      {/* 5. Learning Journey Timeline */}
      <LearningJourney />

      {/* 6. Director's Message */}
      <DirectorMessage />

      {/* 7. Student Video Reels Carousel */}
      <VideoTestimonials />

      {/* 8. Student Testimonials */}
      <Testimonials />

      {/* 9. Final Enrollment CTA */}
      <CTA />
    </main>
  );
}
