import path from 'node:path'
import { fileURLToPath } from 'node:url'

function deepFreeze(value) {
  Object.freeze(value)
  for (const nested of Object.values(value)) {
    if (nested && typeof nested === 'object' && !Object.isFrozen(nested)) {
      deepFreeze(nested)
    }
  }
  return value
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export const HERO_CONFIG = deepFreeze({
  root,
  sourcePath: path.join(root, 'tools/hero/source/hero-source.png'),
  workDir: path.join(root, 'work/hero'),
  outputDir: path.join(root, 'output/hero-production'),
  publicDir: path.join(root, 'public/assets'),
  source: { width: 1672, height: 941 },
  master: { width: 2560, height: 1440 },
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 1080, height: 1920 },
  fps: 30,
  durationSeconds: 4,
  encodedFrames: 120,
  validationFrame: 120,
  protectedRegions: [
    { name: 'logo', left: 47, top: 307, width: 1053, height: 740, radius: 28 },
    { name: 'van', left: 1067, top: 280, width: 1387, height: 833, radius: 72 },
  ],
  motion: {
    wheelTurns: 4,
    roadTravel: 1080,
    suspensionAmplitude: 0,
    pitchDegrees: 0,
    cameraVibrationAmplitude: 0,
    mountainTravel: 0,
    cloudTravelRatio: 0,
    bodyReflectionOpacity: 0,
    glassReflectionOpacity: 0,
    logoDisplacement: 0,
  },
})
