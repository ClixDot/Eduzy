'use client';
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowUp, ChevronDown, ChevronUp } from 'lucide-react';
import { useSite } from '@/cms/site/ContentProvider';
import { tel, whatsapp, isExternal } from '@/cms/site/helpers';
import './Footer.css';

const currentYear = new Date().getFullYear();

export default function Footer() {
  const [showAllPrograms, setShowAllPrograms] = useState(false);
  const { footer, settings, courses } = useSite();
  const contact = settings.contact;
  const social = settings.social;
  const quickLinks = (footer.navLinks || []).map((l: any) => ({ label: l.label, to: l.url }));
  const popularCourses: { name: string; href: string }[] =
    footer.programsSource === 'custom'
      ? (footer.customPrograms || []).map((p: any) => ({ name: p.label, href: p.url }))
      : courses.map((c: any) => ({ name: c.name, href: `/courses/${c.slug}` }));
  const initialCount = Math.max(1, Number(footer.programsInitialCount) || 4);
  const displayedCourses = showAllPrograms ? popularCourses : popularCourses.slice(0, initialCount);
  const logoSrc = footer.logo || settings.logo;
  const ext = (url: string) => (isExternal(url) ? { target: '_blank', rel: 'noopener noreferrer' } : {});

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (footer.visible === false) return null;

  return (
    <footer className="footer" id="site-footer" role="contentinfo">
      <div className="container footer__container">
        {footer.cta?.enabled && footer.cta.heading && (
          <div className="footer__cta-strip">
            <p className="footer__cta-heading">{footer.cta.heading}</p>
            {footer.cta.buttonLabel && footer.cta.buttonUrl && (
              <a href={footer.cta.buttonUrl} className="btn btn-primary" {...ext(footer.cta.buttonUrl)}>
                {footer.cta.buttonLabel}
              </a>
            )}
          </div>
        )}

        {/* Main 4-Column Grid */}
        <div className="footer__grid">
          {/* Column 1: Brand & Socials */}
          <div className="footer__col footer__col--brand">
            <Link to="/" className="footer__logo" aria-label={settings.logoAlt}>
              <img src={logoSrc} alt={settings.logoAlt} className="footer__logo-img" />
            </Link>

            <p className="footer__brand-desc">
              {footer.description}
            </p>

            {footer.showSocials && (
            <div className="footer__socials" aria-label="Follow EDUZY on social media">
              {social.facebook && (
              <a
                href={social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-btn"
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              )}
              {social.instagram && (
              <a
                href={social.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-btn"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                </svg>
              </a>
              )}
              {social.youtube && (
              <a
                href={social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-btn"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.33z"/>
                  <polygon points="9.75 15.02 15.5 11.75 9.75 8.48 9.75 15.02" fill="#ffffff"/>
                </svg>
              </a>
              )}
              {social.linkedin && (
              <a href={social.linkedin} target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="LinkedIn">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9h4v12H3zM9 9h3.8v1.7h.05c.53-1 1.83-2.05 3.77-2.05C20.6 8.65 21 11.2 21 14.5V21h-4v-5.8c0-1.4-.03-3.2-1.95-3.2-1.95 0-2.25 1.52-2.25 3.1V21H9z"/>
                </svg>
              </a>
              )}
              {social.twitter && (
              <a href={social.twitter} target="_blank" rel="noopener noreferrer" className="footer__social-btn" aria-label="X">
                <svg viewBox="0 0 24 24" width="15" height="15" fill="currentColor">
                  <path d="M18.9 2H22l-7.6 8.7L23 22h-6.8l-5.3-6.9L4.8 22H1.7l8.1-9.3L1 2h7l4.8 6.3zm-1.2 18h1.9L7.4 3.9H5.4z"/>
                </svg>
              </a>
              )}
              <a
                href={whatsapp(contact.whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="footer__social-btn footer__social-btn--wa"
                aria-label="WhatsApp"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.669-.699c.969.54 1.772.82 2.791.82 3.181 0 5.767-2.586 5.768-5.766 0-3.18-2.586-5.767-5.768-5.767zm3.376 8.163c-.143.402-.83.743-1.15.789-.32.046-.737.07-2.127-.492-1.782-.72-2.915-2.518-3.003-2.637-.089-.118-.725-.964-.725-1.839s.457-1.306.62-1.484c.162-.178.355-.223.473-.223.118 0 .237.001.341.006.109.005.255-.042.399.305.148.355.503 1.229.548 1.317.045.089.074.193.015.312-.059.118-.089.193-.178.297-.089.104-.187.232-.267.311-.089.089-.182.186-.078.364.104.178.462.763.992 1.236.684.609 1.261.798 1.439.887.178.089.282.074.386-.045.104-.118.445-.519.564-.697.118-.178.237-.148.399-.089.163.059 1.036.489 1.214.578.178.089.297.133.341.208.045.074.045.431-.098.833z"/>
                </svg>
              </a>
            </div>
            )}
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer__col">
            <h4 className="footer__heading">{footer.navHeading}</h4>
            <ul className="footer__links">
              {quickLinks.map((link: any) => (
                <li key={link.label + link.to}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Popular Courses */}
          <div className="footer__col">
            <h4 className="footer__heading">{footer.programsHeading}</h4>
            <ul className="footer__links">
              {displayedCourses.map((c) => (
                <li key={c.href + c.name} className="footer__link-item">
                  <Link to={c.href} className="footer__link">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>

            {popularCourses.length > initialCount && (
              <button
                type="button"
                className="footer__view-more-btn"
                onClick={() => setShowAllPrograms(!showAllPrograms)}
                aria-expanded={showAllPrograms}
              >
                <span>{showAllPrograms ? 'View Less' : 'View More'}</span>
                {showAllPrograms ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
              </button>
            )}
          </div>

          {/* Column 4: Contact & Location */}
          <div className="footer__col footer__col--contact">
            <h4 className="footer__heading">{footer.contactHeading}</h4>

            <div className="footer__contact-simple">
              {contact.address && (
              <div className="footer__contact-row">
                <MapPin size={17} className="footer__contact-icon" />
                <span>{contact.address}</span>
              </div>
              )}

              <div className="footer__contact-row">
                <Phone size={17} className="footer__contact-icon" />
                <div className="footer__phones">
                  <a href={tel(contact.phone)}>{contact.phoneDisplay}</a>
                </div>
              </div>

              <div className="footer__contact-row">
                <Mail size={17} className="footer__contact-icon" />
                <a href={`mailto:${contact.email}`}>{contact.email}</a>
              </div>

              {contact.hours && (
              <div className="footer__contact-row">
                <Clock size={17} className="footer__contact-icon" />
                <span>{contact.hours}</span>
              </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {currentYear} <strong>{footer.copyrightName}</strong>. {footer.copyrightSuffix}
            {footer.showPoweredBy && footer.poweredByLabel && (
              <>
                <span className="footer__powered-sep">&bull;</span>
                <span className="footer__powered-text">
                  Powered by{' '}
                  <a
                    href={footer.poweredByUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="footer__clixdot-link"
                    title={footer.poweredByLabel}
                  >
                    {footer.poweredByLabel}
                  </a>
                </span>
              </>
            )}
          </p>

          <div className="footer__legal">
            {(footer.legalLinks || []).map((l: any, i: number) => (
              <React.Fragment key={i}>
                {i > 0 && <span className="footer__dot">•</span>}
                <Link to={l.url}>{l.label}</Link>
              </React.Fragment>
            ))}
          </div>

          <button
            type="button"
            onClick={scrollToTop}
            className="footer__back-top"
            aria-label="Back to top"
            title="Scroll to top"
          >
            <span>{footer.backToTopLabel}</span>
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}
