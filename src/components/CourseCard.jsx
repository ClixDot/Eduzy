import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import './CourseCard.css';

export default function CourseCard({ course }) {
  const hasDuration = Boolean(course.duration);
  const hasFormat = Boolean(course.format);

  return (
    <article className="course-card" aria-label={`${course.name} course`}>
      {/* 1. Thumbnail */}
      <Link
        to={`/courses/${course.slug}`}
        className="course-card__img-link"
        tabIndex="-1"
        aria-hidden="true"
      >
        <div className="course-card__img-wrap">
          <img
            src={course.image}
            alt={`${course.fullName || course.name} at EDUZY`}
            className="course-card__img"
            loading="lazy"
            width="480"
            height="300"
          />
        </div>
      </Link>

      {/* Body */}
      <div className="course-card__body">
        {/* 2 & 3. Duration & Online/Offline Format (only when verified) */}
        <div className="course-card__meta">
          {hasDuration ? (
            <span className="course-card__duration">
              <Clock size={14} aria-hidden="true" />
              <span>{course.duration}</span>
            </span>
          ) : (
            <span className="course-card__meta-spacer" aria-hidden="true" />
          )}

          {hasFormat ? (
            <span className="course-card__format">{course.format}</span>
          ) : (
            <span className="course-card__meta-spacer" aria-hidden="true" />
          )}
        </div>

        {/* 4. Course Title */}
        <h3 className="course-card__name">
          <Link to={`/courses/${course.slug}`} className="course-card__title-link">
            {course.name}
          </Link>
        </h3>

        {/* 5. Short Professional Description */}
        <p className="course-card__desc">{course.shortDesc}</p>

        {/* 6. Action Button */}
        <div className="course-card__footer">
          <Link
            to={`/courses/${course.slug}`}
            className="course-card__btn"
            id={`course-view-${course.slug}`}
            aria-label={`Explore ${course.name} course`}
          >
            <span>Explore Course</span>
            <ArrowRight size={15} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}
