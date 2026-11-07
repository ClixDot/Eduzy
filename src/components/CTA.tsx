'use client';
import React, { useEffect, useRef } from 'react';
import { gsap } from '../utils/gsapSetup';
import FlowButton from './ui/flow-button';
import { useSite } from '@/cms/site/ContentProvider';
import { tel, whatsapp } from '@/cms/site/helpers';
import './CTA.css';

export default function CTA() {
  const sectionRef = useRef(null);
  const cardRef = useRef(null);
  const { cta, settings } = useSite();
  const primaryHref = cta.primary?.url || tel(settings.contact.phone);
  const secondaryHref = cta.secondary?.url || whatsapp(settings.contact.whatsapp, cta.secondary?.whatsappMessage);

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
    <section className="cta-section" id="cta" ref={sectionRef} aria-label="Call to action">
      <div className="container">
        <div
          className="cta-card"
          ref={cardRef}
          style={cta.backgroundImage ? {
            backgroundImage: `linear-gradient(135deg, rgba(204, 41, 0, 0.88) 0%, rgba(255, 59, 11, 0.78) 100%), url("${encodeURI(decodeURI(cta.backgroundImage))}")`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          } : undefined}
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
              <span>{cta.badge}</span>
            </div>

            <h2 className="cta-card__heading">
              {cta.heading}
            </h2>
            <p className="cta-card__desc">
              {cta.description}
            </p>

            <div className="cta-card__actions">
              {/* Button 1: Call Now (Direct Call) */}
              {cta.primary?.label && (
              <FlowButton
                text={cta.primary.label}
                href={primaryHref}
                className="flow-button--white-to-orange"
                hoverColor="#FF3B0B"
                id="cta-call-now"
              />
              )}
              {/* Button 2: Message (WhatsApp Message) */}
              {cta.secondary?.label && (
              <FlowButton
                text={cta.secondary.label}
                href={secondaryHref}
                className="flow-button--orange-to-white"
                hoverColor="#ffffff"
                id="cta-message-whatsapp"
              />
              )}
            </div>

            <div className="cta-card__perks">
              {(cta.perks || []).map((perk: string, i: number) => (
                <span className="cta-card__perk-item" key={i}>✓ {perk}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
