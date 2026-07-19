import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App'

describe('landing page', () => {
  it('renders the essential conversion content', () => {
    render(<App />)
    expect(screen.getByRole('heading', { level: 1, name: /Wynajem 9-osobowych/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '300 zł' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Zarezerwuj' }).length).toBeGreaterThan(1)
    expect(screen.getAllByRole('link', { name: /514 574 594/ })[0]).toHaveAttribute('href', 'tel:+48514574594')
    expect(screen.getByLabelText('BusemNaCzas.pl — strona główna')).toBeInTheDocument()
    expect(screen.getByLabelText('BusemNaCzas.pl — początek strony')).toBeInTheDocument()
    expect(screen.queryByText('k. Wieruszowa')).not.toBeInTheDocument()
    expect(screen.queryByText('k. Kępna')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Dwa busy. Pełna swoboda podróży.' })).toBeInTheDocument()
    expect(screen.queryByText('Dwa Trafiki. Jeden standard podróży.')).not.toBeInTheDocument()
    expect(screen.queryByLabelText('Renault Trafic BusemNaCzas.pl w trasie')).not.toBeInTheDocument()
    expect(screen.getByTestId('hero-poster-picture').querySelector('img')).toHaveAttribute('src', '/assets/hero-static.webp')
    expect(screen.getByTestId('hero-poster-picture').querySelector('source[media="(max-width: 680px)"]')).toHaveAttribute('srcset', '/assets/hero-mobile-portrait.webp')
    expect(screen.getByTestId('mobile-hero-actions').querySelector('a[href="tel:+48514574594"]')).toHaveTextContent('Zadzwoń')
    expect(screen.getByTestId('mobile-hero-actions').querySelector('a[href="#kontakt"]')).toHaveTextContent('Zarezerwuj')
  })

  it('switches vehicles and renders the photo gallery', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByAltText(/Renault Trafic brązowy/)).toHaveAttribute('src', '/assets/renault-trafic-brazowy.webp')
    await user.click(screen.getByRole('tab', { name: 'Stalowy' }))
    expect(await screen.findByText('Hak holowniczy')).toBeInTheDocument()
    expect(screen.getByAltText(/Renault Trafic stalowy/)).toHaveAttribute('src', '/assets/renault-trafic-stalowy.webp')
    expect(screen.getByRole('img', { name: 'Stalowy Renault Trafic z przodu' })).toHaveAttribute('src', '/assets/renault-trafic-stalowy.webp')
    expect(screen.getAllByRole('img', { name: /Renault Trafic/ }).length).toBe(7)
    const galleryTrigger = screen.getByRole('button', { name: 'Powiększ zdjęcie: Stalowy Renault Trafic z przodu' })
    await user.click(galleryTrigger)
    expect(screen.getByRole('dialog', { name: 'Stalowy Renault Trafic z przodu' })).toBeInTheDocument()
    const closeButton = screen.getByRole('button', { name: 'Zamknij podgląd' })
    expect(closeButton).toHaveFocus()
    await user.click(closeButton)
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
    expect(galleryTrigger).toHaveFocus()
  })

  it('opens and closes the mobile navigation', async () => {
    const user = userEvent.setup()
    render(<App />)
    fireEvent.click(screen.getByLabelText('Otwórz menu'))
    expect(screen.getByLabelText('Nawigacja mobilna')).toBeInTheDocument()
    await user.keyboard('{Escape}')
    expect(screen.queryByLabelText('Nawigacja mobilna')).not.toBeInTheDocument()
  })

  it('does not load decorative motion when reduced motion is requested', () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = (query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addEventListener: () => undefined,
      removeEventListener: () => undefined,
      addListener: () => undefined,
      removeListener: () => undefined,
      dispatchEvent: () => true,
    })
    render(<App />)
    expect(screen.queryByLabelText('Renault Trafic BusemNaCzas.pl w trasie')).not.toBeInTheDocument()
    expect(screen.getByTestId('hero-poster-picture')).toBeInTheDocument()
    window.matchMedia = originalMatchMedia
  })

  it('discloses FAQ content and confirms a valid contact request', async () => {
    const user = userEvent.setup()
    render(<App />)
    const faqButton = screen.getByRole('button', { name: 'Jak wygląda rezerwacja?' })
    await user.click(faqButton)
    expect(faqButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Potwierdzimy dostępność, termin/)).toBeInTheDocument()
    await user.type(screen.getByLabelText('Imię'), 'Jan')
    await user.type(screen.getByLabelText('Telefon'), '500 500 500')
    await user.type(screen.getByLabelText('Termin'), '12–14 lipca')
    await user.click(screen.getByRole('button', { name: 'Wyślij zapytanie' }))
    expect(screen.getByRole('status')).toHaveTextContent('Dziękujemy')
  })
})
