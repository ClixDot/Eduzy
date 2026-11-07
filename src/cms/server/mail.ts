import 'server-only';

/**
 * Transactional email. Uses the Resend HTTP API when RESEND_API_KEY and CMS_EMAIL_FROM are set.
 * Without them, development prints the message to the server console; production reports
 * that email is not configured (an owner can still reset passwords from Admin Profile → Admins).
 */
export function emailConfigured() {
  return Boolean(process.env.RESEND_API_KEY && process.env.CMS_EMAIL_FROM);
}

export async function sendMail(to: string, subject: string, text: string): Promise<'sent' | 'logged' | 'unconfigured'> {
  if (emailConfigured()) {
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: process.env.CMS_EMAIL_FROM, to: [to], subject, text }),
    });
    if (!res.ok) throw new Error(`Email provider error (${res.status})`);
    return 'sent';
  }
  if (process.env.NODE_ENV !== 'production') {
    console.info(`\n[EDUZY CMS] Email to ${to}\nSubject: ${subject}\n\n${text}\n`);
    return 'logged';
  }
  console.warn('[EDUZY CMS] Email not configured (RESEND_API_KEY / CMS_EMAIL_FROM); message not sent.');
  return 'unconfigured';
}
