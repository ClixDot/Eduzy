import type { Field } from './fields';

export type Errors = Record<string, string>;

const SAFE_URL = /^(\/(?!\/)|#|\?|https?:\/\/|mailto:|tel:)/i;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const TEL = /^\+?[0-9\s-]{6,20}$/;
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const COLOR = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;
const DATE = /^\d{4}-\d{2}-\d{2}$/;

export const isSafeUrl = (v: string) => SAFE_URL.test(v.trim());

export function slugify(input: string): string {
  return String(input || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 100);
}

const isEmpty = (v: unknown) =>
  v === undefined || v === null || (typeof v === 'string' && v.trim() === '') || (Array.isArray(v) && v.length === 0);

/** Strip tags for length / emptiness checks on formatted text. */
const textOf = (html: string) => html.replace(/<[^>]*>/g, '').replace(/&nbsp;/g, ' ').trim();

export interface ValidateOptions {
  /** server-side HTML sanitizer (sanitize-html); omitted on the client */
  sanitizeHtml?: (html: string, mode: 'inline' | 'rich') => string;
}

/**
 * Validates `data` against `fields` and returns a cleaned copy.
 * Unknown keys are dropped (except `id`, which repeaters use for stable keys).
 */
export function validateFields(
  fields: Field[],
  data: Record<string, any> | undefined,
  opts: ValidateOptions = {},
  prefix = '',
): { value: Record<string, any>; errors: Errors } {
  const errors: Errors = {};
  const value: Record<string, any> = {};
  const src = data && typeof data === 'object' ? data : {};
  if (typeof src._key === 'string') value._key = src._key.slice(0, 40);

  for (const field of fields) {
    const path = prefix ? `${prefix}.${field.name}` : field.name;
    const raw = src[field.name];
    const label = field.label;

    switch (field.type) {
      case 'group': {
        const r = validateFields(field.fields || [], raw, opts, path);
        value[field.name] = r.value;
        Object.assign(errors, r.errors);
        break;
      }
      case 'repeater': {
        const arr = Array.isArray(raw) ? raw : [];
        if (field.maxItems && arr.length > field.maxItems) errors[path] = `${label}: at most ${field.maxItems} items.`;
        if (field.minItems && arr.length < field.minItems) errors[path] = `${label}: add at least ${field.minItems}.`;
        value[field.name] = arr.slice(0, field.maxItems || 500).map((item: any, i: number) => {
          const r = validateFields(field.fields || [], item, opts, `${path}.${i}`);
          Object.assign(errors, r.errors);
          return r.value;
        });
        break;
      }
      case 'stringList':
      case 'images':
      case 'multiselect': {
        const arr = (Array.isArray(raw) ? raw : []).filter((x: any) => typeof x === 'string').map((x: string) => x.trim()).filter(Boolean);
        if (field.required && arr.length === 0) errors[path] = `${label} is required.`;
        const max = field.max || 2000;
        arr.forEach((x: string, i: number) => {
          if (x.length > max) errors[`${path}.${i}`] = `${label}: item ${i + 1} is too long (max ${max} characters).`;
          if (field.type === 'images' && !isSafeUrl(x)) errors[`${path}.${i}`] = `${label}: item ${i + 1} is not a valid image address.`;
        });
        value[field.name] = arr.slice(0, 200);
        break;
      }
      case 'toggle':
        value[field.name] = raw === true || raw === 'true';
        break;
      case 'number': {
        if (isEmpty(raw)) {
          if (field.required) errors[path] = `${label} is required.`;
          value[field.name] = null;
          break;
        }
        const n = Number(raw);
        if (!Number.isFinite(n)) errors[path] = `${label} must be a number.`;
        else if (field.min !== undefined && n < field.min) errors[path] = `${label} must be at least ${field.min}.`;
        else if (field.max !== undefined && n > field.max) errors[path] = `${label} must be at most ${field.max}.`;
        value[field.name] = Number.isFinite(n) ? n : null;
        break;
      }
      default: {
        let v = typeof raw === 'string' ? raw : raw == null ? '' : String(raw);
        if (field.type !== 'richtext' && field.type !== 'inline' && field.type !== 'textarea') v = v.trim();
        if (field.type === 'richtext' || field.type === 'inline') {
          if (opts.sanitizeHtml) v = opts.sanitizeHtml(v, field.type === 'inline' ? 'inline' : 'rich');
          if (field.required && textOf(v) === '' && !/<img/i.test(v)) errors[path] = `${label} is required.`;
        } else if (field.required && v.trim() === '') {
          errors[path] = `${label} is required.`;
        }
        if (field.max && v.length > field.max) errors[path] = `${label} is too long (max ${field.max} characters).`;
        if (v) {
          if ((field.type === 'url' || field.type === 'image') && !isSafeUrl(v)) errors[path] = `${label}: enter a full link (https://…) or a page path starting with “/”.`;
          if (field.type === 'email' && !EMAIL.test(v)) errors[path] = `${label}: enter a valid email address.`;
          if (field.type === 'tel' && !TEL.test(v)) errors[path] = `${label}: enter a valid phone number.`;
          if (field.type === 'slug' && !SLUG.test(v)) errors[path] = `${label}: use lowercase letters, numbers and hyphens only.`;
          if (field.type === 'color' && !COLOR.test(v)) errors[path] = `${label}: enter a colour like #FF3B0B.`;
          if (field.type === 'date' && !DATE.test(v)) errors[path] = `${label}: enter a valid date.`;
          if ((field.type === 'select' || field.type === 'font') && field.options && !field.options.some((o) => o.value === v))
            errors[path] = `${label}: choose one of the options.`;
        }
        value[field.name] = v;
      }
    }
  }
  return { value, errors };
}

/** Deep merge: `over` wins; arrays are replaced; used to apply stored content over defaults. */
export function deepMerge<T>(base: T, over: any): T {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base) || Array.isArray(over) || typeof base !== 'object' || base === null || typeof over !== 'object')
    return over as T;
  const out: any = { ...base };
  for (const [k, v] of Object.entries(over)) {
    out[k] = k in out ? deepMerge(out[k], v) : v;
  }
  return out;
}
