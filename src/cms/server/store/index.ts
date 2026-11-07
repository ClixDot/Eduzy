import 'server-only';
import path from 'path';
import type { Store } from './types';
import { FileStore } from './file';
import { MongoStore } from './mongo';

const g = globalThis as unknown as { __eduzyStore?: Store };

/**
 * MONGODB_URI set  → MongoDB (production)
 * otherwise        → local JSON files in CMS_DATA_DIR (default `.cms-data`) for development.
 */
export function getStore(): Store {
  if (g.__eduzyStore) return g.__eduzyStore;
  const uri = process.env.MONGODB_URI;
  if (uri) {
    g.__eduzyStore = new MongoStore(uri, process.env.MONGODB_DB || 'eduzy_cms');
  } else {
    g.__eduzyStore = new FileStore(path.resolve(/* turbopackIgnore: true */ process.cwd(), process.env.CMS_DATA_DIR || '.cms-data'));
  }
  return g.__eduzyStore;
}

export type { Store };
