import React from 'react';
import WhyChooseUs from '../components/WhyChooseUs';
import LearningJourney from '../components/LearningJourney';
import Achievements from '../components/Achievements';
import Testimonials from '../components/Testimonials';
import CTA from '../components/CTA';

export default function WhyChooseUsPage() {
  return (
    <main className="why-page" id="main-content">
      {/* Header */}
      <section className="page-hero">
        <div className="container text-center">
          <h1 className="page-hero__title">Why Choose EDUZY?</h1>
          <p className="page-hero__subtitle">
            Discover how our student-first philosophy, small batches, and exam-proven training methodologies guarantee your competitive edge.
          </p>
        </div>
      </section>

      {/* Why Choose Us component (6 feature cards) */}
      <WhyChooseUs />

      {/* Learning Journey */}
      <LearningJourney />

      {/* Verified Achievements */}
      <Achievements />

      {/* Student Testimonials */}
      <Testimonials />

      {/* CTA */}
      <CTA />
    </main>
  );
}
