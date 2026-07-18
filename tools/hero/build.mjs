import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { HERO_CONFIG } from './config.mjs'
import { verifyStaticHero } from './verify.mjs'

const metadata = await sharp(HERO_CONFIG.sourcePath).metadata()
if (metadata.width !== HERO_CONFIG.source.width || metadata.height !== HERO_CONFIG.source.height) {
  throw new Error(`Hero source must be ${HERO_CONFIG.source.width}x${HERO_CONFIG.source.height}`)
}

await Promise.all([
  fs.mkdir(HERO_CONFIG.publicDir, { recursive: true }),
  fs.mkdir(HERO_CONFIG.outputDir, { recursive: true }),
])

const desktop = HERO_CONFIG.browserAssets.desktop
const mobile = HERO_CONFIG.browserAssets.mobile

await Promise.all([
  sharp(HERO_CONFIG.sourcePath)
    .webp({ lossless: true, effort: 6 })
    .toFile(path.join(HERO_CONFIG.publicDir, desktop.webp)),
  sharp(HERO_CONFIG.sourcePath)
    .resize({ width: mobile.width, height: mobile.height, fit: 'fill' })
    .webp({ quality: 92, effort: 6 })
    .toFile(path.join(HERO_CONFIG.publicDir, mobile.webp)),
])

await verifyStaticHero()
