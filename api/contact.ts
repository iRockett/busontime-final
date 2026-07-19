import type { IncomingMessage, ServerResponse } from 'node:http'
import nodemailer from 'nodemailer'

const MAX_BODY_BYTES = 10_000
const MIN_FORM_AGE_MS = 1_500
type ContactPayload = { name?: unknown; phone?: unknown; date?: unknown; message?: unknown; website?: unknown; formStartedAt?: unknown }
type ContactValues = { name: string; phone: string; date: string; message: string }

export const config = { api: { bodyParser: { sizeLimit: '10kb' } } }
function sendJson(response: ServerResponse, statusCode: number, payload: Record<string, unknown>) { response.statusCode = statusCode; response.setHeader('Content-Type', 'application/json; charset=utf-8'); response.end(JSON.stringify(payload)) }
function getHeader(request: IncomingMessage, name: string) { const value = request.headers[name]; return Array.isArray(value) ? value[0] : value }
async function readBody(request: IncomingMessage & { body?: unknown }): Promise<unknown> {
  if (request.body !== undefined) {
    if (typeof request.body === 'string' && Buffer.byteLength(request.body) > MAX_BODY_BYTES) throw new Error('Body too large')
    return request.body
  }
  const chunks: Buffer[] = []; let length = 0
  for await (const chunk of request) { const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk); length += buffer.length; if (length > MAX_BODY_BYTES) throw new Error('Body too large'); chunks.push(buffer) }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}
function validSingleLine(value: string, min: number, max: number) { return value.length >= min && value.length <= max && !/[\r\n]/.test(value) }
function validate(payload: ContactPayload): ContactValues | null {
  if (typeof payload.name !== 'string' || typeof payload.phone !== 'string' || typeof payload.date !== 'string' || (payload.message !== undefined && typeof payload.message !== 'string')) return null
  const messageValue = typeof payload.message === 'string' ? payload.message : ''
  const name = payload.name.trim(), phone = payload.phone.trim(), date = payload.date.trim(), message = messageValue.trim()
  const phoneDigits = phone.replace(/\D/g, '')
  if (!validSingleLine(name, 2, 80) || !validSingleLine(date, 2, 100) || phoneDigits.length < 9 || phoneDigits.length > 15 || message.length > 2_000) return null
  return { name, phone, date, message }
}
function formatEmail(values: ContactValues) { return [`Imię: ${values.name}`, `Telefon: ${values.phone}`, `Termin: ${values.date}`, `Wiadomość: ${values.message || '(brak)'}`, `Czas wysłania: ${new Date().toISOString()}`].join('\n') }

export default async function handler(request: IncomingMessage & { body?: unknown; method?: string }, response: ServerResponse) {
  if (request.method !== 'POST') return sendJson(response, 405, { ok: false })
  const allowedOrigin = process.env.CONTACT_ALLOWED_ORIGIN
  if (!allowedOrigin || getHeader(request, 'origin') !== allowedOrigin) return sendJson(response, 403, { ok: false })
  if (!getHeader(request, 'content-type')?.toLowerCase().startsWith('application/json')) return sendJson(response, 400, { ok: false })
  let payload: ContactPayload
  try { payload = await readBody(request) as ContactPayload; if (!payload || typeof payload !== 'object') throw new Error('Invalid payload') } catch { return sendJson(response, 400, { ok: false }) }
  if (typeof payload.website !== 'string' || typeof payload.formStartedAt !== 'number' || !Number.isFinite(payload.formStartedAt)) return sendJson(response, 400, { ok: false })
  if (payload.website.trim()) return sendJson(response, 200, { ok: true })
  if (Date.now() - payload.formStartedAt < MIN_FORM_AGE_MS || payload.formStartedAt > Date.now()) return sendJson(response, 400, { ok: false })
  const values = validate(payload)
  if (!values) return sendJson(response, 400, { ok: false })
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, MAIL_FROM, MAIL_TO } = process.env
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS || !MAIL_FROM || !MAIL_TO) return sendJson(response, 502, { ok: false })
  try {
    const transporter = nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT), secure: Number(SMTP_PORT) === 465, auth: { user: SMTP_USER, pass: SMTP_PASS } })
    await transporter.sendMail({ from: MAIL_FROM, to: MAIL_TO, subject: `Nowe zapytanie — ${values.name} — ${values.date}`, text: formatEmail(values) })
  } catch { return sendJson(response, 502, { ok: false }) }
  return sendJson(response, 200, { ok: true })
}
