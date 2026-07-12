const galleryImages = [
  ['/assets/gallery-01.jpeg', 'Szary Renault Trafic z tyłu'],
  ['/assets/gallery-02.png', 'Szary Renault Trafic z przodu'],
  ['/assets/gallery-03.png', 'Szary Renault Trafic z boku'],
  ['/assets/gallery-04.jpeg', 'Beżowy Renault Trafic w zimowej scenerii'],
  ['/assets/gallery-05.jpeg', 'Wnętrze Renault Trafic — tylne siedzenia'],
  ['/assets/gallery-06.jpeg', 'Wnętrze Renault Trafic — kabina kierowcy'],
]

export function Gallery() {
  const [activeImage, setActiveImage] = useState<number | null>(null)

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setActiveImage(null)
    }
    window.addEventListener('keydown', closeOnEscape)
    return () => window.removeEventListener('keydown', closeOnEscape)
  }, [])

  const active = activeImage === null ? null : galleryImages[activeImage]

  return <>
    <div className="gallery-grid" aria-label="Galeria zdjęć">{galleryImages.map(([src, alt], index) => <button key={src} className="gallery-tile" type="button" onClick={() => setActiveImage(index)} aria-label={`Powiększ zdjęcie: ${alt}`}><img src={src} alt={alt} loading="lazy" /></button>)}</div>
    {active && <div className="lightbox" role="dialog" aria-modal="true" aria-label={active[1]} onClick={(event) => { if (event.target === event.currentTarget) setActiveImage(null) }}><img src={active[0]} alt={active[1]} /><button type="button" onClick={() => setActiveImage(null)} aria-label="Zamknij podgląd">×</button></div>}
  </>
}
import { useEffect, useState } from 'react'
