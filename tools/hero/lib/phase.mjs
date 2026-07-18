import { HERO_CONFIG } from '../config.mjs'

const wrap01 = (value) => ((value % 1) + 1) % 1
const clean = (value) => Math.abs(value) < 1e-12 ? 0 : Number(value.toFixed(12))

export function phaseAt(frame) {
  return wrap01(frame / HERO_CONFIG.encodedFrames)
}

export function motionAt(frame, format = 'desktop') {
  const phase = phaseAt(frame)
  return {
    phase,
    roadPhase: phase,
    guardrailPhase: 0,
    treePhase: 0,
    mountainPhase: 0,
    cloudPhase: 0,
    suspensionY: 0,
    cameraX: 0,
    cameraY: 0,
    pitchDegrees: 0,
    wheelDegrees: clean((phase * 360 * HERO_CONFIG.motion.wheelTurns) % 360),
    reflectionPhase: 0,
  }
}
