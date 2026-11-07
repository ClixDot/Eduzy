import { draftMode } from 'next/headers';
import { redirect } from 'next/navigation';

export async function GET(req: Request) {
  (await draftMode()).disable();
  const target = new URL(req.url).searchParams.get('path') || '/';
  redirect(target.startsWith('/') && !target.startsWith('//') ? target : '/');
}
