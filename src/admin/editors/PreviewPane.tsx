'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Monitor, Smartphone, RefreshCw, ExternalLink, X, Lock, Info } from 'lucide-react';
import { Spinner } from '../ui/feedback';

export type PreviewMessage =
  | { type: 'singleton'; key: string; data: any }
  | { type: 'item'; collection: string; item: any };

/**
 * Shows the real public page (in Draft Mode) inside an iframe and streams unsaved edits
 * to it with postMessage, so the preview updates as the admin types.
 */
export function PreviewPane({ path, anchor, message, onClose, note }: { path: string; anchor?: string; message?: PreviewMessage | null; onClose?: () => void; note?: string }) {
  const frame = useRef<HTMLIFrameElement>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [ready, setReady] = useState(false);
  const [nonce, setNonce] = useState(0);
  const [box, setBox] = useState({ w: 0, h: 0 });

  // Render the page at real device width and scale it down to fit the panel.
  useEffect(() => {
    const el = stage.current;
    if (!el) return;
    const ro = new ResizeObserver(([e]) => setBox({ w: e.contentRect.width, h: e.contentRect.height }));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const deviceWidth = device === 'desktop' ? 1366 : 390;
  const scale = box.w ? Math.min(1, box.w / deviceWidth) : 1;
  const frameStyle: React.CSSProperties = {
    width: deviceWidth,
    height: box.h ? box.h / scale : '100%',
    transform: `scale(${scale})`,
    ...(device === 'mobile' && scale === 1 ? { marginLeft: 'auto', marginRight: 'auto', transformOrigin: 'top center' } : { transformOrigin: 'top left' }),
  };
  const latest = useRef(message);
  useEffect(() => {
    latest.current = message;
  }, [message]);

  const src = `/api/admin/preview?path=${encodeURIComponent(path)}&v=${nonce}`;

  const post = (m: any) => frame.current?.contentWindow?.postMessage({ source: 'eduzy-cms', ...m }, window.location.origin);

  useEffect(() => {
    setReady(false);
  }, [src]);

  useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      if (e.origin !== window.location.origin || e.source !== frame.current?.contentWindow) return;
      if (e.data?.source === 'eduzy-site' && e.data.type === 'ready') {
        setReady(true);
        if (latest.current) post(latest.current);
        if (anchor) setTimeout(() => post({ type: 'scroll', anchor }), 350);
      }
    };
    window.addEventListener('message', onMsg);
    return () => window.removeEventListener('message', onMsg);
  }, [anchor]);

  // scroll when the requested section changes
  useEffect(() => {
    if (ready && anchor) post({ type: 'scroll', anchor });
  }, [anchor, ready]); // eslint-disable-line react-hooks/exhaustive-deps

  // stream edits (lightly debounced)
  useEffect(() => {
    if (!ready || !message) return;
    const t = setTimeout(() => post(message), 120);
    return () => clearTimeout(t);
  }, [message, ready]);

  return (
    <aside className="adm-preview" aria-label="Live preview">
      <div className="adm-preview__bar">
        <div className="adm-preview__dots" aria-hidden="true"><i /><i /><i /></div>
        <div className="adm-preview__url"><Lock size={12} /> eduzycampus.com{path}</div>
        <div className="adm-seg" style={{ padding: 3 }}>
          <button type="button" className={device === 'desktop' ? 'is-active' : ''} onClick={() => setDevice('desktop')} aria-label="Desktop preview" title="Desktop" style={{ height: 30, padding: '0 10px' }}><Monitor size={15} /></button>
          <button type="button" className={device === 'mobile' ? 'is-active' : ''} onClick={() => setDevice('mobile')} aria-label="Mobile preview" title="Mobile" style={{ height: 30, padding: '0 10px' }}><Smartphone size={15} /></button>
        </div>
        <button type="button" className="adm-icon-btn" onClick={() => setNonce((n) => n + 1)} aria-label="Reload preview" title="Reload preview"><RefreshCw size={15} /></button>
        <a className="adm-icon-btn" href={`/api/admin/preview?path=${encodeURIComponent(path)}`} target="_blank" rel="noopener noreferrer" aria-label="Open preview in a new tab" title="Open in new tab"><ExternalLink size={15} /></a>
        {onClose && <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close preview" title="Close preview"><X size={16} /></button>}
      </div>
      <div ref={stage} className={`adm-preview__stage ${device === 'mobile' ? 'is-mobile' : ''}`} style={device === 'desktop' ? { justifyContent: 'flex-start' } : undefined}>
        <iframe ref={frame} key={src} src={src} className="adm-preview__frame" title="Website preview" style={frameStyle} />
        {!ready && <div className="adm-preview__loading"><span style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Spinner /> Loading preview…</span></div>}
      </div>
      <div className="adm-preview__note"><Info size={13} /> {note || 'Preview shows your unsaved changes. Visitors only see them after you publish.'}</div>
    </aside>
  );
}
