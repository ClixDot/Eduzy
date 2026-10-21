import { useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Briefcase, 
  Target, 
  Users, 
  Award, 
  CheckCircle2, 
  ArrowRight 
} from 'lucide-react';
import { gsap } from '../utils/gsapSetup';
import './About.css';

const pillars = [
  {
    icon: Briefcase,
    tag: 'Industry-Oriented',
    title: 'Industry-Oriented Curriculum & Training',
    desc: 'Our programs are engineered directly around modern market demands. Students learn on the exact tools, commercial workflows, and corporate standards required in Logistics, Corporate Accounting, Digital Marketing, Designing, Hospital Administration, and Aviation.',
    highlights: [
      'Hands-on mastery of SAP, TallyPrime, Advanced Excel, Meta Ads & Figma',
      'Curriculum continually reviewed and updated with top enterprise partners',
      'Dual government-approved accreditations (NSDC, NCVET & University tie-ups)',
    ],
  },
  {
    icon: Target,
    tag: 'Practical Learning',
    title: 'Hands-On, Practical Learning Beyond Theory',
    desc: 'We replace passive textbook lectures with experiential workshop learning. Students actively solve business case studies, operate software environments, and execute live client assignments to build true on-the-job competency.',
    highlights: [
      '70% practical computer lab exercises and 30% conceptual foundations',
      'Capstone projects & verified portfolio building before graduation',
      'Interactive classroom sessions guided by seasoned industry practitioners',
    ],
  },
  {
    icon: Users,
    tag: 'Career Development',
    title: 'Comprehensive Career-Focused Development',
    desc: 'Technical proficiency is matched with professional presentation. Our dedicated career mentoring cell prepares each student through personalized 1-on-1 counseling, soft skills development, and workplace readiness training.',
    highlights: [
      '1-on-1 resume optimization, portfolio review & LinkedIn profile branding',
      'Intensive mock HR interviews, technical tests & group discussions',
      'Corporate etiquette, English speaking confidence & workplace ethics',
    ],
  },
  {
    icon: Award,
    tag: 'Verified Outcomes',
    title: 'Proven Placement Network & Track Record',
    desc: 'Eduzy’s 15+ years of trust and 97+ corporate hiring partnerships create direct placement avenues into top multinational companies, corporate enterprises, and high-growth startups across India and abroad.',
    highlights: [
      '40,000+ alumni working across leading corporate and healthcare sectors',
      'On-campus recruitment drives & priority referral interview rounds',
      'Dedicated placement coordinator support until successful job onboarding',
    ],
  },
];

export default function About() {
  const sectionRef = useRef(null);

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
            <Sparkles size={16} /> Why Choose Eduzy?
          </span>

          <h2 className="about-v2__title">
            From Campus to{' '}
            <span className="about-v2__title-highlight">Career</span>
          </h2>

          <p className="about-v2__lead">
            Eduzy bridges the gap between education and employment through industry-oriented
            training, practical learning, and career-focused development. With{' '}
            <strong>15+ years of experience</strong>, <strong>40,000+ students placed</strong>,{' '}
            <strong>97+ placement partners</strong>, and <strong>25+ awards won</strong>, we are
            committed to empowering students with the skills and confidence needed to succeed
            in a competitive professional environment.
          </p>
        </div>

        {/* =========================================================
            2. EXPANDED CONTENT PILLARS (Detailed Features)
            ========================================================= */}
        <div className="about-v2__pillars-grid">
          {pillars.map((pillar, index) => {
            const PillarIcon = pillar.icon;
            return (
              <article className="about-v2__pillar-card" key={index}>
                <div>
                  <div className="about-v2__pillar-top">
                    <div className="about-v2__pillar-icon">
                      <PillarIcon size={26} strokeWidth={2.2} />
                    </div>
                    <span className="about-v2__pillar-tag">{pillar.tag}</span>
                  </div>

                  <h3 className="about-v2__pillar-title">{pillar.title}</h3>
                  <p className="about-v2__pillar-desc">{pillar.desc}</p>
                </div>

                <ul className="about-v2__pillar-features">
                  {pillar.highlights.map((item, hIdx) => (
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
        <div className="about-v2__cta-banner">
          <div className="about-v2__cta-text">
            <h3 className="about-v2__cta-heading">
              Ready to Bridge the Gap Between Education and Employment?
            </h3>
            <p className="about-v2__cta-sub">
              Get personalized career counseling, choose the right industry program, and start
              your journey toward high-growth job placements.
            </p>
          </div>

          <div className="about-v2__cta-actions">
            <a href="/courses" className="about-v2__btn-white">
              <span>Explore Programs</span>
              <ArrowRight size={18} strokeWidth={2.5} />
            </a>
            <button
              type="button"
              onClick={openCounseling}
              className="about-v2__btn-outline"
            >
              <span>Free Counseling</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
