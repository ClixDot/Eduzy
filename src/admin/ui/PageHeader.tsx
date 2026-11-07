'use client';
import React, { useCallback } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useNavGuard } from './feedback';
import { HelpTip } from './HelpTip';
import { PAGE_HELP } from './helpTexts';

export function PageHeader({ title, sub, actions, help }: { title: React.ReactNode; sub?: React.ReactNode; actions?: React.ReactNode; help?: string }) {
  const tip = help ?? (typeof title === 'string' ? PAGE_HELP[title] : undefined);
  return (
    <div className="adm-page-head">
      <div>
        <h1 className="adm-page-head__title">{title}{tip && <HelpTip text={tip} label={`About ${typeof title === 'string' ? title : 'this page'}`} />}</h1>
        {sub && <p className="adm-page-head__sub">{sub}</p>}
      </div>
      {actions && <div className="adm-page-head__actions">{actions}</div>}
    </div>
  );
}

/** Tab state stored in ?tab= so links can open a specific tab. Asks before discarding unsaved edits. */
export function useTab<T extends string>(tabs: readonly T[], fallback: T): [T, (t: T) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const path = usePathname();
  const guard = useNavGuard();
  const raw = params.get('tab') as T | null;
  const tab = raw && tabs.includes(raw) ? raw : fallback;
  const set = useCallback(
    async (t: T) => {
      if (t === tab) return;
      if (!(await guard.confirmLeave())) return;
      router.replace(`${path}${t === fallback ? '' : `?tab=${t}`}`, { scroll: false });
    },
    [tab, guard, router, path, fallback],
  );
  return [tab, set];
}

export function Tabs<T extends string>({ tabs, value, onChange, counts }: { tabs: { id: T; label: string }[]; value: T; onChange: (t: T) => void; counts?: Partial<Record<T, number>> }) {
  return (
    <div className="adm-seg" role="tablist" style={{ marginBottom: 18 }}>
      {tabs.map((t) => (
        <button key={t.id} type="button" role="tab" aria-selected={value === t.id} className={value === t.id ? 'is-active' : ''} onClick={() => onChange(t.id)}>
          {t.label}
          {counts?.[t.id] !== undefined && <span className="adm-seg__count">{counts[t.id]}</span>}
        </button>
      ))}
    </div>
  );
}
