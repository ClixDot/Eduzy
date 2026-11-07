'use client';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Plus, Search, GripVertical, Pencil, Copy, Trash2, Eye, EyeOff, ArrowUp, ArrowDown, ImageOff, Inbox, ExternalLink } from 'lucide-react';
import { COLLECTIONS, ACCREDITATION_GROUPS } from '@/cms/schema';
import { api, timeAgo } from '../lib/api';
import { useAdmin } from '../lib/context';
import { useConfirm, useToast, useNavGuard, StatusChip, EmptyState, Skeleton } from '../ui/feedback';
import { ItemEditor, type Item } from './ItemEditor';

const strip = (s: unknown) => String(s ?? '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

export function CollectionManager({ collection, newDefaults, addLabel, compact, cardsPerRow = 3 }: { collection: string; newDefaults?: Record<string, any>; addLabel?: string; compact?: boolean; cardsPerRow?: 3 | 6 }) {
  const def = COLLECTIONS[collection];
  const router = useRouter();
  const params = useSearchParams();
  const toast = useToast();
  const confirm = useConfirm();
  const guard = useNavGuard();
  const { bump, options, invalidateOptions } = useAdmin();
  const [items, setItems] = useState<Item[] | null>(null);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [filter, setFilter] = useState('');
  const [status, setStatus] = useState<'all' | 'live' | 'draft' | 'changes'>('all');
  const [sort, setSort] = useState<'manual' | 'updated' | 'az'>('manual');
  const [editing, setEditing] = useState<string | null>(null);
  const [drag, setDrag] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const r = await api.get<{ items: Item[] }>(`/api/admin/collections/${collection}`);
      setItems(r.items);
    } catch (e: any) {
      setError(e.message);
    }
  }, [collection]);
  useEffect(() => { load(); }, [load]);

  // open an item from search results (?open=<id>)
  useEffect(() => {
    const open = params.get('open');
    if (open && !def.fullPageEditor) setEditing(open);
  }, [params, def.fullPageEditor]);

  const filterOptions = useMemo(() => {
    if (collection === 'accreditations') return ACCREDITATION_GROUPS;
    return def.filterOptionsFrom ? options(def.filterOptionsFrom) || [] : [];
  }, [collection, def.filterOptionsFrom, options]);
  const optionLabel = (v: string) => filterOptions.find((o) => o.value === v)?.label || v;

  const shown = useMemo(() => {
    let list = [...(items || [])];
    const term = q.trim().toLowerCase();
    if (term) list = list.filter((it) => def.searchFields.some((f) => strip(it.data[f]).toLowerCase().includes(term)));
    if (filter && def.filterField) list = list.filter((it) => it.data[def.filterField!] === filter || (Array.isArray(it.data.categories) && it.data.categories.includes(filter)));
    if (status === 'live') list = list.filter((it) => it.live);
    if (status === 'draft') list = list.filter((it) => !it.live);
    if (status === 'changes') list = list.filter((it) => it.hasChanges);
    if (sort === 'updated') list.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
    if (sort === 'az') list.sort((a, b) => strip(a.data[def.titleField]).localeCompare(strip(b.data[def.titleField])));
    return list;
  }, [items, q, filter, status, sort, def]);

  const canReorder = sort === 'manual' && !q && !filter && status === 'all';

  const reorder = async (from: number, to: number) => {
    if (!items || !canReorder || to < 0 || to >= items.length || from === to) return;
    const next = [...items];
    const [m] = next.splice(from, 1);
    next.splice(to, 0, m);
    setItems(next);
    try {
      await api.post(`/api/admin/collections/${collection}/reorder`, { ids: next.map((i) => i.id) });
      toast('Order saved — the website is updated');
      bump();
    } catch (e: any) {
      toast(e.message, 'error');
      load();
    }
  };

  const openItem = async (id: string) => {
    if (def.fullPageEditor) {
      if (await guard.confirmLeave()) router.push(`/admin/${collection === 'blogs' ? 'blogs' : 'courses'}/${id}`);
    } else setEditing(id);
  };

  const quick = async (it: Item, kind: 'toggle' | 'duplicate' | 'delete') => {
    const name = strip(it.data[def.titleField]) || def.singular;
    if (kind === 'delete' && !(await confirm({ title: `Delete “${name}”?`, message: it.live ? 'It will be removed from the website and deleted permanently. This cannot be undone.' : 'This draft will be deleted permanently. This cannot be undone.', confirmLabel: 'Delete permanently', danger: true }))) return;
    if (kind === 'toggle' && it.live && !(await confirm({ title: `${def.publishWord ? (def.publishWord.off === 'Disabled' ? 'Disable' : 'Hide') : 'Unpublish'} “${name}”?`, message: 'It will no longer appear on the website. You can turn it back on any time.', confirmLabel: def.publishWord ? 'Confirm' : 'Unpublish', danger: true }))) return;
    setBusyId(it.id);
    try {
      if (kind === 'delete') {
        await api.del(`/api/admin/collections/${collection}/${it.id}`);
        toast(`${def.singular} deleted`);
      } else if (kind === 'duplicate') {
        await api.put(`/api/admin/collections/${collection}/${it.id}`, { action: 'duplicate' });
        toast('Copy created as a draft');
      } else {
        await api.put(`/api/admin/collections/${collection}/${it.id}`, { action: it.live ? 'unpublish' : 'publishCurrent' });
        toast(it.live ? 'Removed from the website' : 'Published — the website is updated');
      }
      bump();
      if (collection.endsWith('ategories')) invalidateOptions(collection);
      await load();
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setBusyId(null);
    }
  };

  const closeDrawer = async () => {
    if (await guard.confirmLeave()) {
      setEditing(null);
      if (params.get('open')) router.replace(location.pathname + (params.get('tab') ? `?tab=${params.get('tab')}` : ''));
    }
  };

  const add = () => (def.fullPageEditor ? router.push(`/admin/${collection === 'blogs' ? 'blogs' : 'courses'}/new`) : setEditing('new'));
  const counts = { all: items?.length || 0, live: items?.filter((i) => i.live).length || 0, draft: items?.filter((i) => !i.live).length || 0, changes: items?.filter((i) => i.hasChanges).length || 0 };
  const thumbContain = collection === 'accreditations';

  return (
    <>
      <div className="adm-toolbar">
        <div className="adm-input-wrap">
          <Search size={16} />
          <input className="adm-input" placeholder={`Search ${def.label.toLowerCase()}…`} value={q} onChange={(e) => setQ(e.target.value)} aria-label={`Search ${def.label}`} />
        </div>
        {(def.filterField && filterOptions.length > 0) && (
          <select className="adm-select" value={filter} onChange={(e) => setFilter(e.target.value)} aria-label="Filter by category">
            <option value="">{collection === 'accreditations' ? 'All rows' : 'All categories'}</option>
            {filterOptions.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        )}
        <select className="adm-select" value={status} onChange={(e) => setStatus(e.target.value as any)} aria-label="Filter by status">
          <option value="all">All ({counts.all})</option>
          <option value="live">{def.publishWord?.on || 'Published'} ({counts.live})</option>
          <option value="draft">{def.publishWord?.off || 'Drafts'} ({counts.draft})</option>
          <option value="changes">Unpublished changes ({counts.changes})</option>
        </select>
        <select className="adm-select" value={sort} onChange={(e) => setSort(e.target.value as any)} aria-label="Sort">
          <option value="manual">Website order</option>
          <option value="updated">Recently edited</option>
          <option value="az">A → Z</option>
        </select>
        <span style={{ flex: 1 }} />
        <button type="button" className="adm-btn adm-btn--primary" onClick={add}><Plus size={17} /> {addLabel || `Add ${def.singular.toLowerCase()}`}</button>
      </div>

      {!canReorder && items && items.length > 1 && (
        <p className="adm-help" style={{ margin: '-4px 0 10px 4px' }}>Clear search, filters and sorting to change the website order.</p>
      )}

      <div className="adm-card adm-card--flush">
        {error ? (
          <div className="adm-notice adm-notice--error" style={{ margin: 16 }}>{error}</div>
        ) : items === null ? (
          <div style={{ padding: 16, display: 'grid', gap: 12 }}>{[0, 1, 2, 3].map((i) => <Skeleton key={i} h={52} />)}</div>
        ) : items.length === 0 ? (
          <EmptyState icon={<Inbox size={26} />} title={`No ${def.label.toLowerCase()} yet`} text={def.description} action={<button type="button" className="adm-btn adm-btn--dark" onClick={add}><Plus size={16} /> {addLabel || `Add ${def.singular.toLowerCase()}`}</button>} />
        ) : shown.length === 0 ? (
          <EmptyState icon={<Search size={26} />} title="Nothing matches" text="Try another search word or clear the filters." action={<button type="button" className="adm-btn adm-btn--light" onClick={() => { setQ(''); setFilter(''); setStatus('all'); }}>Clear filters</button>} />
        ) : def.imageField ? (
          <div className={`adm-cards ${cardsPerRow === 6 ? 'adm-cards--6' : ''}`} role="list">
            {shown.map((it, idx) => {
              const index = items.indexOf(it);
              const image = it.data[def.imageField!];
              const sub = def.subtitleField ? strip(it.data[def.subtitleField]) : '';
              const meta = def.filterField && it.data[def.filterField] ? optionLabel(it.data[def.filterField]) : '';
              return (
                <article
                  key={it.id}
                  role="listitem"
                  className={`adm-ccard ${drag === idx ? 'is-dragging' : ''} ${over === idx && drag !== idx ? 'is-over' : ''}`}
                  onDragOver={(e) => { if (drag !== null) { e.preventDefault(); setOver(idx); } }}
                  onDrop={(e) => { e.preventDefault(); if (drag !== null) reorder(drag, idx); setDrag(null); setOver(null); }}
                >
                  <button type="button" className={`adm-ccard__img ${thumbContain ? 'adm-ccard__img--contain' : ''}`} onClick={() => openItem(it.id)} aria-label={`Edit ${strip(it.data[def.titleField]) || 'item'}`}>
                    {image ? <img src={image} alt="" loading="lazy" /> : <ImageOff size={26} />}
                  </button>
                  <span className="adm-ccard__status"><StatusChip live={it.live} hasChanges={it.hasChanges} words={def.publishWord} /></span>
                  <span
                    className={`adm-ccard__handle ${canReorder ? '' : 'is-disabled'}`}
                    draggable={canReorder}
                    onDragStart={(e) => { setDrag(idx); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', it.id); }}
                    onDragEnd={() => { setDrag(null); setOver(null); }}
                    title={canReorder ? 'Drag to reorder' : 'Reordering is available in “Website order” with no filters'}
                    aria-hidden="true"
                  >
                    <GripVertical size={16} />
                  </span>
                  <div className="adm-ccard__body">
                    {meta && <span className="adm-ccard__meta">{meta}</span>}
                    <button type="button" className="adm-ccard__title" onClick={() => openItem(it.id)}>{strip(it.data[def.titleField]) || 'Untitled'}</button>
                    {sub && <p className="adm-ccard__sub">{sub}</p>}
                  </div>
                  <div className="adm-ccard__foot">
                    <span className="adm-row__date" title={new Date(it.updatedAt).toLocaleString()}>#{index + 1} · {timeAgo(it.updatedAt)}</span>
                    <span className="adm-row__actions" style={{ border: 0, padding: 0 }}>
                      {!compact && (
                        <span className="adm-ccard__arrows">
                          <button type="button" className="adm-icon-btn" disabled={!canReorder || index === 0} onClick={() => reorder(index, index - 1)} aria-label="Move earlier" title="Move earlier"><ArrowUp size={15} style={{ transform: 'rotate(-90deg)' }} /></button>
                          <button type="button" className="adm-icon-btn" disabled={!canReorder || index === items.length - 1} onClick={() => reorder(index, index + 1)} aria-label="Move later" title="Move later"><ArrowDown size={15} style={{ transform: 'rotate(-90deg)' }} /></button>
                        </span>
                      )}
                      <button type="button" className="adm-icon-btn" onClick={() => openItem(it.id)} aria-label="Edit" title="Edit"><Pencil size={16} /></button>
                      <button type="button" className="adm-icon-btn" onClick={() => quick(it, 'toggle')} disabled={busyId === it.id} aria-label={it.live ? 'Remove from website' : 'Publish'} title={it.live ? 'Remove from website' : 'Publish'}>
                        {it.live ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                      {(collection === 'courses' || collection === 'blogs') && (
                        <a className="adm-icon-btn" href={`/api/admin/preview?path=${encodeURIComponent(def.previewPath(it.data))}`} target="_blank" rel="noopener noreferrer" aria-label="Preview page" title="Preview page"><ExternalLink size={16} /></a>
                      )}
                      <button type="button" className="adm-icon-btn adm-ccard__dup" onClick={() => quick(it, 'duplicate')} disabled={busyId === it.id} aria-label="Duplicate" title="Duplicate"><Copy size={16} /></button>
                      <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => quick(it, 'delete')} disabled={busyId === it.id} aria-label="Delete" title="Delete"><Trash2 size={16} /></button>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="adm-rows" role="list">
            {shown.map((it, idx) => {
              const index = items.indexOf(it);
              const image = def.imageField ? it.data[def.imageField] : null;
              const sub = def.subtitleField ? strip(it.data[def.subtitleField]) : '';
              const meta = def.filterField && it.data[def.filterField] ? optionLabel(it.data[def.filterField]) : '';
              return (
                <div
                  key={it.id}
                  role="listitem"
                  className={`adm-row ${drag === idx ? 'is-dragging' : ''} ${over === idx && drag !== idx ? 'is-over' : ''}`}
                  onDragOver={(e) => { if (drag !== null) { e.preventDefault(); setOver(idx); } }}
                  onDrop={(e) => { e.preventDefault(); if (drag !== null) reorder(drag, idx); setDrag(null); setOver(null); }}
                >
                  <span
                    className={`adm-row__handle ${canReorder ? '' : 'is-disabled'}`}
                    draggable={canReorder}
                    onDragStart={(e) => { setDrag(idx); e.dataTransfer.effectAllowed = 'move'; e.dataTransfer.setData('text/plain', it.id); }}
                    onDragEnd={() => { setDrag(null); setOver(null); }}
                    title={canReorder ? 'Drag to reorder' : 'Reordering is available in “Website order” with no filters'}
                    aria-hidden="true"
                  >
                    <GripVertical size={16} />
                  </span>
                  {def.imageField ? (
                    <span className={`adm-row__thumb ${thumbContain ? 'adm-row__thumb--contain' : ''}`}>{image ? <img src={image} alt="" loading="lazy" /> : <ImageOff size={18} />}</span>
                  ) : (
                    <span className="adm-row__thumb" style={{ fontFamily: 'var(--font-head)', fontWeight: 700 }}>{index + 1}</span>
                  )}
                  <button type="button" className="adm-row__main" onClick={() => openItem(it.id)}>
                    <span className="adm-row__title">{strip(it.data[def.titleField]) || 'Untitled'}</span>
                    <span className="adm-row__sub" style={{ display: 'block' }}>{[meta, sub].filter(Boolean).join(' · ') || '—'}</span>
                    <span className="adm-row__mobile-status"><StatusChip live={it.live} hasChanges={it.hasChanges} words={def.publishWord} /></span>
                  </button>
                  <span className="adm-row__status-col"><StatusChip live={it.live} hasChanges={it.hasChanges} words={def.publishWord} /></span>
                  <span className="adm-row__date" title={new Date(it.updatedAt).toLocaleString()}>{timeAgo(it.updatedAt)}</span>
                  <span className="adm-row__actions">
                    {!compact && (
                      <span className="adm-row__order">
                        <button type="button" className="adm-icon-btn" disabled={!canReorder || index === 0} onClick={() => reorder(index, index - 1)} aria-label="Move up"><ArrowUp size={13} /></button>
                        <button type="button" className="adm-icon-btn" disabled={!canReorder || index === items.length - 1} onClick={() => reorder(index, index + 1)} aria-label="Move down"><ArrowDown size={13} /></button>
                      </span>
                    )}
                    <button type="button" className="adm-icon-btn" onClick={() => openItem(it.id)} aria-label="Edit" title="Edit"><Pencil size={16} /></button>
                    <button type="button" className="adm-icon-btn" onClick={() => quick(it, 'toggle')} disabled={busyId === it.id} aria-label={it.live ? 'Remove from website' : 'Publish'} title={it.live ? (def.publishWord ? `Set to ${def.publishWord.off.toLowerCase()}` : 'Unpublish') : (def.publishWord ? `Set to ${def.publishWord.on.toLowerCase()}` : 'Publish')}>
                      {it.live ? <EyeOff size={16} /> : <Eye size={16} />}
                    </button>
                    {collection === 'courses' || collection === 'blogs' ? (
                      <a className="adm-icon-btn" href={`/api/admin/preview?path=${encodeURIComponent(def.previewPath(it.data))}`} target="_blank" rel="noopener noreferrer" aria-label="Preview page" title="Preview page"><ExternalLink size={16} /></a>
                    ) : null}
                    <button type="button" className="adm-icon-btn" onClick={() => quick(it, 'duplicate')} disabled={busyId === it.id} aria-label="Duplicate" title="Duplicate"><Copy size={16} /></button>
                    <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => quick(it, 'delete')} disabled={busyId === it.id} aria-label="Delete" title="Delete"><Trash2 size={16} /></button>
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {editing && (
        <>
          <div className="adm-drawer-overlay" onClick={closeDrawer} />
          <div className="adm-drawer" role="dialog" aria-modal="true" aria-label={`Edit ${def.singular.toLowerCase()}`}>
            <ItemEditor
              key={editing}
              collection={collection}
              id={editing}
              mode="drawer"
              defaults={newDefaults}
              onDone={closeDrawer}
              onChanged={(it) => {
                load();
                if (it && editing === 'new') setEditing(it.id);
              }}
            />
          </div>
        </>
      )}
    </>
  );
}
