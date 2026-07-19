import { fireEvent, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
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

  it('discloses FAQ content and sends a valid contact request once', async () => {
    const user = userEvent.setup()
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    const faqButton = screen.getByRole('button', { name: 'Jak wygląda rezerwacja?' })
    await user.click(faqButton)
    expect(faqButton).toHaveAttribute('aria-expanded', 'true')
    expect(screen.getByText(/Potwierdzimy dostępność, termin/)).toBeInTheDocument()
    await user.type(screen.getByLabelText('Imię'), 'Jan')
    await user.type(screen.getByLabelText('Telefon'), '500 500 500')
    await user.type(screen.getByLabelText('Termin'), '12–14 lipca')
    await user.type(screen.getByLabelText('Wiadomość'), 'Proszę o kontakt')
    await user.click(screen.getByRole('button', { name: 'Wyślij zapytanie' }))
    expect(fetchMock).toHaveBeenCalledOnce()
    expect(fetchMock).toHaveBeenCalledWith('/api/contact', expect.objectContaining({ method: 'POST', headers: { 'Content-Type': 'application/json' }, body: expect.any(String) }))
    expect(JSON.parse(fetchMock.mock.calls[0][1].body)).toMatchObject({ name: 'Jan', phone: '500 500 500', date: '12–14 lipca', message: 'Proszę o kontakt', website: '' })
    expect(screen.getByRole('status')).toHaveTextContent('Dziękujemy')
    expect(screen.getByLabelText('Imię')).toHaveValue('')
    vi.unstubAllGlobals()
  })

  it('disables the form while sending and preserves values when the API fails', async () => {
    const user = userEvent.setup()
    let rejectRequest: (reason?: unknown) => void = () => undefined
    const fetchMock = vi.fn(() => new Promise((_, reject) => { rejectRequest = reject }))
    vi.stubGlobal('fetch', fetchMock)
    render(<App />)
    await user.type(screen.getByLabelText('Imię'), 'Jan')
    await user.type(screen.getByLabelText('Telefon'), '500 500 500')
    await user.type(screen.getByLabelText('Termin'), '12–14 lipca')
    await user.click(screen.getByRole('button', { name: 'Wyślij zapytanie' }))
    expect(screen.getByRole('button', { name: 'Wysyłanie…' })).toBeDisabled()
    await user.click(screen.getByRole('button', { name: 'Wysyłanie…' }))
    expect(fetchMock).toHaveBeenCalledOnce()
    rejectRequest(new Error('network'))
    expect(await screen.findByRole('alert')).toHaveTextContent('Nie udało się')
    expect(screen.getByLabelText('Imię')).toHaveValue('Jan')
    vi.unstubAllGlobals()
  })
})
