import assert from 'node:assert/strict'
import test from 'node:test'
import { motionAt, phaseAt } from '../lib/phase.mjs'

test('validation frame evaluates at the same periodic phase as frame zero', () => {
  assert.equal(phaseAt(0), 0)
  assert.equal(phaseAt(120), 0)
  assert.deepEqual(motionAt(120, 'desktop'), motionAt(0, 'desktop'))
})

test('travel phases advance forward at a constant rate', () => {
  const phases = [0, 1, 2, 3].map((frame) => motionAt(frame, 'desktop').roadPhase)
  assert.ok(Math.abs((phases[1] - phases[0]) - (phases[2] - phases[1])) < 1e-12)
  assert.ok(Math.abs((phases[2] - phases[1]) - (phases[3] - phases[2])) < 1e-12)
})

test('only the road phase and wheel rotation advance between frames', () => {
  for (let frame = 0; frame <= 120; frame += 1) {
    const motion = motionAt(frame, 'desktop')
    assert.equal(motion.guardrailPhase, 0)
    assert.equal(motion.treePhase, 0)
    assert.equal(motion.mountainPhase, 0)
    assert.equal(motion.cloudPhase, 0)
    assert.equal(motion.suspensionY, 0)
    assert.equal(motion.cameraX, 0)
    assert.equal(motion.cameraY, 0)
    assert.equal(motion.pitchDegrees, 0)
    assert.equal(motion.reflectionPhase, 0)
  }
})

test('wheels make four constant turns while the road advances one exact tile per loop', () => {
  const start = motionAt(0, 'desktop')
  const next = motionAt(1, 'desktop')
  const quarter = motionAt(30, 'desktop')
  assert.equal(next.wheelDegrees - start.wheelDegrees, 12)
  assert.equal(quarter.wheelDegrees, 0)
  assert.equal(quarter.roadPhase, 0.25)
})
