'use client';
import React from 'react';
import { Target, Compass } from 'lucide-react';
import About from '../components/About';
import DirectorMessage from '../components/DirectorMessage';
import TrustStats from '../components/TrustStats';
import Accreditation from '../components/Accreditation';
import Achievements from '../components/Achievements';
import CTA from '../components/CTA';
import { useSite } from '@/cms/site/ContentProvider';
import { CmsIcon } from '@/cms/site/helpers';

export default function AboutPage() {
  const { about: page } = useSite();
  const show = page.show || {};
  const cardStyle = { padding: '36px', background: '#fff', borderRadius: '16px', border: '1px solid #E5E5E5' };

  return (
    <main className="about-page" id="main-content">
      {/* Page Hero */}
      <section className="page-hero">
        <div className="container text-center">
          <h1 className="page-hero__title">{page.heroTitle}</h1>
          <p className="page-hero__subtitle">
            {page.heroSubtitle}
          </p>
        </div>
      </section>

      {/* About Component (Collage + Story) */}
      {show.whyChoose && <About />}

      {/* Stats */}
      {show.stats && <TrustStats />}

      {/* International Accreditations & Certifications */}
      {show.accreditation && <Accreditation />}

      {/* Director's Message */}
      {show.director && <DirectorMessage />}

      {/* Achievements / Trust */}
      {show.achievements && <Achievements />}

      {/* Mission & Vision Section */}
      {show.mission && (
      <section className="section bg-light-orange" aria-label="Our Mission and Vision">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '40px' }}>
            <h2 className="section-title">{page.missionSectionTitle}</h2>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '28px',
            maxWidth: '1000px',
            margin: '0 auto'
          }}>
            <div className="card" style={cardStyle}>
              <div style={{ marginBottom: '14px', color: '#0F172A' }}>
                <Target size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '12px', color: '#000000' }}>{page.missionTitle}</h3>
              <p style={{ color: '#000000', fontWeight: 600, lineHeight: 1.7 }}>
                {page.mission}
              </p>
            </div>

            <div className="card" style={cardStyle}>
              <div style={{ marginBottom: '14px', color: '#000000' }}>
                <Compass size={32} />
              </div>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '12px', color: '#000000' }}>{page.visionTitle}</h3>
              <p style={{ color: '#000000', fontWeight: 600, lineHeight: 1.7 }}>
                {page.vision}
              </p>
            </div>
          </div>

          {/* Core values (only when added in the CMS) */}
          {(page.values || []).length > 0 && (
            <>
              <div className="text-center" style={{ margin: '56px 0 32px' }}>
                <h2 className="section-title">{page.valuesTitle}</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px', maxWidth: '1000px', margin: '0 auto' }}>
                {page.values.map((v: any, i: number) => (
                  <div className="card" key={i} style={{ ...cardStyle, padding: '28px' }}>
                    <div style={{ marginBottom: '12px', color: 'var(--color-primary)' }}>
                      <CmsIcon name={v.icon} size={28} />
                    </div>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '8px', color: '#000000' }}>{v.title}</h3>
                    {v.desc && <p style={{ lineHeight: 1.65 }}>{v.desc}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>
      )}

      {/* Final CTA */}
      {show.cta && <CTA />}
    </main>
  );
}
