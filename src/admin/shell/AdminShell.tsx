'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import NextLink from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Bell, Search, Menu, PanelLeftClose, PanelLeftOpen, X, ExternalLink, TriangleAlert, Info, ChevronRight, FileText, LogOut, UserRound } from 'lucide-react';
import { NAV, CRUMB_LABELS, type NavItem } from '../lib/nav';
import { useAdmin } from '../lib/context';
import { api, initials } from '../lib/api';
import { useNavGuard, useToast, Spinner } from '../ui/feedback';
import Onboarding from '../onboarding/Onboarding';
import { SIDEBAR_EVENT } from '../onboarding/events';

/** Link that asks before leaving an editor with unsaved changes. */
export function GuardedLink({ href, children, onNavigate, ...rest }: React.ComponentProps<typeof NextLink> & { onNavigate?: () => void }) {
  const guard = useNavGuard();
  const router = useRouter();
  return (
    <NextLink
      href={href}
      {...rest}
      onClick={async (e) => {
        rest.onClick?.(e);
        if (e.defaultPrevented || e.metaKey || e.ctrlKey || e.shiftKey) return;
        if (guard.isDirty()) {
          e.preventDefault();
          if (await guard.confirmLeave()) {
            onNavigate?.();
            router.push(String(href));
          }
        } else onNavigate?.();
      }}
    >
      {children}
    </NextLink>
  );
}

function isActive(item: NavItem, path: string) {
  if (item.href === '/admin') return path === '/admin';
  return path === item.href || path.startsWith(item.href + '/') || !!item.match?.some((m) => path.startsWith(m));
}

interface Notice { level: 'warning' | 'info'; title: string; text: string; href?: string }

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname() || '/admin';
  const router = useRouter();
  const { me, version } = useAdmin();
  const guard = useNavGuard();
  const toast = useToast();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[] | null>(null);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    try {
      setCollapsed(localStorage.getItem('eduzy_admin_sidebar') === 'collapsed');
    } catch { /* storage unavailable */ }
  }, []);
  const toggleCollapsed = () => {
    setCollapsed((c) => {
      try { localStorage.setItem('eduzy_admin_sidebar', c ? 'open' : 'collapsed'); } catch { /* ignore */ }
      return !c;
    });
  };

  useEffect(() => setMobileOpen(false), [path]);

  // the guided tour opens/closes the off-canvas sidebar on small screens
  useEffect(() => {
    const onSidebar = (e: Event) => setMobileOpen(!!(e as CustomEvent).detail?.open);
    window.addEventListener(SIDEBAR_EVENT, onSidebar);
    return () => window.removeEventListener(SIDEBAR_EVENT, onSidebar);
  }, []);

  useEffect(() => {
    api.get('/api/admin/dashboard').then((d) => {
      setNotices(d.notifications);
      setPendingCount(d.stats.drafts);
    }).catch(() => setNotices([]));
  }, [version, path]);

  // ⌘K / Ctrl+K opens search
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const logout = useCallback(async () => {
    if (!(await guard.confirmLeave())) return;
    try {
      await api.post('/api/admin/auth/logout');
    } catch { /* ignore */ }
    toast('Signed out');
    window.location.href = '/admin/login';
  }, [guard, toast]);

  const crumbs = useMemo(() => {
    const parts = path.split('/').filter(Boolean);
    const out: { label: string; href: string }[] = [];
    let acc = '';
    parts.forEach((p, i) => {
      acc += '/' + p;
      if (p === 'pages' && parts[i + 1]) return; // “Pages” is not a page itself
      const isItem = (parts[i - 1] === 'courses' || parts[i - 1] === 'blogs') && p !== 'new';
      const label = isItem ? 'Edit' : p === 'new' ? 'New' : CRUMB_LABELS[p] || decodeURIComponent(p);
      out.push({ label, href: acc });
    });
    if (out[0]) out[0].label = 'Dashboard';
    return out;
  }, [path]);

  const user = me?.user;
  const canSee = (item: NavItem) => !item.permission || me?.permissions?.[item.permission];

  return (
    <div className={`adm-app ${collapsed ? 'is-collapsed' : ''} ${mobileOpen ? 'is-open' : ''}`}>
      <div className="adm-scrim" onClick={() => setMobileOpen(false)} />
      <aside className="adm-sidebar" aria-label="Admin navigation">
        <div className="adm-sidebar__panel">
          <div className="adm-sidebar__brand">
            <GuardedLink href="/admin" aria-label="EDUZY admin dashboard" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              {collapsed ? <span className="adm-sidebar__mark">E</span> : <img src="https://res.cloudinary.com/wbckkjmc/image/upload/v1794040607/eduzy/logo/logo.png" alt="EDUZY" className="adm-sidebar__logo" />}
            </GuardedLink>
            <button type="button" className="adm-icon-btn adm-topbar__menu" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18} /></button>
          </div>
          <nav className="adm-sidebar__nav">
            {NAV.map((g) => {
              const items = g.items.filter(canSee);
              if (!items.length) return null;
              return (
                <div className="adm-sidebar__group" key={g.group}>
                  <div className="adm-sidebar__group-label">{g.group}</div>
                  {items.map((item) => {
                    const Icon = item.icon;
                    if (item.action === 'logout')
                      return (
                        <button key={item.label} type="button" className="adm-navlink" style={{ width: '100%' }} onClick={logout} title={collapsed ? item.label : undefined}>
                          <Icon size={19} /><span className="adm-navlink__text">{item.label}</span>
                        </button>
                      );
                    const active = isActive(item, path);
                    return (
                      <GuardedLink key={item.href} href={item.href} className={`adm-navlink ${active ? 'is-active' : ''}`} aria-current={active ? 'page' : undefined} title={collapsed ? item.label : undefined}>
                        <Icon size={19} />
                        <span className="adm-navlink__text">{item.label}</span>
                        {item.href === '/admin' && pendingCount > 0 && <span className="adm-navlink__count" title="Unpublished changes">{pendingCount}</span>}
                      </GuardedLink>
                    );
                  })}
                </div>
              );
            })}
          </nav>
          <div className="adm-sidebar__foot">
            <a className="adm-navlink" href="/" target="_blank" rel="noopener noreferrer" title={collapsed ? 'View website' : undefined}>
              <ExternalLink size={19} /><span className="adm-navlink__text">View website</span>
            </a>
          </div>
        </div>
      </aside>

      <div className="adm-main">
        <header className="adm-topbar">
          <button type="button" className="adm-round-btn adm-topbar__menu" onClick={() => setMobileOpen(true)} aria-label="Open menu"><Menu size={19} /></button>
          <button type="button" className="adm-round-btn adm-topbar__collapse" onClick={toggleCollapsed} aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'} title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}>
            {collapsed ? <PanelLeftOpen size={18} /> : <PanelLeftClose size={18} />}
          </button>
          <nav className="adm-crumbs" aria-label="Breadcrumb">
            {crumbs.map((c, i) =>
              i === crumbs.length - 1 ? (
                <span key={c.href} className="adm-crumbs__current">{c.label}</span>
              ) : (
                <React.Fragment key={c.href}>
                  <GuardedLink href={c.href}>{c.label}</GuardedLink>
                  <ChevronRight size={14} />
                </React.Fragment>
              ),
            )}
          </nav>
          <div className="adm-topbar__spacer" />
          <button type="button" className="adm-search-trigger" onClick={() => setSearchOpen(true)} aria-label="Search the CMS">
            <Search size={17} /><span>Search pages, courses, media…</span><kbd>Ctrl K</kbd>
          </button>
          <div style={{ position: 'relative' }}>
            <button type="button" className="adm-round-btn" onClick={() => { setNotesOpen((o) => !o); setProfileOpen(false); }} aria-label="Notifications" aria-expanded={notesOpen}>
              <Bell size={18} />
              {!!notices?.length && <span className="adm-round-btn__dot" />}
            </button>
            {notesOpen && (
              <Popover onClose={() => setNotesOpen(false)}>
                <div className="adm-pop__title">Notifications</div>
                {notices === null && <div className="adm-pop__empty"><Spinner /></div>}
                {notices?.length === 0 && <div className="adm-pop__empty">You’re all caught up.</div>}
                {notices?.map((n, i) => (
                  <button key={i} type="button" className="adm-pop__item" onClick={async () => { setNotesOpen(false); if (n.href && (await guard.confirmLeave())) router.push(n.href); }}>
                    <span className={`adm-pop__icon adm-pop__icon--${n.level}`}>{n.level === 'warning' ? <TriangleAlert size={16} /> : <Info size={16} />}</span>
                    <span><strong>{n.title}</strong><span>{n.text}</span></span>
                  </button>
                ))}
              </Popover>
            )}
          </div>
          <div style={{ position: 'relative' }}>
            <button type="button" onClick={() => { setProfileOpen((o) => !o); setNotesOpen(false); }} aria-label="Account menu" aria-expanded={profileOpen} style={{ borderRadius: '50%' }}>
              <span className="adm-avatar">{initials(user?.name || '')}</span>
            </button>
            {profileOpen && (
              <Popover onClose={() => setProfileOpen(false)} width={260}>
                <div style={{ padding: '10px 12px 12px' }}>
                  <strong style={{ display: 'block' }}>{user?.name}</strong>
                  <span className="adm-muted" style={{ fontSize: 12.5 }}>{user?.email}</span>
                  <div style={{ marginTop: 8 }}><span className="adm-chip adm-chip--orange">{user?.role === 'owner' ? 'Owner' : 'Editor'}</span></div>
                </div>
                <button type="button" className="adm-pop__item" onClick={async () => { setProfileOpen(false); if (await guard.confirmLeave()) router.push('/admin/profile'); }}>
                  <span className="adm-pop__icon"><UserRound size={16} /></span><span><strong>Admin profile</strong><span>Name, password, admins</span></span>
                </button>
                <button type="button" className="adm-pop__item" onClick={logout}>
                  <span className="adm-pop__icon"><LogOut size={16} /></span><span><strong>Log out</strong><span>End this session</span></span>
                </button>
              </Popover>
            )}
          </div>
        </header>
        <main className="adm-content" key={path}>{children}</main>
      </div>
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
      <Onboarding />
    </div>
  );
}

function Popover({ children, onClose, width }: { children: React.ReactNode; onClose: () => void; width?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (ref.current && !ref.current.parentElement?.contains(e.target as Node)) onClose();
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [onClose]);
  return <div ref={ref} className="adm-pop" style={width ? { width } : undefined}>{children}</div>;
}

interface Result { group: string; title: string; text?: string; href: string; image?: string }

function SearchDialog({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [active, setActive] = useState(0);
  const router = useRouter();
  const guard = useNavGuard();

  const quick: Result[] = NAV.flatMap((g) => g.items).filter((i) => !i.action).map((i) => ({ group: 'Go to', title: i.label, href: i.href }));
  const shown = q.trim().length < 2 ? quick.filter((r) => !q || r.title.toLowerCase().includes(q.toLowerCase())) : results;

  useEffect(() => {
    if (q.trim().length < 2) return;
    setLoading(true);
    const t = setTimeout(() => {
      api.get<{ results: Result[] }>(`/api/admin/search?q=${encodeURIComponent(q)}`)
        .then((r) => { setResults(r.results); setActive(0); })
        .catch(() => setResults([]))
        .finally(() => setLoading(false));
    }, 220);
    return () => clearTimeout(t);
  }, [q]);

  const go = async (r: Result) => {
    onClose();
    if (await guard.confirmLeave()) router.push(r.href);
  };

  return (
    <div className="adm-overlay" onMouseDown={onClose}>
      <div className="adm-search" role="dialog" aria-modal="true" aria-label="Search" onMouseDown={(e) => e.stopPropagation()}>
        <div className="adm-search__input">
          {loading ? <Spinner size={18} /> : <Search size={20} className="adm-muted" />}
          <input
            autoFocus
            value={q}
            placeholder="Search pages, courses, blog posts, photos, media…"
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') onClose();
              if (e.key === 'ArrowDown') { e.preventDefault(); setActive((a) => Math.min(a + 1, shown.length - 1)); }
              if (e.key === 'ArrowUp') { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)); }
              if (e.key === 'Enter' && shown[active]) go(shown[active]);
            }}
            aria-label="Search"
          />
          <button type="button" className="adm-icon-btn" onClick={onClose} aria-label="Close search"><X size={18} /></button>
        </div>
        <div className="adm-search__results">
          {shown.length === 0 && !loading && <div className="adm-pop__empty">No results for “{q}”.</div>}
          {shown.map((r, i) => {
            const header = i === 0 || shown[i - 1].group !== r.group ? r.group : null;
            return (
              <React.Fragment key={r.href + i}>
                {header && <div className="adm-search__group">{header}</div>}
                <button type="button" className={`adm-search__item ${i === active ? 'is-active' : ''}`} onMouseEnter={() => setActive(i)} onClick={() => go(r)}>
                  <span className="adm-search__thumb">{r.image ? <img src={r.image} alt="" /> : <FileText size={17} />}</span>
                  <span style={{ minWidth: 0 }}><strong>{r.title}</strong>{r.text && <span>{r.text}</span>}</span>
                </button>
              </React.Fragment>
            );
          })}
        </div>
      </div>
    </div>
  );
}
