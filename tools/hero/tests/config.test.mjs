import assert from 'node:assert/strict'
import test from 'node:test'
import { HERO_CONFIG } from '../config.mjs'

test('static hero contract is immutable and responsive', () => {
  assert.deepEqual(HERO_CONFIG.source, { width: 1672, height: 941 })
  assert.deepEqual(HERO_CONFIG.browserAssets, {
    desktop: { webp: 'hero-static.webp', width: 1672, height: 941 },
    mobile: { webp: 'hero-static-1280.webp', width: 1280, height: 720 },
  })
  assert.throws(() => {
    HERO_CONFIG.browserAssets.desktop.webp = 'animated.mp4'
  }, TypeError)
})
