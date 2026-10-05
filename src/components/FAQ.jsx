import React, { useState } from 'react';
import faqs from '../data/faqs';
import './FAQ.css';

export default function FAQ() {
  const [openIds, setOpenIds] = useState([1]); // First FAQ open by default

  const toggleFAQ = (id) => {
    setOpenIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <section className="faq section" id="faqs" aria-label="Frequently Asked Questions">
      <div className="container">
        <div className="text-center faq__header">
          <h2 className="section-title">Frequently Asked Questions</h2>
          <p className="section-subtitle">
            Find answers to common questions about our courses, training methodology, enrollment process, and study materials.
          </p>
        </div>

        <div className="faq__accordion">
          {faqs.map((faq) => {
            const isOpen = openIds.includes(faq.id);
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
                    maxHeight: isOpen ? '400px' : '0px',
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
