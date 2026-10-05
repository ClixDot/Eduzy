import React from 'react';
import './Achievements.css';

const proofs = [
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
      </svg>
    ),
    title: '96% Verified Placement Success',
    desc: 'Consistently achieving top-tier career placements across the UK, Australia, Germany, UAE, and overseas.',
    tag: 'Career Placements',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    title: 'First-Attempt Exam Clearances',
    desc: 'Students achieve high band scores in IELTS, OET Grade B/A, and first-time NCLEX-RN success.',
    tag: 'Proven Outcomes',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
      </svg>
    ),
    title: 'Global Healthcare Placements',
    desc: 'Our alumni work as registered nurses, doctors, and specialists in the UK, Australia, USA, Canada, and Ireland.',
    tag: 'International Reach',
  },
  {
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 14 14"/>
      </svg>
    ),
    title: 'Continuous Individual Mentorship',
    desc: 'One-on-one speaking corrections, letter reviews, and dedicated doubt-clearing sessions daily.',
    tag: 'Personalized Support',
  },
];

export default function Achievements() {
  return (
    <section className="achievements section" id="achievements" aria-label="Academy Trust and Outcomes">
      <div className="container">
        <div className="text-center achievements__header">
          <h2 className="section-title">Built on Trust, Backed by Results</h2>
          <p className="section-subtitle">
            We focus on genuine educational quality, rigorous mock training, and ethical career guidance.
          </p>
        </div>

        <div className="achievements__grid">
          {proofs.map((item, i) => (
            <div className="proof-card" key={i}>
              <div className="proof-card__top">
                <div className="proof-card__icon" aria-hidden="true">
                  {item.icon}
                </div>
                <span className="proof-card__tag">{item.tag}</span>
              </div>
              <h3 className="proof-card__title">{item.title}</h3>
              <p className="proof-card__desc">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
