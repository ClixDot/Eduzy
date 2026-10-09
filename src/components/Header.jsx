import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Phone } from 'lucide-react';
import EnrollModal from './EnrollModal';
import './Header.css';

const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Courses', to: '/courses' },
  { label: 'Portfolio', to: '/portfolio' },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [enrollModalOpen, setEnrollModalOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const location = useLocation();
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleOpen = (e) => {
      setSelectedCourse(e.detail?.course || '');
      setEnrollModalOpen(true);
    };
    window.addEventListener('open-enroll-modal', handleOpen);
    return () => window.removeEventListener('open-enroll-modal', handleOpen);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useEffect(() => {
    setMenuOpen(false);
  }, [location.pathname]);

  const handleNavClick = (e, to) => {
    setMenuOpen(false);
    if (to.startsWith('/#')) {
      e.preventDefault();
      const id = to.replace('/#', '');
      const el = document.getElementById(id);
      if (el) {
        const headerHeight = 70;
        const top = el.getBoundingClientRect().top + window.scrollY - headerHeight;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    }
  };

  const handleEnrollClick = (e) => {
    if (e) e.preventDefault();
    setMenuOpen(false);
    setEnrollModalOpen(true);
  };

  const isActive = (to) => {
    if (to === '/') return location.pathname === '/';
    return location.pathname.startsWith(to.split('#')[0]) && to !== '/';
  };

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`} role="banner">
        <div className="header__inner container">
          {/* Logo */}
          <Link to="/" className="header__logo" aria-label="EDUZY - Home">
            <div className="header__logo-text">
              <span className="header__logo-name">EDUZY</span>
              <span className="header__logo-tagline">Excellence in Education</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="header__nav" role="navigation" aria-label="Main navigation">
            <ul className="header__nav-list" role="list">
              {navLinks.map((link) => (
                <li key={link.to} className="header__nav-item">
                  <Link
                    to={link.to}
                    className={`header__nav-link ${isActive(link.to) ? 'active' : ''}`}
                    onClick={(e) => handleNavClick(e, link.to)}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Desktop CTA */}
          <div className="header__actions">
            <button
              type="button"
              onClick={handleEnrollClick}
              className="header__enroll-btn"
              id="header-enroll-btn"
              aria-label="Enroll Now"
            >
              <span className="header__enroll-glow" aria-hidden="true" />
              <span className="header__enroll-shimmer" aria-hidden="true" />
              <span className="header__enroll-text">Enroll Now</span>
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            type="button"
            className={`header__hamburger ${menuOpen ? 'open' : ''}`}
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label={menuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={menuOpen}
            id="mobile-menu-hamburger"
          >
            <span className="header__hamburger-line"></span>
            <span className="header__hamburger-line"></span>
            <span className="header__hamburger-line"></span>
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`mobile-menu-overlay ${menuOpen ? 'open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu Drawer */}
      <nav
        ref={menuRef}
        className={`mobile-menu ${menuOpen ? 'open' : ''}`}
        role="navigation"
        aria-label="Mobile navigation"
        aria-hidden={!menuOpen}
      >
        <div className="mobile-menu__header">
          <Link to="/" className="header__logo" onClick={() => setMenuOpen(false)}>
            <div className="header__logo-text">
              <span className="header__logo-name">EDUZY</span>
              <span className="header__logo-tagline">Excellence in Education</span>
            </div>
          </Link>
          <button 
            type="button" 
            className="mobile-menu__close" 
            onClick={() => setMenuOpen(false)} 
            aria-label="Close menu"
          >
            ✕
          </button>
        </div>

        <ul className="mobile-menu__list" role="list">
          {navLinks.map((link, i) => (
            <li key={link.to} style={{ animationDelay: `${i * 0.05}s` }}>
              <Link
                to={link.to}
                className={`mobile-menu__link ${isActive(link.to) ? 'active' : ''}`}
                onClick={(e) => handleNavClick(e, link.to)}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="mobile-menu__footer">
          <button
            type="button"
            className="header__enroll-btn mobile-enroll-btn"
            onClick={handleEnrollClick}
            aria-label="Enroll Now"
          >
            <span className="header__enroll-glow" aria-hidden="true" />
            <span className="header__enroll-shimmer" aria-hidden="true" />
            <span className="header__enroll-text">Enroll Now</span>
          </button>
          <a href="tel:+919747944374" className="btn btn-outline mobile-menu__tel" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Phone size={15} />
            <span>Call Us</span>
          </a>
        </div>
      </nav>

      {/* Global Enrollment Modal */}
      <EnrollModal
        isOpen={enrollModalOpen}
        onClose={() => setEnrollModalOpen(false)}
        initialCourse={selectedCourse}
      />
    </>
  );
}
