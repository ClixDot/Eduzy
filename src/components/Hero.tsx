'use client';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlowButton } from '@/components/ui/flow-button';
import { gsap } from '../utils/gsapSetup';
import { useSite } from '@/cms/site/ContentProvider';
import { spaced } from '@/cms/site/helpers';
import './Hero.css';

export default function Hero() {
  const heroRef = useRef(null);
  const navigate = useNavigate();
  const { hero } = useSite();
  const secondaryUrl = hero.secondaryButton?.url;

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
        .from('.hero-ref__circle-text-wrap', { scale: 0.9, opacity: 0, duration: 1.1 }, '-=0.9')
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
      gsap.to('.hero-ref__circle-text-wrap', {
        rotation: 120,
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
      <div
        className="hero-ref__bg-photo"
        aria-hidden="true"
        style={hero.backgroundImage || hero.backgroundPosition ? {
          ...(hero.backgroundImage ? { backgroundImage: `url("${encodeURI(decodeURI(hero.backgroundImage))}")` } : {}),
          ...(hero.backgroundPosition ? { backgroundPosition: hero.backgroundPosition } : {}),
        } : undefined}
      />
      <div className="hero-ref__bg-overlay" aria-hidden="true" />

      <div className="container hero-ref__container">
        <div className="hero-ref__grid">
          {/* ================= LEFT CONTENT ================= */}
          <div className="hero-ref__content">
            {/* Main Heading with Orange Highlights */}
            <h1 className="hero-animate hero-ref__heading">
              {spaced(hero.line1Start)}<span className="highlight-orange">{hero.line1Highlight}</span>
              <br />
              {spaced(hero.line2Start)}<span className="highlight-orange">{hero.line2Highlight}</span>
            </h1>

            {/* Supporting Description */}
            <p className="hero-animate hero-ref__desc" dangerouslySetInnerHTML={{ __html: hero.description }} />

            {/* Action Buttons */}
            <div className="hero-animate hero-ref__actions">
              {hero.primaryButton?.label && (
                <FlowButton 
                  text={hero.primaryButton.label} 
                  to={hero.primaryButton.url || '/courses'}
                />
              )}
              {hero.secondaryButton?.label && (
              <button 
                type="button"
                onClick={() => secondaryUrl ? (/^https?:/i.test(secondaryUrl) ? window.open(secondaryUrl, '_blank', 'noopener,noreferrer') : navigate(secondaryUrl)) : window.dispatchEvent(new CustomEvent('open-enroll-modal'))}
                className="btn-hero-primary" 
                id="hero-enroll-btn"
              >
                <span>{hero.secondaryButton.label}</span>
                <svg className="btn-arrow" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
              )}
            </div>
          </div>

          {/* ================= RIGHT VISUAL COMPOSITION (From Image 1) ================= */}
          <div className="hero-ref__visual hero-animate">
            <div className="hero-ref__stage">
              {/* 1. Large Circular Rotating Text Ring behind portrait */}
              <div className="hero-ref__circle-text-wrap" aria-hidden="true">
                <svg viewBox="0 0 540 540" className="hero-ref__circle-svg">
                  <defs>
                    <path
                      id="circleTextPath"
                      d="M 270, 270 m -248, 0 a 248,248 0 1,1 496,0 a 248,248 0 1,1 -496,0"
                    />
                  </defs>
                  <text className="hero-ref__curved-text">
                    <textPath href="#circleTextPath" startOffset="0%">
                      {hero.circleText}
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
                <picture>
                  {hero.mobileImage && <source media="(max-width: 640px)" srcSet={encodeURI(decodeURI(hero.mobileImage))} />}
                  <img
                    src={hero.portraitImage}
                    alt={hero.portraitAlt}
                    className="hero-ref__portrait-img"
                    style={hero.portraitFit === 'cover'
                      ? { left: 0, top: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: hero.portraitPosition || 'center top' }
                      : undefined}
                    width="2309"
                    height="3464"
                    loading="eager"
                  />
                </picture>
              </div>


              {/* 5. Floating Mentor Card for Rose Mary Johnson */}
              {hero.showMentorCard && (
              <div className="hero-ref__card hero-ref__mentor-card" aria-label="Lead Mentor">
                <div className="hero-ref__mentor-avatar-box">
                  <span className="hero-ref__mentor-star-icon">★</span>
                </div>
                <div className="hero-ref__mentor-details">
                  <span className="hero-ref__mentor-name">{hero.mentorName}</span>
                  <span className="hero-ref__mentor-role">{hero.mentorRole}</span>
                </div>
              </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
