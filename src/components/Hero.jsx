import { useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FlowButton } from '@/components/ui/flow-button';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import roseImg from '../assets/rose.png';
import './Hero.css';

export default function Hero() {
  const heroRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1. Initial Hero Entrance Animation
      const tl = gsap.timeline({ defaults: { ease: 'power3.out', clearProps: 'all' } });

      tl.from('.hero-ref__heading', { y: 25, duration: 0.8 })
        .from('.hero-ref__desc', { y: 15, duration: 0.7 }, '-=0.5')
        .from('.hero-ref__actions', { y: 15, duration: 0.6 }, '-=0.4')
        .from('.hero-ref__portrait-wrapper', { scale: 0.95, duration: 0.9 }, '-=0.8')
        .from('.hero-ref__circle-svg', { rotation: -90, duration: 1.1 }, '-=0.9')
        .from('.hero-ref__mentor-card', { y: 25, scale: 0.92, duration: 0.7, ease: 'back.out(1.5)' }, '-=0.5');

      // 2. GSAP ScrollTrigger Parallax Animations
      // Background photo subtle scrub
      gsap.to('.hero-ref__bg-photo', {
        yPercent: 20,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: true,
        },
      });

      // Left content slight depth lift on scroll without fading
      gsap.to('.hero-ref__content', {
        y: -30,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });

      // Rotating curved text continuous scrub with scroll
      gsap.to('.hero-ref__circle-svg', {
        rotation: 360,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 1.2,
        },
      });

      // Floating cards parallax at different speeds
      gsap.to('.hero-ref__mentor-card', {
        y: -25,
        ease: 'none',
        scrollTrigger: {
          trigger: el,
          start: 'top top',
          end: 'bottom top',
          scrub: 1,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hero-ref" ref={heroRef} aria-label="EDUZY Hero">
      {/* Cinematic Study Background Photo & Light Gradient Overlay (From Image 1) */}
      <div className="hero-ref__bg-photo" aria-hidden="true" />
      <div className="hero-ref__bg-overlay" aria-hidden="true" />

      <div className="container hero-ref__container">
        <div className="hero-ref__grid">
          {/* ================= LEFT CONTENT ================= */}
          <div className="hero-ref__content">
            {/* Main Heading with Orange Highlights */}
            <h1 className="hero-animate hero-ref__heading">
              Achieve Your <span className="highlight-orange">Dream Score.</span>
              <br />
              Build Your <span className="highlight-orange">Global Career.</span>
            </h1>

            {/* Supporting Description */}
            <p className="hero-animate hero-ref__desc">
              Personalized coaching by <strong>Rose</strong> for OET, IELTS, German, and NCLEX-RN to help you achieve your dream score.
            </p>

            {/* Action Buttons */}
            <div className="hero-animate hero-ref__actions">
              <FlowButton 
                text="Explore Courses" 
                to="/courses"
              />
              <button 
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-enroll-modal'))}
                className="btn-hero-primary" 
                id="hero-enroll-btn"
              >
                <span>Enroll Now</span>
                <svg className="btn-arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>

          {/* ================= RIGHT VISUAL COMPOSITION (From Image 1) ================= */}
          <div className="hero-ref__visual hero-animate">
            <div className="hero-ref__stage">
              {/* 1. Large Circular Rotating Text Ring behind student */}
              <div className="hero-ref__circle-text-wrap" aria-hidden="true">
                <svg viewBox="0 0 300 300" className="hero-ref__circle-svg">
                  <defs>
                    <path
                      id="circleTextPath"
                      d="M 150, 150 m -115, 0 a 115,115 0 1,1 230,0 a 115,115 0 1,1 -230,0"
                    />
                  </defs>
                  <text className="hero-ref__curved-text">
                    <textPath href="#circleTextPath" startOffset="0%">
                      • EDUZY GLOBAL ACADEMY • MENTORED BY ROSE • 10+ YEARS EXCELLENCE •
                    </textPath>
                  </text>
                </svg>
              </div>

              {/* 2. Abstract Organic Waves & Blobs (Orange & Purple from Reference Image 1) */}
              <div className="hero-ref__purple-blob" aria-hidden="true" />
              <div className="hero-ref__orange-wave" aria-hidden="true" />
              <div className="hero-ref__peach-accent" aria-hidden="true" />

              {/* 3. Mentor Portrait */}
              <div className="hero-ref__portrait-wrapper">
                <img
                  src={roseImg}
                  alt="Rose, Founder & Lead Mentor of EDUZY"
                  className="hero-ref__portrait-img"
                  width="480"
                  height="640"
                  loading="eager"
                />
              </div>


              {/* 5. Floating Mentor Card for Rose & EDUZY */}
              <div className="hero-ref__card hero-ref__mentor-card" aria-label="Lead Mentor">
                <div className="hero-ref__mentor-avatar-box">
                  <span className="hero-ref__mentor-star-icon">★</span>
                </div>
                <div className="hero-ref__mentor-details">
                  <span className="hero-ref__mentor-name">Rose</span>
                  <span className="hero-ref__mentor-role">Founder &amp; Chief Mentor &bull; EDUZY</span>
                  <span className="hero-ref__mentor-exp">10+ Yrs Mentorship &bull; 12k+ Placed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
