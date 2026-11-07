'use client';
import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, Globe, Star, GraduationCap } from 'lucide-react';
import EnquiryForm from '../components/EnquiryForm';
import CTA from '../components/CTA';
import { useSite } from '@/cms/site/ContentProvider';
import { CmsIcon, whatsapp, fill } from '@/cms/site/helpers';
import '../components/site/SiteExtras.css';
import './CourseDetails.css';

export default function CourseDetails({ courseId }: { courseId: string }) {
  const { courses, testimonials, coursesPage, settings } = useSite();
  const course = courses.find((c: any) => c.id === courseId);
  const t = coursesPage.detail;

  // Remember course category for back navigation
  React.useEffect(() => {
    if (course?.category) {
      sessionStorage.setItem('edozy_active_course_category', course.category);
    }
  }, [course]);

  if (!course) return null;
  const categoryLabel = String(course.category || '');

  // Find testimonials relevant to this course or fallback
  const courseTestimonials = testimonials.filter(
    (t) =>
      t.course.toLowerCase().includes(course.name.toLowerCase()) ||
      course.name.toLowerCase().includes(t.course.toLowerCase()) ||
      (course.category && t.course.toLowerCase().includes(course.category.toLowerCase()))
  );
  const displayedTestimonials = courseTestimonials.length > 0 ? courseTestimonials : testimonials.slice(0, 1);

  return (
    <main className="course-detail-page" id="main-content">
      {/* 1. Breadcrumbs */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container breadcrumb-inner">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">&gt;</span>
          <Link to={`/courses?category=${course.category}`} state={{ fromCategory: course.category }}>Courses</Link>
          <span className="breadcrumb-sep">&gt;</span>
          <span className="breadcrumb-current" aria-current="page">{course.name}</span>
        </div>
      </nav>

      {/* 2. Course Hero */}
      <section className="course-hero">
        <div className="container course-hero__inner">
          <div className="course-hero__content">
            <div className="course-hero__badges">
              <span className="course-hero__cat-badge">{categoryLabel.toUpperCase()}</span>
              {course.level && <span className="course-hero__dur-badge">{course.level}</span>}
              {!course.level && course.duration && <span className="course-hero__dur-badge">{course.duration.toUpperCase()}</span>}
              {course.badge && <span className="course-hero__highlight-badge">{course.badge}</span>}
            </div>

            <h1 className="course-hero__title">
              {course.fullName || course.name}
            </h1>

            <p className="course-hero__desc">
              {course.description}
            </p>

            <div className="course-hero__highlights">
              <div className="course-hero__meta-card">
                <span className="course-hero__meta-label">{course.level ? 'Program Level' : 'Duration'}</span>
                <span className="course-hero__meta-val">
                  {course.level ? <GraduationCap size={16} /> : <Clock size={16} />} {course.level || course.duration || 'Comprehensive'}
                </span>
              </div>
              <div className="course-hero__meta-card">
                <span className="course-hero__meta-label">{t.formatLabel || 'Training Format'}</span>
                <span className="course-hero__meta-val">
                  <Globe size={16} /> {course.format || t.defaultFormat}
                </span>
              </div>
              <div className="course-hero__meta-card">
                <span className="course-hero__meta-label">Rating</span>
                <span className="course-hero__meta-val">
                  <Star size={16} style={{ fill: 'var(--color-primary)', stroke: 'var(--color-primary)' }} /> {course.rating ? `${course.rating} / 5.0` : t.defaultRating}
                </span>
              </div>
            </div>

            <div className="course-hero__actions">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-enroll-modal', { detail: { course: course.name } }))}
                className="btn btn-primary btn-lg course-hero__btn-enroll"
                id="course-detail-enroll"
              >
                {t.enrollPrefix} {course.name}
              </button>
              <a
                href={whatsapp(settings.contact.whatsapp, fill(t.whatsappMessage, { course: course.name }))}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg course-hero__btn-wa"
              >
                {t.whatsappLabel}
              </a>
            </div>
          </div>

          <div className="course-hero__visual">
            <div className="course-hero__img-card">
              <img
                src={course.image}
                alt={course.imageAlt || `${course.name} preparation at EDUZY`}
                className="course-hero__img"
                style={course.imagePosition ? { objectPosition: course.imagePosition } : undefined}
                loading="eager"
              />
              <div className="course-hero__img-overlay">
                <span className="course-hero__img-name">{course.name} Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Details Left, Sticky Enquiry Right */}
      <section className="course-detail-content">
        <div className="container course-layout-grid">
          <div className="course-layout-main">
            {/* 1. What You Will Learn */}
            {course.whatYouLearn && course.whatYouLearn.length > 0 && (
              <article className="course-info-card">
                <h2 className="course-section-title">{t.learnTitle}</h2>
                <div className="course-syllabus-grid">
                  {course.whatYouLearn.map((item, i) => (
                    <div key={i} className="course-syllabus-item">
                      <span className="course-syllabus-num">{i + 1}</span>
                      <p className="course-syllabus-text">{item}</p>
                    </div>
                  ))}
                </div>
              </article>
            )}

            {/* 2. Who Is This Course For? */}
            {course.whoIsItFor && course.whoIsItFor.length > 0 && (
              <article className="course-info-card">
                <h2 className="course-section-title">{t.whoTitle}</h2>
                <ul className="course-checklist">
                  {course.whoIsItFor.map((item, i) => (
                    <li key={i} className="course-checklist__item">
                      <span className="course-checklist__icon">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {/* Optional: Course benefits (Courses page settings → Show course benefits) */}
            {t.showBenefits && course.benefits && course.benefits.length > 0 && (
              <article className="course-info-card">
                <h2 className="course-section-title">{t.benefitsTitle}</h2>
                <ul className="course-checklist">
                  {course.benefits.map((item, i) => (
                    <li key={i} className="course-checklist__item">
                      <span className="course-checklist__icon">✓</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </article>
            )}

            {/* 3. Flexible Learning Modes */}
            {(t.modes || []).length > 0 && (
            <article className="course-info-card">
              <h2 className="course-section-title">{t.modesTitle}</h2>
              <div className="course-method-cards">
                {t.modes.map((mode: any, i: number) => (
                  <div className="method-box" key={i}>
                    <h4>
                      <CmsIcon name={mode.icon} fallback="Laptop" size={18} />
                      <span>{mode.title}</span>
                    </h4>
                    <p>
                      {mode.desc}
                    </p>
                  </div>
                ))}
              </div>
            </article>
            )}

            {/* Optional: Course gallery (only when images were added) */}
            {course.gallery && course.gallery.length > 0 && (
              <article className="course-info-card">
                <h2 className="course-section-title">{t.galleryTitle}</h2>
                <div className="course-gallery-grid">
                  {course.gallery.map((src: string, i: number) => (
                    <img key={i} src={src} alt={`${course.name} – photo ${i + 1}`} loading="lazy" />
                  ))}
                </div>
              </article>
            )}

            {/* 4. Student Review */}
            {displayedTestimonials.length > 0 && (
              <article className="course-info-card">
                <h2 className="course-section-title">{t.reviewTitle}</h2>
                <div className="course-testimonials-list">
                  {displayedTestimonials.slice(0, 1).map((t) => (
                    <div key={t.id} className="course-testi-box">
                      <div className="course-testi-header">
                        <div className="course-testi-avatar" style={{ backgroundColor: 'var(--color-primary)', overflow: 'hidden' }}>
                          {t.image ? <img src={t.image} alt={t.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : t.initials}
                        </div>
                        <div>
                          <strong className="course-testi-name">{t.name}</strong>
                          <div className="course-testi-role">{t.role} ({t.course})</div>
                        </div>
                        <div className="course-testi-stars">{'★'.repeat(Math.max(1, Math.min(5, Number(t.rating) || 5)))}</div>
                      </div>
                      <p className="course-testi-quote">&ldquo;{t.text}&rdquo;</p>
                    </div>
                  ))}
                </div>
              </article>
            )}
          </div>

          {/* Sticky Enquiry Sidebar */}
          <aside className="course-layout-sidebar">
            <div className="sticky-enquiry-box" id="enroll-form">
              <EnquiryForm
                preselectedCourse={course.name}
                title={`${t.enrollPrefix} ${course.name}`}
                subtitle={fill(t.enquirySubtitle, { course: course.name })}
              />
            </div>
          </aside>
        </div>
      </section>

      {/* 15. Final CTA */}
      <CTA />
    </main>
  );
}
