'use client';
import React, { useRef, useState } from 'react';
import { UploadCloud, Check } from 'lucide-react';
import { bytes } from '../lib/api';

export interface MediaItem {
  id: string;
  url: string;
  provider: 'static' | 'local' | 'cloudinary';
  filename: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  alt: string;
  folder: string;
  createdAt: string;
  updatedAt: string;
  uploadedBy?: string;
  usage: { label: string; href?: string }[];
}

export const FOLDERS = [
  { value: 'general', label: 'General' },
  { value: 'courses', label: 'Courses' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'blog', label: 'Blog' },
  { value: 'people', label: 'People & testimonials' },
  { value: 'logos', label: 'Logos & badges' },
  { value: 'pages', label: 'Page images' },
];

/** Uploads with progress (XHR) to /api/admin/media or replaces /api/admin/media/[id]. */
export function uploadWithProgress(url: string, form: FormData, onProgress: (pct: number) => void): Promise<any> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', url);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => {
      let json: any = {};
      try { json = JSON.parse(xhr.responseText); } catch { /* not json */ }
      if (xhr.status >= 200 && xhr.status < 300) resolve(json);
      else reject(new Error(json.error || `Upload failed (${xhr.status})`));
    };
    xhr.onerror = () => reject(new Error('Upload failed: could not reach the server.'));
    xhr.send(form);
  });
}

export function DropZone({ onFiles, multiple = true, busy, progress, compact }: { onFiles: (files: File[]) => void; multiple?: boolean; busy?: boolean; progress?: number; compact?: boolean }) {
  const [over, setOver] = useState(false);
  const input = useRef<HTMLInputElement>(null);
  return (
    <div
      className={`adm-drop ${over ? 'is-over' : ''}`}
      onDragOver={(e) => { e.preventDefault(); setOver(true); }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'));
        if (files.length) onFiles(multiple ? files : files.slice(0, 1));
      }}
      style={compact ? { padding: 18 } : undefined}
    >
      <div className="adm-drop__icon"><UploadCloud size={22} /></div>
      <strong style={{ display: 'block', marginBottom: 4 }}>{busy ? 'Uploading…' : `Drag ${multiple ? 'images' : 'an image'} here`}</strong>
      {busy ? (
        <div className="adm-progress" style={{ maxWidth: 260, margin: '10px auto 0' }}><i style={{ width: `${progress || 0}%` }} /></div>
      ) : (
        <>
          <span className="adm-muted" style={{ display: 'block', marginBottom: 12 }}>JPG, PNG, WebP, GIF or AVIF · up to 10 MB each</span>
          <button type="button" className="adm-btn adm-btn--dark adm-btn--sm" onClick={() => input.current?.click()}>Choose from computer</button>
        </>
      )}
      <input
        ref={input}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif,image/avif,image/x-icon"
        multiple={multiple}
        hidden
        onChange={(e) => {
          const files = Array.from(e.target.files || []);
          e.target.value = '';
          if (files.length) onFiles(files);
        }}
      />
    </div>
  );
}

export function MediaCard({ m, selected, onClick }: { m: MediaItem; selected?: boolean; onClick: () => void }) {
  const logoLike = /\.(png|svg|ico|gif)$/i.test(m.filename);
  return (
    <button type="button" className={`adm-media-card ${selected ? 'is-selected' : ''}`} onClick={onClick} aria-pressed={selected}>
      <div className={`adm-media-card__img ${logoLike ? 'adm-media-card__img--contain' : ''}`}>
        <img src={m.url} alt={m.alt || m.filename} loading="lazy" />
      </div>
      <div className="adm-media-card__body">
        <div className="adm-media-card__name" title={m.filename}>{m.filename}</div>
        <div className="adm-media-card__meta">{m.width && m.height ? `${m.width}×${m.height}` : m.mimeType.replace('image/', '').toUpperCase()}{m.size ? ` · ${bytes(m.size)}` : ''}</div>
      </div>
      {selected && <span className="adm-media-card__check"><Check size={15} /></span>}
      {m.usage && m.usage.length === 0 && m.provider !== 'static' && <span className="adm-media-card__flag adm-chip adm-chip--gray">Unused</span>}
    </button>
  );
}
