import { handler, body } from '@/cms/server/http';
import { requireUser } from '@/cms/server/auth';
import { listItems, createItem, shapeItem, CmsError } from '@/cms/server/content';
import { getCollectionDef } from '@/cms/schema';

export const GET = handler<{ name: string }>(async (_req, { name }) => {
  if (!getCollectionDef(name)) throw new CmsError('Unknown collection.', 404);
  await requireUser();
  return { items: (await listItems(name)).map(shapeItem) };
});

export const POST = handler<{ name: string }>(async (req, { name }) => {
  if (!getCollectionDef(name)) throw new CmsError('Unknown collection.', 404);
  const user = await requireUser();
  const { data, publish } = await body(req);
  return { item: shapeItem(await createItem(name, data, { publish: !!publish, user })) };
});
