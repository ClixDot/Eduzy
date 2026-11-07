'use client';
import React, { useCallback, useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useSite } from '@/cms/site/ContentProvider';
import { isExternal } from '@/cms/site/helpers';
import './SiteExtras.css';

const read = (store: 'session' | 'local', key: string) => {
  try {
    return (store === 'session' ? sessionStorage : localStorage).getItem(key);
  } catch {
    return null;
  }
};
const write = (store: 'session' | 'local', key: string, v: string) => {
  try {
    (store === 'session' ? sessionStorage : localStorage).setItem(key, v);
  } catch {
    /* storage blocked */
  }
};

/** Optional site-wide announcement bar (Global Settings → Announcement & popup). */
export function AnnouncementBar() {
  const { settings } = useSite();
  const a = settings.announcement || {};
  const sig = `${a.text}|${a.linkUrl}`;
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    setHidden(a.dismissible && read('session', 'eduzy_announcement_closed') === sig);
  }, [sig, a.dismissible]);

  const show = a.enabled && a.text && !hidden;
  useEffect(() => {
    document.documentElement.classList.toggle('has-announcement', !!show);
    return () => document.documentElement.classList.remove('has-announcement');
  }, [show]);

  if (!show) return null;
  return (
    <div className="site-announcement" role="region" aria-label="Announcement">
      <p className="site-announcement__text">
        {a.text}
        {a.linkUrl && a.linkLabel && (
          <a href={a.linkUrl} className="site-announcement__link" {...(isExternal(a.linkUrl) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
            {a.linkLabel}
          </a>
        )}
      </p>
      {a.dismissible && (
        <button type="button" className="site-announcement__close" aria-label="Close announcement" onClick={() => { write('session', 'eduzy_announcement_closed', sig); setHidden(true); }}>
          <X size={16} />
        </button>
      )}
    </div>
  );
}

/** Optional popup (Global Settings → Announcement & popup). Never shown inside the admin preview. */
export function SitePopup() {
  const { settings, preview } = useSite();
  const p = settings.popup || {};
  const [open, setOpen] = useState(false);
  const sig = `${p.title}|${p.message}`;

  const enabled = !!p.enabled && !!(p.title || p.message);

  useEffect(() => {
    if (!enabled) return;
    if (preview && window.parent !== window) return; // keep the editor preview clean
    if (p.frequency !== 'always' && read('session', 'eduzy_popup_seen') === sig) return;
    const t = setTimeout(() => setOpen(true), Math.max(0, Number(p.delaySeconds) || 0) * 1000);
    return () => clearTimeout(t);
  }, [enabled, p.frequency, p.delaySeconds, sig, preview]);

  const close = useCallback(() => {
    write('session', 'eduzy_popup_seen', sig);
    setOpen(false);
  }, [sig]);

  const visible = open && enabled;
  useEffect(() => {
    if (!visible) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && close();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [visible, close]);

  if (!visible) return null;
  return (
    <div className="site-popup" role="dialog" aria-modal="true" aria-labelledby="site-popup-title" onClick={close}>
      <div className="site-popup__card" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="site-popup__close" aria-label="Close" onClick={close}><X size={18} /></button>
        {p.image && <img src={p.image} alt="" className="site-popup__img" />}
        <div className="site-popup__body">
          {p.title && <h2 id="site-popup-title" className="site-popup__title">{p.title}</h2>}
          {p.message && <p className="site-popup__text">{p.message}</p>}
          {p.buttonLabel && p.buttonUrl && (
            <a href={p.buttonUrl} className="btn btn-primary site-popup__btn" onClick={close} {...(isExternal(p.buttonUrl) ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
              {p.buttonLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

/** Shown to visitors while maintenance mode is on. */
export function MaintenancePage() {
  const { settings } = useSite();
  const m = settings.maintenance || {};
  const c = settings.contact || {};
  return (
    <main className="site-maintenance" id="main-content">
      <img src={settings.logo} alt={settings.logoAlt} className="site-maintenance__logo" />
      <h1 className="site-maintenance__title">{m.title}</h1>
      <p className="site-maintenance__text">{m.message}</p>
      <div className="site-maintenance__actions">
        {c.phone && <a className="btn btn-primary" href={`tel:${c.phone}`}>{c.phoneDisplay || c.phone}</a>}
        {c.email && <a className="btn btn-outline" href={`mailto:${c.email}`}>{c.email}</a>}
      </div>
    </main>
  );
}
