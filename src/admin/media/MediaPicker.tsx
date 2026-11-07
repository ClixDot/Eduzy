'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { Search, ImageOff } from 'lucide-react';
import { api } from '../lib/api';
import { Modal, Spinner, EmptyState, useToast } from '../ui/feedback';
import { DropZone, MediaCard, uploadWithProgress, FOLDERS, type MediaItem } from './shared';

/** Choose an existing image from the Media Library or upload a new one. */
export function MediaPicker({ onClose, onSelect, folder = 'general' }: { onClose: () => void; onSelect: (m: MediaItem) => void; folder?: string }) {
  const [items, setItems] = useState<MediaItem[] | null>(null);
  const [q, setQ] = useState('');
  const [source, setSource] = useState<'all' | 'uploaded' | 'static'>('all');
  const [selected, setSelected] = useState<MediaItem | null>(null);
  const [tab, setTab] = useState<'library' | 'upload'>('library');
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadFolder, setUploadFolder] = useState(folder);
  const [alt, setAlt] = useState('');
  const toast = useToast();

  useEffect(() => {
    api.get<{ items: MediaItem[] }>('/api/admin/media').then((r) => setItems(r.items)).catch((e) => { toast(e.message, 'error'); setItems([]); });
  }, [toast]);

  const shown = useMemo(() => {
    const term = q.trim().toLowerCase();
    return (items || []).filter((m) =>
      (source === 'all' || (source === 'static' ? m.provider === 'static' : m.provider !== 'static')) &&
      (!term || m.filename.toLowerCase().includes(term) || m.alt.toLowerCase().includes(term)),
    );
  }, [items, q, source]);

  const upload = async (files: File[]) => {
    setBusy(true);
    setProgress(0);
    try {
      const form = new FormData();
      files.forEach((f) => form.append('files', f));
      form.append('folder', uploadFolder);
      form.append('alt', alt);
      const res = await uploadWithProgress('/api/admin/media', form, setProgress);
      if (res.failed?.length) toast(`${res.failed.length} file(s) could not be uploaded: ${res.failed[0].error}`, 'error');
      toast(`${res.items.length} image${res.items.length > 1 ? 's' : ''} uploaded`);
      setItems((cur) => [...res.items, ...(cur || [])]);
      setSelected(res.items[0]);
      setTab('library');
      setSource('all');
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      wide
      title="Choose an image"
      onClose={onClose}
      footer={
        <>
          <span className="adm-muted" style={{ marginRight: 'auto', alignSelf: 'center', fontSize: 13 }}>
            {selected ? `Selected: ${selected.filename}` : 'Click an image to select it'}
          </span>
          <button type="button" className="adm-btn adm-btn--light" onClick={onClose}>Cancel</button>
          <button type="button" className="adm-btn adm-btn--primary" disabled={!selected} onClick={() => selected && onSelect(selected)}>Use this image</button>
        </>
      }
    >
      <div className="adm-toolbar">
        <div className="adm-seg" role="tablist">
          <button type="button" className={tab === 'library' ? 'is-active' : ''} onClick={() => setTab('library')}>Media library</button>
          <button type="button" className={tab === 'upload' ? 'is-active' : ''} onClick={() => setTab('upload')}>Upload new</button>
        </div>
        {tab === 'library' && (
          <>
            <div className="adm-input-wrap">
              <Search size={16} />
              <input className="adm-input" placeholder="Search by file name or description" value={q} onChange={(e) => setQ(e.target.value)} aria-label="Search images" />
            </div>
            <select className="adm-select" value={source} onChange={(e) => setSource(e.target.value as any)} aria-label="Filter images">
              <option value="all">All images</option>
              <option value="uploaded">Uploaded</option>
              <option value="static">Website images</option>
            </select>
          </>
        )}
      </div>

      {tab === 'upload' ? (
        <div style={{ display: 'grid', gap: 16 }}>
          <div className="adm-form">
            <div className="adm-field adm-field--half">
              <label className="adm-label" htmlFor="pick-folder">Folder</label>
              <select id="pick-folder" className="adm-select" value={uploadFolder} onChange={(e) => setUploadFolder(e.target.value)}>
                {FOLDERS.map((f) => <option key={f.value} value={f.value}>{f.label}</option>)}
              </select>
            </div>
            <div className="adm-field adm-field--half">
              <label className="adm-label" htmlFor="pick-alt">Image description (alt text)</label>
              <input id="pick-alt" className="adm-input" value={alt} onChange={(e) => setAlt(e.target.value)} placeholder="e.g. Students in the computer lab" />
            </div>
          </div>
          <DropZone onFiles={upload} busy={busy} progress={progress} />
        </div>
      ) : items === null ? (
        <div style={{ display: 'grid', placeItems: 'center', height: 240 }}><Spinner size={22} /></div>
      ) : shown.length === 0 ? (
        <EmptyState icon={<ImageOff size={26} />} title="No images found" text={q ? 'Try a different search.' : 'Upload your first image.'} action={<button type="button" className="adm-btn adm-btn--dark" onClick={() => setTab('upload')}>Upload images</button>} />
      ) : (
        <div className="adm-media-grid">
          {shown.map((m) => (
            <MediaCard key={m.id} m={m} selected={selected?.id === m.id} onClick={() => setSelected(m)} />
          ))}
        </div>
      )}
    </Modal>
  );
}
