import React, { useState, useEffect, useRef } from 'react';
import { gsap } from '../utils/gsapSetup';
import faqs from '../data/faqs';
import './FAQ.css';

export default function FAQ() {
  const [openId, setOpenId] = useState(1); // First FAQ open by default
  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from('.faq__header > *', {
        y: 20,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        clearProps: 'all',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
          once: true,
        },
      });

      gsap.from('.faq__item', {
        y: 20,
        stagger: 0.06,
        duration: 0.5,
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

  const toggleFAQ = (id) => {
    setOpenId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="faq section" id="faqs" ref={sectionRef} aria-label="Frequently Asked Questions">
      <div className="container">
        <div className="text-center faq__header">
          <h2 className="section-title">
            Frequently Asked <span className="highlight-orange">Questions</span>
          </h2>
          <p className="section-subtitle">
            Find answers to common questions about our courses, training methodology, and enrollment process.
          </p>
        </div>

        <div className="faq__accordion">
          {faqs.map((faq) => {
            const isOpen = openId === faq.id;
            return (
              <div
                key={faq.id}
                className={`faq__item ${isOpen ? 'faq__item--open' : ''}`}
              >
                <button
                  className="faq__trigger"
                  onClick={() => toggleFAQ(faq.id)}
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${faq.id}`}
                  id={`faq-btn-${faq.id}`}
                  type="button"
                >
                  <span className="faq__question-text">{faq.question}</span>
                  <span className="faq__icon" aria-hidden="true">
                    <span className="faq__icon-bar faq__icon-bar--h" />
                    <span className={`faq__icon-bar faq__icon-bar--v ${isOpen ? 'rotated' : ''}`} />
                  </span>
                </button>

                <div
                  id={`faq-answer-${faq.id}`}
                  className="faq__content-wrap"
                  style={{
                    maxHeight: isOpen ? '500px' : '0px',
                    opacity: isOpen ? 1 : 0,
                  }}
                  role="region"
                  aria-labelledby={`faq-btn-${faq.id}`}
                >
                  <div className="faq__answer-inner">
                    <p>{faq.answer}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

