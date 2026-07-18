import assert from 'node:assert/strict'
import test from 'node:test'
import { HERO_CONFIG } from '../config.mjs'

test('hero timeline and outputs satisfy the production contract', () => {
  assert.deepEqual(HERO_CONFIG.source, { width: 1672, height: 941 })
  assert.deepEqual(HERO_CONFIG.master, { width: 2560, height: 1440 })
  assert.deepEqual(HERO_CONFIG.desktop, { width: 1920, height: 1080 })
  assert.deepEqual(HERO_CONFIG.mobile, { width: 1080, height: 1920 })
  assert.equal(HERO_CONFIG.fps, 30)
  assert.equal(HERO_CONFIG.durationSeconds, 4)
  assert.equal(HERO_CONFIG.encodedFrames, 120)
  assert.equal(HERO_CONFIG.durationSeconds * HERO_CONFIG.fps, HERO_CONFIG.encodedFrames)
  assert.equal(HERO_CONFIG.validationFrame, 120)
  assert.equal(HERO_CONFIG.motion.wheelTurns, 4)
  assert.equal(HERO_CONFIG.motion.roadTravel, 1080)
  assert.equal(HERO_CONFIG.motion.roadTravel % 180, 0)
  assert.equal(HERO_CONFIG.motion.roadTravel % 270, 0)
  assert.equal(HERO_CONFIG.motion.roadTravel % 360, 0)
})

test('hero configuration is deeply immutable', () => {
  assert.throws(() => {
    HERO_CONFIG.source.width = 1
  }, TypeError)
  assert.throws(() => {
    HERO_CONFIG.motion.wheelTurns = 1
  }, TypeError)
})
