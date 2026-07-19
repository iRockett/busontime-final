import assert from 'node:assert/strict'
import test from 'node:test'
import { verifyStaticHero } from '../verify.mjs'

test('shipped hero is static, responsive, and source-faithful', async () => {
  const manifest = await verifyStaticHero({ writeReport: false })
  assert.equal(manifest.passed, true)
  assert.equal(manifest.animated, false)
  assert.deepEqual(Object.keys(manifest.assets), ['hero-static.webp', 'hero-static-1280.webp', 'hero-mobile-portrait.webp'])
})
