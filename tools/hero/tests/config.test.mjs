import assert from 'node:assert/strict'
import test from 'node:test'
import { HERO_CONFIG } from '../config.mjs'

test('static hero contract is immutable and responsive', () => {
  assert.deepEqual(HERO_CONFIG.source, { width: 1672, height: 941 })
  assert.deepEqual(HERO_CONFIG.mobileSource, { width: 1086, height: 1448 })
  assert.deepEqual(HERO_CONFIG.browserAssets, {
    desktop: { webp: 'hero-static.webp', width: 1672, height: 941 },
    mobile: { webp: 'hero-static-1280.webp', width: 1280, height: 720 },
    portrait: {
      webp: 'hero-mobile-portrait.webp',
      width: 1086,
      height: 1448,
    },
  })
  assert.throws(() => {
    HERO_CONFIG.browserAssets.desktop.webp = 'animated.mp4'
  }, TypeError)
})
