'use client';
import React from 'react';
import { Eye, EyeOff, Save, Send, Undo2 } from 'lucide-react';
import { Spinner } from '../ui/feedback';
import { timeAgo } from '../lib/api';
import { HelpTip } from '../ui/HelpTip';
import { PUBLISH_HELP } from '../ui/helpTexts';

export function StatusLine({ dirty, hasChanges, live = true, publishedAt, updatedAt, words }: { dirty: boolean; hasChanges: boolean; live?: boolean; publishedAt?: string | null; updatedAt?: string; words?: { on: string; off: string } }) {
  if (dirty) return <span className="adm-chip adm-chip--orange"><span className="adm-chip__dot" />Unsaved changes</span>;
  if (!live) return <span className="adm-chip adm-chip--gray" title={updatedAt ? `Saved ${timeAgo(updatedAt)}` : undefined}><span className="adm-chip__dot" />{words?.off || 'Draft'} · not on website</span>;
  if (hasChanges) return <span className="adm-chip adm-chip--amber" title={updatedAt ? `Saved ${timeAgo(updatedAt)}` : undefined}><span className="adm-chip__dot" />Draft saved · not published</span>;
  return <span className="adm-chip adm-chip--green" title={publishedAt ? `Published ${timeAgo(publishedAt)}` : undefined}><span className="adm-chip__dot" />{words?.on || 'Published'}{publishedAt ? ` · ${timeAgo(publishedAt)}` : ''}</span>;
}

/** Sticky action bar used by every editor. */
export function EditorBar({
  title, status, busy, dirty, canRevert, onRevertDraft, onSave, onPublish, previewOpen, onTogglePreview, publishLabel = 'Publish', extra,
}: {
  title: React.ReactNode;
  status: React.ReactNode;
  busy: null | 'save' | 'publish' | string;
  dirty: boolean;
  canRevert?: boolean;
  onRevertDraft?: () => void;
  onSave: () => void;
  onPublish: () => void;
  previewOpen?: boolean;
  onTogglePreview?: () => void;
  publishLabel?: string;
  extra?: React.ReactNode;
}) {
  return (
    <div className="adm-editor__bar">
      <div style={{ minWidth: 0, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div className="adm-editor__title">{title}</div>
        <div>{status}</div>
      </div>
      <div className="adm-editor__actions">
        {extra}
        {onTogglePreview && (
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={onTogglePreview} aria-pressed={previewOpen}>
            {previewOpen ? <EyeOff size={15} /> : <Eye size={15} />} {previewOpen ? 'Hide preview' : 'Preview'}
          </button>
        )}
        {canRevert && onRevertDraft && (
          <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={onRevertDraft} disabled={!!busy} title="Go back to the version that is live on the website">
            <Undo2 size={15} /> Revert to live
          </button>
        )}
        <button type="button" className="adm-btn adm-btn--light adm-btn--sm" onClick={onSave} disabled={!!busy || !dirty} title="Save without changing the website (Ctrl+S)">
          {busy === 'save' ? <Spinner size={14} /> : <Save size={15} />} Save draft
        </button>
        <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" onClick={onPublish} disabled={!!busy}>
          {busy === 'publish' ? <Spinner size={14} /> : <Send size={15} />} {publishLabel}
        </button>
        <HelpTip text={PUBLISH_HELP} label="About saving and publishing" align="end" />
      </div>
    </div>
  );
}

/** Scrolls to and focuses the first invalid field after a failed save. */
export function focusFirstError(errors: Record<string, string>) {
  const first = Object.keys(errors)[0];
  if (!first) return;
  setTimeout(() => {
    const parts = first.split('.');
    let el: Element | null = null;
    while (parts.length && !el) {
      el = document.querySelector(`[data-path="${parts.join('.')}"]`);
      parts.pop();
    }
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      (el.querySelector('input, textarea, select, [contenteditable]') as HTMLElement | null)?.focus({ preventScroll: true });
    }
  }, 60);
}
