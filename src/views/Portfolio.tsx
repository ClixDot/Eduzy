'use client';
import React, { useState, useEffect } from 'react';
import { ArrowRight, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSite } from '@/cms/site/ContentProvider';
import { spaced } from '@/cms/site/helpers';
import { CmsIcon } from '@/cms/site/helpers';
import '../components/site/SiteExtras.css';
import { gsap } from '../utils/gsapSetup';
import VideoTestimonials from '../components/VideoTestimonials';
import CTA from '../components/CTA';
import './Portfolio.css';

export default function Portfolio() {
  const [activeTab, setActiveTab] = useState('all');
  const [selectedImage, setSelectedImage] = useState(null);
  const { portfolio: page, placementAchievements, gallery, galleryCategories: gcats, blogs, journal, blogCategories } = useSite();
  const show = page.show || {};
  const galleryCategories = [{ id: 'all', label: page.galleryAllLabel }, ...gcats.map((c: any) => ({ id: c.slug, label: c.label }))];
  const galleryItems = gallery.map((g: any) => {
    const cat = gcats.find((c: any) => c.slug === g.category);
    return { ...g, categoryLabel: cat?.badgeLabel || cat?.label || '' };
  });
  const achievements = placementAchievements.items || [];
  const campusFacilities = page.facilities || [];
  const posts = blogs.slice(0, Number(journal.perPage) || 9);
  const blogCategoryLabel = (slug: string) => blogCategories.find((c: any) => c.slug === slug)?.label || '';

  // Filter gallery items
  const filteredGallery = activeTab === 'all'
    ? galleryItems
    : galleryItems.filter((item) => item.category === activeTab);
  const filterKey = filteredGallery.length;

  // GSAP animation on tab change
  useEffect(() => {
    gsap.fromTo(
      '.gallery-card',
      { y: 20, opacity: 0.2 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.5, ease: 'power2.out', clearProps: 'all' }
    );
  }, [activeTab, filterKey]);

  // Smooth scroll handler with header offset
  const scrollToSection = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const headerOffset = 85;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  };

  // Keyboard accessibility & scroll lock for modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setSelectedImage(null);
    };
    if (selectedImage) {
      window.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [selectedImage]);

  return (
    <main className="portfolio-page" id="main-content">
      {/* ================= 1. PAGE HERO ================= */}
      <section className="portfolio-hero">
        <div className="container text-center">
          <span className="portfolio-hero__badge">
            {page.heroBadge}
          </span>
          <h1 className="portfolio-hero__title">
            {spaced(page.heroTitleStart)}<span className="highlight-orange">{page.heroTitleHighlight}</span>
          </h1>
          <p className="portfolio-hero__subtitle">
            {page.heroSubtitle}
          </p>

          {/* Jump Navigation Quick Links */}
          <div className="portfolio-hero__quick-links">
            {show.gallery && <a href="#gallery-section" className="quick-link-pill" onClick={(e) => scrollToSection(e, 'gallery-section')}>{page.linkGallery}</a>}
            {show.achievements && <a href="#achievements-section" className="quick-link-pill" onClick={(e) => scrollToSection(e, 'achievements-section')}>{page.linkAchievements}</a>}
            {show.campus && <a href="#campus-section" className="quick-link-pill" onClick={(e) => scrollToSection(e, 'campus-section')}>{page.linkCampus}</a>}
          </div>
        </div>
      </section>

      {/* ================= BLOG POSTS (shown once posts are published) ================= */}
      {show.journal && posts.length > 0 && (
        <section className="portfolio-section" id="journal-section" aria-label={journal.title}>
          <div className="container">
            <div className="section-header text-center">
              <span className="section-tag">{journal.tag}</span>
              <h2 className="section-title">{journal.title}</h2>
              {journal.subtitle && <p className="section-subtitle">{journal.subtitle}</p>}
            </div>
            <div className="journal-grid">
              {posts.map((post: any) => (
                <Link key={post.id} to={`/blogs/${post.slug}`} className="journal-card">
                  {post.coverImage && <img src={post.coverImage} alt={post.coverAlt || post.title} className="journal-card__img" loading="lazy" />}
                  <div className="journal-card__body">
                    <span className="journal-card__meta">
                      {[blogCategoryLabel(post.category), post.publishDate ? new Date(post.publishDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : ''].filter(Boolean).join(' · ')}
                    </span>
                    <h3 className="journal-card__title">{post.title}</h3>
                    {post.excerpt && <p className="journal-card__excerpt">{post.excerpt}</p>}
                    <span className="journal-card__more">{journal.readMoreLabel} →</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= 2. INTERACTIVE GALLERY & FILTER ================= */}
      {show.gallery && (
      <section className="portfolio-section" id="gallery-section" aria-label="Academy Gallery">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">{page.galleryTag}</span>
            <h2 className="section-title">{page.galleryTitle}</h2>
            <p className="section-subtitle">
              {page.gallerySubtitle}
            </p>
          </div>

          {/* Category Filter Pills (Exact requested categories) */}
          <div className="portfolio-filters-wrapper">
            <div className="portfolio-filters" role="tablist" aria-label="Filter gallery by category">
              {galleryCategories.map((cat) => (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={activeTab === cat.id}
                  className={`portfolio-filter-btn ${activeTab === cat.id ? 'active' : ''}`}
                  onClick={() => setActiveTab(cat.id)}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Gallery Bento Grid */}
          <div className="gallery-grid">
            {filteredGallery.map((item) => (
              <div 
                key={item.id} 
                className="gallery-card"
                onClick={() => setSelectedImage(item)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedImage(item);
                  }
                }}
                role="button"
                tabIndex={0}
                aria-label={`View ${item.title}`}
              >
                <div className="gallery-card__img-wrap">
                  <img 
                    src={item.image}
                    alt={item.alt}
                    className="gallery-card__img" 
                    loading="lazy"
                  />
                  <div className="gallery-card__overlay">
                    <span className="gallery-card__zoom-btn">{page.galleryViewLabel}</span>
                  </div>
                  <span className="gallery-card__category-badge">{item.categoryLabel}</span>
                </div>
                <div className="gallery-card__content">
                  <h3 className="gallery-card__title">{item.title}</h3>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      )}

      {/* ================= 3. STUDENT ACHIEVEMENTS ================= */}
      {show.achievements && (
      <section className="portfolio-section portfolio-section--alt" id="achievements-section" aria-label="Student Achievements">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">{placementAchievements.tag}</span>
            <h2 className="section-title">{placementAchievements.title}</h2>
            <p className="section-subtitle">
              {placementAchievements.subtitle}
            </p>
          </div>

          {/* Achievement Grid */}
          <div className="achievements-grid">
            {achievements.map((item, idx) => (
              <div key={idx} className="achievement-card">
                <div className="achievement-card__top">
                  <span className="achievement-card__badge">{item.badge}</span>
                  <span className="achievement-card__stat">{item.stat}</span>
                </div>
                <h3 className="achievement-card__title">{item.title}</h3>
                <p className="achievement-card__desc">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      )}

      {/* ================= 4. CAMPUS & FACILITIES ================= */}
      {show.campus && (
      <section className="portfolio-section" id="campus-section" aria-label="Campus Facilities">
        <div className="container">
          <div className="section-header text-center">
            <span className="section-tag">{page.campusTag}</span>
            <h2 className="section-title">{page.campusTitle}</h2>
            <p className="section-subtitle">
              {page.campusSubtitle}
            </p>
          </div>

          <div className="facilities-grid">
            {campusFacilities.map((fac: any, idx: number) => {
              return (
                <div key={idx} className="facility-card">
                  <div className="facility-card__icon-box">
                    <CmsIcon name={fac.icon} size={24} />
                  </div>
                  <h3 className="facility-card__title">{fac.title}</h3>
                  <p className="facility-card__desc">{fac.desc}</p>
                  <button
                    type="button"
                    onClick={() => window.dispatchEvent(new CustomEvent('open-enroll-modal', { detail: { course: `Campus Visit: ${fac.title}` } }))}
                    className="facility-card__action-btn"
                  >
                    <span>{page.campusButtonLabel}</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      )}

      {/* ================= 6. VIDEO REELS & TESTIMONIALS ================= */}
      {show.videos && <VideoTestimonials />}

      {/* ================= 10. CALL TO ACTION ================= */}
      {show.cta && <CTA />}

      {/* ================= LIGHTBOX MODAL ================= */}
      {selectedImage && (
        <div 
          className="gallery-lightbox-overlay" 
          onClick={() => setSelectedImage(null)}
          role="dialog"
          aria-modal="true"
        >
          <div className="gallery-lightbox-card" onClick={(e) => e.stopPropagation()}>
            <button 
              className="gallery-lightbox-close" 
              onClick={() => setSelectedImage(null)}
              aria-label="Close image modal"
            >
              <X size={20} />
            </button>
            <div className="gallery-lightbox-img-box">
              <img src={selectedImage.image} alt={selectedImage.alt} />
            </div>
            <div className="gallery-lightbox-info">
              <span className="gallery-lightbox-tag">{selectedImage.categoryLabel}</span>
              <h3 className="gallery-lightbox-title">{selectedImage.title}</h3>
              {selectedImage.description && <p style={{ marginTop: 6, fontSize: '0.92rem' }}>{selectedImage.description}</p>}
              <div className="gallery-lightbox-bottom" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #E2E8F0' }}>
                <button
                  type="button"
                  onClick={() => {
                    const title = selectedImage.title;
                    setSelectedImage(null);
                    window.dispatchEvent(new CustomEvent('open-enroll-modal', { detail: { course: `Campus Visit: ${title}` } }));
                  }}
                  className="btn btn-primary btn-sm"
                  style={{ borderRadius: '9999px', padding: '7px 18px', fontSize: '0.84rem' }}
                >
                  {page.campusButtonLabel}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
