import React, { useEffect, useRef } from 'react';
import { CheckCircle2, Award } from 'lucide-react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import badge1Img from '../assets/badge1.png';
import badge2Img from '../assets/badge2.png';
import badge3Img from '../assets/badge3.png';
import './Accreditation.css';

const badges = [
  {
    id: 'iqa-usa',
    img: badge1Img,
    alt: 'IQA - International Qualifications and Assessments USA',
    pill: 'Accreditation Body',
    title: 'IQA — USA Recognized',
    subtitle: 'International Qualifications and Assessments',
    desc: 'Validated benchmark of global excellence aligned with United States international education standards.',
    points: ['US Benchmarked Standards', 'Global Credential Validity'],
    isFeatured: false,
  },
  {
    id: 'sted-council',
    img: badge2Img,
    alt: 'STED Council - Scientific and Technical Education Development Council Training Provider',
    pill: 'Primary Certification Issuer',
    title: 'STED Council Certified',
    subtitle: 'Scientific & Technical Education Development Council',
    desc: 'Authorized Training Provider delivering internationally recognized, government-registered professional certifications.',
    points: ['IQA-USA Accredited Provider', 'Official Verifiable Credentials'],
    isFeatured: true,
  },
  {
    id: 'aaa-accreditation',
    img: badge3Img,
    alt: 'Accreditation AAA - Organizational Member',
    pill: 'Quality Assurance',
    title: 'Accreditation AAA Member',
    subtitle: 'American Accreditation Association',
    desc: 'Recognized organizational membership ensuring rigorous curriculum quality and global institutional compliance.',
    points: ['Organizational Member', 'International Quality Audited'],
    isFeatured: false,
  },
];

const scrollingPartners = [
  {
    num: '04',
    name: 'American Board of Education',
    tag: 'Global Accreditation',
    badge: 'USA Certified',
    color: '#2563EB',
    bg: '#EFF6FF',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
        <path d="M6 12v5c0 2 3 3 6 3s6-1 6-3v-5"/>
      </svg>
    ),
  },
  {
    num: '05',
    name: 'NSDC',
    tag: 'National Skill Development Corp',
    badge: 'Skill India',
    color: '#EA580C',
    bg: '#FFF7ED',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="9"/>
        <path d="M12 3v18M3 12h18M6.5 6.5l11 11M6.5 17.5l11-11"/>
      </svg>
    ),
  },
  {
    num: '06',
    name: 'IGNET',
    tag: 'Global Education Network',
    badge: 'International',
    color: '#0D9488',
    bg: '#F0FDFA',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <line x1="2" y1="12" x2="22" y2="12"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    num: '07',
    name: 'ISO 9001:2015',
    tag: 'Certified Quality Management',
    badge: 'Quality Standard',
    color: '#DC2626',
    bg: '#FEF2F2',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        <path d="m9 12 2 2 4-4"/>
      </svg>
    ),
  },
  {
    num: '08',
    name: 'SAP',
    tag: 'Enterprise ERP Solutions',
    badge: 'Industry Standard',
    color: '#0284C7',
    bg: '#F0F9FF',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="12 2 2 7 12 12 22 7 12 2"/>
        <polyline points="2 17 12 22 22 17"/>
        <polyline points="2 12 12 17 22 12"/>
      </svg>
    ),
  },
  {
    num: '09',
    name: 'Microsoft Excel',
    tag: 'Advanced Analytics & Modeling',
    badge: 'Certified Skills',
    color: '#16A34A',
    bg: '#F0FDF4',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
        <line x1="3" y1="9" x2="21" y2="9"/>
        <line x1="3" y1="15" x2="21" y2="15"/>
        <line x1="9" y1="3" x2="9" y2="21"/>
        <line x1="15" y1="3" x2="15" y2="21"/>
      </svg>
    ),
  },
  {
    num: '10',
    name: 'TallyPrime',
    tag: 'Corporate Accounting & GST',
    badge: 'Finance Partner',
    color: '#B45309',
    bg: '#FFFBEB',
    icon: (
      <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 2v20l2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1 2-1 2 1V2l-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1-2 1-2-1z"/>
        <path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/>
        <path d="M12 6v2m0 8v2"/>
      </svg>
    ),
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
        stagger: 0.1,
        duration: 0.65,
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
            International Certification<br />
            <span className="highlight-orange">Issued by STED Council</span>
          </h2>

          <p className="accreditation__subtitle">
            EDUZY training programs are internationally validated and accredited by prestigious global councils — 
            ensuring your credentials are accepted for overseas healthcare licensure, embassy attestation, and global careers.
          </p>
        </div>

        {/* 3 Badges Grid */}
        <div className="accreditation__grid">
          {badges.map((b) => (
            <div 
              key={b.id} 
              className={`accreditation__card ${b.isFeatured ? 'accreditation__card--featured' : ''}`}
            >
              {b.isFeatured && (
                <div className="accreditation__featured-ribbon">
                  <Award size={13} />
                  <span>Authorized Provider</span>
                </div>
              )}

              {/* Badge Visual Frame */}
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

              {/* Badge Info */}
              <div className="accreditation__card-body">
                <span className="accreditation__pill-tag">{b.pill}</span>
                <h3 className="accreditation__card-title">{b.title}</h3>
                <h4 className="accreditation__card-subtitle">{b.subtitle}</h4>
                <p className="accreditation__card-desc">{b.desc}</p>

                {/* Key Points */}
                <div className="accreditation__points">
                  {b.points.map((pt, i) => (
                    <div key={i} className="accreditation__point-item">
                      <CheckCircle2 size={15} className="accreditation__point-icon" />
                      <span>{pt}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Scrolling Partner & Certification Ticker (Items 04 - 10) */}
        <div className="accreditation__scroll-wrap">
          <div className="accreditation__scroll-header">
            <div className="accreditation__scroll-divider">
              <span className="accreditation__scroll-line" />
              <span className="accreditation__scroll-pill">
                Certifications &amp; Industry Standards (04 – 10)
              </span>
              <span className="accreditation__scroll-line" />
            </div>
            <p className="accreditation__scroll-subtext">
              Recognized by premier international boards, national skill councils &amp; enterprise platforms
            </p>
          </div>

          <div className="accreditation__marquee" aria-label="Partner and accreditation ticker">
            <div className="accreditation__marquee-track">
              {scrollingPartners.concat(scrollingPartners).map((p, idx) => (
                <div key={`track1-${p.num}-${idx}`} className="accreditation__ticker-card">
                  <div 
                    className="accreditation__ticker-icon" 
                    style={{ color: p.color, backgroundColor: p.bg }}
                  >
                    {p.icon}
                  </div>
                  <div className="accreditation__ticker-info">
                    <div className="accreditation__ticker-top">
                      <span className="accreditation__ticker-num">#{p.num}</span>
                      <span className="accreditation__ticker-badge">{p.badge}</span>
                    </div>
                    <div className="accreditation__ticker-name">{p.name}</div>
                    <div className="accreditation__ticker-tag">{p.tag}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="accreditation__marquee-track" aria-hidden="true">
              {scrollingPartners.concat(scrollingPartners).map((p, idx) => (
                <div key={`track2-${p.num}-${idx}`} className="accreditation__ticker-card">
                  <div 
                    className="accreditation__ticker-icon" 
                    style={{ color: p.color, backgroundColor: p.bg }}
                  >
                    {p.icon}
                  </div>
                  <div className="accreditation__ticker-info">
                    <div className="accreditation__ticker-top">
                      <span className="accreditation__ticker-num">#{p.num}</span>
                      <span className="accreditation__ticker-badge">{p.badge}</span>
                    </div>
                    <div className="accreditation__ticker-name">{p.name}</div>
                    <div className="accreditation__ticker-tag">{p.tag}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

