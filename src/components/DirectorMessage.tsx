'use client';
import React, { useEffect, useRef } from 'react';
import { gsap } from '../utils/gsapSetup';
import { useSite } from '@/cms/site/ContentProvider';
import './DirectorMessage.css';

export default function DirectorMessage() {
  const sectionRef = useRef(null);
  const { director: d } = useSite();

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      // 1. Left editorial content slides in
      gsap.from('.director__content', {
        x: -25,
        duration: 0.7,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });

      // 2. Right media portrait slides in with slight scale
      gsap.from('.director__media', {
        x: 25,
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
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <section className="director section" id="director-message" ref={sectionRef} aria-label="Director's Message">
      <div className="container director__container">
        {/* Editorial Layout Grid: Content on Left, Large Portrait on Right */}
        <div className="director__editorial-grid">
          {/* Vertical Side Accent */}
          <div className="director__side-label" aria-hidden="true">
            <span>{d.sideLabel}</span>
          </div>

          {/* Left: Main Editorial Content */}
          <div className="director__content">


            {/* Main Editorial Headline */}
            <h2 className="director__heading">
              {d.heading}
            </h2>

            {/* Quote Texts */}
            <div className="director__text">
              {(d.paragraphs || []).map((para: string, i: number) => (
                <p key={i}>
                  &ldquo;{para}&rdquo;
                </p>
              ))}
            </div>

            {/* Signature Block */}
            <div className="director__signature">
              {d.signature && <img src={d.signature} alt={`${d.name} signature`} style={{ height: 48, width: 'auto', marginBottom: 6, display: 'block' }} loading="lazy" />}
              <div className="director__name">{d.name}</div>
              <div className="director__role">{d.role}</div>
            </div>
          </div>

          {/* Right: Large Editorial Portrait (Like Reference) */}
          <div className="director__media">
            <div className="director__img-wrapper">
              <img
                src={d.image}
                alt={d.imageAlt}
                className="director__img"
                loading="lazy"
                width="755"
                height="841"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
