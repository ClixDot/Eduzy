'use client';
import React, { useEffect, useMemo, useState } from 'react';
import { ArrowUpRight, Plus, GraduationCap, Newspaper, Images, Quote, Upload, House, Send, Save, Trash2, Pencil, Eye, CircleCheckBig, FileText, Library } from 'lucide-react';
import { api, timeAgo } from '../lib/api';
import { useAdmin } from '../lib/context';
import { Skeleton } from '../ui/feedback';
import { GuardedLink as Link } from '../shell/AdminShell';
import { Compass, RotateCcw } from 'lucide-react';
import { startTour } from '../onboarding/events';
import { TOUR_STEPS } from '../onboarding/steps';

interface Dash {
  stats: { totalPages: number; publishedPages: number; drafts: number; courses: { total: number; live: number }; blogs: { total: number; live: number }; media: { total: number; uploaded: number }; testimonials: number; gallery: number; faqs: number };
  pages: { name: string; path: string; href: string; live: boolean }[];
  pending: { label: string; kind: string; href: string; updatedAt: string; updatedBy?: string; state: 'changed' | 'draft' }[];
  chart: { date: string; label: string; saved: number; published: number }[];
  recentlyEdited: { label: string; kind: string; href: string; updatedAt: string; updatedBy?: string; live: boolean; changed: boolean }[];
  activity: { id: string; at: string; userName?: string; action: string; label: string; href?: string }[];
  notifications: { level: 'warning' | 'info'; title: string; text: string; href?: string }[];
  recentMedia: { id: string; url: string; alt: string }[];
}

const greeting = () => {
  const h = new Date().getHours();
  return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
};

/** Slim “Dashboard tour” strip: same tour as Admin Profile → Help & support, one line on the dashboard. */
function TourMini() {
  const { me } = useAdmin();
  const o = me?.user.onboarding;
  const total = TOUR_STEPS.filter((s) => !s.permission || me?.permissions?.[s.permission]).length;
  const status = !o || !o.started ? 'Not started' : o.completed ? 'Completed' : o.skipped ? `Skipped at step ${o.lastStep + 1} of ${total}` : `Step ${o.lastStep + 1} of ${total}`;
  const canResume = !!o && o.started && !o.completed && o.lastStep > 0;
  return (
    <section className="adm-tour-mini" aria-label="Dashboard tour">
      <span className="adm-tour-mini__icon"><Compass size={18} /></span>
      <div className="adm-tour-mini__text">
        <strong>Dashboard tour</strong>
        <span>{total}-step walkthrough · <em>{status}</em></span>
      </div>
      <div className="adm-tour-mini__actions">
        {canResume && (
          <button type="button" className="adm-btn adm-btn--light adm-btn--sm" onClick={() => startTour(o!.lastStep)}><RotateCcw size={14} /> Resume at step {o!.lastStep + 1}</button>
        )}
        <button type="button" className="adm-btn adm-btn--primary adm-btn--sm" onClick={() => startTour(0)}>
          <Compass size={14} /> {!o?.started ? 'Start tour' : o.completed ? 'Replay tour' : 'Restart'}
        </button>
      </div>
    </section>
  );
}

/** Animates a 0–1 value from where it currently is to `target` (ease-out), e.g. 0% → 89% when the dashboard opens. */
function useCountUp(target: number, duration = 1400) {
  const [shown, setShown] = useState(0);
  const from = React.useRef(0);
  useEffect(() => {
    const start = from.current;
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let raf = 0;
    let t0 = 0;
    const tick = (now: number) => {
      if (!t0) t0 = now;
      const p = reduce ? 1 : Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      const v = start + (target - start) * eased;
      from.current = v;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return shown;
}

function Gauge({ value }: { value: number }) {
  const pct = Math.max(0, Math.min(1, value));
  const shown = useCountUp(pct);
  const r = 80;
  const len = Math.PI * r;
  return (
    <div className="adm-gauge">
      <svg viewBox="0 0 200 110" role="img" aria-label={`${Math.round(pct * 100)}% of content is live`}>
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--surface-3)" strokeWidth="22" strokeLinecap="round" />
        {/* hidden at exactly 0 so the round line cap doesn't leave an orange dot */}
        <path d="M20 100 A80 80 0 0 1 180 100" fill="none" stroke="var(--orange)" strokeWidth="22" strokeLinecap="round" strokeDasharray={`${len * shown} ${len}`} opacity={shown > 0.001 ? 1 : 0} />
      </svg>
      <div className="adm-gauge__value"><span className="adm-figure adm-figure--md" aria-hidden="true">{Math.round(shown * 100)}%</span></div>
    </div>
  );
}

function ActivityChart({ data }: { data: Dash['chart'] }) {
  const W = 640, H = 230, padL = 28, padB = 26, padT = 34;
  const max = Math.max(4, ...data.map((d) => d.saved + d.published));
  const step = (W - padL) / data.length;
  const bw = Math.min(26, step * 0.56);
  const peak = data.reduce((best, d, i) => (d.saved + d.published > data[best].saved + data[best].published ? i : best), 0);
  const ticks = [0, Math.round(max / 2), max];
  const y = (v: number) => H - padB - (v / max) * (H - padB - padT);
  return (
    <svg className="adm-chart" viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Content changes per day over the last 14 days">
      <defs>
        <pattern id="hatch" width="7" height="7" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
          <rect width="7" height="7" fill="#f3f2ee" />
          <line x1="0" y1="0" x2="0" y2="7" stroke="#d5d3cc" strokeWidth="2.4" />
        </pattern>
      </defs>
      {ticks.map((t) => (
        <g key={t}>
          <line x1={padL} x2={W} y1={y(t)} y2={y(t)} stroke="var(--line-2)" strokeDasharray="3 5" />
          <text x={0} y={y(t) + 4}>{t}</text>
        </g>
      ))}
      {data.map((d, i) => {
        const x = padL + i * step + (step - bw) / 2;
        const total = d.saved + d.published;
        const isPeak = i === peak && total > 0;
        const hTotal = (total / max) * (H - padB - padT);
        const hPub = (d.published / max) * (H - padB - padT);
        return (
          <g key={d.date}>
            <title>{`${d.label}: ${d.saved} saved, ${d.published} published`}</title>
            <rect x={x} y={padT} width={bw} height={H - padB - padT} rx={bw / 2} fill="url(#hatch)" opacity={0.55} />
            {total > 0 && <rect className="adm-chart__bar" x={x} y={y(total)} width={bw} height={Math.max(hTotal, 4)} rx={bw / 2} fill={isPeak ? 'var(--orange)' : '#e9e7e1'} />}
            {d.published > 0 && !isPeak && <rect x={x} y={y(d.published)} width={bw} height={Math.max(hPub, 4)} rx={bw / 2} fill="var(--dark)" />}
            {isPeak && (
              <g>
                <rect x={x + bw / 2 - 17} y={y(total) - 30} width={34} height={22} rx={11} fill="var(--dark)" />
                <text x={x + bw / 2} y={y(total) - 15} textAnchor="middle" style={{ fill: '#fff', fontWeight: 700 }}>{total}</text>
                <circle cx={x + bw / 2} cy={y(total) + bw / 2} r={4} fill="#fff" />
              </g>
            )}
            {(i % 2 === 1 || data.length <= 8) && <text x={x + bw / 2} y={H - 6} textAnchor="middle">{d.label}</text>}
          </g>
        );
      })}
    </svg>
  );
}

const ACTION_ICON: Record<string, React.ReactNode> = {
  published: <Send size={15} />, unpublished: <Eye size={15} />, saved: <Save size={15} />, created: <Plus size={15} />, deleted: <Trash2 size={15} />,
  uploaded: <Upload size={15} />, replaced: <Images size={15} />, duplicated: <FileText size={15} />, reordered: <ArrowUpRight size={15} />, discarded: <Pencil size={15} />, updated: <Pencil size={15} />,
};
const actionWord = (a: string) => ({ published: 'Published', unpublished: 'Unpublished', saved: 'Saved draft', created: 'Created', deleted: 'Deleted', uploaded: 'Uploaded', replaced: 'Replaced', duplicated: 'Duplicated', reordered: 'Reordered', discarded: 'Discarded draft', updated: 'Updated', imported: 'Imported' } as Record<string, string>)[a] || a;

/** last dashboard data, so returning to the dashboard shows it instantly while fresh data loads */
let lastDash: Dash | null = null;

export default function Dashboard() {
  const { me, version } = useAdmin();
  const [d, setD] = useState<Dash | null>(lastDash);
  const [error, setError] = useState('');

  useEffect(() => {
    api.get<Dash>('/api/admin/dashboard').then((fresh) => {
      lastDash = fresh;
      setD(fresh);
    }).catch((e) => setError(e.message));
  }, [version]);

  const liveShare = useMemo(() => {
    if (!d) return 0;
    return d.stats.totalPages ? d.stats.publishedPages / d.stats.totalPages : 1;
  }, [d]);

  const firstName = (me?.user.name || '').split(' ')[0];

  if (error) return <div className="adm-notice adm-notice--error">{error}</div>;

  return (
    <>
      <section className="adm-hero">
        <div>
          <h1 className="adm-hero__greet">{greeting()},<br /><em>{firstName || 'admin'}</em>.</h1>
          <p className="adm-hero__sub">Here’s what’s happening on the EDUZY website.</p>
        </div>
        <div className="adm-hero__stats">
          {[
            { label: 'Website pages', value: d?.stats.totalPages, chip: d && <span className="adm-chip adm-chip--gray">{d.stats.courses.total} courses</span>, href: '/admin/website' },
            { label: 'Published', value: d?.stats.publishedPages, chip: d && <span className="adm-chip adm-chip--green">live</span>, href: '/admin/website' },
            { label: 'Unpublished drafts', value: d?.stats.drafts, chip: d && (d.stats.drafts ? <span className="adm-chip adm-chip--orange">review</span> : <span className="adm-chip adm-chip--green">clear</span>), href: '#pending' },
          ].map((s) => (
            <Link key={s.label} href={s.href} className="adm-hero__stat">
              <div className="adm-figure-label">{s.label}</div>
              <div className="adm-figure">{s.value ?? <Skeleton h={40} w={70} />}{s.chip}</div>
            </Link>
          ))}
        </div>
      </section>

      <TourMini />
      <div className="adm-dash">
        {/* Content health gauge */}
        <Link href="/admin/website" className="adm-card adm-card--link adm-span-4">
          <div className="adm-card__head">
            <div><h2 className="adm-card__title">Pages live</h2><p className="adm-card__sub">Website pages visitors can open</p></div>
            <span className="adm-card__corner"><ArrowUpRight size={18} /></span>
          </div>
          {d ? <Gauge value={liveShare} /> : <Skeleton h={120} />}
          {d && (
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12, fontSize: 13 }}>
              <span><strong>{d.stats.courses.live}</strong> <span className="adm-muted">courses live</span></span>
              <span><strong>{d.stats.gallery}</strong> <span className="adm-muted">photos</span></span>
              <span><strong>{d.stats.faqs}</strong> <span className="adm-muted">FAQs</span></span>
            </div>
          )}
        </Link>

        {/* Orange: unpublished changes */}
        <a href="#pending" className="adm-card adm-card--orange adm-card--link adm-span-3" style={{ display: 'flex', flexDirection: 'column' }}>
          <div className="adm-card__head">
            <h2 className="adm-card__title">Ready to<br />publish</h2>
            <span className="adm-card__corner"><ArrowUpRight size={18} /></span>
          </div>
          <span className="adm-btn adm-btn--sm" style={{ background: '#fff', color: 'var(--ink)', alignSelf: 'flex-start' }}><Send size={14} /> Review drafts</span>
          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'flex-end', gap: 10, paddingTop: 20 }}>
            <span className="adm-figure" style={{ fontSize: 64, color: '#fff' }}>{d ? d.stats.drafts : '–'}</span>
            <span style={{ fontSize: 12.5, lineHeight: 1.3, paddingBottom: 8, opacity: 0.9 }}>saved changes<br />not live yet</span>
          </div>
        </a>

        {/* Courses + blog */}
        <div className="adm-span-5" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0,1fr))', gap: 18 }}>
          <Link href="/admin/courses" className="adm-card adm-card--link">
            <div className="adm-card__head">
              <span className="adm-tile__icon"><GraduationCap size={20} /></span>
              <span className="adm-card__corner"><ArrowUpRight size={18} /></span>
            </div>
            <div className="adm-figure-label">Courses</div>
            <div className="adm-figure">{d ? d.stats.courses.total : <Skeleton h={40} w={60} />}</div>
            {d && <p className="adm-card__sub">{d.stats.courses.live} published · {d.stats.courses.total - d.stats.courses.live} draft</p>}
          </Link>
          <Link href="/admin/blogs" className="adm-card adm-card--link">
            <div className="adm-card__head">
              <span className="adm-tile__icon"><Newspaper size={20} /></span>
              <span className="adm-card__corner"><ArrowUpRight size={18} /></span>
            </div>
            <div className="adm-figure-label">Blog posts</div>
            <div className="adm-figure">{d ? d.stats.blogs.total : <Skeleton h={40} w={60} />}</div>
            {d && <p className="adm-card__sub">{d.stats.blogs.total ? `${d.stats.blogs.live} published` : 'No posts yet — write the first one'}</p>}
          </Link>
          <Link href="/admin/media" className="adm-card adm-card--link" style={{ gridColumn: 'span 2', display: 'flex', alignItems: 'center', gap: 16 }}>
            <span className="adm-tile__icon"><Library size={20} /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="adm-figure-label" style={{ marginBottom: 2 }}>Media library</div>
              <strong style={{ fontFamily: 'var(--font-head)', fontSize: 22 }}>{d ? d.stats.media.total : '–'}</strong> <span className="adm-muted">images · {d?.stats.media.uploaded ?? 0} uploaded</span>
            </div>
            <div style={{ display: 'flex' }}>
              {d?.recentMedia.slice(0, 4).map((m, i) => (
                <img key={m.id} src={m.url} alt="" style={{ width: 40, height: 40, borderRadius: '50%', objectFit: 'cover', border: '3px solid #fff', marginLeft: i ? -12 : 0, background: 'var(--surface-3)' }} />
              ))}
            </div>
          </Link>
        </div>

        {/* Activity chart */}
        <section className="adm-card adm-span-8" aria-labelledby="chart-title">
          <div className="adm-card__head">
            <div>
              <h2 className="adm-card__title" id="chart-title">Content activity</h2>
              <p className="adm-card__sub">Saves and publishes per day · last 14 days</p>
            </div>
            <div className="adm-chart-legend">
              <span><i style={{ background: 'var(--orange)' }} />Busiest day</span>
              <span><i style={{ background: 'var(--dark)' }} />Published</span>
              <span><i style={{ background: '#e9e7e1' }} />Saved</span>
            </div>
          </div>
          {d ? <ActivityChart data={d.chart} /> : <Skeleton h={230} />}
        </section>

        {/* Pending (dark, Portfolio “holding” style) */}
        <section className="adm-card adm-card--dark adm-span-4" id="pending" aria-labelledby="pending-title">
          <div className="adm-card__head">
            <div>
              <h2 className="adm-card__title" id="pending-title">Waiting to publish</h2>
              <p className="adm-card__sub">Saved drafts visitors can’t see yet</p>
            </div>
          </div>
          {!d ? <Skeleton h={180} /> : d.pending.length === 0 ? (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '24px 0', color: 'rgba(255,255,255,.7)' }}><CircleCheckBig size={20} color="var(--orange)" /> Everything is published.</div>
          ) : (
            <div className="adm-pending">
              {d.pending.slice(0, 6).map((p, i) => (
                <Link key={i} href={p.href} className="adm-pending__row">
                  <span className="adm-pending__badge">{p.state === 'draft' ? <FileText size={16} /> : <Pencil size={15} />}</span>
                  <span className="adm-pending__text"><strong>{p.label}</strong><span>{p.kind} · {p.state === 'draft' ? 'never published' : 'changes saved'} · {timeAgo(p.updatedAt)}</span></span>
                  <ArrowUpRight size={16} style={{ opacity: 0.5 }} />
                </Link>
              ))}
              {d.pending.length > 6 && <span style={{ fontSize: 12, color: 'rgba(255,255,255,.55)', paddingTop: 8 }}>+ {d.pending.length - 6} more</span>}
            </div>
          )}
        </section>

        {/* Recently edited */}
        <section className="adm-card adm-span-4" aria-labelledby="edited-title">
          <div className="adm-card__head"><h2 className="adm-card__title" id="edited-title">Recently edited</h2></div>
          {!d ? <Skeleton h={200} /> : d.recentlyEdited.length === 0 ? <p className="adm-muted">Nothing edited yet. Changes you make will appear here.</p> : (
            <div className="adm-pages">
              {d.recentlyEdited.slice(0, 6).map((e, i) => (
                <Link key={i} href={e.href}>
                  <strong style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{e.label}<span className="adm-muted" style={{ display: 'block', fontWeight: 400, fontSize: 12 }}>{e.kind} · {timeAgo(e.updatedAt)}{e.updatedBy ? ` · ${e.updatedBy}` : ''}</span></strong>
                  {e.changed ? <span className="adm-chip adm-chip--amber">Draft</span> : e.live ? <span className="adm-chip adm-chip--green">Live</span> : <span className="adm-chip adm-chip--gray">Draft</span>}
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Recent activity */}
        <section className="adm-card adm-span-4" aria-labelledby="activity-title">
          <div className="adm-card__head"><h2 className="adm-card__title" id="activity-title">Admin activity</h2></div>
          {!d ? <Skeleton h={200} /> : d.activity.length === 0 ? <p className="adm-muted">No activity yet.</p> : (
            <div className="adm-timeline">
              {d.activity.slice(0, 6).map((a) => {
                const kind = a.action === 'published' ? 'published' : a.action === 'deleted' ? 'deleted' : 'saved';
                const body = (
                  <>
                    <span className={`adm-timeline__icon adm-timeline__icon--${kind}`}>{ACTION_ICON[a.action] || <Pencil size={15} />}</span>
                    <span className="adm-timeline__text"><strong>{actionWord(a.action)} · {a.label}</strong><span>{a.userName || 'System'}</span></span>
                    <span className="adm-muted" style={{ fontSize: 12, whiteSpace: 'nowrap' }}>{timeAgo(a.at)}</span>
                  </>
                );
                return a.href ? <Link key={a.id} href={a.href} className="adm-timeline__item">{body}</Link> : <div key={a.id} className="adm-timeline__item">{body}</div>;
              })}
            </div>
          )}
        </section>

        {/* Quick create */}
        <section className="adm-card adm-span-4" aria-labelledby="quick-title">
          <div className="adm-card__head"><h2 className="adm-card__title" id="quick-title">Quick actions</h2></div>
          <div className="adm-quick">
            <Link href="/admin/courses/new"><span><Plus size={16} /></span>New course</Link>
            <Link href="/admin/blogs/new"><span><Newspaper size={16} /></span>Write blog post</Link>
            <Link href="/admin/gallery?open=new"><span><Images size={16} /></span>Add gallery photo</Link>
            <Link href="/admin/testimonials?open=new"><span><Quote size={16} /></span>Add testimonial</Link>
            <Link href="/admin/media"><span><Upload size={16} /></span>Upload images</Link>
            <Link href="/admin/pages/home"><span><House size={16} /></span>Edit home page</Link>
          </div>
        </section>


      </div>
    </>
  );
}
