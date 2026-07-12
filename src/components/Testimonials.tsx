import { AnimatePresence, motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useEffect, useState } from 'react'
import { siteContent } from '../content'

export function Testimonials() {
  const [index, setIndex] = useState(0)
  useEffect(() => { const timer = window.setInterval(() => setIndex((value) => (value + 1) % siteContent.testimonials.length), 5200); return () => window.clearInterval(timer) }, [])
  const item = siteContent.testimonials[index]
  return <div className="testimonial-shell">
    <AnimatePresence mode="wait"><motion.article key={item.name} initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -16 }} transition={{ duration: .4 }}>
      <div className="stars" aria-label="5 na 5 gwiazdek">{Array.from({ length: 5 }, (_, i) => <Star key={i} size={17} fill="currentColor" />)}</div>
      <blockquote>„{item.text}”</blockquote>
      <footer><span className="avatar" aria-hidden="true">{item.name[0]}</span><div><strong>{item.name}</strong><small>{item.trip}</small></div></footer>
    </motion.article></AnimatePresence>
    <div className="testimonial-dots">{siteContent.testimonials.map((item, i) => <button key={item.name} onClick={() => setIndex(i)} aria-label={`Pokaż opinię ${i + 1}`} aria-current={i === index} />)}</div>
    <p className="placeholder-note">Przykładowe opinie — treści demonstracyjne do zastąpienia po zebraniu recenzji klientów.</p>
  </div>
}
