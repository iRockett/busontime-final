export function Gallery() {
  return <div className="gallery-grid gallery-placeholders" aria-label="Galeria w przygotowaniu">{Array.from({ length: 9 }, (_, index) => <div key={index} className="gallery-tile gallery-placeholder"><span>{String(index + 1).padStart(2, '0')}</span><p>Zdjęcie wkrótce</p></div>)}</div>
}
