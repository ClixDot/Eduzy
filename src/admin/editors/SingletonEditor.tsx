'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SINGLETONS } from '@/cms/schema';
import type { Field } from '@/cms/fields';
import { validateFields } from '@/cms/validate';
import { api, ApiError, timeAgo } from '../lib/api';
import { useAdmin } from '../lib/context';
import { useConfirm, useToast, useUnsavedChanges, Skeleton } from '../ui/feedback';
import { FieldsRenderer, useFieldTabs, hasErrorUnder } from '../forms/Fields';
import { PreviewPane } from './PreviewPane';
import { EditorBar, StatusLine, focusFirstError } from './EditorBar';

interface Doc { key: string; data: any; version: number; updatedAt: string; updatedBy?: string; publishedAt?: string | null; hasChanges: boolean }

export interface SingletonEditorProps {
  docKey: string;
  title?: string;
  /** show only these tabs (by field.tab) */
  fields?: Field[];
  previewPath?: string;
  anchor?: string;
  hidePreview?: boolean;
  before?: React.ReactNode;
  folder?: string;
  /** render without the outer page header (used inside tabbed pages) */
  embedded?: boolean;
  previewNote?: string;
}

/** Loads, edits, saves and publishes one CMS section/page with live preview. */
export function SingletonEditor({ docKey, title, fields: fieldsProp, previewPath, anchor, hidePreview, before, folder, previewNote }: SingletonEditorProps) {
  const def = SINGLETONS[docKey];
  const fields = fieldsProp || def.fields;
  const tabs = useFieldTabs(fields);
  const [tab, setTab] = useState(tabs[0] || '');
  const [doc, setDoc] = useState<Doc | null>(null);
  const [form, setForm] = useState<any>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<null | 'save' | 'publish' | 'revert'>(null);
  const [loadError, setLoadError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const toast = useToast();
  const confirm = useConfirm();
  const { bump } = useAdmin();

  useEffect(() => {
    setPreviewOpen(!hidePreview && typeof window !== 'undefined' && window.innerWidth > 1280);
  }, [hidePreview]);

  const load = useCallback(async () => {
    try {
      const d = await api.get<Doc>(`/api/admin/singletons/${docKey}`);
      setDoc(d);
      setForm(d.data);
      setErrors({});
    } catch (e: any) {
      setLoadError(e.message);
    }
  }, [docKey]);
  useEffect(() => { load(); }, [load]);

  const dirty = useMemo(() => !!doc && JSON.stringify(form) !== JSON.stringify(doc.data), [form, doc]);
  useUnsavedChanges(dirty);

  const run = useCallback(async (action: 'save' | 'publish') => {
    if (!doc) return;
    // quick client-side check for the visible fields (the server validates everything again)
    const local = validateFields(fields, form).errors;
    if (Object.keys(local).length) {
      setErrors(local);
      const firstTab = fields.find((f) => hasErrorUnder(local, f.name))?.tab;
      if (firstTab) setTab(firstTab);
      focusFirstError(local);
      toast('Please fix the highlighted fields.', 'error');
      return;
    }
    if (action === 'publish' && !(await confirm({ title: 'Publish to the website?', message: `Visitors will see these changes to “${title || def.label}” right away.`, confirmLabel: 'Publish now' }))) return;
    setBusy(action);
    try {
      const d = await api.put<Doc>(`/api/admin/singletons/${docKey}`, { data: { ...doc.data, ...form }, version: doc.version, action });
      setDoc(d);
      setForm(d.data);
      setErrors({});
      bump();
      toast(action === 'publish' ? 'Published — the website is updated' : 'Draft saved (not yet on the website)');
    } catch (e: any) {
      if (e instanceof ApiError && e.errors) {
        setErrors(e.errors);
        const firstTab = fields.find((f) => hasErrorUnder(e.errors!, f.name))?.tab;
        if (firstTab) setTab(firstTab);
        focusFirstError(e.errors);
      }
      toast(e.message, 'error');
    } finally {
      setBusy(null);
    }
  }, [doc, form, fields, docKey, toast, confirm, title, def.label, bump]);

  // Ctrl/Cmd + S saves a draft
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty && !busy) run('save');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, busy, run]);

  const revert = async () => {
    if (!(await confirm({ title: 'Revert to the live version?', message: 'Your saved draft will be replaced with what is currently on the website.', confirmLabel: 'Revert', danger: true }))) return;
    setBusy('revert');
    try {
      const d = await api.put<Doc>(`/api/admin/singletons/${docKey}`, { action: 'discard' });
      setDoc(d);
      setForm(d.data);
      bump();
      toast('Draft discarded');
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  if (loadError) return <div className="adm-notice adm-notice--error">{loadError} <button className="adm-link" onClick={() => { setLoadError(''); load(); }}>Try again</button></div>;
  if (!doc || !form)
    return (
      <div className="adm-editor">
        <div className="adm-card" style={{ display: 'grid', gap: 14 }}>
          <Skeleton h={22} w="40%" /><Skeleton h={46} /><Skeleton h={46} /><Skeleton h={120} /><Skeleton h={46} w="60%" />
        </div>
      </div>
    );

  const visibleFields = tabs.length ? fields.filter((f) => (f.tab || tabs[0]) === tab) : fields;
  const showPreview = previewOpen && !hidePreview;

  return (
    <>
      <EditorBar
        title={title || def.label}
        status={
          <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusLine dirty={dirty} hasChanges={doc.hasChanges} publishedAt={doc.publishedAt} updatedAt={doc.updatedAt} />
            {doc.updatedBy && <span className="adm-editor__meta">Last edited by {doc.updatedBy} · {timeAgo(doc.updatedAt)}</span>}
          </span>
        }
        busy={busy}
        dirty={dirty}
        canRevert={doc.hasChanges && !dirty}
        onRevertDraft={revert}
        onSave={() => run('save')}
        onPublish={() => run('publish')}
        previewOpen={showPreview}
        onTogglePreview={hidePreview ? undefined : () => setPreviewOpen((o) => !o)}
        extra={dirty ? <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => { setForm(doc.data); setErrors({}); }}>Undo changes</button> : null}
      />
      <div className={`adm-editor ${showPreview ? 'has-preview' : ''}`}>
        <div className="adm-editor__form">
          {before}
          {tabs.length > 1 && (
            <div className="adm-seg" role="tablist" aria-label={`${def.label} sections`}>
              {tabs.map((t) => (
                <button key={t} type="button" role="tab" aria-selected={t === tab} className={t === tab ? 'is-active' : ''} onClick={() => setTab(t)}>
                  {t}
                  {fields.some((f) => (f.tab || tabs[0]) === t && hasErrorUnder(errors, f.name)) && <span style={{ color: 'var(--red)', marginLeft: 6 }}>●</span>}
                </button>
              ))}
            </div>
          )}
          <div className="adm-card">
            <FieldsRenderer fields={visibleFields} value={form} onChange={(v) => setForm({ ...form, ...v })} errors={errors} folder={folder} />
          </div>
        </div>
        {showPreview && (
          <PreviewPane
            path={previewPath || def.previewPath}
            anchor={anchor ?? def.anchor}
            message={{ type: 'singleton', key: docKey, data: form }}
            onClose={() => setPreviewOpen(false)}
            note={previewNote}
          />
        )}
      </div>
    </>
  );
}
