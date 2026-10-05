import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, ArrowRight, X, ExternalLink, Play } from 'lucide-react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import videoTestimonials from '../data/videoTestimonials';
import './VideoTestimonials.css';

// Extract YouTube Video ID to generate embed link
function getYouTubeEmbedUrl(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0` : url;
}

// Extract YouTube Thumbnail
function getYouTubeThumbnail(url) {
  if (!url) return null;
  const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regExp);
  return match && match[1] ? `https://img.youtube.com/vi/${match[1]}/maxresdefault.jpg` : null;
}

export default function VideoTestimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardsToShow, setCardsToShow] = useState(4);
  const [activeVideo, setActiveVideo] = useState(null);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  // Responsive cards count
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setCardsToShow(1.2);
      } else if (window.innerWidth < 900) {
        setCardsToShow(2);
      } else if (window.innerWidth < 1200) {
        setCardsToShow(3);
      } else {
        setCardsToShow(4);
      }
    };
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const maxIndex = Math.max(0, videoTestimonials.length - Math.floor(cardsToShow));

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : maxIndex));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < maxIndex ? prev + 1 : 0));
  };

  // Touch swipe support
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].clientX;
    const diff = touchStartX.current - touchEndX.current;
    if (diff > 50) handleNext();
    else if (diff < -50) handlePrev();
  };

  // Keyboard navigation & modal lock
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setActiveVideo(null);
    };
    if (activeVideo) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [activeVideo]);

  const sectionRef = useRef(null);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from('.video-section__header > *', {
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

      gsap.from('.video-carousel__viewport', {
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
    <section className="video-section section" id="video-stories" ref={sectionRef} aria-label="Student Video Success Stories">
      {/* Background ambient accents */}
      <div className="video-section__glow video-section__glow--1" aria-hidden="true" />
      <div className="video-section__glow video-section__glow--2" aria-hidden="true" />

      <div className="container">
        {/* Section Header */}
        <div className="text-center video-section__header">
          <h2 className="section-title">
            Inspiring Journeys, <span className="highlight-orange">Global Careers</span>
          </h2>
          <p className="section-subtitle">
            Watch verified EDUZY alumni share how personalized mentoring by Rose helped them clear OET, IELTS, German, and NCLEX-RN.
          </p>
        </div>

        {/* Carousel Viewport */}
        <div 
          className="video-carousel__viewport"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <div 
            className="video-carousel__track"
            style={{
              transform: `translateX(-${currentIndex * (100 / cardsToShow)}%)`,
            }}
          >
            {videoTestimonials.map((item) => {
              const bgImg = item.thumbnail || getYouTubeThumbnail(item.videoUrl) || item.fallbackImage;

              return (
                <div 
                  className="video-carousel__slide"
                  key={item.id}
                  style={{ flex: `0 0 ${100 / cardsToShow}%` }}
                >
                  <div 
                    className="video-card"
                    onClick={() => setActiveVideo(item)}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter') setActiveVideo(item); }}
                    aria-label={`Watch success story: ${item.studentName} - ${item.course}`}
                  >
                    {/* Thumbnail Image */}
                    <div className="video-card__media">
                      <img 
                        src={bgImg} 
                        alt={item.studentName || 'Student Success Story'} 
                        className="video-card__img"
                        loading="lazy"
                        onError={(e) => {
                          e.target.src = item.fallbackImage;
                        }}
                      />
                      <div className="video-card__overlay" />
                    </div>

                    {/* Center Floating Play Button */}
                    <div className="video-card__play-center" aria-hidden="true">
                      <div className="video-card__play-circle">
                        <div className="video-card__play-pulse" />
                        <Play size={24} className="video-card__play-icon" fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="video-carousel__controls" aria-label="Video carousel navigation">
          <button
            type="button"
            className="video-ctrl-btn video-ctrl-btn--prev"
            onClick={handlePrev}
            aria-label="Previous video"
            title="Previous video"
          >
            <ArrowLeft size={20} />
          </button>
          
          <div className="video-carousel__dots" aria-hidden="true">
            {Array.from({ length: maxIndex + 1 }).map((_, i) => (
              <span 
                key={i} 
                className={`video-dot ${currentIndex === i ? 'active' : ''}`}
                onClick={() => setCurrentIndex(i)}
              />
            ))}
          </div>

          <button
            type="button"
            className="video-ctrl-btn video-ctrl-btn--next"
            onClick={handleNext}
            aria-label="Next video"
            title="Next video"
          >
            <ArrowRight size={20} />
          </button>
        </div>
      </div>

      {/* Video Modal Popup */}
      {activeVideo && (
        <div className="video-modal" onClick={() => setActiveVideo(null)} role="dialog" aria-modal="true">
          <div className="video-modal__backdrop" />
          <div className="video-modal__content" onClick={(e) => e.stopPropagation()}>
            <button 
              type="button" 
              className="video-modal__close-btn" 
              onClick={() => setActiveVideo(null)}
              aria-label="Close video player"
            >
              <X size={20} />
            </button>

            <div className="video-modal__player">
              {activeVideo.videoUrl && activeVideo.videoUrl.includes('youtube') ? (
                <iframe
                  src={getYouTubeEmbedUrl(activeVideo.videoUrl)}
                  title={`${activeVideo.studentName} - Success Story`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="video-modal__iframe"
                />
              ) : (
                <div className="video-modal__fallback">
                  <p>Video URL: {activeVideo.videoUrl}</p>
                </div>
              )}
            </div>

            <div className="video-modal__meta">
              <div>
                <span className="video-modal__course">{activeVideo.course} &bull; {activeVideo.badge}</span>
                <h3 className="video-modal__title">{activeVideo.studentName}</h3>
                <p className="video-modal__quote">&ldquo;{activeVideo.title}&rdquo;</p>
              </div>

              <a 
                href={activeVideo.videoUrl} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="video-modal__external-link"
              >
                <span>Watch on YouTube</span>
                <ExternalLink size={16} />
              </a>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
