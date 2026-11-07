'use client';
import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, CircleAlert, CheckCircle2, ArrowLeft, Mail, KeyRound } from 'lucide-react';
import { api, ApiError } from '../lib/api';
import { Spinner } from '../ui/feedback';

const LOGO = 'https://res.cloudinary.com/wbckkjmc/image/upload/v1794040607/eduzy/logo/logo.png';

function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="adm-auth">
      <div className="adm-auth__shell">
        <aside className="adm-auth__art">
          <span className="adm-auth__glow" aria-hidden="true" />
          <img src={LOGO} alt="EDUZY" className="adm-auth__brand" />
          <div className="adm-auth__pitch">
            <span className="adm-auth__eyebrow">EDUZY Website CMS</span>
            <p className="adm-auth__quote">Manage your website, from campus to career, in one place.</p>
          </div>
        </aside>
        <main className="adm-auth__panel">
          <div className="adm-auth__card">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

function PasswordInput({ id, value, onChange, autoComplete, invalid }: { id: string; value: string; onChange: (v: string) => void; autoComplete: string; invalid?: boolean }) {
  const [show, setShow] = useState(false);
  return (
    <div className="adm-pw">
      <input id={id} className={`adm-input ${invalid ? 'is-invalid' : ''}`} type={show ? 'text' : 'password'} value={value} onChange={(e) => onChange(e.target.value)} autoComplete={autoComplete} required />
      <button type="button" className="adm-icon-btn" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'}>{show ? <EyeOff size={17} /> : <Eye size={17} />}</button>
    </div>
  );
}

const Err = ({ msg }: { msg?: string }) => (msg ? <span className="adm-error"><CircleAlert size={14} style={{ marginTop: 1 }} />{msg}</span> : null);

function strength(pw: string) {
  let s = 0;
  if (pw.length >= 10) s++;
  if (pw.length >= 14) s++;
  if (/[a-z]/.test(pw) && /[A-Z]/.test(pw)) s++;
  if (/\d/.test(pw)) s++;
  if (/[^a-zA-Z0-9]/.test(pw)) s++;
  return Math.min(4, s);
}
export function StrengthBar({ pw }: { pw: string }) {
  const s = strength(pw);
  const labels = ['Too weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['#d92d2d', '#d92d2d', '#a5650a', '#17864b', '#17864b'];
  if (!pw) return <span className="adm-help">At least 10 characters with letters and numbers.</span>;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <div style={{ display: 'flex', gap: 4, flex: 1 }}>
        {[0, 1, 2, 3].map((i) => <i key={i} style={{ height: 5, flex: 1, borderRadius: 4, background: i < s ? colors[s] : 'var(--surface-3)' }} />)}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: colors[s] }}>{labels[s]}</span>
    </div>
  );
}

export function LoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api.get('/api/admin/auth/setup').then((r) => r.needsSetup && router.replace('/admin/setup')).catch(() => undefined);
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) return setError('Enter your email and password.');
    setBusy(true);
    try {
      await api.post('/api/admin/auth/login', { email, password });
      const next = params.get('next');
      window.location.href = next && next.startsWith('/admin') && !next.startsWith('//') ? next : '/admin';
    } catch (e: any) {
      setError(e.message);
      setBusy(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="adm-auth__title">Welcome back</h1>
      <p className="adm-auth__sub">Sign in to manage the EDUZY website.</p>
      {params.get('expired') && <div className="adm-notice adm-notice--warning" style={{ marginBottom: 16 }}>Your session expired. Please sign in again.</div>}
      {params.get('reset') && <div className="adm-notice adm-notice--info" style={{ marginBottom: 16 }}><CheckCircle2 size={16} />Password changed. Sign in with your new password.</div>}
      <form className="adm-auth__form" onSubmit={submit} noValidate>
        <div className="adm-field">
          <label className="adm-label" htmlFor="email">Email</label>
          <input id="email" className="adm-input" type="email" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value)} autoFocus required />
        </div>
        <div className="adm-field">
          <label className="adm-label" htmlFor="password">Password</label>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        {error && <div className="adm-notice adm-notice--error" role="alert"><CircleAlert size={16} />{error}</div>}
        <button type="submit" className="adm-btn adm-btn--primary adm-btn--lg adm-btn--block" disabled={busy}>{busy && <Spinner />} Sign in</button>
      </form>
    </AuthLayout>
  );
}

export function SetupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [setupToken, setSetupToken] = useState('');
  const [requiresCode, setRequiresCode] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [allowed, setAllowed] = useState<boolean | null>(null);

  useEffect(() => {
    api.get('/api/admin/auth/setup')
      .then((r) => {
        if (!r.needsSetup) return router.replace('/admin/login');
        setRequiresCode(!!r.requiresCode);
        setAllowed(true);
      })
      .catch(() => setAllowed(true));
  }, [router]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const errs: Record<string, string> = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = 'Enter a valid email address.';
    if (password.length < 10 || !/[a-zA-Z]/.test(password) || !/\d/.test(password)) errs.password = 'Use at least 10 characters with letters and numbers.';
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await api.post('/api/admin/auth/setup', { email, password, setupToken });
      window.location.href = '/admin';
    } catch (e: any) {
      if (e instanceof ApiError && e.errors) setErrors(e.errors);
      setError(e.message);
      setBusy(false);
    }
  };
  if (allowed === null) return <AuthLayout><Spinner /></AuthLayout>;

  return (
    <AuthLayout>
      <h1 className="adm-auth__title">Create your admin login</h1>
      <p className="adm-auth__sub">Choose the email and password you will use to sign in.</p>
      <form className="adm-auth__form" onSubmit={submit} noValidate>
        <div className="adm-field"><label className="adm-label" htmlFor="email">Email</label><input id="email" type="email" className={`adm-input ${errors.email ? 'is-invalid' : ''}`} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus /><Err msg={errors.email} /></div>
        <div className="adm-field"><label className="adm-label" htmlFor="password">Password</label><PasswordInput id="password" value={password} onChange={setPassword} autoComplete="new-password" invalid={!!errors.password} /><StrengthBar pw={password} /><Err msg={errors.password} /></div>
        {requiresCode && (
          <div className="adm-field"><label className="adm-label" htmlFor="token">Setup code</label><input id="token" className={`adm-input ${errors.setupToken ? 'is-invalid' : ''}`} value={setupToken} onChange={(e) => setSetupToken(e.target.value)} autoComplete="off" /><Err msg={errors.setupToken} /></div>
        )}
        {error && <div className="adm-notice adm-notice--error" role="alert"><CircleAlert size={16} />{error}</div>}
        <button type="submit" className="adm-btn adm-btn--primary adm-btn--lg adm-btn--block" disabled={busy}>{busy && <Spinner />} Create login</button>
      </form>
    </AuthLayout>
  );
}

export function ForgotPage() {
  const [email, setEmail] = useState('');
  const [done, setDone] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError('Enter a valid email address.');
    setBusy(true);
    setError('');
    try {
      const r = await api.post('/api/admin/auth/forgot', { email });
      setDone(r.message);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <AuthLayout>
      <a href="/admin/login" className="adm-btn adm-btn--ghost adm-btn--sm" style={{ marginBottom: 18, marginLeft: -12 }}><ArrowLeft size={15} /> Back to sign in</a>
      <h1 className="adm-auth__title">Reset your password</h1>
      <p className="adm-auth__sub">Enter your admin email and we’ll send you a link to choose a new password.</p>
      {done ? (
        <div className="adm-notice adm-notice--info"><Mail size={16} />{done}</div>
      ) : (
        <form className="adm-auth__form" onSubmit={submit} noValidate>
          <div className="adm-field"><label className="adm-label" htmlFor="email">Email</label><input id="email" type="email" className="adm-input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" autoFocus /></div>
          {error && <div className="adm-notice adm-notice--error" role="alert"><CircleAlert size={16} />{error}</div>}
          <button type="submit" className="adm-btn adm-btn--primary adm-btn--lg adm-btn--block" disabled={busy}>{busy && <Spinner />} Send reset link</button>
        </form>
      )}
    </AuthLayout>
  );
}

export function ResetPage() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get('token') || '';
  const [pw, setPw] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pw !== confirm) return setError('Passwords do not match.');
    setBusy(true);
    setError('');
    try {
      await api.post('/api/admin/auth/reset', { token, password: pw });
      router.replace('/admin/login?reset=1');
    } catch (e: any) {
      setError(e.message);
      setBusy(false);
    }
  };
  return (
    <AuthLayout>
      <h1 className="adm-auth__title">Choose a new password</h1>
      <p className="adm-auth__sub">You’ll be signed out on all other devices.</p>
      {!token ? (
        <div className="adm-notice adm-notice--error">This reset link is incomplete. <a href="/admin/forgot-password">Request a new one</a>.</div>
      ) : (
        <form className="adm-auth__form" onSubmit={submit} noValidate>
          <div className="adm-field"><label className="adm-label" htmlFor="pw">New password</label><PasswordInput id="pw" value={pw} onChange={setPw} autoComplete="new-password" /><StrengthBar pw={pw} /></div>
          <div className="adm-field"><label className="adm-label" htmlFor="pw2">Confirm new password</label><PasswordInput id="pw2" value={confirm} onChange={setConfirm} autoComplete="new-password" /></div>
          {error && <div className="adm-notice adm-notice--error" role="alert"><CircleAlert size={16} />{error}</div>}
          <button type="submit" className="adm-btn adm-btn--primary adm-btn--lg adm-btn--block" disabled={busy}>{busy ? <Spinner /> : <KeyRound size={17} />} Save new password</button>
        </form>
      )}
    </AuthLayout>
  );
}
