import { beforeEach, describe, expect, it, vi } from 'vitest'

const sendMail = vi.hoisted(() => vi.fn())
const createTransport = vi.hoisted(() => vi.fn(() => ({ sendMail })))
vi.mock('nodemailer', () => ({ default: { createTransport } }))

import handler from '../api/contact'

const originalEnv = { ...process.env }
const validPayload = { name: ' Jan ', phone: '+48 500 500 500', date: ' 12–14 lipca ', message: 'Proszę o kontakt', website: '', formStartedAt: Date.now() - 2_000 }

function response() {
  const result = { statusCode: 0, body: '', setHeader: vi.fn(), end: vi.fn((body: string) => { result.body = body }) }
  return result
}

async function request(body: unknown = validPayload, overrides: Record<string, unknown> = {}) {
  const result = response()
  await handler({ method: 'POST', headers: { origin: 'https://busemnaczas.pl', 'content-type': 'application/json' }, body, ...overrides } as never, result as never)
  return result
}

describe('/api/contact', () => {
  beforeEach(() => {
    process.env = { ...originalEnv, CONTACT_ALLOWED_ORIGIN: 'https://busemnaczas.pl', SMTP_HOST: 'smtp.example.test', SMTP_PORT: '465', SMTP_USER: 'test@busemnaczas.pl', SMTP_PASS: 'secret', MAIL_FROM: 'test@busemnaczas.pl', MAIL_TO: 'test@busemnaczas.pl' }
    sendMail.mockResolvedValue({})
    createTransport.mockClear()
    sendMail.mockClear()
  })

  it('sends one correctly formatted plain-text message for a valid request', async () => {
    const result = await request()
    expect(result.statusCode).toBe(200)
    expect(JSON.parse(result.body)).toEqual({ ok: true })
    expect(createTransport).toHaveBeenCalledWith(expect.objectContaining({ host: 'smtp.example.test', port: 465, secure: true, auth: { user: 'test@busemnaczas.pl', pass: 'secret' } }))
    expect(sendMail).toHaveBeenCalledOnce()
    expect(sendMail).toHaveBeenCalledWith(expect.objectContaining({ from: 'test@busemnaczas.pl', to: 'test@busemnaczas.pl', subject: 'Nowe zapytanie — Jan — 12–14 lipca', text: expect.stringContaining('Telefon: +48 500 500 500') }))
    expect(sendMail.mock.calls[0][0].text).toMatch(/Imię: Jan\nTelefon: \+48 500 500 500\nTermin: 12–14 lipca\nWiadomość: Proszę o kontakt\nCzas wysłania: /)
    expect(sendMail.mock.calls[0][0]).not.toHaveProperty('replyTo')
  })

  it.each([
    ['invalid fields', { ...validPayload, name: 'J' }],
    ['wrong method', validPayload, { method: 'GET' }],
    ['wrong origin', validPayload, { headers: { origin: 'https://other.example', 'content-type': 'application/json' } }],
    ['oversized body', 'x'.repeat(10_001)],
    ['honeypot', { ...validPayload, website: 'spam' }],
    ['too fast', { ...validPayload, formStartedAt: Date.now() }],
  ])('does not send mail for %s', async (_case, body, overrides = {}) => {
    const result = await request(body, overrides)
    expect(sendMail).not.toHaveBeenCalled()
    expect([200, 400, 403, 405]).toContain(result.statusCode)
  })

  it('returns a generic error without SMTP details when delivery fails', async () => {
    sendMail.mockRejectedValue(new Error('SMTP password rejected'))
    const result = await request()
    expect(result.statusCode).toBe(502)
    expect(result.body).toBe('{"ok":false}')
    expect(result.body).not.toContain('SMTP')
    expect(result.body).not.toContain('secret')
  })
})
