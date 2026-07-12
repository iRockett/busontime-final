import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(cleanup)

class IntersectionObserverMock implements IntersectionObserver {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds = [0]
  disconnect() {}
  observe() {}
  takeRecords() { return [] }
  unobserve() {}
}

globalThis.IntersectionObserver = IntersectionObserverMock
window.scrollTo = () => undefined
