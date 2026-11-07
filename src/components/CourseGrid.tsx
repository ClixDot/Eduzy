'use client';
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from './CourseCard';
import { useSite } from '@/cms/site/ContentProvider';
import './CourseGrid.css';

export default function CourseGrid({ showAll = false, compact = false, courses: list = null as any[] | null, showFilter = true, initialCount = 6, loadMoreLabel = 'Load More Courses', viewAllLabel = 'View All Courses' }) {
  const site = useSite();
  const courses = list || site.courses;
  const INITIAL_COUNT = initialCount;
  const courseCategories = [{ id: 'all', label: site.coursesPage.allLabel }, ...site.courseCategories.map((c: any) => ({ id: c.slug, label: c.label }))]
    .filter((cat) => cat.id === 'all' || courses.some((c: any) => c.categories?.includes(cat.id)));
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sectionRef = useRef(null);

  const filtered = activeCategory === 'all'
    ? courses
    : courses.filter((c) => c.category === activeCategory || c.categories?.includes(activeCategory));

  const displayed = showAll ? filtered : filtered.slice(0, visibleCount);

  const handleCategoryChange = (catId) => {
    setActiveCategory(catId);
    setVisibleCount(INITIAL_COUNT);
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.querySelectorAll('.fade-up').forEach((el, i) => {
              setTimeout(() => el.classList.add('visible'), i * 80);
            });
          }
        });
      },
      { threshold: 0.05 }
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [displayed]);

  return (
    <div className="course-grid-wrapper" ref={sectionRef}>
      {/* Category filter */}
      {showFilter && (
      <div className="course-filter-wrapper">
        <div className="course-filter" role="tablist" aria-label="Filter courses by category">
          {courseCategories.map((cat) => (
            <button
              key={cat.id}
              role="tab"
              aria-selected={activeCategory === cat.id}
              className={`course-filter__btn ${activeCategory === cat.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
              id={`filter-${cat.id}`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>
      )}

      {/* Grid */}
      <div className={`course-grid ${compact ? 'course-grid--compact' : ''}`} role="list">
        {displayed.map((course, idx) => (
          <div key={course.id} className="fade-up course-grid__item" role="listitem">
            <CourseCard course={course} priority={idx < 4} />
          </div>
        ))}
      </div>

      {/* Load more / View all */}
      {!showAll && (
        <div className="course-grid__footer">
          {visibleCount < filtered.length ? (
            <button
              className="btn btn-outline"
              onClick={() => setVisibleCount((p) => p + 6)}
              id="load-more-courses"
            >
              {loadMoreLabel}
            </button>
          ) : (
            <Link to="/courses" className="btn btn-outline" id="view-all-courses">
              {viewAllLabel}
              <svg className="btn-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd"/>
              </svg>
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
