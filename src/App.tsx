import Lenis from 'lenis'
import { MotionConfig } from 'framer-motion'
import { Armchair, BadgeCheck, Banknote, Bike, CalendarRange, Check, Clock3, Gauge, Luggage, MapPin, MapPinned, Phone, Route, ShieldCheck, Snowflake, Truck, Users, Wrench } from 'lucide-react'
import { useEffect } from 'react'
import { siteContent } from './content'
import { Contact } from './components/Contact'
import { Faq } from './components/Faq'
import { Gallery } from './components/Gallery'
import { Nav } from './components/Nav'
import { Reveal } from './components/Reveal'
import { Testimonials } from './components/Testimonials'
import { VehicleShowcase } from './components/VehicleShowcase'
import './styles.css'

const quickFeatures = [
  [Users, '9 miejsc', 'Komfort dla całej ekipy'],
  [BadgeCheck, 'Kategoria B', 'Bez dodatkowych uprawnień'],
  [Wrench, 'Manualna skrzynia', 'Sprawdzona, 6-biegowa'],
  [Clock3, 'Dostępne od ręki', 'Szybki kontakt i rezerwacja'],
] as const

const benefits = [
  [ShieldCheck, 'Pewne samochody', 'Przygotowane do trasy i objęte ubezpieczeniem OC oraz AC.'],
  [CalendarRange, 'Elastyczny wynajem', 'Od jednej doby po indywidualnie ustalany wynajem długoterminowy.'],
  [Armchair, 'Wygodna podróż', 'Dziewięć miejsc, dwustrefowa klimatyzacja i komfort na dłuższej trasie.'],
  [Luggage, 'Duży bagażnik', 'Wersja LONG daje przestrzeń na walizki, sprzęt i rodzinny ekwipunek.'],
  [Banknote, 'Przejrzyste ceny', 'Czytelne stawki, limity kilometrów i ubezpieczenie w cenie.'],
  [MapPinned, 'Lokalny odbiór', 'Dwa wygodne punkty odbioru blisko Wieruszowa i Kępna.'],
] as const

function SectionHeading({ label, title, copy }: { label: string; title: string; copy?: string }) {
  return <div className="section-heading"><p>{label}</p><h2>{title}</h2>{copy && <span>{copy}</span>}</div>
}

function App() {
  useEffect(() => {
    if (navigator.userAgent.includes('jsdom')) return
    const lenis = new Lenis({ lerp: .085, wheelMultiplier: .9 })
    let frame = 0
    const raf = (time: number) => { lenis.raf(time); frame = requestAnimationFrame(raf) }
    frame = requestAnimationFrame(raf)
    return () => { cancelAnimationFrame(frame); lenis.destroy() }
  }, [])

  return <MotionConfig reducedMotion="user">
    <Nav />
    <main id="top">
      <section className="hero hero-image-only" aria-label="BusemNaCzas.pl — Renault Trafic">
        <div className="hero-full-media">
          <img className="hero-static-poster" src="/assets/busemnaczas-hero-brand.webp" width="2048" height="1152" alt="" aria-hidden="true" />
          <video className="hero-video" aria-label="Renault Trafic BusemNaCzas.pl w trasie" autoPlay muted loop playsInline preload="metadata" poster="/assets/busemnaczas-hero-brand.webp">
            <source src="/assets/busemnaczas-hero.mp4" type="video/mp4" />
          </video>
        </div>
      </section>

      <section className="hero-copy-section" aria-labelledby="hero-title">
        <div className="container intro-shell">
          <div className="intro-grid">
            <h1 id="hero-title">Wynajem 9-osobowych busów Renault Trafic</h1>
            <div className="intro-details">
              <p className="hero-subtitle">Wygodny, bezpieczny i gotowy na każdą podróż.</p>
              <p className="hero-body">Wynajem krótko- i długoterminowy. Obsługujemy Wieruszów, Kępno, Ostrzeszów, Syców, Kluczbork, Wieluń i Złoczew.</p>
              <div className="hero-actions"><a className="button button-primary" href="#kontakt">Zarezerwuj</a><a className="button button-secondary" href={siteContent.phone.href}><Phone size={18} />Zadzwoń</a></div>
            </div>
          </div>
          <div className="trust-row" aria-label="Najważniejsze cechy">
            {['Kategoria B', '9 osób', 'Klimatyzacja', 'Diesel', 'Manual', 'OC / AC'].map((item) => <span key={item}><Check />{item}</span>)}
          </div>
        </div>
      </section>

      <section className="feature-rail container" aria-label="Szybkie informacje">{quickFeatures.map(([Icon, title, copy]) => <div key={title}><Icon /><span><strong>{title}</strong><small>{copy}</small></span></div>)}</section>

      <section className="section" id="oferta"><div className="container"><Reveal><SectionHeading label="Nasze busy" title="Dwa busy. Pełna swoboda podróży." copy="Przestrzeń wersji LONG, wyposażenie na dłuższą trasę i proste warunki wynajmu." /></Reveal><Reveal><VehicleShowcase /></Reveal></div></section>

      <section className="section soft-section"><div className="container"><Reveal><SectionHeading label="Dlaczego my" title="Wszystko, czego potrzeba. Bez zbędnych komplikacji." /></Reveal><div className="benefit-grid">{benefits.map(([Icon, title, copy]) => <Reveal key={title} className="benefit"><Icon /><h3>{title}</h3><p>{copy}</p></Reveal>)}</div></div></section>

      <section className="section locations-section"><div className="container locations-grid"><Reveal className="locations-copy"><SectionHeading label="Odbiór i zasięg" title="Blisko początku Twojej trasy." copy="Odbierz samochód w jednym z dwóch lokalnych punktów lub zapytaj o podstawienie pod wskazany adres." /><div className="pickup-list"><span><MapPin />Galewice</span><span><MapPin />Łęka Mroczeńska</span></div><div className="area-list">{siteContent.serviceAreas.map((area) => <span key={area}>{area}</span>)}</div></Reveal><Reveal className="map-frame"><iframe title="Mapa obszaru działania BusemNaCzas.pl" loading="lazy" referrerPolicy="no-referrer-when-downgrade" src="https://www.google.com/maps?q=Wierusz%C3%B3w%2C%20Polska&z=9&output=embed" /></Reveal></div></section>

      <section className="section" id="galeria"><div className="container"><Reveal><SectionHeading label="Galeria" title="Gotowy na drogę." copy="Renault Trafic w naturalnym środowisku — dużo miejsca, spokojne prowadzenie i komfort całej ekipy." /></Reveal><Gallery /></div></section>

      <section className="section pricing-section" id="cennik"><div className="container"><Reveal><SectionHeading label="Cennik" title="Im dłuższa podróż, tym lepsza stawka." copy="Każda cena zawiera pełne ubezpieczenie OC i AC." /></Reveal><div className="pricing-grid">{siteContent.pricing.map((tier) => <Reveal key={tier.duration} className={`price-card ${tier.recommended ? 'recommended' : ''}`}>{tier.recommended && <span className="recommended-label">Najczęściej wybierane</span>}<p>{tier.duration}</p><h3><strong>{tier.price}</strong> zł</h3><span>za dobę</span><div><Gauge />{tier.limit}</div><a href="#kontakt">Zapytaj o termin</a></Reveal>)}</div><Reveal className="pricing-notes"><p><strong>Nadprzebieg:</strong> 1 zł/km.</p><p>Doba liczona jest od godziny odbioru. Przekroczenie o 1–2 godziny może zostać zaakceptowane po wcześniejszej informacji.</p><p>Najem długoterminowy wyceniamy indywidualnie.</p></Reveal></div></section>

      <section className="section"><div className="container"><Reveal><SectionHeading label="Usługi dodatkowe" title="Jeszcze mniej logistyki po Twojej stronie." /></Reveal><div className="service-row"><Reveal className="service-item"><Truck /><div><h3>Podstawienie i odbiór</h3><p>Pod wskazany adres, licząc od miejsca postoju pojazdu.</p></div><strong>5 zł/km</strong></Reveal><Reveal className="service-item"><Bike /><div><h3>Bagażnik rowerowy</h3><p>Wersja 3-miejscowa, dostępna z pojazdem wyposażonym w hak.</p></div><strong>80 zł</strong></Reveal><Reveal className="service-item service-muted"><Route /><div><h3>Kolejne akcesoria</h3><p>Oferta wyposażenia dodatkowego będzie rozwijana.</p></div><strong>Wkrótce</strong></Reveal></div></div></section>

      <section className="section soft-section"><div className="container testimonial-grid"><Reveal><SectionHeading label="Opinie" title="Podróż zaczyna się od dobrego wyboru." copy="Miejsce przygotowane na przyszłe, zweryfikowane recenzje klientów." /></Reveal><Reveal><Testimonials /></Reveal></div></section>

      <section className="section" id="faq"><div className="container faq-grid"><Reveal><SectionHeading label="FAQ" title="Najważniejsze odpowiedzi przed drogą." copy="Jeśli nie widzisz swojego pytania, zadzwoń — odpowiemy od razu." /><a className="text-link" href={siteContent.phone.href}>{siteContent.phone.display}</a></Reveal><Reveal><Faq /></Reveal></div></section>

      <section className="contact-section" id="kontakt"><div className="container"><Contact /></div></section>
    </main>
    <footer className="footer"><div className="container footer-top"><nav aria-label="Stopka">{siteContent.nav.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}</nav><a href={siteContent.phone.href}>{siteContent.phone.display}</a></div><div className="container footer-bottom"><span>© 2026 BusemNaCzas.pl</span><span>Polityka prywatności</span><a href="https://maps.google.com/?q=Wieruszów" target="_blank" rel="noreferrer">Google Maps</a></div></footer>
    <div className="mobile-cta"><a href={siteContent.phone.href}><Phone />Zadzwoń</a><a href="#kontakt">Zarezerwuj</a></div>
  </MotionConfig>
}

export default App
