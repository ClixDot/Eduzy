import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Clock } from 'lucide-react';
import './CourseCard.css';

export default function CourseCard({ course }) {
  return (
    <article className="course-card" aria-label={`${course.name} course`}>
      {/* Image Wrap */}
      <div className="course-card__img-wrap">
        <img
          src={course.image}
          alt={`${course.fullName} at EDUZY`}
          className="course-card__img"
          loading="lazy"
          width="400"
          height="240"
        />
      </div>

      {/* Body */}
      <div className="course-card__body">
        <div className="course-card__meta">
          <span className="course-card__duration">
            <Clock size={14} />
            {course.duration}
          </span>
          <span className="course-card__format">{course.format}</span>
        </div>

        <h3 className="course-card__name">{course.name}</h3>
        <p className="course-card__desc">{course.shortDesc}</p>

        {/* Footer */}
        <div className="course-card__footer">
          <Link
            to={`/courses/${course.slug}`}
            className="course-card__btn"
            id={`course-view-${course.slug}`}
          >
            <span>Explore Course</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </article>
  );
}
