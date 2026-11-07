import { handler, body } from '@/cms/server/http';
import { requireUser } from '@/cms/server/auth';
import { reorderItems, CmsError } from '@/cms/server/content';
import { getCollectionDef } from '@/cms/schema';

export const POST = handler<{ name: string }>(async (req, { name }) => {
  if (!getCollectionDef(name)) throw new CmsError('Unknown collection.', 404);
  const user = await requireUser();
  const { ids } = await body(req);
  if (!Array.isArray(ids)) throw new CmsError('Invalid order.', 400);
  await reorderItems(name, ids.map(String), user);
  return { ok: true };
});
