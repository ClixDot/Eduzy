import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import './WhyChooseUs.css';

const features = [
  {
    num: '01',
    tag: 'Certified Mentors',
    title: 'Expert Faculty',
    desc: 'Learn directly from certified specialists in OET, IELTS, NCLEX-RN, and German with extensive exam coaching experience.',
  },
  {
    num: '02',
    tag: 'Tailored Plans',
    title: 'Personalized Learning',
    desc: 'Custom study roadmaps crafted around your target score and schedule, focusing precisely on your growth areas.',
  },
  {
    num: '03',
    tag: 'High Pass Rate',
    title: 'Proven Success',
    desc: 'Consistent high first-attempt clearance rates across language proficiency and international nursing licensure exams.',
  },
  {
    num: '04',
    tag: 'Online & Offline',
    title: 'Flexible Learning',
    desc: 'Join interactive live online sessions or attend classes at our Aluva, Kochi centre with flexible weekend and evening batches.',
  },
  {
    num: '05',
    tag: 'Latest Exam Banks',
    title: 'Comprehensive Materials',
    desc: 'Regularly updated question banks, timed mock tests, writing templates, and detailed study modules aligned with latest exam patterns.',
  },
  {
    num: '06',
    tag: '1-on-1 Feedback',
    title: 'Individual Attention',
    desc: 'Small batch sizes with dedicated daily speaking corrections, personalized letter reviews, and one-on-one doubt clearance.',
  },
];

export default function WhyChooseUs() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1. Header reveal
      gsap.from('.why__header > *', {
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

      // 2. Staggered 3D cards entrance
      gsap.from('.why-card', {
        y: 25,
        scale: 0.97,
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
    <section className="why section" id="why-choose-us" ref={sectionRef} aria-label="Why Choose EDUZY">
      <div className="container">
        {/* Header */}
        <div className="text-center why__header">
          <h2 className="section-title">
            Designed for Your Success.<br />
            <span className="highlight-orange">Built on Proven Results.</span>
          </h2>
          <p className="section-subtitle">
            Everything you need to prepare with clarity, practice with confidence, and achieve your global career goals.
          </p>
        </div>

        {/* Features Grid */}
        <div className="why__grid">
          {features.map((feat) => (
            <div className="why-card" key={feat.title}>
              {/* Top Row: Number on Left, Tag on Right */}
              <div className="why-card__top">
                <span className="why-card__num" aria-hidden="true">{feat.num}</span>
                <span className="why-card__tag">{feat.tag}</span>
              </div>

              {/* Title & Desc */}
              <h3 className="why-card__title">{feat.title}</h3>
              <p className="why-card__desc">{feat.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
