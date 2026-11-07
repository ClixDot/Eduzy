'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, Check, Compass, LayoutDashboard, MousePointerClick, Send, X } from 'lucide-react';
import { useAdmin, type OnboardingState } from '../lib/context';
import { api } from '../lib/api';
import { useNavGuard, useToast } from '../ui/feedback';
import { TOUR_STEPS, type TourStep } from './steps';
import { TOUR_EVENT, SIDEBAR_EVENT } from './events';
import './onboarding.css';


type Mode = 'idle' | 'welcome' | 'tour';
type Rect = { top: number; left: number; width: number; height: number };

const MOBILE = 640;
const PAD = 8;

/** Decides what to show when the dashboard first loads, from the stored per-admin state. */
function initialMode(o: OnboardingState | null | undefined): { mode: Mode; step: number } {
  if (!o || o.showAgain) return { mode: 'welcome', step: 0 };
  if (o.started && !o.completed && !o.skipped) return { mode: 'tour', step: o.lastStep }; // resume after a refresh
  return { mode: 'idle', step: 0 };
}

export default function Onboarding() {
  const { me, reloadMe } = useAdmin();
  const router = useRouter();
  const path = usePathname() || '/admin';
  const guard = useNavGuard();
  const toast = useToast();

  const steps = useMemo(() => TOUR_STEPS.filter((s) => !s.permission || me?.permissions?.[s.permission]), [me?.permissions]);
  const start0 = useMemo(() => initialMode(me?.user.onboarding), []); // eslint-disable-line react-hooks/exhaustive-deps
  const [mode, setMode] = useState<Mode>(start0.mode);
  const [index, setIndex] = useState(Math.min(start0.step, steps.length - 1));
  const step: TourStep | undefined = steps[index];

  const persist = useCallback(
    async (patch: Partial<OnboardingState>) => {
      try {
        await api.put('/api/admin/me', { action: 'onboarding', ...patch });
        await reloadMe();
      } catch {
        toast('Could not save your tour progress. It will show again next time.', 'error');
      }
    },
    [reloadMe, toast],
  );

  // ----- actions -------------------------------------------------------------
  const begin = useCallback(
    (from = 0) => {
      const i = Math.min(Math.max(from, 0), steps.length - 1);
      setIndex(i);
      setMode('tour');
      persist({ started: true, completed: false, skipped: false, showAgain: false, lastStep: i });
    },
    [persist, steps.length],
  );

  const goTo = useCallback(
    (i: number) => {
      if (i < 0 || i >= steps.length) return;
      setIndex(i);
      persist({ lastStep: i });
    },
    [persist, steps.length],
  );

  const closeSidebar = () => window.dispatchEvent(new CustomEvent(SIDEBAR_EVENT, { detail: { open: false } }));

  /** Skip / close. `toDashboard` opens the dashboard (Skip), otherwise the admin stays where they are (Close). */
  const dismiss = useCallback(
    async (toDashboard: boolean) => {
      setMode('idle');
      closeSidebar();
      await persist({ skipped: true, showAgain: false });
      toast('Tour closed. You can replay it any time from Admin Profile → Help & support.');
      if (toDashboard && path !== '/admin' && (await guard.confirmLeave())) router.push('/admin');
    },
    [guard, path, persist, router, toast],
  );

  const finish = useCallback(async () => {
    setMode('idle');
    closeSidebar();
    await persist({ completed: true, skipped: false, lastStep: steps.length - 1 });
    toast('You’re all set! Replay the tour any time from Admin Profile → Help & support.', 'success');
  }, [persist, steps.length, toast]);

  // replay requests from Help & support
  useEffect(() => {
    const onStart = (e: Event) => begin((e as CustomEvent).detail?.step ?? 0);
    window.addEventListener(TOUR_EVENT, onStart);
    return () => window.removeEventListener(TOUR_EVENT, onStart);
  }, [begin]);

  if (!me || !steps.length) return null;
  if (mode === 'welcome') return <Welcome name={me.user.name} onStart={() => begin(0)} onSkip={() => dismiss(true)} />;
  if (mode === 'tour' && step)
    return (
      <Tour
        key={step.id}
        step={step}
        index={index}
        total={steps.length}
        path={path}
        navigate={async (to) => {
          // respects “Leave without saving?” — if the admin chooses to stay, the tour just waits
          if (!(await guard.confirmLeave())) return false;
          router.push(to);
          return true;
        }}
        onPrev={() => goTo(index - 1)}
        onNext={() => (index === steps.length - 1 ? finish() : goTo(index + 1))}
        onJump={goTo}
        onClose={() => dismiss(false)}
        onSkip={() => dismiss(true)}
      />
    );
  return null;
}

// ---------------------------------------------------------------------------
// Welcome screen
// ---------------------------------------------------------------------------
function Welcome({ name, onStart, onSkip }: { name: string; onStart: () => void; onSkip: () => void }) {
  const startRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    startRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onSkip();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onSkip]);
  const first = name.split(' ')[0];
  return (
    <div className="adm-onb-backdrop">
      <div className="adm-onb-welcome" role="dialog" aria-modal="true" aria-labelledby="onb-title" aria-describedby="onb-sub">
        <button type="button" className="adm-icon-btn adm-onb-welcome__close" onClick={onSkip} aria-label="Close and skip the tutorial"><X size={18} /></button>
        <div className="adm-onb-welcome__art" aria-hidden="true">
          <span className="adm-onb-orb adm-onb-orb--1" />
          <span className="adm-onb-orb adm-onb-orb--2" />
          <span className="adm-onb-orb adm-onb-orb--3" />
          <img src="https://res.cloudinary.com/wbckkjmc/image/upload/v1794040607/eduzy/logo/logo.png" alt="" className="adm-onb-welcome__logo" />
        </div>
        <div className="adm-onb-welcome__body">
          <span className="adm-chip adm-chip--orange">{first ? `Hi ${first}` : 'Welcome'} 👋</span>
          <h2 id="onb-title" className="adm-onb-welcome__title">Welcome to EDUZY Admin Dashboard!</h2>
          <p id="onb-sub" className="adm-onb-welcome__sub">Manage your entire website effortlessly from one place.</p>
          <ul className="adm-onb-welcome__list">
            <li><LayoutDashboard size={17} /> See what’s live and what’s waiting to publish</li>
            <li><MousePointerClick size={17} /> Edit text, images and courses, no code needed</li>
            <li><Send size={17} /> Save drafts, preview, then publish when ready</li>
          </ul>
          <p className="adm-onb-welcome__note">A short, 9-step tour shows you around. It takes about 2 minutes, and you can skip it at any time.</p>
          <div className="adm-onb-welcome__actions">
            <button ref={startRef} type="button" className="adm-btn adm-btn--primary" onClick={onStart}><Compass size={17} /> Start guided tour</button>
            <button type="button" className="adm-btn adm-btn--light" onClick={onSkip}>Skip & explore dashboard</button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// One tour step: opens the step's page, finds the element, spotlights it.
// ---------------------------------------------------------------------------
function Tour({ step, index, total, path, navigate, onPrev, onNext, onJump, onClose, onSkip }: {
  step: TourStep; index: number; total: number; path: string;
  navigate: (to: string) => Promise<boolean>; onPrev: () => void; onNext: () => void; onJump: (i: number) => void; onClose: () => void; onSkip: () => void;
}) {
  const [rect, setRect] = useState<Rect | null>(null);
  const [missing, setMissing] = useState(false);
  const [vw, setVw] = useState(() => (typeof window === 'undefined' ? 1366 : window.innerWidth));
  const cardRef = useRef<HTMLDivElement>(null);
  const [cardH, setCardH] = useState(260);
  const onRoute = path === step.route;
  // where the admin was when this step started: if they browse elsewhere mid-step, never drag them back
  const [startPath] = useState(path);
  const [stayed, setStayed] = useState(false); // admin chose “Stay” on unsaved changes
  const wandered = !onRoute && (path !== startPath || stayed);

  // 1. open the right page — once per step
  useEffect(() => {
    if (path !== step.route) navigate(step.route).then((ok) => !ok && setStayed(true));
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. find the element (pages load their data first), open the sidebar on small screens, scroll into view, then track it
  useEffect(() => {
    if (!onRoute) return;
    let raf = 0;
    let el: HTMLElement | null = null;
    let tries = 0;
    let last = '';
    const small = () => window.innerWidth <= 900;
    if (step.needsSidebar && small()) window.dispatchEvent(new CustomEvent(SIDEBAR_EVENT, { detail: { open: true } }));

    const measure = () => {
      if (el && el.isConnected) {
        const r = el.getBoundingClientRect();
        const top = Math.max(r.top - PAD, 6);
        // very tall elements (a whole grid, the sidebar): highlight the top part so the card fits below it
        // space left under the highlight for the card (14px gap + 16px margin)
        const room = window.innerHeight - top - (cardRef.current?.offsetHeight ?? 260) - 34;
        const tall = r.bottom + PAD - top > room && room > 120 && !step.needsSidebar && window.innerWidth >= MOBILE;
        const bottom = Math.min(tall ? top + room : r.bottom + PAD, window.innerHeight - 6);
        const left = Math.max(r.left - PAD, 6);
        const right = Math.min(r.right + PAD, window.innerWidth - 6);
        const next = { top, left, width: Math.max(right - left, 0), height: Math.max(bottom - top, 0) };
        const sig = `${Math.round(next.top)}|${Math.round(next.left)}|${Math.round(next.width)}|${Math.round(next.height)}|${window.innerWidth}`;
        if (sig !== last) {
          last = sig;
          setRect(next);
          setVw(window.innerWidth);
        }
      } else {
        el = document.querySelector<HTMLElement>(step.target);
        if (el) {
          setMissing(false);
          // leave room for the step card: on phones it sits at the bottom, so keep the element near the top
          const mobile = window.innerWidth < MOBILE;
          const tall = el.offsetHeight > window.innerHeight * 0.55;
          if (!step.needsSidebar) {
            const r = el.getBoundingClientRect();
            // keep clear of the sticky top bar when aligning to the top
            const bar = document.querySelector('.adm-topbar')?.getBoundingClientRect().bottom ?? 72;
            const y = mobile || tall ? r.top + window.scrollY - bar - 16 : r.top + window.scrollY - (window.innerHeight - r.height) / 2;
            window.scrollTo({ top: Math.max(0, y), behavior: 'smooth' });
          }
        } else if (++tries > 600) {
          setMissing(true); // ~10s: show the card without a spotlight rather than hanging
          return;
        }
      }
      raf = requestAnimationFrame(measure);
    };
    raf = requestAnimationFrame(measure);
    return () => {
      cancelAnimationFrame(raf);
      if (step.needsSidebar) window.dispatchEvent(new CustomEvent(SIDEBAR_EVENT, { detail: { open: false } }));
    };
  }, [onRoute, step]);

  // keep the card's real height for positioning
  useEffect(() => {
    const c = cardRef.current;
    if (!c) return;
    const ro = new ResizeObserver(() => setCardH(c.offsetHeight));
    ro.observe(c);
    return () => ro.disconnect();
  }, []);

  // keyboard: ←/→ to move, Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement)?.closest('input, textarea, [contenteditable="true"]')) return;
      if (e.key === 'Escape') onClose();
      else if (e.key === 'ArrowRight') onNext();
      else if (e.key === 'ArrowLeft' && index > 0) onPrev();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, onClose, onNext, onPrev]);

  useEffect(() => {
    cardRef.current?.focus({ preventScroll: true });
  }, [step.id]);

  const mobile = vw < MOBILE;
  const cardStyle = useMemo<React.CSSProperties>(() => {
    if (mobile || !rect) return {}; // CSS docks it (bottom sheet on phones, centred when no target)
    const W = Math.min(380, vw - 32);
    const vh = window.innerHeight;
    const gap = 14;
    const clampX = (x: number) => Math.min(Math.max(x, 16), vw - W - 16);
    const clampY = (y: number) => Math.min(Math.max(y, 16), vh - cardH - 16);
    if (rect.top + rect.height + gap + cardH < vh - 8) return { top: rect.top + rect.height + gap, left: clampX(rect.left), width: W };
    if (rect.top - gap - cardH > 8) return { top: rect.top - gap - cardH, left: clampX(rect.left), width: W };
    if (rect.left + rect.width + gap + W < vw - 8) return { top: clampY(rect.top), left: rect.left + rect.width + gap, width: W };
    if (rect.left - gap - W > 8) return { top: clampY(rect.top), left: rect.left - gap - W, width: W };
    return { bottom: 16, right: 16, width: W };
  }, [rect, vw, cardH, mobile]);

  const last = index === total - 1;
  const ready = onRoute && (rect || missing);

  return (
    <div className="adm-onb-layer" aria-live="polite">
      {rect && onRoute ? (
        <div className="adm-onb-spot" style={{ top: rect.top, left: rect.left, width: rect.width, height: rect.height }} />
      ) : (
        !wandered && <div className="adm-onb-dim" />
      )}
      <div
        ref={cardRef}
        tabIndex={-1}
        role="dialog"
        aria-modal="false"
        aria-labelledby="onb-step-title"
        className={`adm-onb-card ${mobile ? 'is-sheet' : ''} ${wandered ? 'is-corner' : !rect || !onRoute ? 'is-center' : ''}`}
        style={onRoute ? cardStyle : {}}
      >
        <div className="adm-onb-card__top">
          <span className="adm-onb-card__count">Step {index + 1} of {total}</span>
          <button type="button" className="adm-icon-btn adm-onb-card__close" onClick={onClose} aria-label="Close tutorial"><X size={17} /></button>
        </div>
        <div className="adm-onb-progress" role="progressbar" aria-valuemin={1} aria-valuemax={total} aria-valuenow={index + 1} aria-label="Tour progress">
          <i style={{ width: `${((index + 1) / total) * 100}%` }} />
        </div>
        <h2 id="onb-step-title" className="adm-onb-card__title">{step.title}</h2>
        {wandered ? (
          <>
            <p className="adm-onb-card__text">This step is on the {step.title} page. Carry on exploring, or jump back when you’re ready.</p>
            <button type="button" className="adm-btn adm-btn--dark adm-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => navigate(step.route)}>Show me</button>
          </>
        ) : !ready ? (
          <p className="adm-onb-card__text adm-muted">Opening {step.title}…</p>
        ) : (
          <>
            <p className="adm-onb-card__text">{step.text}</p>
            <ul className="adm-onb-card__points">
              {step.points.map((p) => <li key={p}>{p}</li>)}
            </ul>
            {missing && <p className="adm-onb-card__text adm-muted">This part isn’t on screen right now. Continue with Next.</p>}
          </>
        )}
        <div className="adm-onb-dots" aria-label="Jump to a step">
          {Array.from({ length: total }, (_, i) => (
            <button key={i} type="button" className={i === index ? 'is-active' : i < index ? 'is-done' : ''} onClick={() => onJump(i)} aria-label={`Go to step ${i + 1}`} aria-current={i === index ? 'step' : undefined} />
          ))}
        </div>
        <div className="adm-onb-card__actions">
          <button type="button" className="adm-onb-link" onClick={onSkip}>Skip tour</button>
          <div className="adm-onb-card__nav">
            {index > 0 && <button type="button" className="adm-btn adm-btn--light adm-btn--sm" onClick={onPrev}><ArrowLeft size={15} /> Back</button>}
            {!last && <button type="button" className="adm-onb-link" onClick={onNext} title="Skip this step">Skip step</button>}
            <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" onClick={onNext}>
              {last ? <><Check size={15} /> Finish</> : <>Next <ArrowRight size={15} /></>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
