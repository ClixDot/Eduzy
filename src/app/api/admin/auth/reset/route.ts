import { handler, body } from '@/cms/server/http';
import { resetPassword } from '@/cms/server/auth';

export const POST = handler(async (req) => {
  const { token, password } = await body(req);
  await resetPassword(token, password);
  return { ok: true };
});
