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
    expect(screen.queryByText('k. Wieruszowa')).not.toBeInTheDocument()
    expect(screen.queryByText('k. Kępna')).not.toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'Dwa busy. Pełna swoboda podróży.' })).toBeInTheDocument()
    expect(screen.queryByText('Dwa Trafiki. Jeden standard podróży.')).not.toBeInTheDocument()
    const heroVideo = screen.getByLabelText('Renault Trafic BusemNaCzas.pl w trasie')
    expect(heroVideo).toHaveAttribute('autoplay')
    expect(heroVideo).toHaveAttribute('loop')
    expect(heroVideo).toHaveAttribute('playsinline')
    expect(heroVideo).toHaveAttribute('poster', '/assets/busemnaczas-hero-brand.webp')
    expect(heroVideo).toHaveProperty('muted', true)
    expect(heroVideo.querySelector('source')).toHaveAttribute('src', '/assets/busemnaczas-hero.mp4')
    expect(screen.getByTestId('hero-cloud-layer')).toHaveAttribute('data-motion', 'subtle')
  })

  it('switches vehicles and renders the photo gallery', async () => {
    const user = userEvent.setup()
    render(<App />)
    expect(screen.getByAltText(/Renault Trafic brązowy/)).toHaveAttribute('src', '/assets/renault-trafic-brazowy-portrait.png')
    await user.click(screen.getByRole('tab', { name: 'Stalowy' }))
    expect(await screen.findByText('Hak holowniczy')).toBeInTheDocument()
    expect(screen.getByAltText(/Renault Trafic stalowy/)).toHaveAttribute('src', '/assets/renault-trafic-stalowy-portrait-extended.png')
    expect(screen.getByRole('img', { name: 'Szary Renault Trafic z przodu' })).toHaveAttribute('src', '/assets/gallery-02.png')
    expect(screen.getAllByRole('img', { name: /Renault Trafic/ }).length).toBe(7)
  })

  it('opens and closes the mobile navigation', async () => {
    render(<App />)
    fireEvent.click(screen.getByLabelText('Otwórz menu'))
    expect(screen.getByLabelText('Nawigacja mobilna')).toBeInTheDocument()
    fireEvent.click(screen.getByLabelText('Zamknij menu'))
    expect(screen.queryByLabelText('Nawigacja mobilna')).not.toBeInTheDocument()
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
