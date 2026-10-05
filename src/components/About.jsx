import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { GraduationCap, ClipboardCheck, Trophy, CalendarClock, Award, ArrowRight, CheckCircle2, Star } from 'lucide-react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import aboutImg from '../assets/about_classroom.jpg';
import './About.css';

const features = [
  {
    icon: GraduationCap,
    title: 'Personal Mentoring',
    desc: '1-on-1 guidance tailored to your learning pace.',
  },
  {
    icon: ClipboardCheck,
    title: 'Mock Exams',
    desc: 'Regular tests with real exam conditions.',
  },
  {
    icon: Trophy,
    title: 'Proven Results',
    desc: 'Focused prep for OET, IELTS, German & NCLEX.',
  },
  {
    icon: CalendarClock,
    title: 'Flexible Batches',
    desc: 'Online & offline classes to fit your routine.',
  },
];

export default function About() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1. Left image composition slide & zoom
      gsap.from('.about__image-col', {
        x: -25,
        duration: 0.7,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });

      // 2. Right column content stagger
      gsap.from('.about__content > *', {
        y: 20,
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

      // 3. Feature cards stagger (NEVER animate opacity - always 100% visible)
      gsap.from('.about__feature-card', {
        y: 15,
        stagger: 0.05,
        duration: 0.5,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });

      // 4. Floating badge pop
      gsap.from('.about__floating-badge', {
        scale: 0.85,
        duration: 0.5,
        ease: 'back.out(1.5)',
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
    <section className="about section" id="about" ref={sectionRef} aria-label="About EDUZY Academy">
      {/* Subtle Background Glows */}
      <div className="about__bg-glow about__bg-glow--top" aria-hidden="true" />
      <div className="about__bg-glow about__bg-glow--bottom" aria-hidden="true" />

      <div className="container about__inner">
        {/* ================= LEFT: MODERN VISUAL COMPOSITION ================= */}
        <div className="about__image-col slide-left">
          <div className="about__image-frame">
            <div className="about__image-backdrop" aria-hidden="true" />
            
            <div className="about__image-wrapper">
              <img
                src={aboutImg}
                alt="EDUZY modern classroom training session in Aluva"
                className="about__main-img"
                loading="lazy"
                width="640"
                height="480"
              />
              <div className="about__img-overlay" aria-hidden="true" />
            </div>

            {/* Floating Top Rating Card */}
            <div className="about__floating-badge about__floating-badge--top">
              <div className="about__rating-stars">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="about__star-icon" size={14} fill="#F59E0B" color="#F59E0B" />
                ))}
              </div>
              <div className="about__badge-content">
                <span className="about__badge-main">4.9 / 5 Rating</span>
                <span className="about__badge-sub">2,500+ Qualified Aspirants</span>
              </div>
            </div>

            {/* Floating Bottom Milestone Card */}
            <div className="about__floating-badge about__floating-badge--bottom">
              <div className="about__badge-icon-box">
                <Award size={20} className="about__badge-svg" />
              </div>
              <div className="about__badge-content">
                <div className="about__badge-status">
                  <span className="about__pulse-dot" aria-hidden="true" />
                  <span className="about__badge-live">Aluva, Kochi</span>
                </div>
                <span className="about__badge-main">Premier Training Institute</span>
              </div>
            </div>
          </div>
        </div>

        {/* ================= RIGHT: CONTENT & FEATURE CARDS ================= */}
        <div className="about__content slide-right">
          {/* Heading */}
          <h2 className="about__heading">
            Learn With Experts.<br />
            <span className="about__heading--highlight">Grow With Confidence.</span>
          </h2>

          {/* Concise Lead Text */}
          <p className="about__lead">
            Guided by <strong>Rose</strong>, EDUZY helps healthcare professionals and students achieve their dream scores in OET, IELTS, German, and NCLEX-RN.
          </p>

          {/* Feature Bento Grid */}
          <div className="about__features-grid">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="about__feature-card">
                  <div className="about__feature-icon-wrap">
                    <Icon size={20} className="about__feature-icon" />
                  </div>
                  <div className="about__feature-info">
                    <h3 className="about__feature-title">{item.title}</h3>
                    <p className="about__feature-desc">{item.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Action Row */}
          <div className="about__action-row">
            <Link to="/portfolio" className="about__primary-btn" id="about-portfolio-btn">
              <span>View Success Portfolio</span>
              <ArrowRight size={18} className="about__btn-arrow" />
            </Link>

            <button 
              type="button" 
              onClick={() => window.dispatchEvent(new CustomEvent('open-enroll-modal', { detail: { course: 'Free Counseling Session' } }))} 
              className="about__secondary-link" 
              id="about-counsel-btn"
            >
              <CheckCircle2 size={18} className="about__check-accent" />
              <span>Book Free Counseling</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
