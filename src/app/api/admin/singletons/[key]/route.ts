import { handler, body } from '@/cms/server/http';
import { requireUser } from '@/cms/server/auth';
import { getSingleton, saveSingleton, discardSingletonDraft, CmsError } from '@/cms/server/content';
import { getSingletonDef } from '@/cms/schema';

const same = (a: unknown, b: unknown) => JSON.stringify(a) === JSON.stringify(b);

function shape(doc: Awaited<ReturnType<typeof getSingleton>>) {
  return {
    key: doc.id,
    data: doc.draft,
    version: doc.version,
    updatedAt: doc.updatedAt,
    updatedBy: doc.updatedBy,
    publishedAt: doc.publishedAt,
    hasChanges: doc.version > 0 && !same(doc.draft, doc.published),
  };
}

export const GET = handler<{ key: string }>(async (_req, { key }) => {
  const def = getSingletonDef(key);
  if (!def) throw new CmsError('Unknown content section.', 404);
  await requireUser(def.permission || 'content');
  return shape(await getSingleton(key));
});

export const PUT = handler<{ key: string }>(async (req, { key }) => {
  const def = getSingletonDef(key);
  if (!def) throw new CmsError('Unknown content section.', 404);
  const user = await requireUser(def.permission || 'content');
  const { data, version, action } = await body(req);
  if (action === 'discard') return shape(await discardSingletonDraft(key, user));
  if (action !== 'save' && action !== 'publish') throw new CmsError('Unknown action.', 400);
  return shape(await saveSingleton(key, data, { version, publish: action === 'publish', user }));
});
