import path from 'node:path'
import { fileURLToPath } from 'node:url'
import browserAssets from './browser-assets.json' with { type: 'json' }

function deepFreeze(value) {
  Object.freeze(value)
  for (const nested of Object.values(value)) {
    if (nested && typeof nested === 'object' && !Object.isFrozen(nested)) deepFreeze(nested)
  }
  return value
}

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export const HERO_CONFIG = deepFreeze({
  root,
  sourcePath: path.join(root, 'tools/hero/source/hero-source.png'),
  mobileSourcePath: path.join(root, 'tools/hero/source/hero-mobile-source.png'),
  outputDir: path.join(root, 'output/hero-production'),
  publicDir: path.join(root, 'public/assets'),
  source: { width: 1672, height: 941 },
  mobileSource: { width: 1086, height: 1448 },
  browserAssets,
})
