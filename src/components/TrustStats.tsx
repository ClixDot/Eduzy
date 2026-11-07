'use client';
import { useEffect, useRef } from 'react';
import { gsap } from '../utils/gsapSetup';
import { useSite } from '@/cms/site/ContentProvider';
import './TrustStats.css';

export default function TrustStats() {
  const sectionRef = useRef(null);
  const { stats: statsContent } = useSite();
  const stats = (statsContent.items || []).map((s: any) => ({ ...s, number: Number(s.number) || 0 }));
  const animate = statsContent.animate !== false;
  const statsKey = JSON.stringify(stats);

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
      if (!animate) return;
      numberEls.forEach((numEl, i) => {
        if (!stats[i]) return;
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statsKey, animate]);

  return (
    <section className="trust-stats section-sm" id="trust-stats" aria-label="Academy statistics" ref={sectionRef}>
      <div className="container">
        <div className="trust-stats__grid">
          {stats.map((stat, i) => (
            <div className="trust-stat-card" key={i}>
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
