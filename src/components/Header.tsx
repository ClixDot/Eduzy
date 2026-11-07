'use client';
import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Phone } from 'lucide-react';
import { useSite } from '@/cms/site/ContentProvider';
import { tel } from '@/cms/site/helpers';
import './Header.css';

export default function Header() {
  const { header, settings } = useSite();
  const navLinks = (header.navItems || []).filter((l: any) => l.visible !== false).map((l: any) => ({ label: l.label, to: l.url }));
  const logoSrc = header.logo || settings.logo;
  const logoAlt = header.logoAlt || settings.logoAlt;
  const ctaUrl = header.ctaUrl || '/contact';
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const handleOpen = (e) => {
      navigate('/contact', { state: { course: e.detail?.course || '' } });
    };
    window.addEventListener('open-enroll-modal', handleOpen);
    return () => window.removeEventListener('open-enroll-modal', handleOpen);
  }, [navigate]);

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

  const handleNavClick = (e: any, to: string) => {
    if (document.activeElement && typeof (document.activeElement as HTMLElement).blur === 'function') {
      (document.activeElement as HTMLElement).blur();
    }
    setMenuOpen(false);
    if (to === '/courses') {
      sessionStorage.removeItem('edozy_active_course_category');
    }
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

  const handleEnrollClick = (e?: any) => {
    if (e) e.preventDefault();
    setMenuOpen(false);
    if (/^https?:/i.test(ctaUrl)) window.open(ctaUrl, '_blank', 'noopener,noreferrer');
    else navigate(ctaUrl);
  };

  const isActive = (to: string) => {
    if (to === '/') return location.pathname === '/';
    if (to === '/blogs') return location.pathname === '/blogs' || location.pathname === '/portfolio';
    return location.pathname.startsWith(to.split('#')[0]) && to !== '/';
  };

  if (header.visible === false) return null;

  return (
    <>
      <header className={`header ${scrolled ? 'header--scrolled' : ''}`} role="banner">
        <div className="header__inner container">
          {/* Logo */}
          <Link to="/" className="header__logo" aria-label={logoAlt}>
            <img src={logoSrc} alt={logoAlt} className="header__logo-img" />
          </Link>

          {/* Desktop Nav */}
          <nav className="header__nav" role="navigation" aria-label="Main navigation">
            <ul className="header__nav-list" role="list">
              {navLinks.map((link) => (
                <li key={link.to + link.label} className="header__nav-item">
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
            {header.showCta && (
            <button
              type="button"
              onClick={handleEnrollClick}
              className="header__enroll-btn"
              id="header-enroll-btn"
              aria-label={header.ctaLabel}
            >
              <span className="header__enroll-glow" aria-hidden="true" />
              <span className="header__enroll-shimmer" aria-hidden="true" />
              <span className="header__enroll-text">{header.ctaLabel}</span>
            </button>
            )}
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
        inert={!menuOpen ? true : undefined}
      >
        <div className="mobile-menu__header">
          <Link to="/" className="header__logo" onClick={() => setMenuOpen(false)} aria-label={logoAlt}>
            <img src={logoSrc} alt={logoAlt} className="header__logo-img" />
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
            <li key={link.to + link.label} style={{ animationDelay: `${i * 0.05}s` }}>
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
          {header.showCta && (
          <button
            type="button"
            className="header__enroll-btn mobile-enroll-btn"
            onClick={handleEnrollClick}
            aria-label={header.ctaLabel}
          >
            <span className="header__enroll-glow" aria-hidden="true" />
            <span className="header__enroll-shimmer" aria-hidden="true" />
            <span className="header__enroll-text">{header.ctaLabel}</span>
          </button>
          )}
          {header.showMobileCall && (
          <a href={tel(settings.contact.phone)} className="btn btn-outline mobile-menu__tel" style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Phone size={15} />
            <span>{header.mobileCallLabel}</span>
          </a>
          )}
        </div>
      </nav>
    </>
  );
}
