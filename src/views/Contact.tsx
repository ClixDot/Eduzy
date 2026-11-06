'use client';
import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Phone, Mail, Clock, MapPin, MessageCircle, CheckCircle2, ArrowUpRight } from 'lucide-react';
import CustomSelect from '../components/ui/CustomSelect';
import '../components/EnquiryForm.css';
import './Contact.css';

const WHATSAPP_NUMBER = '916235210100';

const locations = ['Thrissur', 'Palakkad', 'Kannur', 'Trivandrum', 'Calicut', 'Kochi', 'Idukki'];

const topics = [
  'Admissions & Courses',
  'Fees & Payments',
  'Classes & Batches',
  'Certificates',
  'Placement Support',
  'Other',
];

const emptyForm = { name: '', phone: '', location: '', topic: '', message: '' };

export default function Contact() {
  const { state } = useLocation();
  const [formData, setFormData] = useState({
    ...emptyForm,
    message: state?.course ? `I am interested in: ${state.course}` : '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [whatsappUrl, setWhatsappUrl] = useState('');

  useEffect(() => {
    document.title = 'Contact Us | EDUZY Global Academy';
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!formData.name.trim()) errs.name = 'Full name is required';
    if (!formData.phone.trim()) {
      errs.phone = 'Phone number is required';
    } else if (!/^[0-9+\s-]{8,15}$/.test(formData.phone.trim())) {
      errs.phone = 'Please enter a valid phone number';
    }
    if (!formData.location) errs.location = 'Please select a location';
    if (!formData.topic) errs.topic = 'Please select a topic';
    if (!formData.message.trim()) errs.message = 'Please tell us how we can help';
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
      'Hello EDUZY, I would like to get in touch.',
      `Name: ${formData.name.trim()}`,
      `Phone: ${formData.phone.trim()}`,
      `Location: ${formData.location}`,
      `Topic: ${formData.topic}`,
      `Message: ${formData.message.trim()}`,
    ].join('\n');

    const url = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
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
          <h1 className="contact-hero__title">Contact Us</h1>
        </div>
      </section>

      {/* Contact Information & Form */}
      <section className="contact-main" aria-label="Contact information and form">
        <div className="container contact-main__grid">
          <aside className="contact-card contact-info" id="contact-info">
            <h2 className="contact-info__title">Contact Information</h2>
            <p className="contact-info__text">
              Have questions about admissions, fees, classes, or placements? Our team is ready to help you choose the right path.
            </p>

            <ul className="contact-info__list" role="list">
              <li className="contact-info__item">
                <Phone size={26} strokeWidth={1.75} className="contact-info__icon" aria-hidden="true" />
                <div>
                  <h3 className="contact-info__label">Phone Number</h3>
                  <a href="tel:+916235210100" className="contact-info__value">+91 62352 10100</a>
                </div>
              </li>
              <li className="contact-info__item">
                <Mail size={26} strokeWidth={1.75} className="contact-info__icon" aria-hidden="true" />
                <div>
                  <h3 className="contact-info__label">Email Address</h3>
                  <a href="mailto:eduzycampus@gmail.com" className="contact-info__value">eduzycampus@gmail.com</a>
                </div>
              </li>
              <li className="contact-info__item">
                <Clock size={26} strokeWidth={1.75} className="contact-info__icon" aria-hidden="true" />
                <div>
                  <h3 className="contact-info__label">Opening Hours</h3>
                  <span className="contact-info__value">Mon &ndash; Sat: 9:00 AM &ndash; 6:00 PM</span>
                </div>
              </li>
              <li className="contact-info__item">
                <MapPin size={26} strokeWidth={1.75} className="contact-info__icon" aria-hidden="true" />
                <div>
                  <h3 className="contact-info__label">Our Location</h3>
                  <span className="contact-info__value">Thrissur, Palakkad, Kannur, Trivandrum, Calicut, Kochi, Idukki</span>
                </div>
              </li>
            </ul>
          </aside>

          <div className="contact-card contact-form-card" id="contact-form">
            <span className="eyebrow">Get In Touch</span>
            <h2 className="contact-form-card__title">Send Us a Message</h2>
            <p className="contact-form-card__text">
              Fill in your details and they will open in WhatsApp, ready to send to our team.
            </p>

            {whatsappUrl ? (
              <div className="enquiry-success" role="status" aria-live="polite">
                <CheckCircle2 size={44} className="enquiry-success__icon" />
                <h3 className="enquiry-success__title">Almost Done, {formData.name.trim()}!</h3>
                <p className="enquiry-success__text">
                  Press send in WhatsApp to deliver your message to our team.
                </p>
                <div className="contact-success__actions">
                  <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    Open WhatsApp Again
                  </a>
                  <button type="button" className="btn btn-outline btn-sm" onClick={handleReset}>
                    New Message
                  </button>
                </div>
              </div>
            ) : (
              <form className="contact-form" onSubmit={handleSubmit} noValidate>
                <div className="contact-form__row">
                  <div className="form-group">
                    <label htmlFor="contact-name" className="form-label">Full Name</label>
                    <input
                      type="text"
                      id="contact-name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="e.g. Sandra Joseph"
                      className={`form-input ${errors.name ? 'is-invalid' : ''}`}
                    />
                    {errors.name && <span className="form-error">{errors.name}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-phone" className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      id="contact-phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 98765 43210"
                      className={`form-input ${errors.phone ? 'is-invalid' : ''}`}
                    />
                    {errors.phone && <span className="form-error">{errors.phone}</span>}
                  </div>
                </div>

                <div className="contact-form__row">
                  <div className="form-group">
                    <label htmlFor="contact-location" className="form-label">Location</label>
                    <CustomSelect
                      id="contact-location"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      options={locations}
                      placeholder="Choose location"
                      error={errors.location}
                      icon={MapPin}
                      menuTitle="Our Locations"
                    />
                    {errors.location && <span className="form-error">{errors.location}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="contact-topic" className="form-label">Topic</label>
                    <CustomSelect
                      id="contact-topic"
                      name="topic"
                      value={formData.topic}
                      onChange={handleChange}
                      options={topics}
                      placeholder="Choose topic"
                      error={errors.topic}
                      icon={MessageCircle}
                      menuTitle="Topics"
                    />
                    {errors.topic && <span className="form-error">{errors.topic}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="contact-message" className="form-label">Message</label>
                  <textarea
                    id="contact-message"
                    name="message"
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Tell us how we can help"
                    className={`form-input contact-form__textarea ${errors.message ? 'is-invalid' : ''}`}
                  />
                  {errors.message && <span className="form-error">{errors.message}</span>}
                </div>

                <button type="submit" className="btn btn-primary contact-form__submit" id="contact-submit-btn">
                  <span>Send on WhatsApp</span>
                  <ArrowUpRight size={18} aria-hidden="true" />
                </button>
              </form>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
