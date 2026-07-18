import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { HERO_CONFIG } from './config.mjs'

const sha256 = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex')

async function inspectAsset(name, expected) {
  const filePath = path.join(HERO_CONFIG.publicDir, name)
  const bytes = await fs.readFile(filePath)
  const metadata = await sharp(bytes).metadata()
  if (metadata.width !== expected.width || metadata.height !== expected.height || metadata.format !== 'webp') {
    throw new Error(`${name} must be a ${expected.width}x${expected.height} WebP`)
  }
  return { width: metadata.width, height: metadata.height, format: metadata.format, bytes: bytes.length, sha256: sha256(bytes) }
}

async function assertStaticIntegration() {
  const [app, html] = await Promise.all([
    fs.readFile(path.join(HERO_CONFIG.root, 'src/App.tsx'), 'utf8'),
    fs.readFile(path.join(HERO_CONFIG.root, 'index.html'), 'utf8'),
  ])
  for (const asset of Object.values(HERO_CONFIG.browserAssets)) {
    if (!app.includes(`/assets/${asset.webp}`)) throw new Error(`App.tsx does not consume ${asset.webp}`)
    if (!html.includes(`/assets/${asset.webp}`)) throw new Error(`index.html does not preload ${asset.webp}`)
  }
  if (/<video\b/i.test(app)) throw new Error('The hero must remain static; App.tsx contains a video element')
}

export async function verifyStaticHero({ writeReport = true } = {}) {
  const source = await fs.readFile(HERO_CONFIG.sourcePath)
  const sourceMetadata = await sharp(source).metadata()
  if (sourceMetadata.width !== HERO_CONFIG.source.width || sourceMetadata.height !== HERO_CONFIG.source.height) {
    throw new Error(`Hero source must be ${HERO_CONFIG.source.width}x${HERO_CONFIG.source.height}`)
  }

  const desktop = HERO_CONFIG.browserAssets.desktop
  const mobile = HERO_CONFIG.browserAssets.mobile
  const assets = {
    [desktop.webp]: await inspectAsset(desktop.webp, desktop),
    [mobile.webp]: await inspectAsset(mobile.webp, mobile),
  }

  const [sourcePixels, desktopPixels] = await Promise.all([
    sharp(source).raw().toBuffer(),
    sharp(path.join(HERO_CONFIG.publicDir, desktop.webp)).raw().toBuffer(),
  ])
  if (!sourcePixels.equals(desktopPixels)) throw new Error('Desktop WebP is not pixel-identical to the supplied source')

  await assertStaticIntegration()
  const manifest = {
    passed: true,
    animated: false,
    source: { ...HERO_CONFIG.source, bytes: source.length, sha256: sha256(source) },
    assets,
  }

  if (writeReport) {
    await fs.mkdir(HERO_CONFIG.outputDir, { recursive: true })
    await fs.writeFile(path.join(HERO_CONFIG.outputDir, 'static-export-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  }
  return manifest
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) await verifyStaticHero()
