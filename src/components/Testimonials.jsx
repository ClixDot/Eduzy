import React, { useState, useEffect, useRef } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import testimonials from '../data/testimonials';
import './Testimonials.css';

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(3);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Update cards to show based on screen width
  useEffect(() => {
    const updateCardsToShow = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1);
      } else if (window.innerWidth < 1024) {
        setCardsToShow(2);
      } else {
        setCardsToShow(3);
      }
    };
    updateCardsToShow();
    window.addEventListener('resize', updateCardsToShow);
    return () => window.removeEventListener('resize', updateCardsToShow);
  }, []);

  const maxIndex = Math.max(0, testimonials.length - cardsToShow);

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  const handleDotClick = (index) => {
    setCurrentIndex(Math.min(index, maxIndex));
  };

  // Touch handlers
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) {
      handleNext();
    } else if (diff < -50) {
      handlePrev();
    }
  };

  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from('.testimonials__top > *', {
        y: 20,
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

      gsap.from('.testimonials__track', {
        y: 25,
        duration: 0.65,
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
    <section className="testimonials section" id="testimonials" ref={sectionRef} aria-label="Student Testimonials">
      <div className="container">
        <div className="testimonials__top">
          <div>
            <h2 className="section-title">
              What Our Students <span className="highlight-orange">Say</span>
            </h2>
            <p className="section-subtitle">
              Hear directly from healthcare professionals and students who transformed their global career aspirations with EDUZY.
            </p>
          </div>

          <div className="testimonials__nav-buttons" aria-label="Carousel navigation">
            <button
              className="carousel-btn prev-btn"
              onClick={handlePrev}
              aria-label="Previous testimonial"
              id="testi-prev-btn"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            </button>
            <button
              className="carousel-btn next-btn"
              onClick={handleNext}
              aria-label="Next testimonial"
              id="testi-next-btn"
            >
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Carousel Track */}
        <div
          className="testimonials__carousel-viewport"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div
            className="testimonials__track"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)`,
            }}
          >
            {testimonials.map((item) => (
              <div
                className="testimonials__slide"
                key={item.id}
                style={{ flex: `0 0 ${100 / cardsToShow}%` }}
              >
                <article className="testimonial-card">
                  {/* Decorative Background Quote Mark */}
                  <div className="testimonial-card__quote-mark" aria-hidden="true">&ldquo;</div>

                  {/* Card Header: Stars + Course Tag */}
                  <div className="testimonial-card__top">
                    <div className="testimonial-card__stars" aria-label={`${item.rating} out of 5 stars`}>
                      {[...Array(item.rating)].map((_, i) => (
                        <span key={i} className="star filled">★</span>
                      ))}
                    </div>
                    <span className="testimonial-card__course-tag">{item.course}</span>
                  </div>

                  {/* Quotation Text */}
                  <p className="testimonial-card__quote">
                    &ldquo;{item.text}&rdquo;
                  </p>

                  {/* Card Footer: Student Profile */}
                  <div className="testimonial-card__author">
                    <div className="testimonial-card__avatar">
                      {item.initials}
                    </div>
                    <div className="testimonial-card__info">
                      <h3 className="testimonial-card__name">{item.name}</h3>
                      <p className="testimonial-card__role">{item.role}</p>
                    </div>
                  </div>
                </article>
              </div>
            ))}
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="testimonials__dots" role="tablist" aria-label="Testimonial page selector">
          {Array.from({ length: maxIndex + 1 }).map((_, idx) => (
            <button
              key={idx}
              className={`testimonials__dot ${currentIndex === idx ? 'active' : ''}`}
              onClick={() => handleDotClick(idx)}
              aria-label={`Go to slide ${idx + 1}`}
              role="tab"
              aria-selected={currentIndex === idx}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
