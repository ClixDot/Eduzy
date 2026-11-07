'use client';
import { useEffect, useRef } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { gsap } from '../utils/gsapSetup';
import { useSite } from '@/cms/site/ContentProvider';
import { CmsIcon } from '@/cms/site/helpers';
import './About.css';

export default function About() {
  const sectionRef = useRef(null);
  const { whyChoose: w } = useSite();
  const pillars = w.pillars || [];

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1. Header fade up
      gsap.from('.about-v2__header > *', {
        y: 28,
        opacity: 0,
        stagger: 0.1,
        duration: 0.7,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });

      // 2. Feature cards
      gsap.from('.about-v2__pillar-card', {
        y: 35,
        opacity: 0,
        stagger: 0.12,
        duration: 0.75,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: '.about-v2__pillars-grid',
          start: 'top 85%',
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const openCounseling = () => {
    window.dispatchEvent(
      new CustomEvent('open-enroll-modal', {
        detail: { course: 'Why Choose EDUZY - Career Counseling' },
      })
    );
  };

  return (
    <section
      className="about-v2 section"
      id="about"
      ref={sectionRef}
      aria-label="Why Choose EDUZY - From Campus to Career"
    >
      <div className="container about-v2__container">
        {/* =========================================================
            1. SECTION HEADER (Primary Requested Content)
            ========================================================= */}
        <div className="about-v2__header">
          <span className="about-v2__badge">
            <Sparkles size={16} /> {w.badge}
          </span>

          <h2 className="about-v2__title">
            {w.titleStart}{' '}
            <span className="about-v2__title-highlight">{w.titleHighlight}</span>
          </h2>

          <div className="about-v2__lead-wrap">
            <p className="about-v2__lead" dangerouslySetInnerHTML={{ __html: w.lead }} />
            {(w.paragraphs || []).map((para: string, i: number) => (
              <p className="about-v2__lead-sub" key={i}>{para}</p>
            ))}
          </div>
        </div>

        {/* =========================================================
            2. EXPANDED CONTENT PILLARS (Detailed Features)
            ========================================================= */}
        <div className="about-v2__pillars-grid">
          {pillars.map((pillar: any, index: number) => {
            return (
              <article className="about-v2__pillar-card" key={index}>
                <div>
                  <div className="about-v2__pillar-top">
                    <div className="about-v2__pillar-icon">
                      <CmsIcon name={pillar.icon} size={26} strokeWidth={2.2} />
                    </div>
                    <span className="about-v2__pillar-tag">{pillar.tag}</span>
                  </div>

                  <h3 className="about-v2__pillar-title">{pillar.title}</h3>
                  <p className="about-v2__pillar-desc">{pillar.desc}</p>
                </div>

                <ul className="about-v2__pillar-features">
                  {(pillar.highlights || []).map((item: string, hIdx: number) => (
                    <li className="about-v2__pillar-feature-item" key={hIdx}>
                      <CheckCircle2 size={16} strokeWidth={2.6} className="about-v2__check-icon" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            );
          })}
        </div>

        {/* =========================================================
            3. BOTTOM CTA CALLOUT BANNER
            ========================================================= */}

        {/* =========================================================
            5. BOTTOM CTA CALLOUT BANNER
            ========================================================= */}
        {w.showCta && (
        <div className="about-v2__cta-banner">
          <div className="about-v2__cta-text">
            <h3 className="about-v2__cta-heading">
              {w.ctaHeading}
            </h3>
            <p className="about-v2__cta-sub">
              {w.ctaText}
            </p>
          </div>

          <div className="about-v2__cta-actions">
            {w.ctaPrimary?.label && (
            <a href={w.ctaPrimary.url || '/courses'} className="about-v2__btn-white">
              <span>{w.ctaPrimary.label}</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </a>
            )}
            {w.ctaSecondaryLabel && (
            <button
              type="button"
              onClick={openCounseling}
              className="about-v2__btn-outline"
            >
              <span>{w.ctaSecondaryLabel}</span>
            </button>
            )}
          </div>
        </div>
        )}
      </div>
    </section>
  );
}
