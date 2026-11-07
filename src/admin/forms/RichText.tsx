'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Bold, Italic, Link2, List, ListOrdered, Heading2, Heading3, TextQuote, RemoveFormatting, Image as ImageIcon, Undo2 } from 'lucide-react';
import { MediaPicker } from '../media/MediaPicker';
import { Modal } from '../ui/feedback';

/**
 * Lightweight WYSIWYG editor (contentEditable). Output HTML is sanitised again on the server.
 * `inline` mode only offers bold, italic and links.
 */
/** Toolbar button. Defined at module level so React keeps the same component between renders. */
function Btn({ title, onClick, children }: { title: string; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" title={title} aria-label={title} onMouseDown={(e) => e.preventDefault()} onClick={onClick}>{children}</button>
  );
}

export function RichText({ value, onChange, inline, invalid, placeholder, id }: { value: string; onChange: (html: string) => void; inline?: boolean; invalid?: boolean; placeholder?: string; id?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const lastHtml = useRef<string>('');
  const savedRange = useRef<Range | null>(null);
  const [picker, setPicker] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState('https://');
  const [linkNewTab, setLinkNewTab] = useState(false);

  // sync external value → DOM (only when it differs from what we last emitted)
  useEffect(() => {
    if (ref.current && value !== lastHtml.current) {
      ref.current.innerHTML = value || '';
      lastHtml.current = value || '';
    }
  }, [value]);

  const emit = () => {
    const html = ref.current?.innerHTML || '';
    const clean = html === '<br>' ? '' : html;
    lastHtml.current = clean;
    onChange(clean);
  };

  const saveSelection = () => {
    const sel = window.getSelection();
    if (sel && sel.rangeCount && ref.current?.contains(sel.anchorNode)) savedRange.current = sel.getRangeAt(0).cloneRange();
  };
  const restoreSelection = () => {
    ref.current?.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const exec = (cmd: string, arg?: string) => {
    ref.current?.focus();
    document.execCommand(cmd, false, arg);
    emit();
  };

  const onPaste = (e: React.ClipboardEvent) => {
    // paste as plain text with line breaks → paragraphs (avoids messy Word/Google Docs markup)
    e.preventDefault();
    const text = e.clipboardData.getData('text/plain');
    if (inline) {
      document.execCommand('insertText', false, text.replace(/\s*\n\s*/g, ' '));
    } else {
      const html = text.split(/\n{2,}/).map((p) => `<p>${p.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]!)).replace(/\n/g, '<br>')}</p>`).join('');
      document.execCommand('insertHTML', false, html);
    }
    emit();
  };

  return (
    <div className={`adm-rte ${inline ? 'adm-rte--inline' : 'adm-rte--rich'} ${invalid ? 'is-invalid' : ''}`}>
      <div className="adm-rte__bar" role="toolbar" aria-label="Formatting">
        {!inline && (
          <>
            <Btn title="Heading" onClick={() => exec('formatBlock', '<h2>')}><Heading2 size={17} /></Btn>
            <Btn title="Sub-heading" onClick={() => exec('formatBlock', '<h3>')}><Heading3 size={17} /></Btn>
            <Btn title="Paragraph" onClick={() => exec('formatBlock', '<p>')}><span style={{ fontWeight: 700, fontSize: 13 }}>P</span></Btn>
            <span className="adm-rte__sep" />
          </>
        )}
        <Btn title="Bold" onClick={() => exec('bold')}><Bold size={16} /></Btn>
        <Btn title="Italic" onClick={() => exec('italic')}><Italic size={16} /></Btn>
        <Btn title="Link" onClick={() => { saveSelection(); setLinkUrl('https://'); setLinkOpen(true); }}><Link2 size={16} /></Btn>
        {!inline && (
          <>
            <span className="adm-rte__sep" />
            <Btn title="Bullet list" onClick={() => exec('insertUnorderedList')}><List size={17} /></Btn>
            <Btn title="Numbered list" onClick={() => exec('insertOrderedList')}><ListOrdered size={17} /></Btn>
            <Btn title="Quote" onClick={() => exec('formatBlock', '<blockquote>')}><TextQuote size={16} /></Btn>
            <Btn title="Insert image" onClick={() => { saveSelection(); setPicker(true); }}><ImageIcon size={16} /></Btn>
          </>
        )}
        <span className="adm-rte__sep" />
        <Btn title="Clear formatting" onClick={() => { exec('removeFormat'); exec('unlink'); }}><RemoveFormatting size={16} /></Btn>
        <Btn title="Undo" onClick={() => exec('undo')}><Undo2 size={16} /></Btn>
      </div>
      <div
        id={id}
        ref={ref}
        className="adm-rte__area"
        contentEditable
        suppressContentEditableWarning
        role="textbox"
        aria-multiline={!inline}
        data-placeholder={placeholder || (inline ? 'Write here…' : 'Start writing…')}
        onInput={emit}
        onBlur={() => { saveSelection(); emit(); }}
        onKeyUp={saveSelection}
        onMouseUp={saveSelection}
        onPaste={onPaste}
        onKeyDown={(e) => { if (inline && e.key === 'Enter') e.preventDefault(); }}
      />
      {picker && (
        <MediaPicker
          onClose={() => setPicker(false)}
          onSelect={(m) => {
            setPicker(false);
            restoreSelection();
            const alt = (m.alt || '').replace(/"/g, '&quot;');
            document.execCommand('insertHTML', false, `<img src="${encodeURI(decodeURI(m.url))}" alt="${alt}">`);
            emit();
          }}
        />
      )}
      {linkOpen && (
        <Modal
          title="Add a link"
          onClose={() => setLinkOpen(false)}
          footer={
            <>
              <button type="button" className="adm-btn adm-btn--light" onClick={() => setLinkOpen(false)}>Cancel</button>
              <button
                type="button"
                className="adm-btn adm-btn--dark"
                onClick={() => {
                  setLinkOpen(false);
                  restoreSelection();
                  const url = linkUrl.trim();
                  if (!/^(https?:\/\/|\/|mailto:|tel:|#)/i.test(url)) return;
                  const sel = window.getSelection();
                  const text = sel && !sel.isCollapsed ? '' : url;
                  if (text) document.execCommand('insertHTML', false, `<a href="${url.replace(/"/g, '%22')}"${linkNewTab ? ' target="_blank"' : ''}>${text.replace(/</g, '&lt;')}</a>`);
                  else {
                    document.execCommand('createLink', false, url);
                    if (linkNewTab) sel?.anchorNode?.parentElement?.closest('a')?.setAttribute('target', '_blank');
                  }
                  emit();
                }}
              >
                Insert link
              </button>
            </>
          }
        >
          <div className="adm-form">
            <div className="adm-field">
              <label className="adm-label" htmlFor="rte-link">Link address</label>
              <input id="rte-link" className="adm-input" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} autoFocus />
              <span className="adm-help">A full address (https://…), a page on this website (/courses), an email (mailto:…) or phone (tel:…).</span>
            </div>
            <div className="adm-field">
              <label className="adm-toggle"><input type="checkbox" checked={linkNewTab} onChange={(e) => setLinkNewTab(e.target.checked)} /><span className="adm-toggle__track" />Open in a new tab</label>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
