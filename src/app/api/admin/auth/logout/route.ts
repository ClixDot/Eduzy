import { handler } from '@/cms/server/http';
import { endSession } from '@/cms/server/auth';
import { draftMode } from 'next/headers';

export const POST = handler(async () => {
  await endSession();
  (await draftMode()).disable();
  return { ok: true };
});
