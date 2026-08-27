import { Resend } from 'resend'
import { contactSchema } from '@/lib/schemas'
import { createRateLimiter } from '@/lib/rate-limit'
import { profile } from '@/content/profile'

const limiter = createRateLimiter({ limit: 5, windowMs: 10 * 60 * 1000 })

const json = (body: unknown, status: number) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } })

function clientIp(req: Request): string {
  const forwarded = req.headers.get('x-forwarded-for')
  return forwarded?.split(',')[0]?.trim() || 'unknown'
}

export async function POST(req: Request): Promise<Response> {
  let payload: unknown
  try {
    payload = await req.json()
  } catch {
    return json({ error: 'Malformed request.' }, 400)
  }

  const parsed = contactSchema.safeParse(payload)
  if (!parsed.success) {
    // Field-level errors only. Never echo the submitted values back.
    const errors: Record<string, string> = {}
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? 'form')
      errors[key] ??= issue.message
    }
    return json({ errors }, 400)
  }

  // Honeypot: 200, not 403. Telling a bot it was detected teaches it to adapt.
  if (parsed.data.website) return json({ ok: true }, 200)

  if (!limiter.check(clientIp(req))) {
    return json({ error: 'Too many messages. Please try again later.' }, 429)
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.error('[contact] RESEND_API_KEY is not configured')
    return json({ error: 'Contact form is not configured.' }, 500)
  }

  const { name, email, message } = parsed.data

  try {
    const resend = new Resend(apiKey)
    const { error } = await resend.emails.send({
      // Sent from the verified domain, never Resend's shared onboarding@resend.dev:
      // that shared sender silently delivers ONLY to the Resend account owner, so a
      // regression to it would still log a success while dropping every enquiry
      // addressed anywhere else. Pinned by a test for exactly that reason.
      from: 'Portfolio <portfolio@milanhalo.me>',
      to: process.env.CONTACT_TO_EMAIL ?? profile.email,
      replyTo: email,
      subject: `Portfolio enquiry from ${name}`,
      // Plain text only — the message is never interpolated into HTML, so a
      // crafted body cannot inject markup into the inbox that receives it.
      text: `From: ${name} <${email}>\n\n${message}`,
    })
    if (error) {
      // Log upstream detail server-side; never return it. Provider errors can
      // disclose account state and quota information.
      console.error('[contact] resend error:', error)
      return json({ error: 'Could not send message. Please email directly.' }, 502)
    }
    return json({ ok: true }, 200)
  } catch (err) {
    console.error('[contact] unexpected failure:', err)
    return json({ error: 'Could not send message. Please email directly.' }, 502)
  }
}
