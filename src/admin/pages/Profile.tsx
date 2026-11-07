'use client';
import React, { useEffect, useState } from 'react';
import { UserPlus, Shield, KeyRound, LogOut, Trash2, CircleAlert, Compass, RotateCcw, BookOpen } from 'lucide-react';
import { startTour } from '../onboarding/events';
import { TOUR_STEPS } from '../onboarding/steps';
import { api, ApiError, initials, timeAgo } from '../lib/api';
import { useAdmin } from '../lib/context';
import { useConfirm, useToast, Spinner, Modal } from '../ui/feedback';
import { PageHeader, Tabs, useTab } from '../ui/PageHeader';
import { StrengthBar } from './Auth';

const Err = ({ msg }: { msg?: string }) => (msg ? <span className="adm-error"><CircleAlert size={14} style={{ marginTop: 1 }} />{msg}</span> : null);

export default function Profile() {
  const { me } = useAdmin();
  const tabs = [
    { id: 'profile', label: 'My profile' },
    { id: 'security', label: 'Password & sessions' },
    ...(me?.permissions.users ? [{ id: 'admins', label: 'Admins & roles' }] : []),
    { id: 'help', label: 'Help & support' },
  ] as { id: 'profile' | 'security' | 'admins' | 'help'; label: string }[];
  const [tab, setTab] = useTab(tabs.map((t) => t.id), 'profile');
  return (
    <>
      <PageHeader title="Admin Profile" sub="Your account, password and — for owners — who else can manage the website." />
      <Tabs tabs={tabs} value={tab} onChange={setTab} />
      {tab === 'profile' && <MyProfile />}
      {tab === 'security' && <Security />}
      {tab === 'admins' && me?.permissions.users && <Admins />}
      {tab === 'help' && <HelpSupport />}
    </>
  );
}

// ---------------------------------------------------------------------------
// Help & support: replay the guided tour + a short written guide
// ---------------------------------------------------------------------------
const GUIDE: { q: string; steps: string[] }[] = [
  { q: 'Change text or an image on the home page', steps: ['Open Home Page in the sidebar.', 'Click the pencil on the section you want to change.', 'Edit the text, or click Replace under an image to choose a new one.', 'Click Publish to put it on the website.'] },
  { q: 'Add a new course', steps: ['Open Courses and click “New course”.', 'Fill in the Basics, Details, Images and SEO tabs.', 'Click Publish. The course gets its own page at /courses/<address>.'] },
  { q: 'Hide a course without deleting it', steps: ['Open the course.', 'Click Unpublish. It disappears from the website but stays in the dashboard.'] },
  { q: 'Write a blog post', steps: ['Open Blogs / Journal and click “Write a post”.', 'Add a title, cover image and the article text.', 'Save draft while you work, then Publish when it is ready.'] },
  { q: 'Upload or replace an image', steps: ['Open Media Library and click “Upload images”.', 'To replace an image everywhere it is used, click it and choose Replace.'] },
  { q: 'Update the phone number, email or social links', steps: ['Open Global Settings → Contact & social.', 'Edit the details and Publish. They update everywhere on the website.'] },
  { q: 'Check my changes before they go live', steps: ['In any editor, click Preview to see the page with your changes.', 'Save draft keeps changes private. Only Publish makes them public.', 'Use “View website” at the bottom of the sidebar to check the live site.'] },
];

function HelpSupport() {
  const { me, reloadMe } = useAdmin();
  const toast = useToast();
  const o = me?.user.onboarding;
  const [saving, setSaving] = useState(false);
  const total = TOUR_STEPS.filter((s) => !s.permission || me?.permissions?.[s.permission]).length;
  const status = !o || !o.started ? 'Not started yet' : o.completed ? 'Completed' : o.skipped ? `Skipped at step ${o.lastStep + 1} of ${total}` : `In progress (step ${o.lastStep + 1} of ${total})`;
  const canResume = !!o && o.started && !o.completed && o.lastStep > 0;

  const setShowAgain = async (v: boolean) => {
    setSaving(true);
    try {
      await api.put('/api/admin/me', { action: 'onboarding', showOnLogin: v, showAgain: v });
      await reloadMe();
      toast(v ? 'The welcome screen will show every time you sign in.' : 'The welcome screen won’t show when you sign in.');
    } catch (e: any) {
      toast(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="adm-grid adm-grid--2" style={{ alignItems: 'start' }}>
      <section className="adm-card" aria-labelledby="tour-title">
        <span className="adm-tile__icon"><Compass size={20} /></span>
        <h2 id="tour-title" className="adm-card__title" style={{ marginTop: 12 }}>Take a dashboard tour</h2>
        <p className="adm-card__sub" style={{ marginTop: 4 }}>A short, {total}-step walkthrough of the dashboard: pages, courses, blogs, media, settings and publishing.</p>
        <p style={{ marginTop: 10, fontSize: 13 }}><span className="adm-muted">Your progress:</span> <strong>{status}</strong></p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginTop: 16 }}>
          <button type="button" className="adm-btn adm-btn--primary" onClick={() => startTour(0)}><Compass size={16} /> {o?.started ? 'Restart guided tour' : 'Start guided tour'}</button>
          {canResume && <button type="button" className="adm-btn adm-btn--light" onClick={() => startTour(o!.lastStep)}><RotateCcw size={16} /> Resume at step {o!.lastStep + 1}</button>}
        </div>
        <label className="adm-toggle" style={{ marginTop: 18 }}>
          <input type="checkbox" checked={o?.showOnLogin !== false} disabled={saving} onChange={(e) => setShowAgain(e.target.checked)} />
          <span className="adm-toggle__track" />
          Show the welcome screen every time I sign in
        </label>
      </section>

      <section className="adm-card" aria-labelledby="guide-title">
        <span className="adm-tile__icon"><BookOpen size={20} /></span>
        <h2 id="guide-title" className="adm-card__title" style={{ marginTop: 12 }}>Dashboard guide</h2>
        <p className="adm-card__sub" style={{ marginTop: 4, marginBottom: 14 }}>Quick answers to common tasks. Look for the <strong>?</strong> next to page titles for more tips.</p>
        <div className="adm-help-guide">
          {GUIDE.map((g) => (
            <details key={g.q}>
              <summary>{g.q}</summary>
              <ol>{g.steps.map((s) => <li key={s}>{s}</li>)}</ol>
            </details>
          ))}
        </div>
      </section>
    </div>
  );
}

function MyProfile() {
  const { me, reloadMe } = useAdmin();
  const toast = useToast();
  const [name, setName] = useState(me?.user.name || '');
  const [email, setEmail] = useState(me?.user.email || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.put('/api/admin/me', { action: 'profile', name, email });
      await reloadMe();
      setErrors({});
      toast('Profile updated');
    } catch (e: any) {
      if (e instanceof ApiError && e.errors) setErrors(e.errors);
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="adm-grid adm-grid--2" style={{ alignItems: 'start' }}>
      <form className="adm-card" onSubmit={save}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22 }}>
          <span className="adm-avatar" style={{ width: 64, height: 64, fontSize: 22 }}>{initials(name)}</span>
          <div>
            <div className="adm-card__title">{me?.user.name}</div>
            <span className="adm-chip adm-chip--orange" style={{ marginTop: 6 }}><Shield size={12} /> {me?.user.role === 'owner' ? 'Owner — full access' : 'Editor — content only'}</span>
          </div>
        </div>
        <div className="adm-form">
          <div className="adm-field"><label className="adm-label" htmlFor="p-name">Name</label><input id="p-name" className={`adm-input ${errors.name ? 'is-invalid' : ''}`} value={name} onChange={(e) => setName(e.target.value)} /><Err msg={errors.name} /></div>
          <div className="adm-field"><label className="adm-label" htmlFor="p-email">Email (used to sign in)</label><input id="p-email" type="email" className={`adm-input ${errors.email ? 'is-invalid' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} /><Err msg={errors.email} /></div>
        </div>
        <button type="submit" className="adm-btn adm-btn--dark" style={{ marginTop: 18 }} disabled={busy || (name === me?.user.name && email === me?.user.email)}>{busy && <Spinner />} Save profile</button>
      </form>
      <div className="adm-card">
        <h2 className="adm-card__title" style={{ marginBottom: 12 }}>What you can do</h2>
        <ul style={{ display: 'grid', gap: 10, fontSize: 13.5 }}>
          <li>✓ Edit and publish all website pages, courses, blog posts, gallery, testimonials and FAQs</li>
          <li>✓ Upload and manage images in the Media Library</li>
          <li style={{ opacity: me?.permissions.settings ? 1 : 0.45 }}>{me?.permissions.settings ? '✓' : '✕'} Change Global Settings, contact details and SEO</li>
          <li style={{ opacity: me?.permissions.users ? 1 : 0.45 }}>{me?.permissions.users ? '✓' : '✕'} Add and remove admins</li>
        </ul>
        <p className="adm-help" style={{ marginTop: 14 }}>Last sign-in: {timeAgo(me?.user.lastLoginAt)}</p>
      </div>
    </div>
  );
}

function Security() {
  const toast = useToast();
  const confirm = useConfirm();
  const [current, setCurrent] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const change = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== pw2) return setErrors({ confirm: 'Passwords do not match.' });
    setBusy(true);
    try {
      await api.put('/api/admin/me', { action: 'password', current, password: pw });
      setCurrent(''); setPw(''); setPw2(''); setErrors({});
      toast('Password changed. Other devices have been signed out.');
    } catch (e: any) {
      if (e instanceof ApiError && e.errors) setErrors(e.errors);
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  const signOutAll = async () => {
    if (!(await confirm({ title: 'Sign out on all other devices?', message: 'You stay signed in here. Everyone using your account elsewhere will need to sign in again.', confirmLabel: 'Sign out other devices' }))) return;
    try {
      await api.put('/api/admin/me', { action: 'signout-all' });
      toast('Other devices signed out');
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };
  return (
    <div className="adm-grid adm-grid--2" style={{ alignItems: 'start' }}>
      <form className="adm-card" onSubmit={change} noValidate>
        <h2 className="adm-card__title" style={{ marginBottom: 18, display: 'flex', gap: 8, alignItems: 'center' }}><KeyRound size={18} /> Change password</h2>
        <div className="adm-form">
          <div className="adm-field"><label className="adm-label" htmlFor="s-cur">Current password</label><input id="s-cur" type="password" className={`adm-input ${errors.current ? 'is-invalid' : ''}`} value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" /><Err msg={errors.current} /></div>
          <div className="adm-field"><label className="adm-label" htmlFor="s-new">New password</label><input id="s-new" type="password" className={`adm-input ${errors.password ? 'is-invalid' : ''}`} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /><StrengthBar pw={pw} /><Err msg={errors.password} /></div>
          <div className="adm-field"><label className="adm-label" htmlFor="s-new2">Confirm new password</label><input id="s-new2" type="password" className={`adm-input ${errors.confirm ? 'is-invalid' : ''}`} value={pw2} onChange={(e) => setPw2(e.target.value)} autoComplete="new-password" /><Err msg={errors.confirm} /></div>
        </div>
        <button type="submit" className="adm-btn adm-btn--dark" style={{ marginTop: 18 }} disabled={busy || !current || !pw}>{busy && <Spinner />} Change password</button>
      </form>
      <div className="adm-card">
        <h2 className="adm-card__title" style={{ marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}><LogOut size={18} /> Sessions</h2>
        <p className="adm-muted" style={{ marginBottom: 16 }}>Signed in on a shared or lost device? Sign out everywhere else.</p>
        <button type="button" className="adm-btn adm-btn--light" onClick={signOutAll}>Sign out other devices</button>
      </div>
    </div>
  );
}

interface AdminUser { id: string; name: string; email: string; role: 'owner' | 'editor'; createdAt: string; lastLoginAt?: string | null; disabled?: boolean }

function Admins() {
  const { me } = useAdmin();
  const toast = useToast();
  const confirm = useConfirm();
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [resetFor, setResetFor] = useState<AdminUser | null>(null);
  const load = () => api.get<{ users: AdminUser[] }>('/api/admin/users').then((r) => setUsers(r.users)).catch((e) => toast(e.message, 'error'));
  useEffect(() => { load(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const update = async (u: AdminUser, patch: Partial<AdminUser>, msg: string) => {
    try {
      await api.put(`/api/admin/users/${u.id}`, patch);
      toast(msg);
      load();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };
  const remove = async (u: AdminUser) => {
    if (!(await confirm({ title: `Remove ${u.name}?`, message: 'They will lose access to the admin immediately. Their past edits stay in the activity log.', confirmLabel: 'Remove admin', danger: true }))) return;
    try {
      await api.del(`/api/admin/users/${u.id}`);
      toast('Admin removed');
      load();
    } catch (e: any) {
      toast(e.message, 'error');
    }
  };

  return (
    <>
      <div className="adm-toolbar">
        <p className="adm-muted" style={{ flex: 1 }}><strong>Owners</strong> can change everything. <strong>Editors</strong> can edit and publish content and images, but not settings, SEO or admins.</p>
        <button type="button" className="adm-btn adm-btn--primary" onClick={() => setAdding(true)}><UserPlus size={16} /> Add admin</button>
      </div>
      <div className="adm-card adm-card--flush">
        {!users ? <div style={{ padding: 20 }}><Spinner /></div> : users.map((u) => (
          <div key={u.id} className="adm-row" style={{ gridTemplateColumns: 'auto minmax(0,1fr) auto auto' }}>
            <span className="adm-avatar adm-avatar--sm" style={{ width: 40, height: 40 }}>{initials(u.name)}</span>
            <div className="adm-row__main">
              <span className="adm-row__title">{u.name}{u.id === me?.user.id && <span className="adm-muted" style={{ fontWeight: 400 }}> (you)</span>}</span>
              <span className="adm-row__sub">{u.email} · last sign-in {timeAgo(u.lastLoginAt)}{u.disabled ? ' · disabled' : ''}</span>
            </div>
            <select className="adm-select" style={{ height: 38, width: 130 }} value={u.role} disabled={u.id === me?.user.id} onChange={(e) => update(u, { role: e.target.value as any }, 'Role updated')} aria-label={`Role for ${u.name}`}>
              <option value="owner">Owner</option>
              <option value="editor">Editor</option>
            </select>
            <span className="adm-row__actions" style={{ gridColumn: 'auto', border: 0 }}>
              <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => setResetFor(u)}>Set password</button>
              {u.id !== me?.user.id && <button type="button" className="adm-btn adm-btn--ghost adm-btn--sm" onClick={() => update(u, { disabled: !u.disabled }, u.disabled ? 'Account enabled' : 'Account disabled')}>{u.disabled ? 'Enable' : 'Disable'}</button>}
              {u.id !== me?.user.id && <button type="button" className="adm-icon-btn adm-icon-btn--danger" onClick={() => remove(u)} aria-label={`Remove ${u.name}`}><Trash2 size={16} /></button>}
            </span>
          </div>
        ))}
      </div>
      {adding && <AddAdmin onClose={() => setAdding(false)} onAdded={() => { setAdding(false); load(); }} />}
      {resetFor && <SetPassword user={resetFor} onClose={() => setResetFor(null)} />}
    </>
  );
}

function AddAdmin({ onClose, onAdded }: { onClose: () => void; onAdded: () => void }) {
  const toast = useToast();
  const [f, setF] = useState({ name: '', email: '', password: '', role: 'editor' });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await api.post('/api/admin/users', f);
      toast(`${f.name} can now sign in`);
      onAdded();
    } catch (e: any) {
      if (e instanceof ApiError && e.errors) setErrors(e.errors);
      toast(e.message, 'error');
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title="Add an admin" onClose={onClose} footer={<><button type="button" className="adm-btn adm-btn--light" onClick={onClose}>Cancel</button><button type="button" className="adm-btn adm-btn--primary" onClick={submit} disabled={busy}>{busy && <Spinner />} Add admin</button></>}>
      <div className="adm-form">
        <div className="adm-field adm-field--half"><label className="adm-label" htmlFor="a-name">Name</label><input id="a-name" className={`adm-input ${errors.name ? 'is-invalid' : ''}`} value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /><Err msg={errors.name} /></div>
        <div className="adm-field adm-field--half"><label className="adm-label" htmlFor="a-role">Role</label><select id="a-role" className="adm-select" value={f.role} onChange={(e) => setF({ ...f, role: e.target.value })}><option value="editor">Editor — content only</option><option value="owner">Owner — full access</option></select></div>
        <div className="adm-field"><label className="adm-label" htmlFor="a-email">Email</label><input id="a-email" type="email" className={`adm-input ${errors.email ? 'is-invalid' : ''}`} value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} /><Err msg={errors.email} /></div>
        <div className="adm-field"><label className="adm-label" htmlFor="a-pw">Temporary password</label><input id="a-pw" className={`adm-input ${errors.password ? 'is-invalid' : ''}`} value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} autoComplete="new-password" /><StrengthBar pw={f.password} /><Err msg={errors.password} /><span className="adm-help">Share it privately; they can change it under Admin Profile.</span></div>
      </div>
    </Modal>
  );
}

function SetPassword({ user, onClose }: { user: AdminUser; onClose: () => void }) {
  const toast = useToast();
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    setBusy(true);
    try {
      await api.put(`/api/admin/users/${user.id}`, { password: pw });
      toast(`Password set for ${user.name}. They were signed out everywhere.`);
      onClose();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <Modal title={`Set a new password for ${user.name}`} onClose={onClose} footer={<><button type="button" className="adm-btn adm-btn--light" onClick={onClose}>Cancel</button><button type="button" className="adm-btn adm-btn--dark" onClick={submit} disabled={busy || !pw}>{busy && <Spinner />} Set password</button></>}>
      <div className="adm-field"><label className="adm-label" htmlFor="sp">New password</label><input id="sp" className={`adm-input ${err ? 'is-invalid' : ''}`} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="new-password" /><StrengthBar pw={pw} /><Err msg={err} /></div>
    </Modal>
  );
}
