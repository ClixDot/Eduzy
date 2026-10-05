import React, { useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import directorImg from '../assets/director.png';
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

      // 3. Floating badge pops up
      gsap.from('.director__badge', {
        scale: 0.88,
        duration: 0.5,
        ease: 'back.out(1.5)',
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
                &ldquo;At EDUZY, our mission has always been clear and heartfelt: to bridge the gap between ambitious professionals and their international career goals. Whether you are a nurse working tirelessly towards registration abroad, a doctor seeking global practice, or a student aspiring for overseas education, exam preparation is not just about memorization — it is about strategy, confidence, and individualized support.&rdquo;
              </p>
              <p>
                &ldquo;Every student who enters our doors or logs into our virtual classroom receives our wholehearted dedication. We have carefully curated our faculty, materials, and small batch sizes to ensure no one is left behind. When you succeed, we celebrate your victory as our own.&rdquo;
              </p>
            </div>

            {/* Signature Block */}
            <div className="director__signature">
              <div className="director__name">Rose</div>
              <div className="director__role">Director, EDUZY</div>
            </div>
          </div>

          {/* Right: Large Editorial Portrait (Like Reference) */}
          <div className="director__media">
            <div className="director__img-wrapper">
              <img
                src={directorImg}
                alt="Rose, Director of EDUZY"
                className="director__img"
                loading="lazy"
                width="580"
                height="700"
              />

              {/* Minimalist Floating Pill Badge */}
              <div className="director__badge">
                <span className="director__badge-tag">Leadership</span>
                <span className="director__badge-text">10+ Years of Mentorship</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
