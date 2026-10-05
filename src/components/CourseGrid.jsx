import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { courses, courseCategories } from '../data/courses';
import CourseCard from './CourseCard';
import './CourseGrid.css';

const INITIAL_COUNT = 6;

export default function CourseGrid({ showAll = false, compact = false }) {
  const [activeCategory, setActiveCategory] = useState('all');
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const sectionRef = useRef(null);

  const filtered = activeCategory === 'all'
    ? courses
    : courses.filter((c) => c.category === activeCategory);

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

      {/* Grid */}
      <div className={`course-grid ${compact ? 'course-grid--compact' : ''}`} role="list">
        {displayed.map((course) => (
          <div key={course.id} className="fade-up course-grid__item" role="listitem">
            <CourseCard course={course} />
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
              Load More Courses
            </button>
          ) : (
            <Link to="/courses" className="btn btn-outline" id="view-all-courses">
              View All Courses
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
