import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, MessageCircle, Phone } from 'lucide-react';
import { courses } from '../data/courses';
import './EnrollModal.css';

export default function EnrollModal({ isOpen, onClose, initialCourse = '' }) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    course: initialCourse || '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (initialCourse) {
      setFormData((prev) => ({ ...prev, course: initialCourse }));
    }
  }, [initialCourse]);

  // Lock background scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e) => {
        if (e.key === 'Escape') onClose();
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Please enter your full name';
    if (!formData.phone.trim()) {
      errs.phone = 'Please enter your phone number';
    } else if (!/^[0-9+\s-]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!formData.course) {
      errs.course = 'Please select a program';
    }
    return errs;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 700);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      course: initialCourse || '',
    });
    setSubmitted(false);
    setErrors({});
  };

  return (
    <div className="enroll-modal" role="dialog" aria-modal="true" aria-labelledby="enroll-modal-title">
      <div className="enroll-modal__backdrop" onClick={onClose} />

      <div className="enroll-modal__dialog">
        <button
          type="button"
          className="enroll-modal__close"
          onClick={onClose}
          aria-label="Close enrollment form"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="enroll-modal__success" role="status" aria-live="polite">
            <CheckCircle2 size={52} className="enroll-modal__success-icon" />
            <h3 className="enroll-modal__success-title">Enrollment Request Received!</h3>
            <p className="enroll-modal__success-desc">
              Thank you, <strong>{formData.name}</strong>. We have received your application for{' '}
              <strong>{formData.course}</strong>. Our admissions counselor will contact you at{' '}
              <strong>{formData.phone}</strong> with batch timings and fee details.
            </p>
            <div className="enroll-modal__success-actions">
              <button
                type="button"
                className="btn btn-primary btn-sm"
                onClick={onClose}
              >
                Done
              </button>
              <button
                type="button"
                className="btn btn-outline btn-sm"
                onClick={handleReset}
              >
                Submit Another Request
              </button>
            </div>
          </div>
        ) : (
          <div className="enroll-modal__body">
            <div className="enroll-modal__header">
              <span className="enroll-modal__badge">Admissions Open</span>
              <h2 className="enroll-modal__title" id="enroll-modal-title">
                Enroll at <span className="highlight-orange">EDUZY</span>
              </h2>
              <p className="enroll-modal__subtitle">
                Fill in your details below and our academic advisor will connect with you to confirm your seat.
              </p>
            </div>

            <form className="enroll-modal__form" onSubmit={handleSubmit} noValidate>
              {/* Full Name */}
              <div className="enroll-form-group">
                <label htmlFor="modal-name" className="enroll-form-label">
                  Full Name
                </label>
                <input
                  type="text"
                  id="modal-name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Sandra Joseph"
                  className={`enroll-form-input ${errors.name ? 'is-invalid' : ''}`}
                  autoFocus
                />
                {errors.name && <span className="enroll-form-error">{errors.name}</span>}
              </div>

              {/* Phone Number */}
              <div className="enroll-form-group">
                <label htmlFor="modal-phone" className="enroll-form-label">
                  Phone Number
                </label>
                <input
                  type="tel"
                  id="modal-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="+91 98765 43210"
                  className={`enroll-form-input ${errors.phone ? 'is-invalid' : ''}`}
                />
                {errors.phone && <span className="enroll-form-error">{errors.phone}</span>}
              </div>

              {/* Course Selection */}
              <div className="enroll-form-group">
                <label htmlFor="modal-course" className="enroll-form-label">
                  Select Program
                </label>
                <select
                  id="modal-course"
                  name="course"
                  value={formData.course}
                  onChange={handleChange}
                  className={`enroll-form-select ${errors.course ? 'is-invalid' : ''}`}
                >
                  <option value="">-- Choose a course --</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.name}>
                      {c.name}
                    </option>
                  ))}
                </select>
                {errors.course && <span className="enroll-form-error">{errors.course}</span>}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="btn btn-primary enroll-modal__submit-btn"
                disabled={loading}
                id="modal-submit-enroll-btn"
              >
                {loading ? 'Submitting Application...' : 'Confirm Enrollment'}
              </button>
            </form>

            {/* Direct Instant Contact */}
            <div className="enroll-modal__footer">
              <span className="enroll-modal__footer-text">Or reach admissions directly:</span>
              <div className="enroll-modal__direct-links">
                <a
                  href="https://wa.me/919747944374?text=Hello%20EDUZY%2C%20I%20would%20like%20to%20enroll%20in%20a%20course"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="enroll-modal__pill enroll-modal__pill--wa"
                >
                  <MessageCircle size={15} />
                  <span>WhatsApp</span>
                </a>
                <a
                  href="tel:+919747944374"
                  className="enroll-modal__pill enroll-modal__pill--phone"
                >
                  <Phone size={15} />
                  <span>Call: +91 97479 44374</span>
                </a>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
