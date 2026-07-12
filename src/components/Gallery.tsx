const galleryImages = [
  ['/assets/gallery-01.jpeg', 'Szary Renault Trafic z tyłu'],
  ['/assets/gallery-02.png', 'Szary Renault Trafic z przodu'],
  ['/assets/gallery-03.png', 'Szary Renault Trafic z boku'],
  ['/assets/gallery-04.jpeg', 'Beżowy Renault Trafic w zimowej scenerii'],
  ['/assets/gallery-05.jpeg', 'Wnętrze Renault Trafic — tylne siedzenia'],
  ['/assets/gallery-06.jpeg', 'Wnętrze Renault Trafic — kabina kierowcy'],
]

export function Gallery() {
  return <div className="gallery-grid" aria-label="Galeria zdjęć">{galleryImages.map(([src, alt]) => <div key={src} className="gallery-tile"><img src={src} alt={alt} loading="lazy" /></div>)}</div>
}
