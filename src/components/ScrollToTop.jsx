import { useLayoutEffect, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { ScrollTrigger } from '../utils/gsapSetup';

export default function ScrollToTop() {
  const { pathname, search, hash } = useLocation();

  // 1. Disable browser's native scroll restoration to prevent fighting SPA navigation
  useEffect(() => {
    if (typeof window !== 'undefined' && 'scrollRestoration' in window.history) {
      window.history.scrollRestoration = 'manual';
    }
  }, []);

  // 2. Synchronous pre-paint reset on every route change
  useLayoutEffect(() => {
    // If a hash is provided (e.g. /#about), handle target element scrolling
    if (hash) {
      const id = hash.replace('#', '');
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
        return;
      }
    }

    const resetScroll = () => {
      const html = document.documentElement;
      const prevBehavior = html ? html.style.scrollBehavior : '';

      // Temporarily override CSS scroll-behavior: smooth to avoid delayed/sluggish scroll reset
      if (html) {
        html.style.scrollBehavior = 'auto';
      }

      try {
        window.scrollTo({
          top: 0,
          left: 0,
          behavior: 'auto',
        });
      } catch {
        window.scrollTo(0, 0);
      }

      if (html) {
        html.scrollTop = 0;
      }
      if (document.body) {
        document.body.scrollTop = 0;
      }

      // Restore original scroll behavior
      if (html) {
        html.style.scrollBehavior = prevBehavior;
      }
    };

    // Execute immediately before browser paint
    resetScroll();

    // Secondary reset on next animation frame to guarantee zero-scroll after React commits DOM
    const rafId = requestAnimationFrame(() => {
      resetScroll();
      if (typeof ScrollTrigger !== 'undefined' && ScrollTrigger.refresh) {
        ScrollTrigger.refresh();
      }
    });

    return () => cancelAnimationFrame(rafId);
  }, [pathname, search]);

  return null;
}

