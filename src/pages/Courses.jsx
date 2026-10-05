import React, { useState, useMemo, useEffect } from 'react';
import { gsap, ScrollTrigger } from '../utils/gsapSetup';
import { courses, courseCategories } from '../data/courses';
import CourseCard from '../components/CourseCard';
import EnquiryForm from '../components/EnquiryForm';
import CTA from '../components/CTA';
import './Courses.css';

export default function Courses() {
  const [selectedCategory, setSelectedCategory] = useState('all');

  const filteredCourses = useMemo(() => {
    if (selectedCategory === 'all') return courses;
    return courses.filter((c) => c.category === selectedCategory);
  }, [selectedCategory]);

  useEffect(() => {
    gsap.fromTo(
      '.course-card',
      { y: 35, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.08, duration: 0.6, ease: 'power2.out' }
    );
  }, [filteredCourses]);

  return (
    <main className="courses-page" id="main-content">
      {/* Clean Header / Hero */}
      <section className="courses-hero">
        <div className="container text-center">
          <h1 className="courses-hero__title">
            Explore All <span className="highlight-orange">Courses</span>
          </h1>

          <p className="courses-hero__subtitle">
            Industry-led executive programs in digital marketing, creator growth, and business leadership.
          </p>

          {/* Simple Category Filter */}
          <div className="course-filter-wrapper">
            <div className="course-filter" role="tablist" aria-label="Course categories">
              {courseCategories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`course-filter__btn ${isActive ? 'active' : ''}`}
                    onClick={() => setSelectedCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* Course List */}
      <section className="courses-catalog-section">
        <div className="container">
          <div className="course-grid">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </div>
      </section>

      {/* Advisory Enquiry Form */}
      <section className="courses-advisory-section">
        <div className="container" style={{ maxWidth: '580px' }}>
          <EnquiryForm
            title="Need Help Choosing a Course?"
            subtitle="Leave your details and our team will get in touch with you."
          />
        </div>
      </section>

      <CTA />
    </main>
  );
}
