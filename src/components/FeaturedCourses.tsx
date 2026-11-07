'use client';
import React from 'react';
import CourseGrid from './CourseGrid';
import { useSite } from '@/cms/site/ContentProvider';
import { spaced } from '@/cms/site/helpers';

/** Optional home page section built on the existing CourseGrid component. */
export default function FeaturedCourses() {
  const { featuredCourses: fc, courses } = useSite();
  const list = fc.mode === 'featured' ? courses.filter((c: any) => c.featured) : courses;
  if (!list.length) return null;
  return (
    <section className="section" id="featured-courses" aria-label="Featured courses">
      <div className="container">
        <div className="text-center" style={{ marginBottom: 32 }}>
          <h2 className="section-title">
            {spaced(fc.titleStart)}<span className="highlight-orange">{fc.titleHighlight}</span>
          </h2>
          {fc.subtitle && <p className="section-subtitle">{fc.subtitle}</p>}
        </div>
        <CourseGrid courses={list} showFilter={fc.showFilter} initialCount={Number(fc.initialCount) || 6} loadMoreLabel={fc.loadMoreLabel} viewAllLabel={fc.viewAllLabel} />
      </div>
    </section>
  );
}
