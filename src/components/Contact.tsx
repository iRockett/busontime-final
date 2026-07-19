import { ArrowRight, CheckCircle2, Clock3, MapPin, Phone } from 'lucide-react'
import { FormEvent, useRef, useState } from 'react'
import { siteContent } from '../content'

type ContactValues = { name: string; phone: string; date: string; message: string; website: string }
const emptyValues: ContactValues = { name: '', phone: '', date: '', message: '', website: '' }

export function Contact() {
  const [values, setValues] = useState<ContactValues>(emptyValues)
  const [state, setState] = useState<'idle' | 'sending' | 'success' | 'error'>('idle')
  const formStartedAt = useRef(Date.now())
  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (state === 'sending') return
    setState('sending')
    try {
      const response = await fetch('/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...values, formStartedAt: formStartedAt.current }) })
      if (!response.ok) throw new Error('Contact request failed')
      setValues(emptyValues)
      formStartedAt.current = Date.now()
      setState('success')
    } catch { setState('error') }
  }
  return <div className="contact-grid">
    <div className="contact-copy">
      <h2>Ustalmy termin Twojej podróży.</h2>
      <p>Zadzwoń lub zostaw krótki formularz. Potwierdzimy dostępność i odpowiemy na pytania przed rezerwacją.</p>
      <a className="contact-phone" href={siteContent.phone.href}><Phone /><span><small>Zadzwoń teraz</small>{siteContent.phone.display}</span></a>
      <div className="contact-meta"><span><Clock3 />Godziny odbioru ustalamy indywidualnie</span><span><MapPin />Galewice · Łęka Mroczeńska</span></div>
    </div>
    <form onSubmit={submit} className="contact-form">
      <label>Imię<input name="name" required autoComplete="name" value={values.name} onChange={(event) => setValues({ ...values, name: event.target.value })} /></label>
      <label>Telefon<input name="phone" type="tel" required autoComplete="tel" value={values.phone} onChange={(event) => setValues({ ...values, phone: event.target.value })} /></label>
      <label>Termin<input name="date" required placeholder="np. 12–14 lipca" value={values.date} onChange={(event) => setValues({ ...values, date: event.target.value })} /></label>
      <label className="full-field">Wiadomość<textarea name="message" rows={4} placeholder="Liczba osób, miejsce odbioru, dodatkowe pytania…" value={values.message} onChange={(event) => setValues({ ...values, message: event.target.value })} /></label>
      <div className="contact-honeypot" aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(event) => setValues({ ...values, website: event.target.value })} /></label></div>
      <button className="button button-primary full-field" type="submit" disabled={state === 'sending'}>{state === 'sending' ? 'Wysyłanie…' : <>Wyślij zapytanie <ArrowRight size={18} /></>}</button>
      {state === 'success' && <p className="form-status full-field" role="status"><CheckCircle2 />Dziękujemy. Odpowiemy najszybciej, jak to możliwe.</p>}
      {state === 'error' && <p className="form-status form-status-error full-field" role="alert">Nie udało się wysłać zapytania. Spróbuj ponownie za chwilę.</p>}
    </form>
  </div>
}
