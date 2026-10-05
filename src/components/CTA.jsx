import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import FlowButton from './ui/flow-button';
import './CTA.css';

export default function CTA() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1. CTA Card scale & lift on scroll
      gsap.from('.cta-card', {
        y: 25,
        scale: 0.97,
        duration: 0.7,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });

      // 2. Elements staggered entrance inside the card
      gsap.from('.cta-card__badge, .cta-card__heading, .cta-card__desc, .cta-card__actions, .cta-card__perks', {
        y: 15,
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

  // Subtle 3D tilt & cursor spotlight
  const handleMouseMove = (e) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    const rotateX = ((y - centerY) / centerY) * -4;
    const rotateY = ((x - centerX) / centerX) * 4;

    card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-2px)`;
    card.style.setProperty('--mouse-x', `${x}px`);
    card.style.setProperty('--mouse-y', `${y}px`);
  };

  const handleMouseLeave = () => {
    const card = cardRef.current;
    if (!card) return;
    card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)';
  };

  return (
    <section className="cta-section" ref={sectionRef} aria-label="Call to action">
      <div className="container">
        <div
          className="cta-card"
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          {/* Dynamic cursor spotlight glow */}
          <div className="cta-card__mouse-glow" aria-hidden="true" />

          {/* Floating animated ambient circles */}
          <div className="cta-card__circle cta-card__circle--1" aria-hidden="true" />
          <div className="cta-card__circle cta-card__circle--2" aria-hidden="true" />
          <div className="cta-card__circle cta-card__circle--3" aria-hidden="true" />

          <div className="cta-card__content">
            {/* Animated Transformation Badge */}
            <div className="cta-card__badge">
              <span className="cta-card__badge-dot" aria-hidden="true" />
              <span>Start Your Transformation</span>
            </div>

            <h2 className="cta-card__heading">
              Ready to Start Your Success Journey?
            </h2>
            <p className="cta-card__desc">
              Take the next step toward your academic and career goals. Join thousands of successful candidates who trusted EDUZY.
            </p>

            <div className="cta-card__actions">
              {/* Button 1: White to Orange */}
              <FlowButton
                text="Enroll Now"
                onClick={() => window.dispatchEvent(new CustomEvent('open-enroll-modal'))}
                className="flow-button--white-to-orange"
                hoverColor="#EA580C"
                id="cta-enroll-now"
              />
              {/* Button 2: Orange to White */}
              <FlowButton
                text="Talk to an Expert"
                href="https://wa.me/919747944374?text=Hi%2C%20I%20would%20like%20to%20talk%20to%20an%20expert%20counselor%20at%20EDUZY"
                className="flow-button--orange-to-white"
                hoverColor="#ffffff"
                id="cta-talk-expert"
              />
            </div>

            <div className="cta-card__perks">
              <span className="cta-card__perk-item">✓ Free Consultation</span>
              <span className="cta-card__perk-item">✓ Flexible Batches</span>
              <span className="cta-card__perk-item">✓ Online &amp; Offline Available</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
