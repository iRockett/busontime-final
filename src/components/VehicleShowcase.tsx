import { AnimatePresence, motion } from 'framer-motion'
import { Check, ChevronLeft, ChevronRight } from 'lucide-react'
import { useState } from 'react'
import { siteContent } from '../content'

export function VehicleShowcase() {
  const [index, setIndex] = useState(0)
  const vehicle = siteContent.vehicles[index]
  const select = (next: number) => setIndex((next + siteContent.vehicles.length) % siteContent.vehicles.length)
  return (
    <div className="vehicle-showcase">
      <div className="vehicle-tabs" role="tablist" aria-label="Wybierz pojazd">
        {siteContent.vehicles.map((item, itemIndex) => <button key={item.id} role="tab" aria-selected={index === itemIndex} onClick={() => setIndex(itemIndex)}>{item.finish}</button>)}
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={vehicle.id} className="vehicle-grid" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: .35 }}>
          <div className="vehicle-media image-zoom">
            <span className="vehicle-media-bg" aria-hidden="true" style={{ backgroundImage: `url(${vehicle.image})` }} />
            <img className="vehicle-media-image" src={vehicle.image} alt={`Renault Trafic ${vehicle.finish.toLowerCase()} — 9-osobowy bus`} width={vehicle.imageWidth} height={vehicle.imageHeight} loading="lazy" decoding="async" />
          </div>
          <div className="vehicle-copy">
            <p className="section-index">0{index + 1} / 02</p>
            <h3>{vehicle.name} <span>{vehicle.finish}</span></h3>
            <p className="lead">Przestronny Trafic w wersji LONG — przygotowany na rodzinny wyjazd, podróż ze znajomymi lub firmowy przejazd.</p>
            <div className="spec-list">{vehicle.specs.map((spec) => <span key={spec}>{spec}</span>)}</div>
            <ul>{vehicle.equipment.map((item) => <li key={item}><Check size={17} />{item}</li>)}</ul>
            <a className="button button-primary" href="#kontakt">Zarezerwuj ten pojazd</a>
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="carousel-arrows"><button onClick={() => select(index - 1)} aria-label="Poprzedni pojazd"><ChevronLeft /></button><button onClick={() => select(index + 1)} aria-label="Następny pojazd"><ChevronRight /></button></div>
    </div>
  )
}
