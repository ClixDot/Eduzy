import React, { useEffect, useRef } from 'react';
import { gsap } from '../utils/gsapSetup';
import badge1Img from '../assets/badge1.png';
import badge2Img from '../assets/badge2.png';
import badge3Img from '../assets/badge3.png';
import americanBoardImg from '../assets/American Board of Education Seal.png';
import nsdcImg from '../assets/NSDC Logo with Celebrating Figures.png';
import isoImg from '../assets/Blue ISO Globe Logo.png';
import ignetImg from '../assets/IGNET_University_Emblem_and_Wordmark-removebg-preview.png';
import sapImg from '../assets/SAP Blue Gradient Logo.png';
import excelImg from '../assets/Microsoft Excel Logo on Transparency.png';
import tallyImg from '../assets/Tally_Black_and_Red_Script_Logo-removebg-preview.png';
import './Accreditation.css';

// --- ROW 1: 3 International Certificates ---
const primaryBadges = [
  {
    id: 'iqa-usa',
    img: badge1Img,
    alt: 'IQA - International Qualifications and Assessments USA',
  },
  {
    id: 'sted-council',
    img: badge2Img,
    alt: 'STED Council - Scientific and Technical Education Development Council',
  },
  {
    id: 'aaa-accreditation',
    img: badge3Img,
    alt: 'Accreditation AAA - Organizational Member',
  },
];

// --- PARTNER SECTION: Exactly matches user's screenshot order ---
// 1. American Board of Education | 2. NSDC | 3. IGNET | 4. ISO | 5. SAP | 6. Excel | 7. Tally
const partnerBadges = [
  {
    id: 'american-board',
    img: americanBoardImg,
    alt: 'American Board of Education',
  },
  {
    id: 'nsdc-india',
    img: nsdcImg,
    alt: 'NSDC - National Skill Development Corporation',
  },
  {
    id: 'ignet-network',
    img: ignetImg,
    alt: 'IGNET - Indira Gandhi National Open University',
  },
  {
    id: 'iso-9001',
    img: isoImg,
    alt: 'ISO 9001:2015 Certified',
  },
  {
    id: 'sap-erp',
    img: sapImg,
    alt: 'SAP Enterprise ERP Solutions',
  },
  {
    id: 'microsoft-excel',
    img: excelImg,
    alt: 'Microsoft Excel',
  },
  {
    id: 'tally-prime',
    img: tallyImg,
    alt: 'Tally - Power of Simplicity',
  },
];

export default function Accreditation() {
  const sectionRef = useRef(null);

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
            International Certifications &<br />
            <span className="highlight-orange">University Recognitions</span>
          </h2>

          <p className="accreditation__subtitle">
            EDUZY training programs are internationally validated, government-regulated, and university-recognized — 
            ensuring your credentials are accepted for global corporate employment, embassy attestation, and international careers.
          </p>
        </div>

        {/* Cards Wrapper */}
        <div className="accreditation__cards-wrapper">
          {/* Row 1: Exactly 3 International Certificates */}
          <div className="accreditation__grid accreditation__grid--primary">
            {primaryBadges.map((b) => (
              <div 
                key={b.id} 
                className="accreditation__card accreditation__card--primary"
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

          {/* Marked Section: 4 per row in exact user-requested order */}
          <div className="accreditation__grid accreditation__grid--secondary">
            {partnerBadges.map((b) => (
              <div 
                key={b.id} 
                className="accreditation__card accreditation__card--secondary"
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
        </div>
      </div>
    </section>
  );
}



