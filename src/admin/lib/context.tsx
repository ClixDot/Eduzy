'use client';
import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from './api';

export interface OnboardingState {
  started: boolean;
  completed: boolean;
  skipped: boolean;
  lastStep: number;
  showAgain: boolean;
  updatedAt: string;
}

export interface Me {
  user: { id: string; name: string; email: string; role: 'owner' | 'editor'; lastLoginAt?: string | null; onboarding?: OnboardingState | null };
  permissions: { content: boolean; settings: boolean; users: boolean };
  system: { contentStorage: string; contentStorageKind: string; mediaStorage: string; mediaStorageKind: string; email: string; production: boolean };
}

interface AdminCtx {
  me: Me | null;
  reloadMe: () => Promise<void>;
  /** select options from a collection (e.g. course categories) */
  options: (source: string) => { value: string; label: string }[] | null;
  invalidateOptions: (source?: string) => void;
  /** bumps whenever content changes, so dashboards/badges can refresh */
  version: number;
  bump: () => void;
}

const Ctx = createContext<AdminCtx | null>(null);

export function AdminProvider({ initialMe, children }: { initialMe: Me | null; children: React.ReactNode }) {
  const [me, setMe] = useState<Me | null>(initialMe);
  const [opts, setOpts] = useState<Record<string, { value: string; label: string }[]>>({});
  const loading = useRef(new Set<string>());
  const [version, setVersion] = useState(0);

  const reloadMe = useCallback(async () => {
    setMe(await api.get<Me>('/api/admin/me'));
  }, []);

  useEffect(() => {
    if (!initialMe) reloadMe().catch(() => undefined);
  }, [initialMe, reloadMe]);

  const options = useCallback(
    (source: string) => {
      if (opts[source]) return opts[source];
      if (!loading.current.has(source)) {
        loading.current.add(source);
        api
          .get<{ items: any[] }>(`/api/admin/collections/${source}`)
          .then(({ items }) => setOpts((o) => ({ ...o, [source]: items.map((i) => ({ value: i.data.slug, label: i.data.label || i.data.slug })) })))
          .catch(() => setOpts((o) => ({ ...o, [source]: [] })))
          .finally(() => loading.current.delete(source));
      }
      return null;
    },
    [opts],
  );

  const invalidateOptions = useCallback((source?: string) => {
    setOpts((o) => {
      if (!source) return {};
      const { [source]: _, ...rest } = o;
      return rest;
    });
  }, []);

  const bump = useCallback(() => setVersion((v) => v + 1), []);

  return <Ctx.Provider value={{ me, reloadMe, options, invalidateOptions, version, bump }}>{children}</Ctx.Provider>;
}

export function useAdmin() {
  const c = useContext(Ctx);
  if (!c) throw new Error('useAdmin must be used inside AdminProvider');
  return c;
}
