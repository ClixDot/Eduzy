import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, ArrowUp } from 'lucide-react';
import './Footer.css';

const popularCourses = [
  { name: 'Digital Marketing', slug: 'digital-marketing' },
  { name: 'Influencer Marketing', slug: 'influencer-marketing' },
  { name: 'Entrepreneurship', slug: 'entrepreneurship' },
  { name: 'Business Development', slug: 'business-development' },
];

const quickLinks = [
  { label: 'Home', to: '/' },
  { label: 'All Courses', to: '/courses' },
  { label: 'Success Portfolio', to: '/portfolio' },
];

const currentYear = new Date().getFullYear();

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="footer" role="contentinfo">
      <div className="container footer__container">
        {/* Main 4-Column Grid */}
        <div className="footer__grid">
          {/* Column 1: Brand & Socials */}
          <div className="footer__col footer__col--brand">
            <Link to="/" className="footer__logo" aria-label="EDUZY Home">
              <span className="footer__logo-mark">E</span>
              <div className="footer__logo-text">
                <span className="footer__logo-title">EDUZY</span>
                <span className="footer__logo-sub">Global Academy • Aluva</span>
              </div>
            </Link>

            <p className="footer__brand-desc">
              Industry-led executive programs in digital marketing, creator growth, and business leadership in Aluva, Kochi.
            </p>

            <div className="footer__socials" aria-label="Follow EDUZY on social media">
              <a 
                href="https://facebook.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer__social-btn" 
                aria-label="Facebook"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/>
                </svg>
              </a>
              <a 
                href="https://instagram.com" 
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
              <a 
                href="https://youtube.com" 
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
              <a 
                href="https://wa.me/919747944374" 
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
          </div>

          {/* Column 2: Quick Links */}
          <div className="footer__col">
            <h4 className="footer__heading">Navigation</h4>
            <ul className="footer__links">
              {quickLinks.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="footer__link">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Popular Courses */}
          <div className="footer__col">
            <h4 className="footer__heading">Top Programs</h4>
            <ul className="footer__links">
              {popularCourses.map((c) => (
                <li key={c.slug}>
                  <Link to={`/courses/${c.slug}`} className="footer__link">
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact & Location */}
          <div className="footer__col footer__col--contact">
            <h4 className="footer__heading">Contact Campus</h4>
            
            <div className="footer__contact-simple">
              <div className="footer__contact-row">
                <MapPin size={17} className="footer__contact-icon" />
                <span>Opp. Metro Pillar 75, Pulinchod, Aluva, Kochi</span>
              </div>

              <div className="footer__contact-row">
                <Phone size={17} className="footer__contact-icon" />
                <div className="footer__phones">
                  <a href="tel:+919747944374">+91 97479 44374</a>
                  <span className="footer__phone-sep">/</span>
                  <a href="tel:+919633133374">+91 96331 33374</a>
                </div>
              </div>

              <div className="footer__contact-row">
                <Mail size={17} className="footer__contact-icon" />
                <a href="mailto:info@eduzy.com">info@eduzy.com</a>
              </div>

              <div className="footer__contact-row">
                <Clock size={17} className="footer__contact-icon" />
                <span>Mon &ndash; Sat: 9:00 AM &ndash; 6:00 PM</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Sub-Footer Bar */}
        <div className="footer__bottom">
          <p className="footer__copyright">
            &copy; {currentYear} <strong>EDUZY Global Academy</strong>. All Rights Reserved.
            <span className="footer__powered-sep">&bull;</span>
            <span className="footer__powered-text">
              Powered by{' '}
              <a 
                href="https://clixdot.com" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="footer__clixdot-link"
              >
                Clixdot
              </a>
            </span>
          </p>

          <div className="footer__legal">
            <Link to="/">Privacy Policy</Link>
            <span className="footer__dot">•</span>
            <Link to="/">Terms &amp; Conditions</Link>
            <span className="footer__dot">•</span>
            <Link to="/">Sitemap</Link>
          </div>

          <button 
            type="button" 
            onClick={scrollToTop} 
            className="footer__back-top" 
            aria-label="Back to top"
            title="Scroll to top"
          >
            <span>Back to top</span>
            <ArrowUp size={15} />
          </button>
        </div>
      </div>
    </footer>
  );
}
