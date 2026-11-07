import 'server-only';
import { MongoClient, type Db } from 'mongodb';
import type { Store } from './types';

/**
 * PRODUCTION ADAPTER — MongoDB. Each CMS collection maps to a Mongo collection
 * named `cms_<name>` with `_id` = document id.
 */
const g = globalThis as unknown as { __eduzyMongo?: Promise<MongoClient> };

function client(uri: string): Promise<MongoClient> {
  if (!g.__eduzyMongo) {
    g.__eduzyMongo = new MongoClient(uri, { maxPoolSize: 10, serverSelectionTimeoutMS: 8000 }).connect().catch((e) => {
      g.__eduzyMongo = undefined; // allow retry on next request
      throw e;
    });
  }
  return g.__eduzyMongo;
}

const strip = (doc: any) => {
  if (!doc) return doc;
  const { _id, ...rest } = doc;
  return rest;
};

export class MongoStore implements Store {
  readonly kind = 'mongo' as const;
  readonly label: string;
  private indexed = new Set<string>();

  constructor(private uri: string, private dbName: string) {
    this.label = `MongoDB (database “${dbName}”)`;
  }

  private async col(name: string) {
    if (!/^[a-zA-Z0-9_-]+$/.test(name)) throw new Error(`Invalid collection name: ${name}`);
    const db: Db = (await client(this.uri)).db(this.dbName);
    const c = db.collection<any>(`cms_${name}`);
    if (!this.indexed.has(name)) {
      this.indexed.add(name);
      if (name === 'users') c.createIndex({ email: 1 }, { unique: true }).catch(() => undefined);
      if (name === 'activity') c.createIndex({ at: -1 }).catch(() => undefined);
      if (name === 'media') c.createIndex({ createdAt: -1 }).catch(() => undefined);
    }
    return c;
  }

  async all<T extends { id: string }>(name: string): Promise<T[]> {
    return (await (await this.col(name)).find({}).toArray()).map(strip);
  }
  async get<T extends { id: string }>(name: string, id: string): Promise<T | null> {
    return strip(await (await this.col(name)).findOne({ _id: id }));
  }
  async findOne<T extends { id: string }>(name: string, field: string, value: unknown): Promise<T | null> {
    return strip(await (await this.col(name)).findOne({ [field]: value }));
  }
  async put<T extends { id: string }>(name: string, doc: T) {
    await (await this.col(name)).replaceOne({ _id: doc.id }, { ...doc, _id: doc.id }, { upsert: true });
  }
  async putMany<T extends { id: string }>(name: string, docs: T[]) {
    if (!docs.length) return;
    await (await this.col(name)).bulkWrite(
      docs.map((d) => ({ replaceOne: { filter: { _id: d.id }, replacement: { ...d, _id: d.id }, upsert: true } })),
      { ordered: false },
    );
  }
  async insertIfAbsent<T extends { id: string }>(name: string, docs: T[]) {
    if (!docs.length) return;
    await (await this.col(name)).bulkWrite(
      docs.map((d) => ({ updateOne: { filter: { _id: d.id }, update: { $setOnInsert: { ...d, _id: d.id } }, upsert: true } })),
      { ordered: false },
    );
  }
  async remove(name: string, id: string) {
    await (await this.col(name)).deleteOne({ _id: id });
  }
  async recent<T extends { id: string }>(name: string, field: string, limit: number): Promise<T[]> {
    return (await (await this.col(name)).find({}).sort({ [field]: -1 }).limit(limit).toArray()).map(strip);
  }
  async prune(name: string, field: string, keep: number) {
    const c = await this.col(name);
    const cutoff = await c.find({}).sort({ [field]: -1 }).skip(keep).limit(1).toArray();
    if (cutoff[0]) await c.deleteMany({ [field]: { $lte: cutoff[0][field] } });
  }
}
