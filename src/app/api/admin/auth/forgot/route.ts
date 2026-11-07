import { handler, body } from '@/cms/server/http';
import { createResetToken } from '@/cms/server/auth';
import { sendMail, emailConfigured } from '@/cms/server/mail';

export const POST = handler(async (req) => {
  const { email } = await body(req);
  const result = await createResetToken(String(email || ''));
  if (result) {
    const origin = new URL(req.url).origin;
    const link = `${origin}/admin/reset-password?token=${result.token}`;
    await sendMail(
      result.user.email,
      'Reset your EDUZY admin password',
      `Hello ${result.user.name},\n\nUse this link to choose a new password for the EDUZY website admin. It expires in 30 minutes.\n\n${link}\n\nIf you did not ask for this, you can ignore this email.`,
    );
  }
  // Same answer whether or not the email exists (no account enumeration).
  return {
    ok: true,
    message: emailConfigured()
      ? 'If an admin account exists for that email, a reset link has been sent. It expires in 30 minutes.'
      : process.env.NODE_ENV !== 'production'
        ? 'Email is not configured in development: the reset link has been printed in the server console.'
        : 'If an admin account exists for that email, a reset link has been sent. If nothing arrives, ask the website owner to reset your password.',
  };
});
