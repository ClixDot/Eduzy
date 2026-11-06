'use client';
import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
const directorImg = '/assets/the.png';
import './DirectorMessage.css';

export default function DirectorMessage() {
  const sectionRef = useRef(null);

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
            <span>Leadership &bull; Estd 2014</span>
          </div>

          {/* Left: Main Editorial Content */}
          <div className="director__content">


            {/* Main Editorial Headline */}
            <h2 className="director__heading">
              Guiding Every Student to Their Global Potential
            </h2>

            {/* Quote Texts */}
            <div className="director__text">
              <p>
                &ldquo;At EDUZY, our mission has always been clear and heartfelt: to bridge the gap between ambitious students and high-growth professional careers. Whether you are stepping into global logistics, corporate accounting, digital marketing, creative design, hospital administration, or aviation, industry preparation is about hands-on practical skills, confidence, and dedicated mentorship.&rdquo;
              </p>
              <p>
                &ldquo;Every student who enters our doors or logs into our virtual classroom receives our wholehearted dedication. We have carefully curated our faculty, materials, and small batch sizes to ensure no one is left behind. When you succeed, we celebrate your victory as our own.&rdquo;
              </p>
            </div>

            {/* Signature Block */}
            <div className="director__signature">
              <div className="director__name">Rose Mary Johnson</div>
              <div className="director__role">Founder &amp; CEO Eduzy</div>
            </div>
          </div>

          {/* Right: Large Editorial Portrait (Like Reference) */}
          <div className="director__media">
            <div className="director__img-wrapper">
              <img
                src={directorImg}
                alt="Rose Mary Johnson, Founder & CEO of Eduzy"
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
