import React, { useEffect, useRef } from 'react';
import { Award } from 'lucide-react';
import { gsap } from '../utils/gsapSetup';
import badge1Img from '../assets/badge1.png';
import badge2Img from '../assets/badge2.png';
import badge3Img from '../assets/badge3.png';
import ncvetImg from '../assets/NCVET_Gear_Emblem_with_Hindi_Tagline-removebg-preview.png';
import alagappaImg from '../assets/logo2.png';
import kalingaImg from '../assets/Kalinga University Heraldic Emblem.png';
import isoImg from '../assets/Blue ISO Globe Logo.png';
import ignetImg from '../assets/IGNET_University_Emblem_and_Wordmark-removebg-preview.png';
import excelImg from '../assets/Microsoft Excel Logo on Transparency.png';
import tallyImg from '../assets/Tally_Black_and_Red_Script_Logo-removebg-preview.png';
import sapImg from '../assets/SAP Blue Gradient Logo.png';
import './Accreditation.css';

const badges = [
  // --- ROW 1: International Accreditations (3 Cards) ---
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
    ribbonText: null,
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
    ribbonText: 'Authorized Provider',
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
    ribbonText: null,
  },

  // --- ROW 2: University & Govt Recognitions (3 Cards) ---
  {
    id: 'ncvet-india',
    img: ncvetImg,
    alt: 'NCVET - National Council for Vocational Education and Training, Govt of India',
    pill: 'Govt. of India Recognition',
    title: 'NCVET — Govt. of India',
    subtitle: 'National Council for Vocational Education & Training',
    desc: 'National regulatory body establishing standardized vocational qualifications and NSQF frameworks under MSDE, Govt. of India.',
    points: ['National Skill Qualification (NSQF)', 'Govt. Regulated Framework'],
    isFeatured: false,
    ribbonText: null,
  },
  {
    id: 'alagappa-university',
    img: alagappaImg,
    alt: 'Alagappa University - State University NAAC A+ Grade',
    pill: 'University Partner',
    title: 'Alagappa University',
    subtitle: 'State University — NAAC A+ Grade',
    desc: 'Prestigious UGC-recognized State University partnership delivering accredited undergraduate, diploma, and specialized certifications.',
    points: ['NAAC A+ Grade University', 'UGC & Equivalence Recognized'],
    isFeatured: false,
    ribbonText: null,
  },
  {
    id: 'kalinga-university',
    img: kalingaImg,
    alt: 'Kalinga University - UGC, AICTE & AIU Approved',
    pill: 'University Affiliation',
    title: 'Kalinga University',
    subtitle: 'UGC, AICTE & AIU Approved',
    desc: 'Premier multidisciplinary university partnership offering industry-aligned degrees with global credit transfer and embassy attestation.',
    points: ['UGC & AICTE Approved', 'Embassy Attestation Eligible'],
    isFeatured: false,
    ribbonText: null,
  },

  // --- ROW 3: Quality & Global Certification Standards (3 Cards) ---
  {
    id: 'iso-9001',
    img: isoImg,
    alt: 'ISO 9001:2015 Certified Quality Management',
    pill: 'Quality Standard',
    title: 'ISO 9001:2015 Certified',
    subtitle: 'International Organization for Standardization',
    desc: 'Certified quality management standard verifying rigorous institutional administration, curriculum excellence, and global benchmarks.',
    points: ['Certified Quality Management', 'International Standard Audited'],
    isFeatured: false,
    ribbonText: null,
  },
  {
    id: 'ignet-network',
    img: ignetImg,
    alt: 'IGNET - Indira Gandhi National Educational Trust',
    pill: 'National Education Network',
    title: 'IGNET Network',
    subtitle: 'Indira Gandhi National Educational Trust',
    desc: 'Government-registered open education network delivering standardized vocational diplomas and skill certifications across India.',
    points: ['Established Since 2004', 'Govt. Registered Trust Network'],
    isFeatured: false,
    ribbonText: null,
  },

  // --- ROW 4: Industry Software & Technology Standards (3 Cards) ---
  {
    id: 'microsoft-excel',
    img: excelImg,
    alt: 'Microsoft Excel - Advanced Analytics & Financial Modeling',
    pill: 'Analytics & Modeling',
    title: 'Microsoft Excel',
    subtitle: 'Advanced Data Analytics & Financial Modeling',
    desc: 'Hands-on training in corporate financial modeling, automated formulas, dynamic dashboards, pivot reporting, and business analytics.',
    points: ['Advanced Spreadsheet Modeling', 'Data Analytics & Visualization'],
    isFeatured: false,
    ribbonText: null,
  },
  {
    id: 'tally-prime',
    img: tallyImg,
    alt: 'TallyPrime - Corporate Accounting & Taxation',
    pill: 'Corporate Accounting',
    title: 'TallyPrime with GST',
    subtitle: 'Comprehensive Computerized Accounting & Taxation',
    desc: 'Live practical drills covering computerized corporate bookkeeping, inventory tracking, GST e-filing, TDS, and statutory compliance.',
    points: ['Live GST & TDS Filing Practical', 'Industry Standard Accounting'],
    isFeatured: false,
    ribbonText: null,
  },
  {
    id: 'sap-erp',
    img: sapImg,
    alt: 'SAP - Enterprise ERP Solutions',
    pill: 'Enterprise ERP',
    title: 'SAP ERP Solutions',
    subtitle: 'Global Enterprise Resource Planning Standard',
    desc: 'Industry-standard ERP workflows covering global logistics, supply chain operations, materials management (MM), and finance modules.',
    points: ['Enterprise ERP Workflow Practice', 'Global Multinational Benchmark'],
    isFeatured: false,
    ribbonText: null,
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
            International Certifications &<br />
            <span className="highlight-orange">University Recognitions</span>
          </h2>

          <p className="accreditation__subtitle">
            EDUZY training programs are internationally validated, government-regulated, and university-recognized — 
            ensuring your credentials are accepted for overseas healthcare licensure, embassy attestation, and global careers.
          </p>
        </div>

        {/* 6 Badges Grid (1st Row 3 Cards, 2nd Row 3 Cards - Same Level) */}
        <div className="accreditation__grid">
          {badges.map((b) => (
            <div 
              key={b.id} 
              className={`accreditation__card ${b.isFeatured ? 'accreditation__card--featured' : ''}`}
            >
              {b.isFeatured && (
                <div className="accreditation__featured-ribbon">
                  <Award size={13} />
                  <span>{b.ribbonText || 'Authorized Provider'}</span>
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
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}



