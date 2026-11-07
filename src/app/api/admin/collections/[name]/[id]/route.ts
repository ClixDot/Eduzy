import { handler, body } from '@/cms/server/http';
import { requireUser } from '@/cms/server/auth';
import { getItem, updateItem, setItemPublished, discardItemDraft, duplicateItem, deleteItem, shapeItem, CmsError } from '@/cms/server/content';
import { getCollectionDef } from '@/cms/schema';

type P = { name: string; id: string };

const check = (name: string) => {
  if (!getCollectionDef(name)) throw new CmsError('Unknown collection.', 404);
};

export const GET = handler<P>(async (_req, { name, id }) => {
  check(name);
  await requireUser();
  return { item: shapeItem(await getItem(name, id)) };
});

export const PUT = handler<P>(async (req, { name, id }) => {
  check(name);
  const user = await requireUser();
  const { data, version, action } = await body(req);
  switch (action) {
    case 'save':
    case 'publish':
      return { item: shapeItem(await updateItem(name, id, data, { version, publish: action === 'publish', user })) };
    case 'unpublish':
      return { item: shapeItem(await setItemPublished(name, id, false, user)) };
    case 'publishCurrent':
      return { item: shapeItem(await setItemPublished(name, id, true, user)) };
    case 'discard':
      return { item: shapeItem(await discardItemDraft(name, id, user)) };
    case 'duplicate':
      return { item: shapeItem(await duplicateItem(name, id, user)) };
    default:
      throw new CmsError('Unknown action.', 400);
  }
});

export const DELETE = handler<P>(async (_req, { name, id }) => {
  check(name);
  const user = await requireUser();
  await deleteItem(name, id, user);
  return { ok: true };
});
