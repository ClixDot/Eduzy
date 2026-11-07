import { handler } from '@/cms/server/http';
import { requireUser } from '@/cms/server/auth';
import { listMedia, mediaUsage, uploadMedia } from '@/cms/server/media';
import { CmsError } from '@/cms/server/content';

export const GET = handler(async () => {
  await requireUser();
  const [items, usage] = await Promise.all([listMedia(), mediaUsage()]);
  return { items: items.map((m) => ({ ...m, usage: usage.get(m.url) || [] })) };
});

/** multipart/form-data: files (1..20), folder, alt */
export const POST = handler(async (req) => {
  const user = await requireUser();
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw new CmsError('Upload failed: the files could not be read.', 400);
  }
  const files = form.getAll('files').filter((f): f is File => typeof f === 'object' && f !== null && 'arrayBuffer' in f);
  if (!files.length) throw new CmsError('Choose at least one image.', 400);
  if (files.length > 20) throw new CmsError('Upload at most 20 images at a time.', 400);
  const folder = String(form.get('folder') || 'general');
  const alt = String(form.get('alt') || '');
  const uploaded = [];
  const failed: { name: string; error: string }[] = [];
  for (const file of files) {
    try {
      uploaded.push(await uploadMedia(file, { folder, alt }, user));
    } catch (e: any) {
      failed.push({ name: file.name, error: e instanceof CmsError ? e.message : 'Upload failed.' });
    }
  }
  if (!uploaded.length) throw new CmsError(failed[0]?.error || 'Upload failed.', 400);
  return { items: uploaded.map((m) => ({ ...m, usage: [] })), failed };
});
