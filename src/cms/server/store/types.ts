/** Minimal document store used by the CMS. Every document has a string `id`. */
export interface Store {
  readonly kind: 'file' | 'mongo';
  /** human readable description for the admin (never includes credentials) */
  readonly label: string;
  all<T extends { id: string }>(col: string): Promise<T[]>;
  get<T extends { id: string }>(col: string, id: string): Promise<T | null>;
  findOne<T extends { id: string }>(col: string, field: string, value: unknown): Promise<T | null>;
  put<T extends { id: string }>(col: string, doc: T): Promise<void>;
  putMany<T extends { id: string }>(col: string, docs: T[]): Promise<void>;
  /** inserts only documents whose id does not exist yet (idempotent seeding) */
  insertIfAbsent<T extends { id: string }>(col: string, docs: T[]): Promise<void>;
  remove(col: string, id: string): Promise<void>;
  /** newest first by `field` (ISO string) */
  recent<T extends { id: string }>(col: string, field: string, limit: number): Promise<T[]>;
  /** keep only the newest `keep` docs by `field` */
  prune(col: string, field: string, keep: number): Promise<void>;
}
