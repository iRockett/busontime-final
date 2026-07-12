import { ChevronDown } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { useState } from 'react'
import { siteContent } from '../content'

export function Faq() {
  const [open, setOpen] = useState<number | null>(null)
  return <div className="faq-list">{siteContent.faqs.map(([question, answer], index) => <div className="faq-item" key={question}><button aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)}>{question}<ChevronDown /></button><AnimatePresence>{open === index && <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}><p>{answer}</p></motion.div>}</AnimatePresence></div>)}</div>
}
