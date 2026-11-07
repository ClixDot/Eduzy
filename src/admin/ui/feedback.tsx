'use client';
import React, { createContext, useCallback, useContext, useEffect, useId, useRef, useState } from 'react';
import { Check, X, TriangleAlert, Info, Trash2 } from 'lucide-react';

// ---------------------------------------------------------------------------
// Toasts
// ---------------------------------------------------------------------------
type ToastKind = 'success' | 'error' | 'info';
interface Toast { id: number; kind: ToastKind; text: string }
const ToastCtx = createContext<(text: string, kind?: ToastKind) => void>(() => undefined);
export const useToast = () => useContext(ToastCtx);

// ---------------------------------------------------------------------------
// Confirm dialogs (promise based)
// ---------------------------------------------------------------------------
interface ConfirmOpts { title: string; message?: React.ReactNode; confirmLabel?: string; cancelLabel?: string; danger?: boolean }
const ConfirmCtx = createContext<(o: ConfirmOpts) => Promise<boolean>>(async () => false);
export const useConfirm = () => useContext(ConfirmCtx);

// ---------------------------------------------------------------------------
// Unsaved changes guard
// ---------------------------------------------------------------------------
interface GuardCtx { setDirty: (key: string, dirty: boolean) => void; isDirty: () => boolean; confirmLeave: () => Promise<boolean> }
const GuardContext = createContext<GuardCtx>({ setDirty: () => undefined, isDirty: () => false, confirmLeave: async () => true });
export const useNavGuard = () => useContext(GuardContext);

/** Marks the current editor as having unsaved changes while `dirty` is true. */
export function useUnsavedChanges(dirty: boolean) {
  const { setDirty } = useNavGuard();
  const key = useId();
  useEffect(() => {
    setDirty(key, dirty);
    return () => setDirty(key, false);
  }, [dirty, key, setDirty]);
}

export function FeedbackProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [dialog, setDialog] = useState<(ConfirmOpts & { resolve: (v: boolean) => void }) | null>(null);
  const dirty = useRef(new Set<string>());

  const toast = useCallback((text: string, kind: ToastKind = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t.slice(-3), { id, kind, text }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), kind === 'error' ? 6500 : 3600);
  }, []);

  const confirm = useCallback((o: ConfirmOpts) => new Promise<boolean>((resolve) => setDialog({ ...o, resolve })), []);
  const close = (v: boolean) => {
    dialog?.resolve(v);
    setDialog(null);
  };

  const guard: GuardCtx = {
    setDirty: useCallback((key: string, d: boolean) => {
      if (d) dirty.current.add(key);
      else dirty.current.delete(key);
    }, []),
    isDirty: useCallback(() => dirty.current.size > 0, []),
    confirmLeave: useCallback(async () => {
      if (dirty.current.size === 0) return true;
      const ok = await confirm({ title: 'Leave without saving?', message: 'You have changes that are not saved. If you leave now, they will be lost.', confirmLabel: 'Leave page', cancelLabel: 'Stay', danger: true });
      if (ok) dirty.current.clear();
      return ok;
    }, [confirm]),
  };

  // Browser-level warning (reload, close tab, external links)
  useEffect(() => {
    const onBeforeUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current.size > 0) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, []);

  useEffect(() => {
    if (!dialog) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  });

  return (
    <ToastCtx.Provider value={toast}>
      <ConfirmCtx.Provider value={confirm}>
        <GuardContext.Provider value={guard}>
          {children}
          <div className="adm-toasts" role="status" aria-live="polite">
            {toasts.map((t) => (
              <div key={t.id} className={`adm-toast adm-toast--${t.kind}`}>
                <span className="adm-toast__icon">{t.kind === 'success' ? <Check size={14} /> : t.kind === 'error' ? <TriangleAlert size={13} /> : <Info size={14} />}</span>
                {t.text}
              </div>
            ))}
          </div>
          {dialog && (
            <div className="adm-overlay" onMouseDown={() => close(false)}>
              <div className="adm-modal" role="alertdialog" aria-modal="true" aria-labelledby="adm-confirm-title" onMouseDown={(e) => e.stopPropagation()} style={{ width: 'min(440px, 100%)' }}>
                <div className="adm-modal__body" style={{ paddingTop: 26 }}>
                  <div className={`adm-confirm__icon ${dialog.danger ? '' : 'adm-confirm__icon--neutral'}`}>
                    {dialog.danger ? <Trash2 size={22} /> : <Info size={22} />}
                  </div>
                  <h2 id="adm-confirm-title" className="adm-modal__title" style={{ marginBottom: 8 }}>{dialog.title}</h2>
                  {dialog.message && <div className="adm-muted" style={{ lineHeight: 1.55 }}>{dialog.message}</div>}
                </div>
                <div className="adm-modal__foot" style={{ borderTop: 0, paddingTop: 4 }}>
                  <button type="button" className="adm-btn adm-btn--light" onClick={() => close(false)} autoFocus>{dialog.cancelLabel || 'Cancel'}</button>
                  <button type="button" className={`adm-btn ${dialog.danger ? 'adm-btn--danger' : 'adm-btn--dark'}`} onClick={() => close(true)}>{dialog.confirmLabel || 'Confirm'}</button>
                </div>
              </div>
            </div>
          )}
        </GuardContext.Provider>
      </ConfirmCtx.Provider>
    </ToastCtx.Provider>
  );
}

/** Generic modal shell. */
export function Modal({ title, onClose, children, footer, wide }: { title: React.ReactNode; onClose: () => void; children: React.ReactNode; footer?: React.ReactNode; wide?: boolean }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);
  return (
    <div className="adm-overlay" onMouseDown={onClose}>
      <div className={`adm-modal ${wide ? 'adm-modal--wide' : ''}`} role="dialog" aria-modal="true" onMouseDown={(e) => e.stopPropagation()}>
        <div className="adm-modal__head">
          <h2 className="adm-modal__title">{title}</h2>
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="adm-modal__body">{children}</div>
        {footer && <div className="adm-modal__foot">{footer}</div>}
      </div>
    </div>
  );
}

export function Spinner({ size = 16 }: { size?: number }) {
  return (
    <svg className="adm-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.25" strokeWidth="3" />
      <path d="M21 12a9 9 0 0 0-9-9" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

export function Skeleton({ h = 16, w = '100%', r }: { h?: number; w?: number | string; r?: number }) {
  return <div className="adm-skel" style={{ height: h, width: w, borderRadius: r }} />;
}

export function EmptyState({ icon, title, text, action }: { icon: React.ReactNode; title: string; text?: string; action?: React.ReactNode }) {
  return (
    <div className="adm-empty">
      <div className="adm-empty__icon">{icon}</div>
      <div className="adm-empty__title">{title}</div>
      {text && <p className="adm-empty__text">{text}</p>}
      {action}
    </div>
  );
}

export function StatusChip({ live, hasChanges, words }: { live: boolean; hasChanges?: boolean; words?: { on: string; off: string } }) {
  if (!live) return <span className="adm-chip adm-chip--gray"><span className="adm-chip__dot" />{words?.off || 'Draft'}</span>;
  if (hasChanges) return <span className="adm-chip adm-chip--amber"><span className="adm-chip__dot" />Unpublished changes</span>;
  return <span className="adm-chip adm-chip--green"><span className="adm-chip__dot" />{words?.on || 'Published'}</span>;
}
