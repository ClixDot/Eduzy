import React from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Clock, Globe, Star, Laptop, Building2 } from 'lucide-react';
import { courses } from '../data/courses';
import testimonials from '../data/testimonials';
import faqs from '../data/faqs';
import EnquiryForm from '../components/EnquiryForm';
import CTA from '../components/CTA';
import './CourseDetails.css';

export default function CourseDetails() {
  const { courseSlug } = useParams();

  const course = courses.find(
    (c) => c.slug.toLowerCase() === courseSlug?.toLowerCase()
  );

  if (!course) {
    return <Navigate to="/courses" replace />;
  }

  // Find testimonials relevant to this course or fallback
  const courseTestimonials = testimonials.filter(
    (t) => t.course.toLowerCase().includes(course.name.toLowerCase()) || course.name.toLowerCase().includes(t.course.toLowerCase())
  );
  const displayedTestimonials = courseTestimonials.length > 0 ? courseTestimonials : testimonials.slice(0, 2);

  // Relevant FAQs
  const relevantFaqs = faqs.slice(0, 4);

  return (
    <main className="course-detail-page" id="main-content">
      {/* 1. Breadcrumbs */}
      <nav className="breadcrumb-nav" aria-label="Breadcrumb">
        <div className="container breadcrumb-inner">
          <Link to="/">Home</Link>
          <span className="breadcrumb-sep">/</span>
          <Link to="/courses">Courses</Link>
          <span className="breadcrumb-sep">/</span>
          <span className="breadcrumb-current" aria-current="page">{course.name}</span>
        </div>
      </nav>

      {/* 2. Course Hero */}
      <section className="course-hero">
        <div className="container course-hero__inner">
          <div className="course-hero__content">
            <div className="course-hero__badges">
              <span className="course-hero__cat-badge">{course.category.toUpperCase()}</span>
              {course.badge && <span className="badge badge-orange">{course.badge}</span>}
            </div>

            <h1 className="course-hero__title">
              {course.fullName || course.name}
            </h1>

            <p className="course-hero__desc">
              {course.description}
            </p>

            <div className="course-hero__highlights">
              <div className="course-hero__meta-card">
                <span className="course-hero__meta-label">Duration</span>
                <span className="course-hero__meta-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Clock size={16} /> {course.duration}
                </span>
              </div>
              <div className="course-hero__meta-card">
                <span className="course-hero__meta-label">Training Format</span>
                <span className="course-hero__meta-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Globe size={16} /> {course.format}
                </span>
              </div>
              <div className="course-hero__meta-card">
                <span className="course-hero__meta-label">Rating</span>
                <span className="course-hero__meta-val" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <Star size={16} /> {course.rating} / 5.0
                </span>
              </div>
            </div>

            <div className="course-hero__actions">
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent('open-enroll-modal', { detail: { course: course.name } }))}
                className="btn btn-primary btn-lg"
                id="course-detail-enroll"
              >
                Enroll in {course.name}
              </button>
              <a
                href={`https://wa.me/919747944374?text=Hi%2C%20I%20would%20like%20more%20information%20about%20the%20${encodeURIComponent(course.name)}%20course`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-outline btn-lg"
              >
                Chat on WhatsApp
              </a>
            </div>
          </div>

          <div className="course-hero__visual">
            <div className="course-hero__img-card">
              <img
                src={course.image}
                alt={`${course.name} preparation at EDUZY`}
                className="course-hero__img"
                loading="eager"
              />
              <div className="course-hero__img-overlay">
                <span className="course-hero__img-icon">{course.icon}</span>
                <span className="course-hero__img-name">{course.name} Excellence</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Grid: Details Left, Sticky Enquiry Right */}
      <section className="section bg-light-orange">
        <div className="container course-layout-grid">
          <div className="course-layout-main">
            {/* 1. What You Will Learn */}
            {course.whatYouLearn && course.whatYouLearn.length > 0 && (
              <article className="course-info-card">
                <h2 className="course-section-title">What You Will Learn</h2>
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
                <h2 className="course-section-title">Who Is This Course For?</h2>
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

            {/* 3. Flexible Learning Modes */}
            <article className="course-info-card">
              <h2 className="course-section-title">Flexible Learning Modes</h2>
              <div className="course-method-cards">
                <div className="method-box">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Laptop size={18} />
                    <span>Online Live Interactive</span>
                  </h4>
                  <p>
                    Live Zoom lectures with real-time mentor corrections, doubt resolution, and full recording access.
                  </p>
                </div>
                <div className="method-box">
                  <h4 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Building2 size={18} />
                    <span>Classroom Coaching</span>
                  </h4>
                  <p>
                    In-person training near Pulinchod Metro, Aluva with dedicated quiet study spaces and on-site mock tests.
                  </p>
                </div>
              </div>
            </article>

            {/* 4. Student Review */}
            {displayedTestimonials.length > 0 && (
              <article className="course-info-card">
                <h2 className="course-section-title">Student Review</h2>
                <div className="course-testimonials-list">
                  {displayedTestimonials.slice(0, 1).map((t) => (
                    <div key={t.id} className="course-testi-box">
                      <div className="course-testi-header">
                        <div className="course-testi-avatar" style={{ backgroundColor: t.color }}>{t.initials}</div>
                        <div>
                          <strong>{t.name}</strong>
                          <div className="course-testi-role">{t.role} ({t.course})</div>
                        </div>
                        <div className="course-testi-stars">★★★★★</div>
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
                title={`Enroll in ${course.name}`}
                subtitle={`Secure your seat for the upcoming ${course.name} batch at EDUZY.`}
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
