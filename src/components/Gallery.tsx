import { useEffect, useRef, useState } from 'react'

const galleryImages = [
  ['/assets/gallery-photo-01.webp', '/assets/gallery-photo-01-640.webp', 'Szary Renault Trafic z tyłu', 1295, 1054],
  ['/assets/renault-trafic-stalowy.webp', '/assets/renault-trafic-stalowy.webp', 'Stalowy Renault Trafic z przodu', 1448, 1086],
  ['/assets/renault-trafic-brazowy.webp', '/assets/renault-trafic-brazowy.webp', 'Beżowy Renault Trafic z przodu', 1448, 1086],
  ['/assets/gallery-photo-04.webp', '/assets/gallery-photo-04-640.webp', 'Beżowy Renault Trafic w zimowej scenerii', 1600, 1200],
  ['/assets/gallery-photo-05.webp', '/assets/gallery-photo-05-640.webp', 'Wnętrze Renault Trafic — tylne siedzenia', 1600, 1200],
  ['/assets/gallery-photo-06.webp', '/assets/gallery-photo-06-640.webp', 'Wnętrze Renault Trafic — kabina kierowcy', 1600, 1200],
] as const

export function Gallery() {
  const [activeImage, setActiveImage] = useState<number | null>(null)
  const closeButtonRef = useRef<HTMLButtonElement>(null)
  const triggerRef = useRef<HTMLButtonElement | null>(null)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveImage(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  useEffect(() => {
    if (activeImage === null) return
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    closeButtonRef.current?.focus()
    return () => {
      document.body.style.overflow = previousOverflow
      triggerRef.current?.focus()
    }
  }, [activeImage])

  const active = activeImage === null ? null : galleryImages[activeImage]

  return <>
    <div className="gallery-grid" aria-label="Galeria zdjęć">{galleryImages.map(([src, smallSrc, alt, width, height], index) => <button key={src} className="gallery-tile" type="button" onClick={(event) => { triggerRef.current = event.currentTarget; setActiveImage(index) }} aria-label={`Powiększ zdjęcie: ${alt}`}><img src={smallSrc} srcSet={`${smallSrc} 640w, ${src} 1280w`} sizes="(max-width: 680px) 30vw, 390px" width={width} height={height} alt={alt} loading="lazy" decoding="async" /></button>)}</div>
    {active && <div className="lightbox" role="dialog" aria-modal="true" aria-label={active[2]} onClick={(event) => { if (event.target === event.currentTarget) setActiveImage(null) }}><img src={active[0]} width={active[3]} height={active[4]} alt={active[2]} /><button ref={closeButtonRef} type="button" onClick={() => setActiveImage(null)} aria-label="Zamknij podgląd">×</button></div>}
  </>
}
