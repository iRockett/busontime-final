import { ArrowRight, CheckCircle2, Clock3, MapPin, Phone } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { siteContent } from '../content'

export function Contact() {
  const [sent, setSent] = useState(false)
  const submit = (event: FormEvent<HTMLFormElement>) => { event.preventDefault(); setSent(true) }
  return <div className="contact-grid">
    <div className="contact-copy">
      <h2>Ustalmy termin Twojej podróży.</h2>
      <p>Zadzwoń lub zostaw krótki formularz. Potwierdzimy dostępność i odpowiemy na pytania przed rezerwacją.</p>
      <a className="contact-phone" href={siteContent.phone.href}><Phone /><span><small>Zadzwoń teraz</small>{siteContent.phone.display}</span></a>
      <div className="contact-meta"><span><Clock3 />Godziny odbioru ustalamy indywidualnie</span><span><MapPin />Galewice · Łęka Mroczeńska</span></div>
    </div>
    <form onSubmit={submit} className="contact-form">
      <label>Imię<input name="name" required autoComplete="name" /></label>
      <label>Telefon<input name="phone" type="tel" required autoComplete="tel" /></label>
      <label>Termin<input name="date" required placeholder="np. 12–14 lipca" /></label>
      <label className="full-field">Wiadomość<textarea name="message" rows={4} placeholder="Liczba osób, miejsce odbioru, dodatkowe pytania…" /></label>
      <button className="button button-primary full-field" type="submit">Wyślij zapytanie <ArrowRight size={18} /></button>
      {sent && <p className="form-status full-field" role="status"><CheckCircle2 />Dziękujemy. To wersja demonstracyjna — w finalnej stronie formularz zostanie połączony z wybraną skrzynką.</p>}
    </form>
  </div>
}
