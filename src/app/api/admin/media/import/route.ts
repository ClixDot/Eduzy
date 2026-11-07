import { handler, body } from '@/cms/server/http';
import { requireUser } from '@/cms/server/auth';
import { importMediaFromUrl } from '@/cms/server/media-import';
import { CmsError } from '@/cms/server/content';

/** JSON: { url, folder?, alt? } — downloads the image from a public link into the media library. */
export const POST = handler(async (req) => {
  const user = await requireUser();
  const { url, folder, alt } = await body(req);
  if (typeof url !== 'string' || !url.trim()) throw new CmsError('Paste an image link first.', 400);
  const item = await importMediaFromUrl(url, { folder: typeof folder === 'string' ? folder : 'general', alt: typeof alt === 'string' ? alt : '' }, user);
  return { item: { ...item, usage: [] } };
});
