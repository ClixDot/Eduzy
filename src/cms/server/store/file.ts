import 'server-only';
import { promises as fs } from 'fs';
import path from 'path';
import type { Store } from './types';

/**
 * DEVELOPMENT ADAPTER — stores CMS content as JSON files in `.cms-data/`.
 * Works with `next dev` and a single `next start` server. It is NOT suitable for
 * serverless hosting (Vercel etc.) where the filesystem is temporary: use MongoDB there.
 */
export class FileStore implements Store {
  readonly kind = 'file' as const;
  readonly label: string;
  private queues = new Map<string, Promise<unknown>>();

  constructor(private dir: string) {
    this.label = `Local files (${path.relative(/* turbopackIgnore: true */ process.cwd(), dir) || dir}) — development storage`;
  }

  private file(col: string) {
    if (!/^[a-zA-Z0-9_-]+$/.test(col)) throw new Error(`Invalid collection name: ${col}`);
    return path.join(this.dir, `${col}.json`);
  }

  private async read(col: string): Promise<Record<string, any>> {
    try {
      const raw = await fs.readFile(this.file(col), 'utf8');
      return raw.trim() ? JSON.parse(raw) : {};
    } catch (e: any) {
      if (e.code === 'ENOENT') return {};
      throw e;
    }
  }

  private async write(col: string, data: Record<string, any>) {
    await fs.mkdir(this.dir, { recursive: true });
    const target = this.file(col);
    const tmp = `${target}.${process.pid}.${Date.now()}.tmp`;
    await fs.writeFile(tmp, JSON.stringify(data, null, 1), 'utf8');
    // rename is atomic on the same volume; retry briefly for Windows file locks
    for (let i = 0; ; i++) {
      try {
        await fs.rename(tmp, target);
        return;
      } catch (e: any) {
        if (i >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(e.code)) throw e;
        await new Promise((r) => setTimeout(r, 40 * (i + 1)));
      }
    }
  }

  /** serialise read-modify-write per collection */
  private mutate(col: string, fn: (data: Record<string, any>) => void | Promise<void>) {
    const prev = this.queues.get(col) || Promise.resolve();
    const next = prev
      .catch(() => undefined)
      .then(async () => {
        const data = await this.read(col);
        await fn(data);
        await this.write(col, data);
      });
    this.queues.set(col, next);
    return next as Promise<void>;
  }

  async all<T extends { id: string }>(col: string): Promise<T[]> {
    return Object.values(await this.read(col)) as T[];
  }
  async get<T extends { id: string }>(col: string, id: string): Promise<T | null> {
    const data = await this.read(col);
    return Object.prototype.hasOwnProperty.call(data, id) ? (data[id] as T) : null;
  }
  async findOne<T extends { id: string }>(col: string, field: string, value: unknown): Promise<T | null> {
    return ((await this.all<T>(col)).find((d: any) => d[field] === value) as T) || null;
  }
  put<T extends { id: string }>(col: string, doc: T) {
    return this.mutate(col, (d) => {
      d[doc.id] = doc;
    });
  }
  putMany<T extends { id: string }>(col: string, docs: T[]) {
    return this.mutate(col, (d) => {
      for (const doc of docs) d[doc.id] = doc;
    });
  }
  insertIfAbsent<T extends { id: string }>(col: string, docs: T[]) {
    return this.mutate(col, (d) => {
      for (const doc of docs) if (!Object.prototype.hasOwnProperty.call(d, doc.id)) d[doc.id] = doc;
    });
  }
  remove(col: string, id: string) {
    return this.mutate(col, (d) => {
      delete d[id];
    });
  }
  async recent<T extends { id: string }>(col: string, field: string, limit: number): Promise<T[]> {
    const all = await this.all<any>(col);
    return all.sort((a, b) => String(b[field]).localeCompare(String(a[field]))).slice(0, limit);
  }
  prune(col: string, field: string, keep: number) {
    return this.mutate(col, (d) => {
      const ids = Object.values(d)
        .sort((a: any, b: any) => String(b[field]).localeCompare(String(a[field])))
        .slice(keep)
        .map((x: any) => x.id);
      for (const id of ids) delete d[id];
    });
  }
}
