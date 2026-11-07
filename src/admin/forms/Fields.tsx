'use client';
import React, { useId, useRef, useState } from 'react';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronUp, ArrowUp, ArrowDown, ImagePlus, X, Copy, CircleAlert, RefreshCw, Upload, Link2 } from 'lucide-react';
import type { Field } from '@/cms/fields';
import { ICON_OPTIONS } from '@/cms/fields';
import { slugify } from '@/cms/validate';
import { CmsIcon } from '@/cms/site/helpers';
import { RichText } from './RichText';
import { MediaPicker } from '../media/MediaPicker';
import { uploadWithProgress, type MediaItem } from '../media/shared';
import { api } from '../lib/api';
import { useAdmin } from '../lib/context';
import { useConfirm, useToast, Spinner } from '../ui/feedback';

export type Errors = Record<string, string>;

const newKey = () => Math.random().toString(36).slice(2, 10);

export function emptyFor(field: Field): any {
  switch (field.type) {
    case 'toggle': return false;
    case 'number': return null;
    case 'group': return emptyObject(field.fields || []);
    case 'repeater': case 'stringList': case 'images': case 'multiselect': return [];
    case 'select': return field.options?.[0]?.value ?? '';
    case 'icon': return 'Sparkles';
    default: return '';
  }
}
export function emptyObject(fields: Field[]) {
  const o: Record<string, any> = {};
  for (const f of fields) o[f.name] = emptyFor(f);
  return o;
}

/** First error under a path prefix (used to flag collapsed repeater items / tabs). */
export const hasErrorUnder = (errors: Errors, prefix: string) => Object.keys(errors).some((k) => k === prefix || k.startsWith(prefix + '.'));

interface RendererProps {
  fields: Field[];
  value: Record<string, any>;
  onChange: (v: Record<string, any>) => void;
  errors?: Errors;
  path?: string;
  /** media folder suggestion for uploads */
  folder?: string;
  /** auto-fill slug from this field while slug is untouched */
  slugFrom?: string;
}

export function FieldsRenderer({ fields, value, onChange, errors = {}, path = '', folder, slugFrom }: RendererProps) {
  const set = (name: string, v: any) => {
    const next = { ...value, [name]: v };
    if (slugFrom && name === slugFrom) {
      const slugField = fields.find((f) => f.type === 'slug');
      if (slugField && (!value[slugField.name] || value[slugField.name] === slugify(value[slugFrom] || ''))) next[slugField.name] = slugify(v);
    }
    onChange(next);
  };
  return (
    <div className="adm-form">
      {fields.map((field) => {
        if (field.showIf && !value?.[field.showIf]) return null;
        const p = path ? `${path}.${field.name}` : field.name;
        return <FieldControl key={field.name} field={field} value={value?.[field.name]} onChange={(v) => set(field.name, v)} errors={errors} path={p} folder={folder} />;
      })}
    </div>
  );
}

function Label({ field, htmlFor, extra }: { field: Field; htmlFor?: string; extra?: React.ReactNode }) {
  return (
    <label className="adm-label" htmlFor={htmlFor}>
      {field.label}
      {field.required && <span className="adm-label__req" aria-hidden="true">*</span>}
      {extra}
    </label>
  );
}

function ErrorText({ msg }: { msg?: string }) {
  if (!msg) return null;
  return <span className="adm-error" role="alert"><CircleAlert size={14} style={{ marginTop: 1, flex: 'none' }} />{msg}</span>;
}

function Counter({ value, max }: { value: string; max?: number }) {
  if (!max || max > 5000) return null;
  const len = (value || '').length;
  if (len < max * 0.6) return null;
  return <span className={`adm-counter ${len > max ? 'is-over' : ''}`}>{len}/{max}</span>;
}

export function FieldControl({ field, value, onChange, errors, path, folder }: { field: Field; value: any; onChange: (v: any) => void; errors: Errors; path: string; folder?: string }) {
  const id = useId();
  const err = errors[path];
  const cls = `adm-field ${field.half ? 'adm-field--half' : ''}`;
  const { options: loadOptions } = useAdmin();

  switch (field.type) {
    case 'group':
      return (
        <fieldset className="adm-fieldset" data-path={path}>
          <div className="adm-fieldset__head">
            <div>
              <legend className="adm-fieldset__title">{field.label}</legend>
              {field.help && <p className="adm-help" style={{ marginTop: 4 }}>{field.help}</p>}
            </div>
          </div>
          <FieldsRenderer fields={field.fields || []} value={value || {}} onChange={onChange} errors={errors} path={path} folder={folder} />
        </fieldset>
      );

    case 'repeater':
      return <Repeater field={field} value={Array.isArray(value) ? value : []} onChange={onChange} errors={errors} path={path} folder={folder} />;

    case 'stringList':
      return (
        <div className={cls} data-path={path}>
          <Label field={field} />
          {field.help && <span className="adm-help">{field.help}</span>}
          <StringList value={Array.isArray(value) ? value : []} onChange={onChange} itemLabel={field.itemLabel || 'Item'} errors={errors} path={path} long={(field.max || 0) > 300} />
          <ErrorText msg={err} />
        </div>
      );

    case 'toggle':
      return (
        <div className={cls} data-path={path}>
          <label className="adm-toggle">
            <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} />
            <span className="adm-toggle__track" />
            {field.label}
          </label>
          {field.help && <span className="adm-help" style={{ paddingLeft: 56 }}>{field.help}</span>}
        </div>
      );

    case 'image':
      return (
        <div className={cls} data-path={path}>
          <Label field={field} />
          <ImageField value={value || ''} onChange={onChange} invalid={!!err} folder={folder} />
          {field.help && <span className="adm-help">{field.help}</span>}
          <ErrorText msg={err} />
        </div>
      );

    case 'images':
      return (
        <div className={cls} data-path={path}>
          <Label field={field} />
          {field.help && <span className="adm-help">{field.help}</span>}
          <ImagesField value={Array.isArray(value) ? value : []} onChange={onChange} folder={folder} />
          <ErrorText msg={err} />
        </div>
      );

    case 'richtext':
    case 'inline':
      return (
        <div className={cls} data-path={path}>
          <Label field={field} htmlFor={id} />
          <RichText id={id} value={value || ''} onChange={onChange} inline={field.type === 'inline'} invalid={!!err} />
          {field.help && <span className="adm-help">{field.help}</span>}
          <ErrorText msg={err} />
        </div>
      );

    case 'icon':
      return (
        <div className={cls} data-path={path}>
          <Label field={field} />
          <div className="adm-icons" role="radiogroup" aria-label={field.label}>
            {ICON_OPTIONS.map((name) => (
              <button key={name} type="button" title={name} aria-label={name} role="radio" aria-checked={value === name} className={value === name ? 'is-active' : ''} onClick={() => onChange(name)}>
                <CmsIcon name={name} size={19} />
              </button>
            ))}
          </div>
        </div>
      );

    case 'color':
      return (
        <div className={cls} data-path={path}>
          <Label field={field} htmlFor={id} />
          <div className="adm-color">
            <input type="color" value={/^#[0-9a-f]{6}$/i.test(value || '') ? value : '#000000'} onChange={(e) => onChange(e.target.value.toUpperCase())} aria-label={`${field.label} picker`} />
            <input id={id} className={`adm-input ${err ? 'is-invalid' : ''}`} value={value || ''} onChange={(e) => onChange(e.target.value)} placeholder="#FF3B0B" />
          </div>
          {field.help && <span className="adm-help">{field.help}</span>}
          <ErrorText msg={err} />
        </div>
      );

    case 'select':
    case 'font': {
      const opts = field.optionsFrom ? loadOptions(field.optionsFrom) : field.options || [];
      return (
        <div className={cls} data-path={path}>
          <Label field={field} htmlFor={id} />
          <select id={id} className={`adm-select ${err ? 'is-invalid' : ''}`} value={value ?? ''} onChange={(e) => onChange(e.target.value)} disabled={opts === null}>
            {opts === null && <option>Loading…</option>}
            {(field.optionsFrom || !field.required) && <option value="">{field.required ? '— Choose —' : '— None —'}</option>}
            {(opts || []).map((o) => <option key={o.value} value={o.value} style={field.type === 'font' ? { fontFamily: o.value } : undefined}>{o.label}</option>)}
            {value && opts && !opts.some((o) => o.value === value) && <option value={value}>{value} (missing)</option>}
          </select>
          {field.help && <span className="adm-help">{field.help}</span>}
          <ErrorText msg={err} />
        </div>
      );
    }

    case 'multiselect': {
      const opts = field.optionsFrom ? loadOptions(field.optionsFrom) : field.options || [];
      const arr: string[] = Array.isArray(value) ? value : [];
      return (
        <div className={cls} data-path={path}>
          <Label field={field} />
          <div className="adm-chips-select">
            {opts === null && <span className="adm-muted">Loading…</span>}
            {(opts || []).map((o) => {
              const on = arr.includes(o.value);
              return (
                <button key={o.value} type="button" className={on ? 'is-active' : ''} aria-pressed={on} onClick={() => onChange(on ? arr.filter((x) => x !== o.value) : [...arr, o.value])}>
                  {o.label}
                </button>
              );
            })}
          </div>
          {field.help && <span className="adm-help">{field.help}</span>}
          <ErrorText msg={err} />
        </div>
      );
    }

    case 'textarea':
      return (
        <div className={cls} data-path={path}>
          <Label field={field} htmlFor={id} extra={<Counter value={value} max={field.max} />} />
          <textarea id={id} className={`adm-textarea ${err ? 'is-invalid' : ''}`} rows={field.rows || 3} value={value ?? ''} placeholder={field.placeholder} onChange={(e) => onChange(e.target.value)} aria-invalid={!!err} />
          {field.help && <span className="adm-help">{field.help}</span>}
          <ErrorText msg={err} />
        </div>
      );

    case 'number':
      return (
        <div className={cls} data-path={path}>
          <Label field={field} htmlFor={id} />
          <input id={id} type="number" inputMode="decimal" className={`adm-input ${err ? 'is-invalid' : ''}`} value={value ?? ''} min={field.min} max={field.max} step="any" onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))} aria-invalid={!!err} />
          {field.help && <span className="adm-help">{field.help}</span>}
          <ErrorText msg={err} />
        </div>
      );

    case 'slug':
      return (
        <div className={cls} data-path={path}>
          <Label field={field} htmlFor={id} />
          <div className="adm-input-group">
            <input id={id} className={`adm-input ${err ? 'is-invalid' : ''}`} value={value ?? ''} onChange={(e) => onChange(e.target.value.toLowerCase().replace(/\s+/g, '-'))} onBlur={(e) => onChange(slugify(e.target.value))} spellCheck={false} aria-invalid={!!err} />
          </div>
          {field.help && <span className="adm-help">{field.help}</span>}
          <ErrorText msg={err} />
        </div>
      );

    default: {
      const type = field.type === 'email' ? 'email' : field.type === 'tel' ? 'tel' : field.type === 'date' ? 'date' : field.type === 'url' ? 'text' : 'text';
      return (
        <div className={cls} data-path={path}>
          <Label field={field} htmlFor={id} extra={<Counter value={value} max={field.max} />} />
          <input
            id={id}
            type={type}
            inputMode={field.type === 'url' ? 'url' : undefined}
            className={`adm-input ${err ? 'is-invalid' : ''}`}
            value={value ?? ''}
            placeholder={field.placeholder || (field.type === 'url' ? 'https://… or /page' : undefined)}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!err}
            spellCheck={field.type === 'url' || field.type === 'email' ? false : undefined}
          />
          {field.help && <span className="adm-help">{field.help}</span>}
          <ErrorText msg={err} />
        </div>
      );
    }
  }
}

// ---------------------------------------------------------------------------
// Image fields
// ---------------------------------------------------------------------------

/**
 * The three ways to set an image: upload from this computer, pick from the Media Library,
 * or paste a link (the server downloads it into the library, so the site never hotlinks).
 */
function ImageSources({ folder, multiple, onAdd, hasValue }: { folder?: string; multiple?: boolean; onAdd: (urls: string[]) => void; hasValue?: boolean }) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [library, setLibrary] = useState(false);
  const [urlOpen, setUrlOpen] = useState(false);
  const [link, setLink] = useState('');
  const [busy, setBusy] = useState<'' | 'upload' | 'url'>('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');

  const upload = async (files: File[]) => {
    if (!files.length) return;
    setBusy('upload');
    setProgress(0);
    setError('');
    try {
      const form = new FormData();
      files.forEach((f) => form.append('files', f));
      form.append('folder', folder || 'general');
      const res = await uploadWithProgress('/api/admin/media', form, setProgress);
      if (res.failed?.length) toast(`${res.failed.length} file(s) could not be uploaded: ${res.failed[0].error}`, 'error');
      onAdd(res.items.map((m: MediaItem) => m.url));
      toast(`${res.items.length} image${res.items.length > 1 ? 's' : ''} uploaded`);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy('');
      if (fileRef.current) fileRef.current.value = '';
    }
  };

  const importLink = async () => {
    if (!/^https?:\/\/\S+$/i.test(link.trim())) return setError('Paste a full image link starting with https://');
    setBusy('url');
    setError('');
    try {
      const res = await api.post<{ item: MediaItem }>('/api/admin/media/import', { url: link.trim(), folder: folder || 'general' });
      onAdd([res.item.url]);
      toast('Image added from link');
      setLink('');
      setUrlOpen(false);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy('');
    }
  };

  return (
    <div className="adm-imgsrc">
      <div className="adm-image__actions">
        <button type="button" className="adm-btn adm-btn--light adm-btn--sm" disabled={!!busy} onClick={() => fileRef.current?.click()}>
          {busy === 'upload' ? <><Spinner /> Uploading {progress}%</> : <><Upload size={14} /> {hasValue ? 'Upload new' : 'Upload'}</>}
        </button>
        <button type="button" className="adm-btn adm-btn--light adm-btn--sm" disabled={!!busy} onClick={() => setLibrary(true)}>
          {hasValue ? <RefreshCw size={14} /> : <ImagePlus size={14} />} {hasValue ? 'Choose from library' : 'Media library'}
        </button>
        <button type="button" className={`adm-btn adm-btn--light adm-btn--sm ${urlOpen ? 'is-active' : ''}`} disabled={!!busy} aria-expanded={urlOpen} onClick={() => { setUrlOpen((o) => !o); setError(''); }}>
          <Link2 size={14} /> Paste URL
        </button>
      </div>
      <input ref={fileRef} type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif,image/avif" multiple={multiple} onChange={(e) => upload(Array.from(e.target.files || []))} />
      {urlOpen && (
        <div className="adm-imgsrc__url">
          <input
            className="adm-input"
            type="url"
            inputMode="url"
            placeholder="https://example.com/photo.jpg"
            value={link}
            autoFocus
            onChange={(e) => setLink(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); importLink(); } if (e.key === 'Escape') setUrlOpen(false); }}
            aria-label="Image link"
          />
          <button type="button" className="adm-btn adm-btn--dark adm-btn--sm" disabled={busy === 'url' || !link.trim()} onClick={importLink}>
            {busy === 'url' ? <><Spinner /> Adding…</> : 'Add image'}
          </button>
        </div>
      )}
      {urlOpen && !error && <span className="adm-help">The image is copied into your Media Library, so it keeps working even if the original link changes.</span>}
      {error && <span className="adm-error"><CircleAlert size={14} style={{ marginTop: 1 }} />{error}</span>}
      {library && <MediaPicker folder={folder} onClose={() => setLibrary(false)} onSelect={(m) => { onAdd([m.url]); setLibrary(false); }} />}
    </div>
  );
}

export function ImageField({ value, onChange, invalid, folder }: { value: string; onChange: (v: string) => void; invalid?: boolean; folder?: string }) {
  const name = value ? decodeURIComponent(value.split('/').pop() || value) : '';
  return (
    <div className={`adm-image ${invalid ? 'is-invalid' : ''}`}>
      <div className="adm-image__thumb">{value ? <img src={value} alt="" /> : <ImagePlus size={22} />}</div>
      <div className="adm-image__meta">
        <div className="adm-image__name" title={value}>
          <span>{value ? name : 'No image selected'}</span>
          {value && <button type="button" className="adm-btn adm-btn--danger-ghost adm-btn--sm adm-image__remove" onClick={() => onChange('')}><X size={14} /> Remove</button>}
        </div>
        <ImageSources folder={folder} hasValue={!!value} onAdd={(urls) => urls[0] && onChange(urls[0])} />
      </div>
    </div>
  );
}

function ImagesField({ value, onChange, folder }: { value: string[]; onChange: (v: string[]) => void; folder?: string }) {
  return (
    <>
      {value.length > 0 && (
        <div className="adm-images-grid">
          {value.map((src, i) => (
            <div className="adm-images-grid__item" key={src + i}>
              <img src={src} alt="" />
              <button type="button" className="adm-icon-btn adm-icon-btn--danger" aria-label="Remove image" onClick={() => onChange(value.filter((_, j) => j !== i))}><X size={15} /></button>
            </div>
          ))}
        </div>
      )}
      <div className="adm-image adm-image--add">
        <div className="adm-image__meta">
          <div className="adm-image__name">Add images</div>
          <ImageSources folder={folder} multiple onAdd={(urls) => onChange([...value, ...urls])} />
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// String list
// ---------------------------------------------------------------------------

function StringList({ value, onChange, itemLabel, errors, path, long }: { value: string[]; onChange: (v: string[]) => void; itemLabel: string; errors: Errors; path: string; long?: boolean }) {
  const move = (i: number, d: number) => {
    const j = i + d;
    if (j < 0 || j >= value.length) return;
    const next = [...value];
    [next[i], next[j]] = [next[j], next[i]];
    onChange(next);
  };
  return (
    <div className="adm-list">
      {value.map((v, i) => (
        <div className="adm-list__row" key={i}>
          {long ? (
            <textarea className={`adm-textarea ${errors[`${path}.${i}`] ? 'is-invalid' : ''}`} rows={3} value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} aria-label={`${itemLabel} ${i + 1}`} />
          ) : (
            <input className={`adm-input ${errors[`${path}.${i}`] ? 'is-invalid' : ''}`} value={v} onChange={(e) => onChange(value.map((x, j) => (j === i ? e.target.value : x)))} aria-label={`${itemLabel} ${i + 1}`} />
          )}
          <button type="button" className="adm-icon-btn" onClick={() => move(i, -1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={15} /></button>
          <button type="button" className="adm-icon-btn" onClick={() => move(i, 1)} disabled={i === value.length - 1} aria-label="Move down"><ArrowDown size={15} /></button>
          <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => onChange(value.filter((_, j) => j !== i))} aria-label={`Remove ${itemLabel.toLowerCase()}`}><Trash2 size={15} /></button>
        </div>
      ))}
      <button type="button" className="adm-add-btn" style={{ marginTop: value.length ? 2 : 0 }} onClick={() => onChange([...value, ''])}><Plus size={16} /> Add {itemLabel.toLowerCase()}</button>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Repeater (list of objects) with drag & drop and up/down buttons
// ---------------------------------------------------------------------------

function Repeater({ field, value, onChange, errors, path, folder }: { field: Field; value: any[]; onChange: (v: any[]) => void; errors: Errors; path: string; folder?: string }) {
  const [open, setOpen] = useState<Record<string, boolean>>({});
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const confirm = useConfirm();
  const itemLabel = field.itemLabel || 'Item';
  const keyOf = (item: any, i: number) => item?._key || `i${i}`;

  const ensureKeys = (arr: any[]) => arr.map((x) => (x && typeof x === 'object' && !x._key ? { ...x, _key: newKey() } : x));
  const items = value;

  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length || from === to) return;
    const next = ensureKeys([...items]);
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    onChange(next);
  };
  const add = () => {
    const item = { ...emptyObject(field.fields || []), _key: newKey() };
    onChange([...ensureKeys(items), item]);
    setOpen((o) => ({ ...o, [item._key]: true }));
  };
  const remove = async (i: number) => {
    const title = items[i]?.[field.titleField || ''] || `${itemLabel} ${i + 1}`;
    if (await confirm({ title: `Remove “${title}”?`, message: 'It will be removed when you save. You can still undo by leaving without saving.', confirmLabel: 'Remove', danger: true })) {
      onChange(items.filter((_, j) => j !== i));
    }
  };
  const duplicate = (i: number) => {
    const next = ensureKeys([...items]);
    const copy = { ...JSON.parse(JSON.stringify(items[i])), _key: newKey() };
    next.splice(i + 1, 0, copy);
    onChange(next);
    setOpen((o) => ({ ...o, [copy._key]: true }));
  };

  return (
    <div className={`adm-field ${field.half ? 'adm-field--half' : ''}`} data-path={path}>
      <div className="adm-label" style={{ justifyContent: 'space-between' }}>
        <span>{field.label} <span className="adm-muted" style={{ fontWeight: 500 }}>({items.length})</span></span>
      </div>
      {field.help && <span className="adm-help">{field.help}</span>}
      <div>
        {items.map((item, i) => {
          const k = keyOf(item, i);
          const isOpen = !!open[k] || hasErrorUnder(errors, `${path}.${i}`);
          const title = (field.titleField && item?.[field.titleField]) || `${itemLabel} ${i + 1}`;
          return (
            <div
              key={k}
              className={`adm-repeat ${drag === i ? 'is-dragging' : ''} ${over === i && drag !== i ? 'is-over' : ''}`}
              onDragOver={(e) => { if (drag !== null) { e.preventDefault(); setOver(i); } }}
              onDrop={(e) => { e.preventDefault(); if (drag !== null) move(drag, i); setDrag(null); setOver(null); }}
            >
              <div className="adm-repeat__head">
                <span className="adm-repeat__handle" draggable onDragStart={(e) => { setDrag(i); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', String(i)); }} onDragEnd={() => { setDrag(null); setOver(null); }} title="Drag to reorder" aria-hidden="true">
                  <GripVertical size={16} />
                </span>
                <button type="button" className="adm-repeat__title" onClick={() => setOpen((o) => ({ ...o, [k]: !isOpen }))} aria-expanded={isOpen}>
                  {String(title).replace(/<[^>]+>/g, '')}
                  {hasErrorUnder(errors, `${path}.${i}`) && <small style={{ color: 'var(--red)' }}>needs attention</small>}
                </button>
                <button type="button" className="adm-icon-btn" onClick={() => move(i, i - 1)} disabled={i === 0} aria-label="Move up"><ArrowUp size={15} /></button>
                <button type="button" className="adm-icon-btn" onClick={() => move(i, i + 1)} disabled={i === items.length - 1} aria-label="Move down"><ArrowDown size={15} /></button>
                <button type="button" className="adm-icon-btn" onClick={() => duplicate(i)} aria-label={`Duplicate ${itemLabel.toLowerCase()}`} disabled={!!field.maxItems && items.length >= field.maxItems}><Copy size={15} /></button>
                <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(i)} aria-label={`Remove ${itemLabel.toLowerCase()}`}><Trash2 size={15} /></button>
                <button type="button" className="adm-icon-btn" onClick={() => setOpen((o) => ({ ...o, [k]: !isOpen }))} aria-label={isOpen ? 'Collapse' : 'Expand'}>{isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}</button>
              </div>
              {isOpen && (
                <div className="adm-repeat__body">
                  <FieldsRenderer fields={field.fields || []} value={item || {}} onChange={(v) => onChange(items.map((x, j) => (j === i ? { ...v, _key: x?._key || k } : x)))} errors={errors} path={`${path}.${i}`} folder={folder} />
                </div>
              )}
            </div>
          );
        })}
        <button type="button" className="adm-add-btn" onClick={add} disabled={!!field.maxItems && items.length >= field.maxItems}>
          <Plus size={16} /> Add {itemLabel.toLowerCase()}
          {field.maxItems && items.length >= field.maxItems ? ` (maximum ${field.maxItems})` : ''}
        </button>
      </div>
      <ErrorText msg={errors[path]} />
    </div>
  );
}

/** Tabs derived from field `tab` hints. */
export function useFieldTabs(fields: Field[]) {
  const tabs: string[] = [];
  for (const f of fields) if (f.tab && !tabs.includes(f.tab)) tabs.push(f.tab);
  return tabs;
}
