import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams, useLocation } from 'react-router-dom';
import { gsap } from '../utils/gsapSetup';
import { courses, courseCategories } from '../data/courses';
import CourseCard from '../components/CourseCard';
import EnquiryForm from '../components/EnquiryForm';
import CTA from '../components/CTA';
import './Courses.css';

export default function Courses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const location = useLocation();

  const validCategoryIds = useMemo(() => new Set(courseCategories.map((c) => c.id)), []);

  const getInitialCategory = () => {
    // 1. From URL query param
    const paramCat = searchParams.get('category');
    if (paramCat && validCategoryIds.has(paramCat)) {
      return paramCat;
    }
    // 2. From router location state
    if (location.state?.fromCategory && validCategoryIds.has(location.state.fromCategory)) {
      return location.state.fromCategory;
    }
    if (location.state?.category && validCategoryIds.has(location.state.category)) {
      return location.state.category;
    }
    // 3. From session storage (e.g., if user backed out from a course details page)
    const storedCat = sessionStorage.getItem('edozy_active_course_category');
    if (storedCat && validCategoryIds.has(storedCat)) {
      return storedCat;
    }
    return 'all';
  };

  const [selectedCategory, setSelectedCategory] = useState(getInitialCategory);

  // Sync state if searchParams or session changes
  useEffect(() => {
    const paramCat = searchParams.get('category');
    if (paramCat && validCategoryIds.has(paramCat)) {
      if (paramCat !== selectedCategory) {
        setSelectedCategory(paramCat);
      }
    } else if (!paramCat) {
      const storedCat = sessionStorage.getItem('edozy_active_course_category');
      if (storedCat && validCategoryIds.has(storedCat) && storedCat !== selectedCategory) {
        setSelectedCategory(storedCat);
        setSearchParams({ category: storedCat }, { replace: true });
      }
    }
  }, [searchParams, validCategoryIds, selectedCategory, setSearchParams]);

  const handleSelectCategory = useCallback((catId) => {
    setSelectedCategory(catId);
    if (catId === 'all') {
      const newParams = new URLSearchParams(searchParams);
      newParams.delete('category');
      setSearchParams(newParams, { replace: true });
      sessionStorage.removeItem('edozy_active_course_category');
    } else {
      const newParams = new URLSearchParams(searchParams);
      newParams.set('category', catId);
      setSearchParams(newParams, { replace: true });
      sessionStorage.setItem('edozy_active_course_category', catId);
    }
  }, [searchParams, setSearchParams]);

  // Compute displayed list with 05. Designing category heading
  const displayItems = useMemo(() => {
    if (selectedCategory === 'all') {
      const items = [];
      let designingHeaderAdded = false;

      courses.forEach((course) => {
        // Add Designing category heading before 03.1
        if (course.isUnderDesigningCategory && !designingHeaderAdded) {
          items.push({
            type: 'heading',
            id: 'category-heading-designing',
            categoryTitle: 'Designing',
            badge: '03. Designing',
            subtitle: 'Specialized creative programs in fashion, interior spaces, and visual digital arts.',
          });
          designingHeaderAdded = true;
        }
        items.push({ type: 'course', ...course });
      });

      return items;
    }

    if (selectedCategory === 'designing') {
      const items = [
        {
          type: 'heading',
          id: 'category-heading-designing',
          categoryTitle: 'Designing',
          badge: '03. Designing',
          subtitle: 'Specialized creative programs in fashion, interior spaces, and visual digital arts.',
        },
      ];

      courses
        .filter((c) => c.category === 'designing')
        .forEach((course) => {
          items.push({ type: 'course', ...course });
        });

      return items;
    }

    // Filter by specific category without changing original order
    const filtered = courses.filter((c) => {
      if (c.category === selectedCategory) return true;
      if (Array.isArray(c.categories) && c.categories.includes(selectedCategory)) return true;
      return false;
    });

    return filtered.map((course) => ({ type: 'course', ...course }));
  }, [selectedCategory]);

  useEffect(() => {
    gsap.fromTo(
      '.course-card',
      { y: 24, opacity: 0 },
      { y: 0, opacity: 1, stagger: 0.05, duration: 0.45, ease: 'power2.out' }
    );
  }, [selectedCategory]);

  // Scroll active tab into view in horizontal filter tab bar
  useEffect(() => {
    const activeTabEl = document.getElementById(`filter-tab-${selectedCategory}`);
    if (activeTabEl) {
      activeTabEl.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  }, [selectedCategory]);

  return (
    <main className="courses-page" id="main-content">
      {/* 1. Header / Hero Section */}
      <section className="courses-hero" aria-label="Course Explorer Hero">
        <div className="container text-center courses-hero__container">
          <h1 className="courses-hero__title">
            Explore All <span className="highlight-orange">Courses</span>
          </h1>

          <p className="courses-hero__subtitle">
            Industry-focused programs designed to develop professional skills and prepare learners for career opportunities.
          </p>

          {/* Functional Category Filter matching reference screenshot */}
          <div className="course-filter-wrapper">
            <div className="course-filter" role="tablist" aria-label="Course categories">
              {courseCategories.map((cat) => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    role="tab"
                    id={`filter-tab-${cat.id}`}
                    aria-selected={isActive}
                    aria-controls="courses-catalog-grid"
                    className={`course-filter__btn ${isActive ? 'active' : ''}`}
                    onClick={() => handleSelectCategory(cat.id)}
                  >
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Course Catalog Section */}
      <section className="courses-catalog-section" aria-label="Available Courses Catalog">
        <div className="container">
          <div className="course-grid" id="courses-catalog-grid">
            {displayItems.map((item) => {
              if (item.type === 'heading') {
                return (
                  <div
                    key={item.id}
                    className="course-category-banner"
                    role="region"
                    aria-label={item.categoryTitle}
                  >
                    <div className="course-category-banner__tag">
                      <span className="course-category-banner__indicator" aria-hidden="true" />
                      <span>{item.badge}</span>
                    </div>
                    <h2 className="course-category-banner__title">{item.categoryTitle}</h2>
                    <p className="course-category-banner__desc">{item.subtitle}</p>
                  </div>
                );
              }

              return <CourseCard key={item.id} course={item} />;
            })}
          </div>
        </div>
      </section>

      {/* 3. Advisory Enquiry Form */}
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
