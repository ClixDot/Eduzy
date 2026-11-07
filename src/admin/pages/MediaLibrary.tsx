'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, X, Copy, RefreshCw, Trash2, ImageOff, Upload, ExternalLink } from 'lucide-react';
import { api, bytes, timeAgo } from '../lib/api';
import { useAdmin } from '../lib/context';
import { useConfirm, useToast, Spinner, EmptyState, Skeleton } from '../ui/feedback';
import { DropZone, MediaCard, uploadWithProgress, FOLDERS, type MediaItem } from '../media/shared';
import { PageHeader } from '../ui/PageHeader';

type Filter = 'all' | 'uploaded' | 'static' | 'unused' | 'noalt';

export default function MediaLibrary() {
  const params = useSearchParams();
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState<Filter>((params.get('filter') as Filter) || 'all');
  const [type, setType] = useState('');
  const [folder, setFolder] = useState('');
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadFolder, setUploadFolder] = useState('general');
  const toast = useToast();
  const { bump } = useAdmin();

  const load = useCallback(async () => {
    try {
      const r = await api.get<{ items: MediaItem[] }>('/api/admin/media');
      setItems(r.items);
      return r.items;
    } catch (e: any) {
      toast(e.message, 'error');
      setItems([]);
      return [];
    }
  }, [toast]);

  useEffect(() => {
    load().then((list) => {
      const open = params.get('open');
      if (open) setSelected(list.find((m) => m.id === open) || null);
    });
  }, [load, params]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (items || []).filter((m) => {
      if (term && !m.filename.toLowerCase().includes(term) && !m.alt.toLowerCase().includes(term)) return false;
      if (type && m.mimeType !== type) return false;
      if (folder && m.folder !== folder) return false;
      if (filter === 'uploaded') return m.provider !== 'static';
      if (filter === 'static') return m.provider === 'static';
      if (filter === 'unused') return m.usage.length === 0;
      if (filter === 'noalt') return !m.alt;
      return true;
    });
  }, [items, q, filter, type, folder]);

  const types = useMemo(() => Array.from(new Set((items || []).map((m) => m.mimeType))).sort(), [items]);
  const folders = useMemo(() => Array.from(new Set((items || []).map((m) => m.folder))).sort(), [items]);

  const upload = async (files: File[]) => {
    setBusy(true);
    setProgress(0);
    try {
      const form = new FormData();
      files.forEach((f) => form.append('files', f));
      form.append('folder', uploadFolder);
      const res = await uploadWithProgress('/api/admin/media', form, setProgress);
      toast(`${res.items.length} image${res.items.length > 1 ? 's' : ''} uploaded`);
      if (res.failed?.length) toast(`${res.failed.length} file(s) failed: ${res.failed[0].error}`, 'error');
      setItems((cur) => [...res.items, ...(cur || [])]);
      setSelected(res.items[0]);
      setShowUpload(false);
      bump();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  const counts: Record<Filter, number> = {
    all: items?.length || 0,
    uploaded: items?.filter((m) => m.provider !== 'static').length || 0,
    static: items?.filter((m) => m.provider === 'static').length || 0,
    unused: items?.filter((m) => m.usage.length === 0).length || 0,
    noalt: items?.filter((m) => !m.alt).length || 0,
  };

  return (
    <>
      <PageHeader
        title="Media Library"
        sub="Every image used on the website. Upload new images, add descriptions for Google and screen readers, and replace an image everywhere it is used."
        actions={<button type="button" className="adm-btn adm-btn--primary" onClick={() => setShowUpload((s) => !s)}><Upload size={16} /> Upload images</button>}
      />

      {showUpload && (
        <div className="adm-card" style={{ marginBottom: 18 }}>
          <div className="adm-form" style={{ marginBottom: 14 }}>
            <div className="adm-field adm-field--half">
              <label className="adm-label" htmlFor="up-folder">Save in folder</label>
              <select id="up-folder" className="adm-select" value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)}>
                {FOLDERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
          </div>
          <DropZone onFiles={upload} busy={busy} progress={progress} />
        </div>
      )}

      <div className="adm-toolbar">
        <div className="adm-seg">
          {([['all', 'All'], ['uploaded', 'Uploaded'], ['static', 'Website images'], ['unused', 'Unused'], ['noalt', 'No description']] as [Filter, string][]).map(([k, l]) => (
            <button key={k} type="button" className={filter === k ? 'is-active' : ''} onClick={() => setFilter(k)}>{l}<span className="adm-seg__count">{counts[k]}</span></button>
          ))}
        </div>
        <div className="adm-input-wrap">
          <Search size={16} />
          <input className="adm-input" placeholder="Search file name or description" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search media" />
        </div>
        <select className="adm-select" value={type} onChange={(e) => setType(e.target.value)} aria-label="Filter by image type">
          <option value="">All types</option>
          {types.map((t) => <option key={t} value={t}>{t.replace('image/', '').toUpperCase()}</option>)}
        </select>
        <select className="adm-select" value={folder} onChange={(e) => setFolder(e.target.value)} aria-label="Filter by folder">
          <option value="">All folders</option>
          {folders.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>

      <div className="adm-media-layout">
        <div>
          {items === null ? (
            <div className="adm-media-grid">{Array.from({ length: 12 }).map((_, i) => <Skeleton key={i} h={170} r={18} />)}</div>
          ) : shown.length === 0 ? (
            <div className="adm-card"><EmptyState icon={<ImageOff size={26} />} title="No images here" text={filter === 'unused' ? 'Every image is in use.' : 'Try another filter or upload new images.'} /></div>
          ) : (
            <div className="adm-media-grid">
              {shown.map((m) => <MediaCard key={m.id} m={m} selected={selected?.id === m.id} onClick={() => setSelected(m)} />)}
            </div>
          )}
        </div>
        {selected && (
          <MediaDetails
            key={selected.id + selected.updatedAt}
            m={selected}
            onClose={() => setSelected(null)}
            onUpdated={(m) => { setItems((cur) => (cur || []).map((x) => (x.id === m.id ? { ...x, ...m } : x))); setSelected((s) => (s ? { ...s, ...m } : s)); }}
            onDeleted={() => { setItems((cur) => (cur || []).filter((x) => x.id !== selected.id)); setSelected(null); bump(); }}
            reload={async () => { const list = await load(); setSelected(list.find((x) => x.id === selected.id) || null); bump(); }}
          />
        )}
      </div>
    </>
  );
}

function MediaDetails({ m, onClose, onUpdated, onDeleted, reload }: { m: MediaItem; onClose: () => void; onUpdated: (m: MediaItem) => void; onDeleted: () => void; reload: () => Promise<void> }) {
  const [alt, setAlt] = useState(m.alt);
  const [folder, setFolder] = useState(m.folder);
  const [saving, setSaving] = useState(false);
  const [replacing, setReplacing] = useState(false);
  const [progress, setProgress] = useState(0);
  const file = useRef<HTMLInputElement>(null);
  const toast = useToast();
  const confirm = useConfirm();
  const absolute = typeof window !== 'undefined' ? new URL(m.url, window.location.origin).toString() : m.url;
  const dirty = alt !== m.alt || folder !== m.folder;

  const save = async () => {
    setSaving(true);
    try {
      const r = await api.put<{ item: MediaItem }>(`/api/admin/media/${m.id}`, { alt, folder });
      onUpdated({ ...m, ...r.item });
      toast('Image details saved');
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const replace = async (f: File) => {
    const ok = await confirm({
      title: 'Replace this image everywhere?',
      message: m.usage.length ? `It is used in ${m.usage.length} place${m.usage.length > 1 ? 's' : ''}. All of them — including the live website — will show the new image immediately.` : 'The new file will take the place of this one in the library.',
      confirmLabel: 'Replace image',
    });
    if (!ok) return;
    setReplacing(true);
    setProgress(0);
    try {
      const form = new FormData();
      form.append('file', f);
      const r = await uploadWithProgress(`/api/admin/media/${m.id}`, form, setProgress);
      toast(`Image replaced${r.changed ? ` in ${r.changed} place${r.changed > 1 ? 's' : ''}` : ''}`);
      await reload();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setReplacing(false);
    }
  };

  const remove = async () => {
    if (m.usage.length) {
      toast('This image is still in use. Replace or remove it in those places first.', 'error');
      return;
    }
    const ok = await confirm({
      title: m.provider === 'static' ? 'Remove from the library?' : 'Delete this image?',
      message: m.provider === 'static' ? 'This image ships with the website code, so the file stays on the server; it is only removed from this library.' : 'The file is deleted permanently. This cannot be undone.',
      confirmLabel: m.provider === 'static' ? 'Remove' : 'Delete image',
      danger: true,
    });
    if (!ok) return;
    try {
      await api.del(`/api/admin/media/${m.id}`);
      toast(m.provider === 'static' ? 'Removed from library' : 'Image deleted');
      onDeleted();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  return (
    <aside className="adm-card adm-media-panel" aria-label="Image details">
      <div className="adm-card__head" style={{ marginBottom: 12 }}>
        <h2 className="adm-card__title" style={{ fontSize: 16, wordBreak: 'break-all' }}>{m.filename}</h2>
        <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close details"><X size={17} /></button>
      </div>
      <div className="adm-media-panel__img"><img src={m.url} alt={m.alt || m.filename} /></div>
      <dl className="adm-kv" style={{ marginBottom: 16 }}>
        <dt>Dimensions</dt><dd>{m.width && m.height ? `${m.width} × ${m.height} px` : 'Unknown'}</dd>
        <dt>Size</dt><dd>{m.size ? bytes(m.size) : '—'}</dd>
        <dt>Type</dt><dd>{m.mimeType.replace('image/', '').toUpperCase()}</dd>
        <dt>Stored in</dt><dd>{m.provider === 'static' ? 'Website files' : m.provider === 'cloudinary' ? 'Cloudinary' : 'Local (development)'}</dd>
        <dt>Added</dt><dd>{timeAgo(m.createdAt)}{m.uploadedBy ? ` by ${m.uploadedBy}` : ''}</dd>
      </dl>
      <div className="adm-form" style={{ marginBottom: 14 }}>
        <div className="adm-field">
          <label className="adm-label" htmlFor="m-alt">Description (alt text)</label>
          <textarea id="m-alt" className="adm-textarea" rows={2} style={{ minHeight: 64 }} value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="Describe what is in the image" maxLength={240} />
          <span className="adm-help">Used when this image is inserted into blog posts and for search engines.</span>
        </div>
        {m.provider !== 'static' && (
          <div className="adm-field">
            <label className="adm-label" htmlFor="m-folder">Folder</label>
            <select id="m-folder" className="adm-select" value={folder} onChange={(e) => setFolder(e.target.value)}>
              {FOLDERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              {!FOLDERS.some((f) => f.value === folder) && <option value={folder}>{folder}</option>}
            </select>
          </div>
        )}
      </div>
      <button type="button" className="adm-btn adm-btn--dark adm-btn--sm adm-btn--block" onClick={save} disabled={!dirty || saving}>{saving && <Spinner size={14} />} Save details</button>

      <div className="adm-divider" />
      <div className="adm-section-title">Used in {m.usage.length ? `${m.usage.length} place${m.usage.length > 1 ? 's' : ''}` : '—'}</div>
      {m.usage.length === 0 ? <p className="adm-muted" style={{ fontSize: 13 }}>Not used anywhere on the website.</p> : (
        <ul style={{ display: 'grid', gap: 6, fontSize: 13 }}>{m.usage.map((u, i) => <li key={i}>• {u.label}</li>)}</ul>
      )}

      <div className="adm-divider" />
      {replacing && <div className="adm-progress" style={{ marginBottom: 10 }}><i style={{ width: `${progress}%` }} /></div>}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        <button type="button" className="adm-btn adm-btn--light adm-btn--sm" onClick={() => file.current?.click()} disabled={replacing}><RefreshCw size={14} /> Replace</button>
        <button type="button" className="adm-btn adm-btn--light adm-btn--sm" onClick={() => { navigator.clipboard?.writeText(absolute); toast('Image link copied'); }}><Copy size={14} /> Copy link</button>
        <a className="adm-btn adm-btn--ghost adm-btn--sm" href={m.url} target="_blank" rel="noopener noreferrer"><ExternalLink size={14} /> Open</a>
        <button type="button" className="adm-btn adm-btn--danger-ghost adm-btn--sm" onClick={remove} title={m.usage.length ? 'Images in use cannot be deleted' : undefined}><Trash2 size={14} /> {m.provider === 'static' ? 'Remove' : 'Delete'}</button>
      </div>
      <input ref={file} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/x-icon" hidden onChange={(e) => { const f = e.target.files?.[0]; e.target.value = ''; if (f) replace(f); }} />
    </aside>
  );
}
