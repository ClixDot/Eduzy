import { handler, body } from '@/cms/server/http';
import { requireUser } from '@/cms/server/auth';
import { updateMedia, deleteMedia, replaceMedia } from '@/cms/server/media';
import { CmsError } from '@/cms/server/content';

export const PUT = handler<{ id: string }>(async (req, { id }) => {
  await requireUser();
  const { alt, folder } = await body(req);
  return { item: await updateMedia(id, { alt, folder }) };
});

/** Replace the file (multipart: file). Every page using the image is updated. */
export const POST = handler<{ id: string }>(async (req, { id }) => {
  const user = await requireUser();
  const form = await req.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file !== 'object') throw new CmsError('Choose an image.', 400);
  const { doc, changed } = await replaceMedia(id, file as File, user);
  return { item: doc, changed };
});

export const DELETE = handler<{ id: string }>(async (_req, { id }) => {
  const user = await requireUser();
  await deleteMedia(id, user);
  return { ok: true };
});
