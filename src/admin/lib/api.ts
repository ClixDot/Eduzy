'use client';

export class ApiError extends Error {
  constructor(message: string, public status: number, public errors?: Record<string, string>) {
    super(message);
  }
}

async function request<T>(method: string, url: string, body?: unknown): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url, {
      method,
      credentials: 'same-origin',
      headers: body instanceof FormData ? undefined : { 'Content-Type': 'application/json' },
      body: body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      cache: 'no-store',
    });
  } catch {
    throw new ApiError('Could not reach the server. Check your internet connection and try again.', 0);
  }
  const json: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    if (res.status === 401 && typeof window !== 'undefined' && !url.includes('/auth/')) {
      const next = encodeURIComponent(location.pathname + location.search);
      window.location.href = `/admin/login?next=${next}&expired=1`;
    }
    throw new ApiError(json.error || `Request failed (${res.status})`, res.status, json.errors);
  }
  return json as T;
}

/** Identical GET requests made at the same moment (e.g. the dashboard page and the notification bell) share one network call. */
const inflight = new Map<string, Promise<unknown>>();
function dedupedGet<T>(url: string): Promise<T> {
  const hit = inflight.get(url);
  if (hit) return hit as Promise<T>;
  const p = request<T>('GET', url).finally(() => inflight.delete(url));
  inflight.set(url, p);
  return p;
}

export const api = {
  get: <T = any>(url: string) => dedupedGet<T>(url),
  post: <T = any>(url: string, body?: unknown) => request<T>('POST', url, body ?? {}),
  put: <T = any>(url: string, body?: unknown) => request<T>('PUT', url, body ?? {}),
  del: <T = any>(url: string) => request<T>('DELETE', url),
};

export const timeAgo = (iso?: string | null) => {
  if (!iso) return 'never';
  const s = Math.round((Date.now() - new Date(iso).getTime()) / 1000);
  if (s < 45) return 'just now';
  const m = Math.round(s / 60);
  if (m < 60) return `${m} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} hour${h > 1 ? 's' : ''} ago`;
  const d = Math.round(h / 24);
  if (d < 7) return `${d} day${d > 1 ? 's' : ''} ago`;
  return new Date(iso).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};

export const bytes = (n: number) => (n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : n > 1024 ? `${Math.round(n / 1024)} KB` : `${n} B`);

export const initials = (name: string) =>
  String(name || '?').split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';
