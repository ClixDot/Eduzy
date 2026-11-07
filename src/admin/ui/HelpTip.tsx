'use client';
import React, { useEffect, useId, useRef, useState } from 'react';
import { CircleHelp } from 'lucide-react';

/** Small “?” button that shows a one-line explanation. Click/tap to open, Esc or click outside to close. */
export function HelpTip({ text, label = 'What is this?', align = 'center' }: { text: string; label?: string; align?: 'center' | 'end' }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);
  const id = useId();
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <span ref={ref} className={`adm-help-tip ${align === 'end' ? 'adm-help-tip--end' : ''}`}>
      <button type="button" className="adm-help-tip__btn" aria-label={label} aria-expanded={open} aria-describedby={open ? id : undefined} onClick={() => setOpen((o) => !o)}>
        <CircleHelp size={15} />
      </button>
      {open && <span id={id} role="tooltip" className="adm-help-tip__pop">{text}</span>}
    </span>
  );
}
