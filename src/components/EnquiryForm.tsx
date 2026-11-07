'use client';
import React, { useState } from 'react';
import { CheckCircle2, MessageCircle, Phone } from 'lucide-react';
import CustomSelect from './ui/CustomSelect';
import { useSite } from '@/cms/site/ContentProvider';
import { tel, whatsapp, fill } from '@/cms/site/helpers';
import './EnquiryForm.css';

export default function EnquiryForm({
  preselectedCourse = '',
  title = undefined as string | undefined,
  subtitle = undefined as string | undefined,
}) {
  const { contact, settings, courses } = useSite();
  const t = contact.enquiry;
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    course: preselectedCourse || '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
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

  // successText supports {course} and {phone}, rendered in bold like the original design
  const successParts = String(t.successText || '').split(/(\{course\}|\{phone\})/);

  return (
    <div className="enquiry-card" id="enquiry-form">
      <div className="enquiry-card__header">
        <h3 className="enquiry-card__title">{title ?? t.title}</h3>
        <p className="enquiry-card__subtitle">{subtitle ?? t.subtitle}</p>
      </div>

      {submitted ? (
        <div className="enquiry-success" role="status" aria-live="polite">
          <CheckCircle2 size={44} className="enquiry-success__icon" />
          <h4 className="enquiry-success__title">{fill(t.successTitle, { name: formData.name })}</h4>
          <p className="enquiry-success__text">
            {successParts.map((part, i) =>
              part === '{course}' ? <strong key={i}>{formData.course}</strong> : part === '{phone}' ? <strong key={i}>{formData.phone}</strong> : part,
            )}
          </p>
          <button className="btn btn-outline btn-sm" onClick={handleReset}>
            {t.anotherLabel}
          </button>
        </div>
      ) : (
        <form className="enquiry-form" onSubmit={handleSubmit} noValidate>
          {/* Name */}
          <div className="form-group">
            <label htmlFor="enquiry-name" className="form-label">
              {t.nameLabel}
            </label>
            <input
              type="text"
              id="enquiry-name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder={t.namePlaceholder}
              className={`form-input ${errors.name ? 'is-invalid' : ''}`}
            />
            {errors.name && <span className="form-error">{errors.name}</span>}
          </div>

          {/* Phone */}
          <div className="form-group">
            <label htmlFor="enquiry-phone" className="form-label">
              {t.phoneLabel}
            </label>
            <input
              type="tel"
              id="enquiry-phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder={t.phonePlaceholder}
              className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
            />
            {errors.phone && <span className="form-error">{errors.phone}</span>}
          </div>

          {/* Course Select */}
          <div className="form-group">
            <label htmlFor="enquiry-course" className="form-label">
              {t.courseLabel}
            </label>
            <CustomSelect
              id="enquiry-course"
              name="course"
              value={formData.course}
              onChange={handleChange}
              options={courses}
              placeholder={t.coursePlaceholder}
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
            {loading ? t.submittingLabel : t.submitLabel}
          </button>
        </form>
      )}

      {/* Quick Direct Contact */}
      <div className="enquiry-card__direct">
        <span className="enquiry-card__direct-label">{t.directLabel}</span>
        <div className="enquiry-card__direct-actions">
          <a
            href={whatsapp(settings.contact.whatsapp, t.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="enquiry-pill enquiry-pill--wa"
          >
            <MessageCircle size={15} />
            <span>{t.whatsappLabel}</span>
          </a>
          <a
            href={tel(settings.contact.phone)}
            className="enquiry-pill enquiry-pill--phone"
          >
            <Phone size={15} />
            <span>{t.callLabel}</span>
          </a>
        </div>
      </div>
    </div>
  );
}
