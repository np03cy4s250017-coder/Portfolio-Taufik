import { describe, it, expect, vi, beforeEach } from 'vitest'

const send = vi.fn()
vi.mock('resend', () => ({ Resend: class { emails = { send } } }))

const post = async (body: unknown, ip = '1.1.1.1') => {
  const { POST } = await import('./route')
  return POST(new Request('http://localhost/api/contact', {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-forwarded-for': ip },
    body: JSON.stringify(body),
  }))
}

const valid = { name: 'Ada', email: 'ada@example.com', message: 'This is a genuine enquiry.', website: '' }

beforeEach(() => {
  vi.resetModules()
  send.mockReset()
  send.mockResolvedValue({ data: { id: 'x' }, error: null })
  process.env.RESEND_API_KEY = 'test-key'
  process.env.CONTACT_TO_EMAIL = 'to@example.com'
})

describe('POST /api/contact', () => {
  it('sends a valid message and returns 200', async () => {
    const res = await post(valid)
    expect(res.status).toBe(200)
    expect(send).toHaveBeenCalledOnce()
  })

  it('returns 400 with field errors for a malformed payload', async () => {
    const res = await post({ ...valid, email: 'nope' })
    expect(res.status).toBe(400)
    expect((await res.json()).errors).toHaveProperty('email')
    expect(send).not.toHaveBeenCalled()
  })

  it('silently discards a honeypot hit with 200 and sends nothing', async () => {
    const res = await post({ ...valid, website: 'http://spam.test' })
    expect(res.status).toBe(200)
    expect(send).not.toHaveBeenCalled()
  })

  it('returns 429 once the per-IP limit is exceeded', async () => {
    for (let i = 0; i < 5; i++) await post(valid, '9.9.9.9')
    expect((await post(valid, '9.9.9.9')).status).toBe(429)
  })

  it('returns 502 with a generic message when Resend fails', async () => {
    send.mockResolvedValue({ data: null, error: { message: 'quota exceeded for account acct_12345' } })
    const res = await post(valid)
    expect(res.status).toBe(502)
    const body = await res.json()
    expect(body.error).toBe('Could not send message. Please email directly.')
    expect(JSON.stringify(body)).not.toContain('acct_12345')
  })

  it('returns 500 when the API key is not configured, without sending', async () => {
    delete process.env.RESEND_API_KEY
    expect((await post(valid)).status).toBe(500)
    expect(send).not.toHaveBeenCalled()
  })

  it('returns 400 for a non-JSON body', async () => {
    const { POST } = await import('./route')
    const res = await POST(new Request('http://localhost/api/contact', {
      method: 'POST', headers: { 'content-type': 'application/json' }, body: 'not json',
    }))
    expect(res.status).toBe(400)
  })
})
