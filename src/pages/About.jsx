import React from 'react';
import { Target, Compass } from 'lucide-react';
import About from '../components/About';
import DirectorMessage from '../components/DirectorMessage';
import TrustStats from '../components/TrustStats';
import Achievements from '../components/Achievements';
import CTA from '../components/CTA';

export default function AboutPage() {
  return (
    <main className="about-page" id="main-content">
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container text-center">
          <h1 className="page-hero__title">Dedicated to Your Global Career</h1>
          <p className="page-hero__subtitle">
            EDUZY is one of Kerala&apos;s most respected coaching centres for international language exams, healthcare licensure, and professional skill enhancement.
          </p>
        </div>
      </section>

      {/* About Component (Collage + Story) */}
      <About />

      {/* Stats */}
      <TrustStats />

      {/* Director's Message */}
      <DirectorMessage />

      {/* Achievements / Trust */}
      <Achievements />

      {/* Mission & Vision Section */}
      <section className="section bg-light-orange" aria-label="Our Mission and Vision">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '40px' }}>
            <h2 className="section-title">Our Vision &amp; Core Mission</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '28px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div className="card" style={{ padding: '36px', background: '#fff', borderRadius: '16px', border: '1px solid #E5E5E5' }}>
              <div style={{ marginBottom: '14px', color: '#0F172A' }}>
                <Target size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '12px' }}>Our Mission</h3>
              <p style={{ color: '#555', lineHeight: 1.7 }}>
                To provide high-quality, personalized, and exam-focused education that equips healthcare professionals and students with the language proficiency and certifications required to excel on global platforms.
              </p>
            </div>

            <div className="card" style={{ padding: '36px', background: '#fff', borderRadius: '16px', border: '1px solid #E5E5E5' }}>
              <div style={{ marginBottom: '14px', color: '#0F172A' }}>
                <Compass size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '12px' }}>Our Vision</h3>
              <p style={{ color: '#555', lineHeight: 1.7 }}>
                To be the most trusted and result-oriented career training academy in India, celebrated for authentic mentor guidance, cutting-edge teaching methodologies, and life-changing student success stories.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <CTA />
    </main>
  );
}
