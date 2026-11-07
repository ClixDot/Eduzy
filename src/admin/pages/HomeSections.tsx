'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { GripVertical, ArrowUp, ArrowDown, Pencil, Trash2, Plus, X, LayoutTemplate } from 'lucide-react';
import { HOME_SECTION_TYPES, richTextBlockFields } from '@/cms/schema';
import { validateFields } from '@/cms/validate';
import { api, ApiError, timeAgo } from '../lib/api';
import { useAdmin } from '../lib/context';
import { useConfirm, useToast, useUnsavedChanges, Skeleton, Modal } from '../ui/feedback';
import { FieldsRenderer, emptyObject } from '../forms/Fields';
import { PreviewPane } from '../editors/PreviewPane';
import { EditorBar, StatusLine } from '../editors/EditorBar';
import { GuardedLink } from '../shell/AdminShell';
import { PageHeader } from '../ui/PageHeader';

interface Section { id: string; type: string; enabled: boolean; label?: string }
interface HomeDoc { sections: Section[]; blocks: Record<string, any> }
interface Doc { data: HomeDoc; version: number; updatedAt: string; updatedBy?: string; publishedAt?: string | null; hasChanges: boolean }

export default function HomeSections() {
  const [doc, setDoc] = useState<Doc | null>(null);
  const [form, setForm] = useState<HomeDoc | null>(null);
  const [busy, setBusy] = useState<null | 'save' | 'publish' | 'revert'>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [editingBlock, setEditingBlock] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [focus, setFocus] = useState<string | undefined>(undefined);
  const toast = useToast();
  const confirm = useConfirm();
  const { bump } = useAdmin();

  useEffect(() => { setPreviewOpen(window.innerWidth > 1280); }, []);
  const load = useCallback(async () => {
    const d = await api.get<Doc>('/api/admin/singletons/home');
    setDoc(d);
    setForm(d.data);
  }, []);
  useEffect(() => { load().catch((e) => toast(e.message, 'error')); }, [load, toast]);

  const dirty = useMemo(() => !!doc && JSON.stringify(form) !== JSON.stringify(doc.data), [doc, form]);
  useUnsavedChanges(dirty);

  const setSections = (sections: Section[]) => setForm((f) => (f ? { ...f, sections } : f));
  const move = (from: number, to: number) => {
    if (!form || to < 0 || to >= form.sections.length || from === to) return;
    const next = [...form.sections];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    setSections(next);
  };

  const run = async (action: 'save' | 'publish') => {
    if (!doc || !form) return;
    for (const s of form.sections.filter((x) => x.type === 'richText')) {
      const errs = validateFields(richTextBlockFields, form.blocks[s.id]).errors;
      if (Object.keys(errs).length) {
        setEditingBlock(s.id);
        setErrors(errs);
        toast('A custom block needs attention before saving.', 'error');
        return;
      }
    }
    if (action === 'publish' && !(await confirm({ title: 'Publish the home page?', message: 'Visitors will see the new section order and visibility right away.', confirmLabel: 'Publish now' }))) return;
    setBusy(action);
    try {
      const d = await api.put<Doc>('/api/admin/singletons/home', { data: form, version: doc.version, action });
      setDoc(d);
      setForm(d.data);
      bump();
      toast(action === 'publish' ? 'Home page published' : 'Draft saved (not yet on the website)');
    } catch (e: any) {
      if (e instanceof ApiError && e.errors) setErrors(e.errors);
      toast(e.message, 'error');
    } finally {
      setBusy(null);
    }
  };

  const revert = async () => {
    if (!(await confirm({ title: 'Revert to the live version?', message: 'Your saved draft will be replaced with the home page as it is on the website.', confirmLabel: 'Revert', danger: true }))) return;
    setBusy('revert');
    try {
      const d = await api.put<Doc>('/api/admin/singletons/home', { action: 'discard' });
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

  const addSection = (type: string) => {
    if (!form) return;
    const id = type === 'richText' ? `block-${crypto.randomUUID().slice(0, 6)}` : type;
    const sections = [...form.sections, { id, type, enabled: true, ...(type === 'richText' ? { label: 'Custom text block' } : {}) }];
    const blocks = type === 'richText' ? { ...form.blocks, [id]: { ...emptyObject(richTextBlockFields), heading: 'New section', imageSide: 'right', background: 'white' } } : form.blocks;
    setForm({ sections, blocks });
    setAdding(false);
    if (type === 'richText') setEditingBlock(id);
  };

  const removeSection = async (s: Section) => {
    if (!form) return;
    const label = s.type === 'richText' ? form.blocks[s.id]?.heading || 'Custom block' : HOME_SECTION_TYPES[s.type].label;
    if (!(await confirm({ title: `Remove “${label}” from the home page?`, message: s.type === 'richText' ? 'This custom block and its text will be deleted when you save.' : 'The section’s content is kept — you can add it back later from “Add section”.', confirmLabel: 'Remove', danger: true }))) return;
    const blocks = { ...form.blocks };
    if (s.type === 'richText') delete blocks[s.id];
    setForm({ sections: form.sections.filter((x) => x.id !== s.id), blocks });
  };

  if (!doc || !form)
    return (<><PageHeader title="Home Page" /><div className="adm-card" style={{ display: 'grid', gap: 12 }}>{[0, 1, 2, 3, 4].map((i) => <Skeleton key={i} h={58} />)}</div></>);

  const available = Object.entries(HOME_SECTION_TYPES).filter(([type, t]) => t.repeatable || !form.sections.some((s) => s.type === type));
  const anchorFor = (s: Section) => ({ hero: 'top', stats: 'trust-stats', whyChoose: 'about', accreditation: 'accreditations', featuredCourses: 'featured-courses', director: 'director-message', videoStories: 'video-stories', testimonials: 'testimonials', achievements: 'achievements', faq: 'faqs', cta: 'cta' } as Record<string, string>)[s.type] || s.id;

  return (
    <>
      <PageHeader title="Home Page" sub="Drag sections to change their order, hide the ones you don’t need, and open any section to edit its text and images." />
      <EditorBar
        title="Section order & visibility"
        status={<span style={{ display: 'inline-flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}><StatusLine dirty={dirty} hasChanges={doc.hasChanges} publishedAt={doc.publishedAt} />{doc.updatedBy && <span className="adm-editor__meta">Edited by {doc.updatedBy} · {timeAgo(doc.updatedAt)}</span>}</span>}
        busy={busy}
        dirty={dirty}
        canRevert={doc.hasChanges && !dirty}
        onRevertDraft={revert}
        onSave={() => run('save')}
        onPublish={() => run('publish')}
        previewOpen={previewOpen}
        onTogglePreview={() => setPreviewOpen((o) => !o)}
      />
      <div className={`adm-editor ${previewOpen ? 'has-preview' : ''}`}>
        <div className="adm-editor__form">
          <div className="adm-notice adm-notice--info">Section text and images are edited inside each section (pencil icon) and published there. This page controls only the order and visibility of sections.</div>
          <div className="adm-sections" role="list">
            {form.sections.map((s, i) => {
              const t = HOME_SECTION_TYPES[s.type];
              const title = s.type === 'richText' ? form.blocks[s.id]?.heading || 'Custom text block' : t.label;
              return (
                <div
                  key={s.id}
                  role="listitem"
                  className={`adm-section-row ${s.enabled ? '' : 'is-off'} ${drag === i ? 'is-dragging' : ''} ${over === i && drag !== i ? 'is-over' : ''}`}
                  onDragOver={(e) => { if (drag !== null) { e.preventDefault(); setOver(i); } }}
                  onDrop={(e) => { e.preventDefault(); if (drag !== null) move(drag, i); setDrag(null); setOver(null); }}
                >
                  <span className="adm-row__handle" draggable onDragStart={(e) => { setDrag(i); e.dataTransfer.setData('text/plain', s.id); }} onDragEnd={() => { setDrag(null); setOver(null); }} title="Drag to reorder" aria-hidden="true"><GripVertical size={17} /></span>
                  <span className="adm-section-row__num">{String(i + 1).padStart(2, '0')}</span>
                  <div style={{ minWidth: 0, cursor: 'pointer' }} onClick={() => setFocus(anchorFor(s))} title="Show this section in the preview">
                    <div className="adm-section-row__title">{title}</div>
                    <div className="adm-section-row__sub">{s.type === 'richText' ? 'Custom text block' : t.description}{!s.enabled && ' · hidden'}</div>
                  </div>
                  <div className="adm-section-row__actions">
                    <label className="adm-toggle" title={s.enabled ? 'Shown on the home page' : 'Hidden from the home page'}>
                      <input type="checkbox" checked={s.enabled} onChange={(e) => setSections(form.sections.map((x) => (x.id === s.id ? { ...x, enabled: e.target.checked } : x)))} aria-label={`Show ${title}`} />
                      <span className="adm-toggle__track" />
                    </label>
                    <button type="button" className="adm-icon-btn" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={15} /></button>
                    <button type="button" className="adm-icon-btn" onClick={() => move(i, i + 1)} disabled={i === form.sections.length - 1} aria-label="Move down"><ArrowDown size={15} /></button>
                    {s.type === 'richText' ? (
                      <button type="button" className="adm-btn adm-btn--light adm-btn--sm" onClick={() => setEditingBlock(s.id)}><Pencil size={14} /> Edit</button>
                    ) : (
                      <GuardedLink href={t.adminPath} className="adm-btn adm-btn--light adm-btn--sm"><Pencil size={14} /> Edit content</GuardedLink>
                    )}
                    <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => removeSection(s)} aria-label={`Remove ${title}`} disabled={s.type === 'hero'} title={s.type === 'hero' ? 'The hero can be hidden but not removed' : 'Remove section'}><Trash2 size={15} /></button>
                  </div>
                </div>
              );
            })}
          </div>
          <button type="button" className="adm-add-btn" onClick={() => setAdding(true)}><Plus size={16} /> Add section</button>
        </div>
        {previewOpen && (
          <PreviewPane path="/" message={{ type: 'singleton', key: 'home', data: form }} onClose={() => setPreviewOpen(false)} anchor={editingBlock || focus} />
        )}
      </div>

      {adding && (
        <Modal title="Add a section" onClose={() => setAdding(false)}>
          <div className="adm-pages">
            {available.length === 0 && <p className="adm-muted">All sections are already on the page.</p>}
            {available.map(([type, t]) => (
              <button key={type} type="button" onClick={() => addSection(type)} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 0', borderTop: '1px solid var(--line-2)', width: '100%', textAlign: 'left' }}>
                <span className="adm-tile__icon"><LayoutTemplate size={18} /></span>
                <strong style={{ flex: 1 }}>{t.label}<span className="adm-muted" style={{ display: 'block', fontWeight: 400, fontSize: 12.5 }}>{t.description}</span></strong>
                <Plus size={18} />
              </button>
            ))}
          </div>
        </Modal>
      )}

      {editingBlock && form.blocks[editingBlock] && (
        <>
          <div className="adm-drawer-overlay" onClick={() => setEditingBlock(null)} />
          <div className="adm-drawer" role="dialog" aria-modal="true" aria-label="Edit custom block">
            <div className="adm-drawer__head">
              <div className="adm-drawer__title">Custom text block</div>
              <button type="button" className="adm-icon-btn" onClick={() => setEditingBlock(null)} aria-label="Close"><X size={18} /></button>
            </div>
            <div className="adm-drawer__body">
              <FieldsRenderer
                fields={richTextBlockFields}
                value={form.blocks[editingBlock]}
                onChange={(v) => setForm({ ...form, blocks: { ...form.blocks, [editingBlock]: v } })}
                errors={errors}
                folder="pages"
              />
            </div>
            <div className="adm-drawer__foot">
              <span className="adm-help" style={{ flex: 1 }}>Changes are kept here — use Save draft or Publish at the top to store them.</span>
              <button type="button" className="adm-btn adm-btn--dark adm-btn--sm" onClick={() => { setErrors({}); setEditingBlock(null); }}>Done</button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
