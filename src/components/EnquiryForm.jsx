import React, { useState } from 'react';
import { courses } from '../data/courses';
import { CheckCircle2, MessageCircle, Phone } from 'lucide-react';
import CustomSelect from './ui/CustomSelect';
import './EnquiryForm.css';

export default function EnquiryForm({ 
  preselectedCourse = '', 
  title = 'Need Help Choosing a Course?', 
  subtitle = 'Leave your details and our academic advisor will connect with you.' 
}) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    course: preselectedCourse || '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!formData.course) {
      errs.course = 'Please select a course';
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
    }, 800);
  };

  const handleReset = () => {
    setFormData({
      name: '',
      phone: '',
      course: preselectedCourse || '',
    });
    setSubmitted(false);
    setErrors({});
  };

  return (
    <div className="enquiry-card" id="enquiry-form">
      <div className="enquiry-card__header">
        <h3 className="enquiry-card__title">{title}</h3>
        <p className="enquiry-card__subtitle">{subtitle}</p>
      </div>

      {submitted ? (
        <div className="enquiry-success" role="status" aria-live="polite">
          <CheckCircle2 size={44} className="enquiry-success__icon" />
          <h4 className="enquiry-success__title">Thank You, {formData.name}!</h4>
          <p className="enquiry-success__text">
            Your enquiry for <strong>{formData.course}</strong> has been received. We will call you shortly at <strong>{formData.phone}</strong>.
          </p>
          <button className="btn btn-outline btn-sm" onClick={handleReset}>
            Submit Another Enquiry
          </button>
        </div>
      ) : (
        <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="enquiry-name" className="form-label">
              Full Name
            </label>
            <input
              type="text"
              id="enquiry-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Sandra Joseph"
              className={`form-input ${errors.name ? 'is-invalid' : ''}`}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="enquiry-phone" className="form-label">
              Phone Number
            </label>
            <input
              type="tel"
              id="enquiry-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="+91 98765 43210"
              className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          {/* Course Select */}
          <div className="form-group">
            <label htmlFor="enquiry-course" className="form-label">
              Select Course
            </label>
            <CustomSelect
              id="enquiry-course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              options={courses}
              placeholder="-- Choose a course --"
              error={errors.course}
            />
            {errors.course && <span className="form-error">{errors.course}</span>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn btn-primary btn-submit"
            disabled={loading}
            id="enquiry-submit-btn"
          >
            {loading ? 'Submitting...' : 'Submit Enquiry'}
          </button>
        </form>
      )}

      {/* Quick Direct Contact */}
      <div className="enquiry-card__direct">
        <span className="enquiry-card__direct-label">Or reach us directly</span>
        <div className="enquiry-card__direct-actions">
          <a
            href="https://wa.me/919747944374?text=Hello%20EDUZY%2C%20I%20would%20like%20to%20enquire%20about%20your%20courses"
            target="_blank"
            rel="noopener noreferrer"
            className="enquiry-pill enquiry-pill--wa"
          >
            <MessageCircle size={15} />
            <span>WhatsApp Us</span>
          </a>
          <a
            href="tel:+919747944374"
            className="enquiry-pill enquiry-pill--phone"
          >
            <Phone size={15} />
            <span>Call Now</span>
          </a>
        </div>
      </div>
    </div>
  );
}
