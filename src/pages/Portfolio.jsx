import React, { useState, useEffect } from 'react';
import { 
  GraduationCap, 
  Calendar, 
  MapPin, 
  Users, 
  BookOpen, 
  Monitor, 
  Building, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Globe,
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

// Image Assets
import classroomImg from '../assets/about_classroom.jpg';
import labImg from '../assets/campus_lab.jpg';
import convocationImg from '../assets/event_graduation.jpg';
import workshopImg from '../assets/workshop_seminar.jpg';
import libraryImg from '../assets/campus_library.jpg';
import healthcareStudentImg from '../assets/healthcare_student.jpg';
import studyGroupImg from '../assets/hero_card_students.jpg';
import heroStudentImg from '../assets/hero_student.jpg';
import languageLearnImg from '../assets/language_learning.jpg';

// Gallery Categories requested by user
const galleryCategories = [
  { id: 'all', label: 'All' },
  { id: 'classes', label: 'Classes' },
  { id: 'events', label: 'Events' },
  { id: 'workshops', label: 'Workshops' },
  { id: 'activities', label: 'Student Activities' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'campus', label: 'Campus' },
];

// Rich Gallery Items
const galleryItems = [
  {
    id: 1,
    title: 'CBT Simulation Lab',
    category: 'campus',
    categoryLabel: 'Campus & Facilities',
    image: labImg,
    location: 'Main Lab A, Aluva',
    desc: 'High-tech workstations with noise-canceling headsets replicating exact CD-IELTS and OET Pearson VUE test environments.',
  },
  {
    id: 2,
    title: 'Annual Convocation & Felicitation',
    category: 'events',
    categoryLabel: 'Events',
    image: convocationImg,
    location: 'Grand Auditorium',
    desc: 'Honoring over 100+ healthcare nurses who cleared OET & German exams and secured NHS UK and European hospital offers.',
  },
  {
    id: 3,
    title: 'Clinical Roleplay Workshop',
    category: 'workshops',
    categoryLabel: 'Workshops',
    image: workshopImg,
    location: 'Interactive Hall 2',
    desc: 'Hands-on clinical roleplay workshop simulating patient-nurse communication, clinical history taking, and OET speaking criteria.',
  },
  {
    id: 4,
    title: 'OET & IELTS Classroom',
    category: 'classes',
    categoryLabel: 'Classes',
    image: classroomImg,
    location: 'Lecture Hall 1',
    desc: 'Daily expert mentor-led sessions focusing on intensive grammar drills, case-note reading techniques, and essay writing.',
  },
  {
    id: 5,
    title: 'Reference Library & Lounge',
    category: 'campus',
    categoryLabel: 'Campus',
    image: libraryImg,
    location: 'Library Wing',
    desc: 'A serene study haven stocked with Cambridge test packs, British Council materials, medical encyclopedias, and Goethe guides.',
  },
  {
    id: 6,
    title: 'German Language Workshop',
    category: 'workshops',
    categoryLabel: 'Workshops',
    image: languageLearnImg,
    location: 'Language Lab',
    desc: 'Intensive vocabulary, German hospital dialogue drills, and listening exercises for nurses preparing for migration to Germany.',
  },
  {
    id: 7,
    title: 'Speaking Circles & Peer Drills',
    category: 'activities',
    categoryLabel: 'Student Activities',
    image: studyGroupImg,
    location: 'Student Activity Arena',
    desc: 'Structured peer group speaking sessions where candidates practice speaking cues, clinical roleplays, and build real confidence.',
  },
  {
    id: 8,
    title: '1-on-1 Mentor Feedback',
    category: 'classes',
    categoryLabel: 'Classes',
    image: healthcareStudentImg,
    location: 'Mentorship Cabins',
    desc: 'Personalized corrections with mentor Rose, dissecting letter structure, medical terminology, and grammatical accuracy.',
  },
  {
    id: 9,
    title: 'Top Achievers Felicitation',
    category: 'achievements',
    categoryLabel: 'Achievements',
    image: heroStudentImg,
    location: 'EDUZY Campus',
    desc: 'Celebrating outstanding first-attempt record scores and presenting official certificates and international migration packages.',
  },
];

// Student Achievements Data
const achievements = [
  {
    title: 'OET Grade B & A Achievers',
    stat: '45+ Monthly',
    badge: 'OET Excellence',
    desc: 'Consistent monthly qualifiers securing scores needed for UK NMC & Ireland nurse registrations.',
  },
  {
    title: 'IELTS Academic 7.5 - 8.5 Scorers',
    stat: '1,800+ Qualified',
    badge: 'IELTS Mastery',
    desc: 'High-band achievements across all subsets for university admissions and global healthcare visas.',
  },
  {
    title: 'Goethe German B1 & B2 Certified',
    stat: '650+ Nurses',
    badge: 'German Pathway',
    desc: 'Language clearance for healthcare professionals qualifying for direct hospital placement across Germany.',
  },
  {
    title: 'NCLEX-RN USA Licensure Passers',
    stat: '98.2% Pass Rate',
    badge: 'USA & Australia',
    desc: 'Candidates passing the Next Generation NCLEX (NGN) exam on their very first attempt.',
  }
];

// Events and Programs Data
const academyEvents = [
  {
    tag: 'Recruitment Drive',
    title: 'UK NHS Hospital Direct Interview Days',
    date: 'Quarterly Event',
    desc: 'Delegations from top UK NHS Trusts (Imperial College, Manchester Royal Infirmary) visit EDUZY for direct nurse hiring with immediate job offers.',
    icon: Building
  },
  {
    tag: 'Clinical Workshop',
    title: 'Mastering OET Speaking & Roleplay Clinics',
    date: 'Every Saturday',
    desc: 'Intensive weekend bootcamps led by senior healthcare trainers simulating complex clinical situations with real feedback.',
    icon: Users
  },
  {
    tag: 'Career Seminar',
    title: 'International Licensing & Visa Orientation',
    date: 'Bi-Monthly',
    desc: 'Comprehensive roadmaps covering NMC / NMBI verification, credential evaluation, OSCE preparation, and family visa protocols.',
    icon: GraduationCap
  },
  {
    tag: 'Cultural Program',
    title: 'German Healthcare Immersion & Language Exchange',
    date: 'Monthly Feature',
    desc: 'Interactive live sessions with native German healthcare coordinators to acclimatize candidates with German hospital culture.',
    icon: Globe
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
            <a href="#events-section" className="quick-link-pill" onClick={(e) => scrollToSection(e, 'events-section')}>Events & Workshops</a>
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
              Browse classroom sessions, testing labs, cultural events, and graduation celebrations at our Aluva academy.
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
                    alt={item.title} 
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
            <h2 className="section-title">Student Achievements & Exam Results</h2>
            <p className="section-subtitle">
              Thousands of healthcare professionals have achieved their dream scores on their first attempt.
            </p>
          </div>

          {/* Achievement Stats Banner */}
          <div className="achievement-stats-row">
            <div className="achieve-stat-box">
              <span className="achieve-stat-num">96.4%</span>
              <span className="achieve-stat-label">First-Attempt Pass Rate</span>
            </div>
            <div className="achieve-stat-box">
              <span className="achieve-stat-num">12,500+</span>
              <span className="achieve-stat-label">Global Nurse Placements</span>
            </div>
            <div className="achieve-stat-box">
              <span className="achieve-stat-num">25+</span>
              <span className="achieve-stat-label">State & National Awards</span>
            </div>
            <div className="achieve-stat-box">
              <span className="achieve-stat-num">40+</span>
              <span className="achieve-stat-label">Certified Language Trainers</span>
            </div>
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

      {/* ================= 4. EVENTS & WORKSHOPS ================= */}
      <section className="portfolio-section" id="events-section" aria-label="Events and Programs">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">Career Acceleration</span>
            <h2 className="section-title">Events, Seminars & Workshops</h2>
            <p className="section-subtitle">
              Regular interactive masterclasses, mock code roleplays, and direct hospital recruitment drives.
            </p>
          </div>

          <div className="events-grid">
            {academyEvents.map((evt, idx) => {
              const Icon = evt.icon;
              return (
                <div key={idx} className="event-card">
                  <div className="event-card__icon-wrap">
                    <Icon size={24} />
                  </div>
                  <div className="event-card__body">
                    <div className="event-card__meta">
                      <span className="event-card__tag">{evt.tag}</span>
                      <span className="event-card__date">
                        <Calendar size={13} /> {evt.date}
                      </span>
                    </div>
                    <h3 className="event-card__title">{evt.title}</h3>
                    <p className="event-card__desc">{evt.desc}</p>
                    <button
                      type="button"
                      onClick={() => window.dispatchEvent(new CustomEvent('open-enroll-modal', { detail: { course: evt.title } }))}
                      className="event-card__action-btn"
                    >
                      <span>Join Workshop</span>
                      <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ================= 5. CAMPUS & FACILITIES ================= */}
      <section className="portfolio-section portfolio-section--alt" id="campus-section" aria-label="Campus Facilities">
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
              <img src={selectedImage.image} alt={selectedImage.title} />
            </div>
            <div className="gallery-lightbox-info">
              <span className="gallery-lightbox-tag">{selectedImage.categoryLabel}</span>
              <h3 className="gallery-lightbox-title">{selectedImage.title}</h3>
              <p className="gallery-lightbox-desc">{selectedImage.desc}</p>
              <div className="gallery-lightbox-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                <span className="gallery-lightbox-loc">
                  <MapPin size={14} /> {selectedImage.location}
                </span>
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
