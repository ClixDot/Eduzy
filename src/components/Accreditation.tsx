'use client';
import React, { useEffect, useRef } from 'react';
import { gsap } from '../utils/gsapSetup';
import { useSite } from '@/cms/site/ContentProvider';
import './Accreditation.css';

export default function Accreditation() {
  const sectionRef = useRef(null);
  const { accreditationSection: sec, accreditations } = useSite();
  const toBadge = (a: any) => ({ id: a.id.replace(/^acc-/, ''), img: a.image, alt: a.name });
  const primaryBadges = accreditations.filter((a: any) => a.group === 'primary').map(toBadge);
  const partnerBadges = accreditations.filter((a: any) => a.group !== 'primary').map(toBadge);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1. Header reveal
      gsap.from('.accreditation__header > *', {
        y: 20,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });

      // 2. Badges cards staggered reveal
      gsap.from('.accreditation__card', {
        y: 25,
        stagger: 0.06,
        duration: 0.6,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section 
      className="accreditation section" 
      id="accreditations" 
      ref={sectionRef} 
      aria-label="International Certifications and Accreditations"
    >
      {/* Ambient background glows */}
      <div className="accreditation__glow accreditation__glow--top" aria-hidden="true" />
      <div className="accreditation__glow accreditation__glow--bottom" aria-hidden="true" />

      <div className="container accreditation__container">
        {/* Section Header */}
        <div className="text-center accreditation__header">
          <h2 className="accreditation__title">
            {sec.titleLine1}<br />
            <span className="highlight-orange">{sec.titleHighlight}</span>
          </h2>

          <p className="accreditation__subtitle">
            {sec.subtitle}
          </p>
        </div>

        {/* Cards Wrapper */}
        <div className="accreditation__cards-wrapper">
          {/* Row 1: International Certificates */}
          {primaryBadges.length > 0 && (
          <div className="accreditation__grid accreditation__grid--primary">
            {primaryBadges.map((b) => (
              <div 
                key={b.id} 
                className={`accreditation__card accreditation__card--primary accreditation__card--${b.id}`}
              >
                <div className="accreditation__badge-frame">
                  <div className="accreditation__badge-glow" aria-hidden="true" />
                  <img 
                    src={b.img} 
                    alt={b.alt} 
                    className="accreditation__badge-img"
                    loading="lazy"
                    width="220"
                    height="220"
                  />
                </div>
              </div>
            ))}
          </div>
          )}

          {/* Partner logos: 4 per row in the order set in the CMS */}
          {partnerBadges.length > 0 && (
          <div className="accreditation__grid accreditation__grid--secondary">
            {partnerBadges.map((b) => (
              <div 
                key={b.id} 
                className={`accreditation__card accreditation__card--secondary accreditation__card--${b.id}`}
              >
                <div className="accreditation__badge-frame">
                  <div className="accreditation__badge-glow" aria-hidden="true" />
                  <img 
                    src={b.img} 
                    alt={b.alt} 
                    className="accreditation__badge-img"
                    loading="lazy"
                    width="220"
                    height="220"
                  />
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>
    </section>
  );
}



