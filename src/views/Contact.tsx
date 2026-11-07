'use client';
import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, Mail, Clock, MapPin, MessageCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import CustomSelect from '../components/ui/CustomSelect';
import { useSite } from '@/cms/site/ContentProvider';
import { tel, whatsapp, fill } from '@/cms/site/helpers';
import '../components/EnquiryForm.css';
import '../components/site/SiteExtras.css';
import './Contact.css';

const emptyForm = { name: '', phone: '', location: '', topic: '', message: '' };

export default function Contact() {
  const { state } = useLocation();
  const { contact: page, settings } = useSite();
  const form = page.form;
  const c = settings.contact;
  const [formData, setFormData] = useState({
    ...emptyForm,
    message: state?.course ? `I am interested in: ${state.course}` : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [whatsappUrl, setWhatsappUrl] = useState('');

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = form.errors.name;
    if (!formData.phone.trim()) {
      errs.phone = form.errors.phone;
    } else if (!/^[0-9+\s-]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = form.errors.phoneInvalid;
    }
    if (!formData.location) errs.location = form.errors.location;
    if (!formData.topic) errs.topic = form.errors.topic;
    if (!formData.message.trim()) errs.message = form.errors.message;
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

    const text = [
      form.whatsappIntro,
      `Name: ${formData.name.trim()}`,
      `Phone: ${formData.phone.trim()}`,
      `Location: ${formData.location}`,
      `Topic: ${formData.topic}`,
      `Message: ${formData.message.trim()}`,
    ].join('\n');

    const url = whatsapp(c.whatsapp, text);
    setWhatsappUrl(url);
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleReset = () => {
    setFormData(emptyForm);
    setErrors({});
    setWhatsappUrl('');
  };

  return (
    <main className="contact-page" id="main-content">
      {/* Page Title */}
      <section className="contact-hero" aria-label="Contact Us">
        <div className="container">
          <h1 className="contact-hero__title">{page.pageTitle}</h1>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="contact-main" aria-label="Contact information and form">
        <div className="container contact-main__grid">
          <aside className="contact-card contact-info" id="contact-info">
            <h2 className="contact-info__title">{page.infoTitle}</h2>
            <p className="contact-info__text">
              {page.infoText}
            </p>

            <ul className="contact-info__list" role="list">
              <li className="contact-info__item">
                <Phone size={26} strokeWidth={1.75} className="contact-info__icon" aria-hidden="true" />
                <div>
                  <h3 className="contact-info__label">{page.phoneLabel}</h3>
                  <a href={tel(c.phone)} className="contact-info__value">{c.phoneDisplay}</a>
                </div>
              </li>
              <li className="contact-info__item">
                <Mail size={26} strokeWidth={1.75} className="contact-info__icon" aria-hidden="true" />
                <div>
                  <h3 className="contact-info__label">{page.emailLabel}</h3>
                  <a href={`mailto:${c.email}`} className="contact-info__value">{c.email}</a>
                </div>
              </li>
              {c.hours && (
              <li className="contact-info__item">
                <Clock size={26} strokeWidth={1.75} className="contact-info__icon" aria-hidden="true" />
                <div>
                  <h3 className="contact-info__label">{page.hoursLabel}</h3>
                  <span className="contact-info__value">{c.hours}</span>
                </div>
              </li>
              )}
              {c.address && (
              <li className="contact-info__item">
                <MapPin size={26} strokeWidth={1.75} className="contact-info__icon" aria-hidden="true" />
                <div>
                  <h3 className="contact-info__label">{page.locationLabel}</h3>
                  <span className="contact-info__value">{c.address}</span>
                </div>
              </li>
              )}
            </ul>
          </aside>

          <div className="contact-card contact-form-card" id="contact-form">
            <span className="eyebrow">{form.eyebrow}</span>
            <h2 className="contact-form-card__title">{form.title}</h2>
            <p className="contact-form-card__text">
              {form.text}
            </p>

            {whatsappUrl ? (
              <div className="enquiry-success" role="status" aria-live="polite">
                <CheckCircle2 size={44} className="enquiry-success__icon" />
                <h3 className="enquiry-success__title">{fill(form.successTitle, { name: formData.name.trim() })}</h3>
                <p className="enquiry-success__text">
                  {form.successText}
                </p>
                <div className="contact-success__actions">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    {form.againLabel}
                  </a>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleReset}>
                    {form.newLabel}
                  </button>
                </div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-form__row">
                  <div className="form-group">
                    <label htmlFor="contact-name" className="form-label">{form.nameLabel}</label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder={form.namePlaceholder}
                      className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-phone" className="form-label">{form.phoneLabel}</label>
                    <input
                      type="tel"
                      id="contact-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder={form.phonePlaceholder}
                      className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
                    />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="contact-form__row">
                  <div className="form-group">
                    <label htmlFor="contact-location" className="form-label">{form.locationLabel}</label>
                    <CustomSelect
                      id="contact-location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      options={form.locations}
                      placeholder={form.locationPlaceholder}
                      error={errors.location}
                      icon={MapPin}
                      menuTitle={form.locationsMenuTitle}
                    />
                    {errors.location && <span className="form-error">{errors.location}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-topic" className="form-label">{form.topicLabel}</label>
                    <CustomSelect
                      id="contact-topic"
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      options={form.topics}
                      placeholder={form.topicPlaceholder}
                      error={errors.topic}
                      icon={MessageCircle}
                      menuTitle={form.topicsMenuTitle}
                    />
                    {errors.topic && <span className="form-error">{errors.topic}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message" className="form-label">{form.messageLabel}</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder={form.messagePlaceholder}
                    className={`form-input contact-form__textarea ${errors.message ? 'is-invalid' : ''}`}
                  />
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </div>

                <button type="submit" className="btn btn-primary contact-form__submit" id="contact-submit-btn">
                  <span>{form.submitLabel}</span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* Optional map (Global Settings → Contact & social → Google Maps embed link) */}
      {c.mapUrl && /^https:\/\/(www\.)?google\.[a-z.]+\/maps\/embed/i.test(c.mapUrl) && (
        <section className="contact-map" aria-label={page.mapTitle}>
          <div className="container">
            {page.mapTitle && <h2 className="contact-map__title">{page.mapTitle}</h2>}
            <iframe className="contact-map__frame" src={c.mapUrl} title={page.mapTitle || 'Map'} loading="lazy" referrerPolicy="no-referrer-when-downgrade" allowFullScreen />
          </div>
        </section>
      )}
    </main>
  );
}
