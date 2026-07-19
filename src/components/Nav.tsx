import { Menu, Phone, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { siteContent } from '../content'

export function Nav() {
  const [scrolled, setScrolled] = useState(false)
  const [open, setOpen] = useState(false)
  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 24)
    update(); window.addEventListener('scroll', update, { passive: true })
    return () => window.removeEventListener('scroll', update)
  }, [])
  useEffect(() => {
    if (!open) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', closeOnEscape)
    return () => {
      document.body.style.overflow = previousOverflow
      window.removeEventListener('keydown', closeOnEscape)
    }
  }, [open])
  return (
    <header className={`site-nav ${scrolled ? 'site-nav--scrolled' : ''}`}>
      <div className="container nav-inner">
        <a className="brand nav-brand" href="#top" aria-label="BusemNaCzas.pl — początek strony">Busem<span>NaCzas</span>.pl</a>
        <nav className="desktop-nav" aria-label="Główna nawigacja">
          {siteContent.nav.map(([label, id]) => <a key={id} href={`#${id}`}>{label}</a>)}
        </nav>
        <div className="nav-actions">
          <a className="phone-link" href={siteContent.phone.href}><Phone size={17} />{siteContent.phone.display}</a>
          <a className="button button-primary nav-cta" href="#kontakt">Zarezerwuj</a>
          <button className="menu-button" onClick={() => setOpen(!open)} aria-expanded={open} aria-label={open ? 'Zamknij menu' : 'Otwórz menu'}>{open ? <X /> : <Menu />}</button>
        </div>
      </div>
      {open && <nav className="mobile-menu" aria-label="Nawigacja mobilna">{siteContent.nav.map(([label, id]) => <a key={id} href={`#${id}`} onClick={() => setOpen(false)}>{label}</a>)}</nav>}
    </header>
  )
}
