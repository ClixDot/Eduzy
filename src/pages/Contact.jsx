import React, { useEffect, useRef } from 'react';
import { MapPin, Phone, MessageCircle, Clock, Mail } from 'lucide-react';
import { gsap } from '../utils/gsapSetup';
import EnquiryForm from '../components/EnquiryForm';
import FAQ from '../components/FAQ';
import CTA from '../components/CTA';
import './Contact.css';

export default function Contact() {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from('.contact-hero > *', {
        y: 30,
        opacity: 0,
        stagger: 0.1,
        duration: 0.75,
        ease: 'power3.out',
      });

      gsap.from('.contact-info-col', {
        x: -35,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        delay: 0.2,
      });

      gsap.from('.contact-form-col', {
        x: 35,
        opacity: 0,
        duration: 0.85,
        ease: 'power3.out',
        delay: 0.2,
      });
    }, el);

    return () => ctx.revert();
  }, []);

  return (
    <main className="contact-page" id="main-content" ref={containerRef}>
      {/* 1. Clean Hero */}
      <section className="contact-hero">
        <div className="container text-center">
          <h1 className="contact-hero__title">
            Get in <span className="highlight-orange">Touch</span>
          </h1>
          <p className="contact-hero__subtitle">
            Visit our campus in Aluva, Kochi, or connect with our advisors for personalized guidance.
          </p>
        </div>
      </section>

      {/* 2. Contact Cards & Form */}
      <section className="contact-main-section">
        <div className="container contact-grid">
          {/* Left Info Column */}
          <div className="contact-info-col">
            <div className="contact-info-card">
              <div className="contact-info-header">
                <h2 className="contact-info-title">Academy Information</h2>
                <p className="contact-info-desc">
                  We welcome prospective students and parents for campus visits and counseling sessions.
                </p>
              </div>

              <div className="contact-details-list">
                {/* Location */}
                <div className="contact-detail-item">
                  <div className="contact-detail-icon" aria-hidden="true">
                    <MapPin size={20} />
                  </div>
                  <div className="contact-detail-content">
                    <span className="contact-detail-label">Campus Address</span>
                    <p className="contact-detail-val">
                      Near Pulinchod Metro Station,<br />
                      Opposite Metro Pillar No. 75,<br />
                      Aluva, Kochi, Kerala 683106
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="contact-detail-item">
                  <div className="contact-detail-icon" aria-hidden="true">
                    <Phone size={20} />
                  </div>
                  <div className="contact-detail-content">
                    <span className="contact-detail-label">Phone Numbers</span>
                    <div className="contact-detail-links">
                      <a href="tel:+919747944374">+91 97479 44374</a>
                      <span className="contact-detail-sep">&bull;</span>
                      <a href="tel:+919633133374">+91 96331 33374</a>
                    </div>
                  </div>
                </div>

                {/* WhatsApp */}
                <div className="contact-detail-item">
                  <div className="contact-detail-icon contact-detail-icon--whatsapp" aria-hidden="true">
                    <MessageCircle size={20} />
                  </div>
                  <div className="contact-detail-content">
                    <span className="contact-detail-label">WhatsApp Helpline</span>
                    <div className="contact-detail-links">
                      <a
                        href="https://wa.me/919747944374?text=Hello%20EDUZY%2C%20I%20want%20to%20enquire%20about%20admissions"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="whatsapp-link"
                      >
                        Chat with an Advisor &rarr;
                      </a>
                    </div>
                  </div>
                </div>

                {/* Email */}
                <div className="contact-detail-item">
                  <div className="contact-detail-icon" aria-hidden="true">
                    <Mail size={20} />
                  </div>
                  <div className="contact-detail-content">
                    <span className="contact-detail-label">Email Address</span>
                    <div className="contact-detail-links">
                      <a href="mailto:info@eduzy.com">info@eduzy.com</a>
                    </div>
                  </div>
                </div>

                {/* Working Hours */}
                <div className="contact-detail-item">
                  <div className="contact-detail-icon" aria-hidden="true">
                    <Clock size={20} />
                  </div>
                  <div className="contact-detail-content">
                    <span className="contact-detail-label">Working Hours</span>
                    <p className="contact-detail-val">
                      Mon &ndash; Sat: 9:00 AM &ndash; 6:00 PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Form Column */}
          <div className="contact-form-col">
            <EnquiryForm
              title="Send Us a Message"
              subtitle="Have questions about batch dates, fees, or modules? Leave your details below."
            />
          </div>
        </div>
      </section>

      {/* 3. Google Maps Section */}
      <section className="map-section" aria-label="Campus Location Map">
        <div className="container">
          <div className="text-center" style={{ marginBottom: '28px' }}>
            <h2 className="section-title">Easily Accessible Location</h2>
            <p className="section-subtitle">
              Conveniently located opposite Pulinchod Metro Station (Pillar No. 75), Aluva.
            </p>
          </div>

          <div className="map-wrapper">
            <iframe
              title="EDUZY Location Map"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3928.5376512398544!2d76.3475878!3d10.1017424!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3b080f5ecad59195%3A0xe543fa0f671c6dc3!2sPulinchodu%20Metro%20Station!5e0!3m2!1sen!2sin!4v1700000000000!5m2!1sen!2sin"
              width="100%"
              height="380"
              style={{ border: 0, borderRadius: '18px' }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </section>

      {/* 4. FAQs */}
      <FAQ />

      {/* 5. CTA */}
      <CTA />
    </main>
  );
}
