'use client';
import React, { useState, useEffect } from 'react';
import {
  Users,
  BookOpen, 
  Monitor, 
  Building, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Coffee,
  ArrowRight,
  X, 
  ExternalLink,
  ChevronRight
} from 'lucide-react';
import { gsap } from '../utils/gsapSetup';
import VideoTestimonials from '../components/VideoTestimonials';
import CTA from '../components/CTA';
import './Portfolio.css';

// Gallery Categories requested by user
const galleryCategories = [
  { id: 'all', label: 'All' },
  { id: 'classes', label: 'Classes' },
  { id: 'events', label: 'Events' },
  { id: 'industrial-visits', label: 'Industrial Visits' },
  { id: 'student-activities', label: 'Student Activities' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'campus', label: 'Campus' },
];

// Client photos, served from public/assets/gellery
const galleryItems = [
  {
    id: 1,
    title: 'CBT / Computer Lab',
    category: 'campus',
    categoryLabel: 'Campus & Facilities',
    image: '/assets/gellery/01-cbt-computer-lab.jpg',
    alt: 'EDUZY students practising in the computer lab',
  },
  {
    id: 2,
    title: 'Annual Convocation Ceremony',
    category: 'events',
    categoryLabel: 'Events',
    image: '/assets/gellery/02-annual-convocation-ceremony.jpg',
    alt: 'EDUZY convocation ceremony – Our Proud Graduates',
  },
  {
    id: 3,
    title: 'Classroom Sessions',
    category: 'classes',
    categoryLabel: 'Classes',
    image: '/assets/gellery/03-classroom-sessions.jpg',
    alt: 'Students attending a classroom session at EDUZY',
  },
  {
    id: 4,
    title: 'Industrial Visit – Port / Container Yard',
    category: 'industrial-visits',
    categoryLabel: 'Industrial Visits',
    image: '/assets/gellery/04-industrial-visit-port-container-yard.jpg',
    alt: 'EDUZY students in safety gear during a container yard visit',
  },
  {
    id: 5,
    title: 'Site Visit & Field Training',
    category: 'industrial-visits',
    categoryLabel: 'Industrial Visits',
    image: '/assets/gellery/05-site-visit-field-training.jpg',
    alt: 'EDUZY students in helmets and safety vests on a site visit',
  },
  {
    id: 6,
    title: 'Corporate Visit / Placement Drive',
    category: 'achievements',
    categoryLabel: 'Achievements',
    image: '/assets/gellery/06-corporate-visit-placement-drive.jpg',
    alt: 'EDUZY students at a corporate office during a placement drive',
  },
  {
    id: 7,
    title: 'Student Trip & Outing',
    category: 'student-activities',
    categoryLabel: 'Student Activities',
    image: '/assets/gellery/07-student-trip-outing.jpg',
    alt: 'EDUZY students on a group trip',
  },
  {
    id: 8,
    title: 'Cultural Events & Celebrations',
    category: 'events',
    categoryLabel: 'Events',
    image: '/assets/gellery/08-cultural-events-celebrations.jpg',
    alt: 'Collage of EDUZY students celebrating cultural events and festivals',
  },
];

// Student Achievements Data
const achievements = [
  {
    title: 'Logistics & Supply Chain Qualifiers',
    stat: '950+ Certified',
    badge: 'Logistics Excellence',
    desc: 'Graduates securing high-demand roles in global shipping lines, freight forwarding, and supply chain hubs.',
  },
  {
    title: 'Accounting & Corporate Finance Specialists',
    stat: '1,200+ Placed',
    badge: 'Accounting Mastery',
    desc: 'Certified professionals equipped with Tally, GST, SAP, and computerized accounting across corporate firms.',
  },
  {
    title: 'Digital Marketing & Creative Designers',
    stat: '850+ Placed',
    badge: 'Creative & Tech Hub',
    desc: 'Graduates excelling in performance marketing, fashion styling, interior CAD drafting, and brand design.',
  },
  {
    title: 'Hospital Admin & Aviation Graduates',
    stat: '98.4% Placement Rate',
    badge: 'Global Careers',
    desc: 'Diploma holders placed across leading healthcare networks and international airport operations.',
  }
];

// Campus Facilities Data
const campusFacilities = [
  {
    icon: Monitor,
    title: 'CBT Computer Mock Lab',
    desc: 'Equipped with 50+ high-performance workstations, licensed software, and studio headphones simulating real Pearson VUE & CD-IELTS test environments.'
  },
  {
    icon: BookOpen,
    title: 'Comprehensive Reference Library',
    desc: 'Vast collection of official Cambridge practice manuals, medical journals, German grammar guides, and quiet reading desks.'
  },
  {
    icon: Users,
    title: 'Sound-Insulated Speaking Booths',
    desc: 'Dedicated individual booths allowing students to record, replay, and review mock speaking tests with zero external noise interference.'
  },
  {
    icon: Building,
    title: 'Smart Digital Classrooms',
    desc: 'Air-conditioned lecture spaces equipped with 4K interactive presentation touchscreens, surround sound, and ergonomic student seating.'
  },
  {
    icon: Coffee,
    title: 'Student Lounge & Collaboration Zone',
    desc: 'A vibrant cafeteria and open-air discussion deck where peer study circles, group revisions, and informal mentorship interactions happen.'
  },
  {
    icon: ShieldCheck,
    title: 'Official Test Registration Desk',
    desc: 'In-house authorized assistance for exam slot booking, passport verification, credential evaluation, and exam fee payments.'
  }
];

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);

  useEffect(() => {
    document.title = 'Campus Life, Placements & Gallery | EDUZY';
  }, []);

  // Filter gallery items
  const filteredGallery = activeTab === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeTab);

  // GSAP animation on tab change
  useEffect(() => {
    gsap.fromTo(
      '.gallery-card',
      { y: 20, opacity: 0.2 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
    );
  }, [activeTab]);

  // Smooth scroll handler with header offset
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 85;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Keyboard accessibility & scroll lock for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  return (
    <main className="portfolio-page" id="main-content">
      {/* ================= 1. PAGE HERO ================= */}
      <section className="portfolio-hero">
        <div className="container text-center">
          <span className="portfolio-hero__badge">
            Campus Life, Achievements & Gallery
          </span>
          <h1 className="portfolio-hero__title">
            Life at EDUZY: <span className="highlight-orange">Portfolio & Achievements</span>
          </h1>
          <p className="portfolio-hero__subtitle">
            Explore our state-of-the-art campus infrastructure, clinical simulation labs, student celebrations, and global healthcare career milestones.
          </p>

          {/* Jump Navigation Quick Links */}
          <div className="portfolio-hero__quick-links">
            <a href="#gallery-section" className="quick-link-pill" onClick={(e) => scrollToSection(e, 'gallery-section')}>Gallery</a>
            <a href="#achievements-section" className="quick-link-pill" onClick={(e) => scrollToSection(e, 'achievements-section')}>Achievements</a>
            <a href="#campus-section" className="quick-link-pill" onClick={(e) => scrollToSection(e, 'campus-section')}>Campus & Labs</a>
          </div>
        </div>
      </section>

      {/* ================= 2. INTERACTIVE GALLERY & FILTER ================= */}
      <section className="portfolio-section" id="gallery-section" aria-label="Academy Gallery">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Visual Showcase</span>
            <h2 className="section-title">Academy Photo Gallery</h2>
            <p className="section-subtitle">
              Browse classroom sessions, testing labs, cultural events, and graduation celebrations at EDUZY academy.
            </p>
          </div>

          {/* Category Filter Pills (Exact requested categories) */}
          <div className="portfolio-filters-wrapper">
            <div className="portfolio-filters" role="tablist" aria-label="Filter gallery by category">
              {galleryCategories.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeTab === cat.id}
                  className={`portfolio-filter-btn ${activeTab === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Bento Grid */}
          <div className="gallery-grid">
            {filteredGallery.map((item) => (
              <div 
                key={item.id} 
                className="gallery-card"
                onClick={() => setSelectedImage(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedImage(item);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${item.title}`}
              >
                <div className="gallery-card__img-wrap">
                  <img 
                    src={item.image}
                    alt={item.alt}
                    className="gallery-card__img" 
                    loading="lazy"
                  />
                  <div className="gallery-card__overlay">
                    <span className="gallery-card__zoom-btn">View Photo</span>
                  </div>
                  <span className="gallery-card__category-badge">{item.categoryLabel}</span>
                </div>
                <div className="gallery-card__content">
                  <h3 className="gallery-card__title">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 3. STUDENT ACHIEVEMENTS ================= */}
      <section className="portfolio-section portfolio-section--alt" id="achievements-section" aria-label="Student Achievements">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Proven Track Record</span>
            <h2 className="section-title">Student Achievements</h2>
            <p className="section-subtitle">
              Thousands of healthcare professionals have achieved their dream scores on their first attempt.
            </p>
          </div>

          {/* Achievement Grid */}
          <div className="achievements-grid">
            {achievements.map((item, idx) => (
              <div key={idx} className="achievement-card">
                <div className="achievement-card__top">
                  <span className="achievement-card__badge">{item.badge}</span>
                  <span className="achievement-card__stat">{item.stat}</span>
                </div>
                <h3 className="achievement-card__title">{item.title}</h3>
                <p className="achievement-card__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= 4. CAMPUS & FACILITIES ================= */}
      <section className="portfolio-section" id="campus-section" aria-label="Campus Facilities">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Infrastructure</span>
            <h2 className="section-title">Modern Campus & Facilities</h2>
            <p className="section-subtitle">
              Designed from the ground up to offer the most conducive environment for language learning and test preparation.
            </p>
          </div>

          <div className="facilities-grid">
            {campusFacilities.map((fac, idx) => {
              const Icon = fac.icon;
              return (
                <div key={idx} className="facility-card">
                  <div className="facility-card__icon-box">
                    <Icon size={24} />
                  </div>
                  <h3 className="facility-card__title">{fac.title}</h3>
                  <p className="facility-card__desc">{fac.desc}</p>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-enroll-modal', { detail: { course: `Campus Visit: ${fac.title}` } }))}
                    className="facility-card__action-btn"
                  >
                    <span>Book Campus Visit</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 6. VIDEO REELS & TESTIMONIALS ================= */}
      <VideoTestimonials />

      {/* ================= 10. CALL TO ACTION ================= */}
      <CTA />

      {/* ================= LIGHTBOX MODAL ================= */}
      {selectedImage && (
        <div 
          className="gallery-lightbox-overlay" 
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="gallery-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="gallery-lightbox-close" 
              onClick={() => setSelectedImage(null)}
              aria-label="Close image modal"
            >
              <X size={20} />
            </button>
            <div className="gallery-lightbox-img-box">
              <img src={selectedImage.image} alt={selectedImage.alt} />
            </div>
            <div className="gallery-lightbox-info">
              <span className="gallery-lightbox-tag">{selectedImage.categoryLabel}</span>
              <h3 className="gallery-lightbox-title">{selectedImage.title}</h3>
              <div className="gallery-lightbox-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => {
                    const title = selectedImage.title;
                    setSelectedImage(null);
                    window.dispatchEvent(new CustomEvent('open-enroll-modal', { detail: { course: `Campus Visit: ${title}` } }));
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: '9999px', padding: '7px 18px', fontSize: '0.84rem' }}
                >
                  Book Campus Visit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
