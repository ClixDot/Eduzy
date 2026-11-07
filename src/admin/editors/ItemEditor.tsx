'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Trash2, EyeOff, ArrowLeft, X } from 'lucide-react';
import { COLLECTIONS } from '@/cms/schema';
import { validateFields } from '@/cms/validate';
import { api, ApiError, timeAgo } from '../lib/api';
import { useAdmin } from '../lib/context';
import { useConfirm, useToast, useUnsavedChanges, Skeleton, Spinner } from '../ui/feedback';
import { FieldsRenderer, useFieldTabs, hasErrorUnder, emptyObject } from '../forms/Fields';
import { PreviewPane } from './PreviewPane';
import { EditorBar, StatusLine, focusFirstError } from './EditorBar';
import { GuardedLink } from '../shell/AdminShell';

export interface Item {
  id: string;
  data: Record<string, any>;
  order: number;
  version: number;
  createdAt: string;
  updatedAt: string;
  updatedBy?: string;
  publishedAt?: string | null;
  live: boolean;
  hasChanges: boolean;
}

const FOLDER: Record<string, string> = { courses: 'courses', blogs: 'blog', gallery: 'gallery', testimonials: 'people', videoTestimonials: 'people', accreditations: 'logos' };

/**
 * Edits one collection item. `mode="page"` renders a full editor with live preview (courses, blog posts);
 * `mode="drawer"` renders inside the side panel used by simpler lists.
 */
export function ItemEditor({ collection, id, mode, onDone, onChanged, defaults }: { collection: string; id: string | 'new'; mode: 'page' | 'drawer'; onDone?: () => void; onChanged?: (item: Item | null) => void; defaults?: Record<string, any> }) {
  const def = COLLECTIONS[collection];
  const router = useRouter();
  const toast = useToast();
  const confirm = useConfirm();
  const { bump, invalidateOptions } = useAdmin();
  const tabs = useFieldTabs(def.fields);
  const [tab, setTab] = useState(tabs[0] || '');
  const [item, setItem] = useState<Item | null>(null);
  const [form, setForm] = useState<Record<string, any> | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [loadError, setLoadError] = useState('');
  const [previewOpen, setPreviewOpen] = useState(false);
  const isNew = id === 'new';

  useEffect(() => {
    setPreviewOpen(mode === 'page' && typeof window !== 'undefined' && window.innerWidth > 1280);
  }, [mode]);

  useEffect(() => {
    if (isNew) {
      const blank = { ...emptyObject(def.fields), ...(defaults || {}) };
      if (collection === 'blogs' && !blank.publishDate) blank.publishDate = new Date().toISOString().slice(0, 10);
      if (collection === 'testimonials' && !blank.rating) blank.rating = 5;
      setItem(null);
      setForm(blank);
      return;
    }
    api.get<{ item: Item }>(`/api/admin/collections/${collection}/${id}`)
      .then(({ item }) => { setItem(item); setForm(item.data); })
      .catch((e) => setLoadError(e.message));
  }, [collection, id, isNew, def.fields, defaults]);

  const baseline = useMemo(() => (isNew ? JSON.stringify({ ...emptyObject(def.fields), ...(defaults || {}) }) : JSON.stringify(item?.data)), [isNew, item, def.fields, defaults]);
  const dirty = !!form && JSON.stringify(form) !== baseline;
  useUnsavedChanges(dirty && !busy);

  const afterChange = (it: Item | null) => {
    bump();
    if (collection.endsWith('ategories')) invalidateOptions(collection);
    onChanged?.(it);
  };

  const save = useCallback(async (action: 'save' | 'publish') => {
    if (!form) return;
    const local = validateFields(def.fields, form).errors;
    if (def.slugField && def.slugFrom && !form[def.slugField] && form[def.slugFrom]) delete local[def.slugField]; // server generates it
    if (Object.keys(local).length) {
      setErrors(local);
      const t = def.fields.find((f) => hasErrorUnder(local, f.name))?.tab;
      if (t) setTab(t);
      focusFirstError(local);
      toast('Please fix the highlighted fields.', 'error');
      return;
    }
    setBusy(action);
    try {
      const res = isNew
        ? await api.post<{ item: Item }>(`/api/admin/collections/${collection}`, { data: form, publish: action === 'publish' })
        : await api.put<{ item: Item }>(`/api/admin/collections/${collection}/${id}`, { data: form, version: item!.version, action });
      setItem(res.item);
      setForm(res.item.data);
      setErrors({});
      afterChange(res.item);
      toast(action === 'publish' ? `${def.singular} published — the website is updated` : `${def.singular} saved as draft`);
      if (isNew) {
        if (mode === 'page') router.replace(`/admin/${collection === 'blogs' ? 'blogs' : 'courses'}/${res.item.id}`);
      }
    } catch (e: any) {
      if (e instanceof ApiError && e.errors) {
        setErrors(e.errors);
        const t = def.fields.find((f) => hasErrorUnder(e.errors!, f.name))?.tab;
        if (t) setTab(t);
        focusFirstError(e.errors);
      }
      toast(e.message, 'error');
    } finally {
      setBusy(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, isNew, collection, id, item, def, toast, mode, router]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
        e.preventDefault();
        if (dirty && !busy) save('save');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [dirty, busy, save]);

  const action = async (kind: 'unpublish' | 'discard' | 'duplicate' | 'delete') => {
    if (!item) return;
    const name = item.data[def.titleField] || def.singular;
    const prompts: Record<string, any> = {
      unpublish: { title: `Unpublish “${name}”?`, message: `It will be removed from the website. You can publish it again any time.`, confirmLabel: 'Unpublish', danger: true },
      discard: { title: 'Revert to the live version?', message: 'Your saved draft will be replaced with what is currently on the website.', confirmLabel: 'Revert', danger: true },
      delete: { title: `Delete “${name}”?`, message: item.live ? 'It will be removed from the website and deleted permanently. This cannot be undone.' : 'This draft will be deleted permanently. This cannot be undone.', confirmLabel: 'Delete permanently', danger: true },
    };
    if (prompts[kind] && !(await confirm(prompts[kind]))) return;
    setBusy(kind);
    try {
      if (kind === 'delete') {
        await api.del(`/api/admin/collections/${collection}/${item.id}`);
        toast(`${def.singular} deleted`);
        afterChange(null);
        if (mode === 'page') router.push(collection === 'blogs' ? '/admin/blogs' : '/admin/courses');
        else onDone?.();
        return;
      }
      const res = await api.put<{ item: Item }>(`/api/admin/collections/${collection}/${item.id}`, { action: kind });
      if (kind === 'duplicate') {
        toast(`Copy created as a draft`);
        afterChange(res.item);
        if (mode === 'page') router.push(`/admin/${collection === 'blogs' ? 'blogs' : 'courses'}/${res.item.id}`);
        else onDone?.();
        return;
      }
      setItem(res.item);
      setForm(res.item.data);
      afterChange(res.item);
      toast(kind === 'unpublish' ? `${def.singular} removed from the website` : 'Draft discarded');
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  if (loadError) return <div className="adm-notice adm-notice--error" style={{ margin: mode === 'drawer' ? 20 : 0 }}>{loadError}</div>;
  if (!form)
    return (
      <div className="adm-card" style={{ display: 'grid', gap: 14 }}>
        <Skeleton h={22} w="40%" /><Skeleton h={46} /><Skeleton h={46} /><Skeleton h={120} />
      </div>
    );

  const title = String(form[def.titleField] || '').replace(/<[^>]+>/g, '') || (isNew ? `New ${def.singular.toLowerCase()}` : 'Untitled');
  const visible = tabs.length ? def.fields.filter((f) => (f.tab || tabs[0]) === tab) : def.fields;
  const status = <StatusLine dirty={dirty} hasChanges={!!item?.hasChanges} live={!!item?.live} publishedAt={item?.publishedAt} updatedAt={item?.updatedAt} words={def.publishWord} />;
  const publishLabel = def.publishWord ? (item?.live ? 'Save & apply' : `Save & ${def.publishWord.on.toLowerCase().replace('enabled', 'enable').replace('visible', 'show')}`) : item?.live ? 'Publish changes' : 'Publish';
  const secondary = item && (
    <>
      <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => action('duplicate')} disabled={!!busy}><Copy size={15} /> Duplicate</button>
      {item.live && <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => action('unpublish')} disabled={!!busy}><EyeOff size={15} /> {def.publishWord ? (def.publishWord.off === 'Disabled' ? 'Disable' : 'Hide') : 'Unpublish'}</button>}
      <button type="button" className="adm-btn adm-btn--danger-ghost adm-btn--sm" onClick={() => action('delete')} disabled={!!busy}><Trash2 size={15} /> Delete</button>
    </>
  );
  const tabsBar = tabs.length > 1 && (
    <div className="adm-seg" role="tablist">
      {tabs.map((t) => (
        <button key={t} type="button" role="tab" aria-selected={t === tab} className={t === tab ? 'is-active' : ''} onClick={() => setTab(t)}>
          {t}
          {def.fields.some((f) => (f.tab || tabs[0]) === t && hasErrorUnder(errors, f.name)) && <span style={{ color: 'var(--red)', marginLeft: 6 }}>●</span>}
        </button>
      ))}
    </div>
  );
  const fieldsEl = <FieldsRenderer fields={visible} value={form} onChange={(v) => setForm({ ...form, ...v })} errors={errors} folder={FOLDER[collection]} slugFrom={isNew || !item?.live ? def.slugFrom : undefined} />;

  if (mode === 'drawer') {
    return (
      <>
        <div className="adm-drawer__head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="adm-drawer__title">{title}</div>
            <div style={{ marginTop: 4 }}>{status}</div>
          </div>
          <button type="button" className="adm-icon-btn" onClick={onDone} aria-label="Close"><X size={18} /></button>
        </div>
        <div className="adm-drawer__body">
          {tabsBar && <div style={{ marginBottom: 16 }}>{tabsBar}</div>}
          {fieldsEl}
          {item && <p className="adm-help" style={{ marginTop: 18 }}>Created {timeAgo(item.createdAt)} · last saved {timeAgo(item.updatedAt)}{item.updatedBy ? ` by ${item.updatedBy}` : ''}</p>}
        </div>
        <div className="adm-drawer__foot">
          {secondary}
          <span style={{ flex: 1 }} />
          {item?.hasChanges && !dirty && <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => action('discard')} disabled={!!busy}>Revert to live</button>}
          <button type="button" className="adm-btn adm-btn--light adm-btn--sm" onClick={() => save('save')} disabled={!!busy || (!dirty && !isNew)}>
            {busy === 'save' && <Spinner size={14} />} Save draft
          </button>
          <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => save('publish')} disabled={!!busy}>
            {busy === 'publish' && <Spinner size={14} />} {publishLabel}
          </button>
        </div>
      </>
    );
  }

  const listHref = collection === 'blogs' ? '/admin/blogs' : '/admin/courses';
  return (
    <>
      <div style={{ marginBottom: 12 }}>
        <GuardedLink href={listHref} className="adm-btn adm-btn--ghost adm-btn--sm"><ArrowLeft size={15} /> All {def.label.toLowerCase()}</GuardedLink>
      </div>
      <EditorBar
        title={title}
        status={<span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>{status}{item?.updatedBy && <span className="adm-editor__meta">Edited by {item.updatedBy} · {timeAgo(item.updatedAt)}</span>}</span>}
        busy={busy}
        dirty={dirty || isNew}
        canRevert={!!item?.hasChanges && !dirty}
        onRevertDraft={() => action('discard')}
        onSave={() => save('save')}
        onPublish={() => save('publish')}
        publishLabel={publishLabel}
        previewOpen={previewOpen}
        onTogglePreview={() => setPreviewOpen((o) => !o)}
        extra={secondary}
      />
      <div className={`adm-editor ${previewOpen ? 'has-preview' : ''}`}>
        <div className="adm-editor__form">
          {tabsBar}
          <div className="adm-card">{fieldsEl}</div>
        </div>
        {previewOpen && (
          <PreviewPane
            path={def.previewPath(item ? item.data : form).replace(/\/$/, '') || '/'}
            anchor={def.anchor}
            message={{ type: 'item', collection, item: { id: item?.id || 'preview-new', ...form } }}
            onClose={() => setPreviewOpen(false)}
            note={isNew ? 'Save the draft once to preview it on its own page address.' : undefined}
          />
        )}
      </div>
    </>
  );
}
