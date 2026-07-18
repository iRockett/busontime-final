import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

const rootElement = document.getElementById('root')!
const mount = () => createRoot(rootElement).render(<StrictMode><App /></StrictMode>)

if (rootElement.querySelector('.initial-hero')) {
  requestAnimationFrame(() => requestAnimationFrame(mount))
} else {
  mount()
}
