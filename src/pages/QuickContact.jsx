import React, { useEffect, useRef } from 'react';
import { Phone, ArrowRight } from 'lucide-react';
import { gsap } from '../utils/gsapSetup';
import './QuickContact.css';

export default function QuickContact() {
  const containerRef = useRef(null);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    document.title = 'Connect With Us | EDUZY Global Academy';

    const el = containerRef.current;
    if (!el) return;

    const ctx = gsap.context(() => {
      gsap.from('.quick-contact-card', {
        y: 30,
        opacity: 0,
        scale: 0.96,
        duration: 0.65,
        ease: 'power3.out',
      });

      gsap.from('.quick-channel-item', {
        y: 20,
        opacity: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: 'power3.out',
        delay: 0.15,
      });
    }, el);

    return () => ctx.revert();
  }, []);

  const channels = [
    {
      id: 'whatsapp',
      name: 'WhatsApp',
      subtitle: 'Chat with our advisor',
      href: 'https://wa.me/919747944374?text=Hello%20EDUZY%2C%20I%20want%20to%20enquire%20about%20admissions',
      isExternal: true,
      cardClass: 'quick-channel--whatsapp',
      iconClass: 'quick-channel__icon-box--whatsapp',
      arrowClass: 'quick-channel__arrow--whatsapp',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.99 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.53 7.03C9.36 7.03 9.08 7.09 8.84 7.35C8.6 7.61 7.92 8.25 7.92 9.55C7.92 10.85 8.87 12.11 9 12.28C9.13 12.46 10.74 14.94 13.2 16C13.79 16.25 14.24 16.41 14.6 16.52C15.19 16.71 15.73 16.68 16.16 16.62C16.64 16.55 17.63 16.02 17.84 15.43C18.04 14.84 18.04 14.34 17.98 14.23C17.92 14.12 17.76 14.06 17.51 13.93C17.27 13.81 16.08 13.22 15.86 13.14C15.64 13.06 15.48 13.01 15.31 13.26C15.15 13.51 14.69 14.06 14.54 14.23C14.4 14.39 14.25 14.41 14.01 14.29C13.77 14.17 12.98 13.91 12.05 13.08C11.33 12.43 10.84 11.63 10.7 11.39C10.56 11.14 10.69 11.01 10.81 10.89C10.92 10.78 11.06 10.6 11.18 10.45C11.3 10.31 11.35 10.2 11.43 10.04C11.51 9.87 11.47 9.73 11.41 9.61C11.35 9.48 10.86 8.28 10.66 7.78C10.46 7.3 10.26 7.36 10.11 7.35C9.97 7.35 9.8 7.34 9.64 7.34L9.53 7.03Z" />
        </svg>
      ),
    },
    {
      id: 'instagram',
      name: 'Instagram',
      subtitle: 'Follow our updates',
      href: 'https://instagram.com',
      isExternal: true,
      cardClass: 'quick-channel--instagram',
      iconClass: 'quick-channel__icon-box--instagram',
      arrowClass: 'quick-channel__arrow--instagram',
      icon: (
        <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      id: 'youtube',
      name: 'YouTube',
      subtitle: 'Watch our videos',
      href: 'https://youtube.com',
      isExternal: true,
      cardClass: 'quick-channel--youtube',
      iconClass: 'quick-channel__icon-box--youtube',
      arrowClass: 'quick-channel__arrow--youtube',
      icon: (
        <svg viewBox="0 0 24 24" width="30" height="30" aria-hidden="true">
          <path
            fill="#ffffff"
            d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"
          />
          <polygon
            fill="#EF4444"
            points="9.75,15.02 15.5,12 9.75,8.98"
          />
        </svg>
      ),
    },
    {
      id: 'call',
      name: 'Call Now',
      subtitle: 'Speak directly with us',
      href: 'tel:+919747944374',
      isExternal: false,
      cardClass: 'quick-channel--call',
      iconClass: 'quick-channel__icon-box--call',
      arrowClass: 'quick-channel__arrow--call',
      icon: (
        <Phone size={26} strokeWidth={2.4} fill="currentColor" aria-hidden="true" />
      ),
    },
  ];

  const [youtubeComingSoon, setYoutubeComingSoon] = React.useState(false);
  const youtubeTimerRef = useRef(null);

  const handleChannelClick = (e, channel) => {
    if (channel.id === 'youtube') {
      e.preventDefault();
      setYoutubeComingSoon(true);
      if (youtubeTimerRef.current) clearTimeout(youtubeTimerRef.current);
      youtubeTimerRef.current = setTimeout(() => {
        setYoutubeComingSoon(false);
      }, 3200);
    }
  };

  return (
    <main className="quick-contact-page" id="main-content" ref={containerRef}>
      <div className="quick-contact-page__backdrop" aria-hidden="true" />

      <div className="container quick-contact-page__container">
        {/* Central Card container */}
        <div className="quick-contact-card" role="region" aria-label="Connect With Us Options">
          <div className="quick-contact-card__header">
            <h1 className="quick-contact-card__title">Connect With Us</h1>
            <p className="quick-contact-card__subtitle">
              Choose your preferred channel to get in touch instantly.
            </p>
          </div>

          {/* YouTube Coming Soon Banner */}
          {youtubeComingSoon && (
            <div className="quick-contact__notice" role="status" aria-live="polite">
              <span>🎬 YouTube Channel Coming Soon!</span>
            </div>
          )}

          <div className="quick-channels-list" role="list">
            {channels.map((channel) => (
              <a
                key={channel.id}
                href={channel.id === 'youtube' ? '#youtube-coming-soon' : channel.href}
                onClick={(e) => handleChannelClick(e, channel)}
                target={channel.id === 'youtube' ? undefined : (channel.isExternal ? '_blank' : undefined)}
                rel={channel.id === 'youtube' ? undefined : (channel.isExternal ? 'noopener noreferrer' : undefined)}
                className={`quick-channel-item ${channel.cardClass} ${channel.id === 'youtube' && youtubeComingSoon ? 'coming-soon-active' : ''}`}
                role="listitem"
                aria-label={channel.id === 'youtube' && youtubeComingSoon ? 'YouTube - Coming Soon' : `${channel.name} - ${channel.subtitle}`}
                id={`quick-channel-${channel.id}`}
              >
                <div className="quick-channel-item__left">
                  <div className={`quick-channel__icon-box ${channel.iconClass}`}>
                    {channel.icon}
                  </div>
                  <div className="quick-channel__text-group">
                    <span className="quick-channel__name">{channel.name}</span>
                    <span className="quick-channel__sub">
                      {channel.id === 'youtube' && youtubeComingSoon
                        ? '✨ Launching Soon! Stay tuned'
                        : channel.subtitle}
                    </span>
                  </div>
                </div>

                {channel.id === 'youtube' && youtubeComingSoon ? (
                  <span className="quick-channel__coming-soon-pill" aria-hidden="true">
                    Coming Soon
                  </span>
                ) : (
                  <div className={`quick-channel__arrow-btn ${channel.arrowClass}`} aria-hidden="true">
                    <ArrowRight size={18} strokeWidth={2.5} />
                  </div>
                )}
              </a>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
