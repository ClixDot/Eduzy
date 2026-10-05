import { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import './TrustStats.css';

const stats = [
  { number: 20000, suffix: '+', label: 'Students Trained' },
  { number: 40, suffix: '+', label: 'Expert Trainers' },
  { number: 25, suffix: '+', label: 'Awards Won' },
  { number: 96, suffix: '%', label: 'Placement Rate' },
];

export default function TrustStats() {
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      const cards = el.querySelectorAll('.trust-stat-card');
      const numberEls = el.querySelectorAll('.trust-stat-num-val');

      // 1. Gentle lift on scroll without hiding
      gsap.from(cards, {
        y: 20,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power2.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 90%',
          once: true,
        },
      });

      // 2. Count numbers up smoothly
      numberEls.forEach((numEl, i) => {
        const target = stats[i].number;
        const obj = { val: 0 };

        gsap.to(obj, {
          val: target,
          duration: 1.5,
          ease: 'power2.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 90%',
            once: true,
          },
          onUpdate: () => {
            numEl.textContent = Math.floor(obj.val).toLocaleString();
          },
        });
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className="trust-stats section-sm" aria-label="Academy statistics" ref={sectionRef}>
      <div className="container">
        <div className="trust-stats__grid">
          {stats.map((stat) => (
            <div className="trust-stat-card" key={stat.label}>
              <div className="trust-stat-number">
                <span className="trust-stat-num-val">{stat.number.toLocaleString()}</span>
                <span>{stat.suffix}</span>
              </div>
              <div className="trust-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
