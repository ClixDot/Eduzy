import { useEffect, useRef } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { gsap } from '../utils/gsapSetup';
import aboutClassroomImg from '../assets/about_classroom.jpg';
import missionStudentImg from '../assets/mission_student.jpg';
import impactNurseImg from '../assets/impact_nurse.jpg';
import './About.css';

export default function About() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // Reveal 3 cards with gentle stagger
      gsap.from('.about-editorial__card', {
        y: 35,
        opacity: 0,
        stagger: 0.12,
        duration: 0.75,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 82%',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const handleCardClick = (target) => {
    if (target === 'counseling') {
      window.dispatchEvent(
        new CustomEvent('open-enroll-modal', {
          detail: { course: 'Why Choose EDUZY - Expert Counseling' },
        })
      );
    } else if (target === 'portfolio') {
      window.location.href = '/portfolio';
    } else if (target === 'courses') {
      window.location.href = '/courses';
    }
  };

  return (
    <section
      className="about-editorial section"
      id="about"
      ref={sectionRef}
      aria-label="Why Choose EDUZY"
    >
      <div className="container about-editorial__container">
        <div className="about-editorial__grid">
          {/* =========================================================
              CARD 1: WHY CHOOSE EDUZY (Light Card)
              ========================================================= */}
          <article
            className="about-editorial__card about-editorial__card--light"
            onClick={() => handleCardClick('courses')}
            role="region"
            aria-label="Why Choose EDUZY details"
          >
            <div className="about-editorial__card-header">
              <span className="about-editorial__pill">WHY CHOOSE EDUZY</span>
              <button
                type="button"
                className="about-editorial__arrow-btn about-editorial__arrow-btn--orange"
                aria-label="Explore Why Choose EDUZY"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick('courses');
                }}
              >
                <ArrowUpRight size={20} strokeWidth={2.4} />
              </button>
            </div>

            <div className="about-editorial__card-text">
              <h2 className="about-editorial__title">
                Expert Guidance for a{' '}
                <span className="about-editorial__title--highlight">
                  Brighter Global Future
                </span>
              </h2>
              <p className="about-editorial__desc">
                We help you build the skills, confidence, and opportunities to
                achieve your dreams abroad.
              </p>
            </div>

            <div className="about-editorial__image-box">
              <img
                src={aboutClassroomImg}
                alt="EDUZY professional instructor teaching students in a modern interactive classroom"
                className="about-editorial__img"
                loading="lazy"
                width="640"
                height="420"
              />
            </div>
          </article>

          {/* =========================================================
              CARD 2: OUR MISSION (Dominant Centerpiece Orange Card)
              ========================================================= */}
          <article
            className="about-editorial__card about-editorial__card--orange"
            onClick={() => handleCardClick('counseling')}
            role="region"
            aria-label="Our Mission details"
          >
            {/* Visual Media Area with Abstract Geometric Cutout Overlay */}
            <div className="about-editorial__mission-media">
              <img
                src={missionStudentImg}
                alt="EDUZY student smiling and writing notes in an interactive lecture"
                className="about-editorial__mission-img"
                loading="lazy"
                width="640"
                height="460"
              />

              {/* Exact Cutout Shapes matching Reference Design */}
              <svg
                className="about-editorial__cutout-overlay"
                viewBox="0 0 1000 700"
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                {/* 1. Top blob hanging down */}
                <path
                  d="M 60,0 C 70,45 95,72 120,72 C 145,72 170,45 180,0 Z"
                  fill="#FF3D16"
                />

                {/* 2. Left rounded tab */}
                <path
                  d="M 0,150 C 48,150 78,180 78,220 C 78,260 48,290 0,290 Z"
                  fill="#FF3D16"
                />

                {/* 3. Bottom-Left corner wedge */}
                <path
                  d="M 0,490 C 65,490 140,540 210,590 L 210,700 L 0,700 Z"
                  fill="#FF3D16"
                />

                {/* 4. Center-Right 4-Prong Asterisk / Starburst + Right/Bottom Fill */}
                <path
                  d="M 640,0 
                     L 750,0 
                     C 725,85 745,125 770,140 
                     C 820,120 920,60 1000,25 
                     L 1000,120 
                     C 885,160 810,205 745,245 
                     C 805,275 905,310 1000,330 
                     L 1000,700 
                     L 540,700 
                     C 540,630 525,580 495,540 
                     C 460,495 405,460 365,435 
                     C 345,422 348,405 368,392 
                     C 420,360 490,310 525,260 
                     C 555,215 565,115 640,0 Z"
                  fill="#FF3D16"
                />

                {/* 5. Bottom notch base fill leaving the notebook framed cleanly */}
                <path
                  d="M 0,660 
                     L 210,660 
                     L 210,700 
                     L 0,700 Z"
                  fill="#FF3D16"
                />
              </svg>
            </div>

            {/* Header row below image */}
            <div className="about-editorial__card-header about-editorial__card-header--mission">
              <span className="about-editorial__pill about-editorial__pill--cream">
                OUR MISSION
              </span>
              <button
                type="button"
                className="about-editorial__arrow-btn about-editorial__arrow-btn--dark"
                aria-label="Learn more about our mission"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick('counseling');
                }}
              >
                <ArrowUpRight size={20} strokeWidth={2.4} />
              </button>
            </div>

            {/* Typography */}
            <div className="about-editorial__card-text about-editorial__card-text--mission">
              <h2 className="about-editorial__title about-editorial__title--white">
                Empowering Healthcare Professionals and Students Worldwide
              </h2>
              <p className="about-editorial__desc about-editorial__desc--white">
                With quality training, personalized support, and proven
                strategies, EDUZY turns your goals into global opportunities.
              </p>
            </div>
          </article>

          {/* =========================================================
              CARD 3: OUR IMPACT (Light Card)
              ========================================================= */}
          <article
            className="about-editorial__card about-editorial__card--light"
            onClick={() => handleCardClick('portfolio')}
            role="region"
            aria-label="Our Impact details"
          >
            <div className="about-editorial__card-header">
              <span className="about-editorial__pill">OUR IMPACT</span>
              <button
                type="button"
                className="about-editorial__arrow-btn about-editorial__arrow-btn--orange"
                aria-label="Explore our impact and success stories"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCardClick('portfolio');
                }}
              >
                <ArrowUpRight size={20} strokeWidth={2.4} />
              </button>
            </div>

            <div className="about-editorial__card-text">
              <h2 className="about-editorial__title">
                <span className="about-editorial__title--highlight">
                  2,500+ Learners
                </span>{' '}
                Building Global Careers
              </h2>
              <p className="about-editorial__desc">
                From OET to IELTS, German, and NCLEX-RN, our learners are
                achieving their dreams in top countries worldwide.
              </p>
            </div>

            <div className="about-editorial__image-box">
              <img
                src={impactNurseImg}
                alt="Healthcare nurse in blue scrub standing by an illuminated world map holding tablet"
                className="about-editorial__img"
                loading="lazy"
                width="640"
                height="420"
              />
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
