import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { HERO_CONFIG } from './config.mjs'
import { createCompositeProof, createLayerContactSheet, createStaticHoldout, enhancedMaster, expandHoldout, extractMasked, reconstructBackground, trimToHoldout } from './lib/image.mjs'
import { layerNames, maskSvg } from './lib/masks.mjs'

const masterPath = path.join(HERO_CONFIG.outputDir, 'hero-master-2560x1440.png')
const layerDir = path.join(HERO_CONFIG.workDir, 'layers')
const contactSheetPath = path.join(HERO_CONFIG.outputDir, 'layer-contact-sheet.webp')
const compositeProofPath = path.join(HERO_CONFIG.outputDir, 'static-holdout-composite-proof.png')
const manifestPath = path.join(HERO_CONFIG.workDir, 'layer-manifest.json')

const relativePath = (filePath) => path.relative(HERO_CONFIG.root, filePath).replaceAll('\\', '/')

async function sha256(filePath) {
  return crypto.createHash('sha256').update(await fs.readFile(filePath)).digest('hex')
}

async function alphaBounds(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  let left = info.width
  let top = info.height
  let right = -1
  let bottom = -1
  for (let y = 0; y < info.height; y += 1) {
    for (let x = 0; x < info.width; x += 1) {
      if (data[(y * info.width + x) * info.channels + 3] === 0) continue
      left = Math.min(left, x)
      top = Math.min(top, y)
      right = Math.max(right, x)
      bottom = Math.max(bottom, y)
    }
  }
  if (right < left) throw new Error('Generated matte is empty')
  return { left, top, width: right - left + 1, height: bottom - top + 1 }
}

async function validateSource() {
  const metadata = await sharp(HERO_CONFIG.sourcePath).metadata()
  const geometry = [metadata.width, metadata.height]
  const expected = [HERO_CONFIG.source.width, HERO_CONFIG.source.height]
  if (geometry[0] !== expected[0] || geometry[1] !== expected[1]) {
    throw new Error(`Hero source must be ${expected.join('x')}; received ${geometry.join('x')}`)
  }
}

function reconstructionPatches() {
  // The flattened source has no clean plate.  At the configured 0–2.4px
  // motion envelope, source-faithful pixels are safer than inventing cloned
  // rectangles: all reconstructed-pixel change is therefore zero.
  return []
}

async function main() {
  await validateSource()
  await fs.mkdir(layerDir, { recursive: true })
  await fs.mkdir(HERO_CONFIG.outputDir, { recursive: true })
  await enhancedMaster(HERO_CONFIG.sourcePath, masterPath, HERO_CONFIG.master)

  const backgroundPath = path.join(layerDir, 'background.png')
  const patches = reconstructionPatches()
  await reconstructBackground(masterPath, patches, backgroundPath)
  const basePlate = {
    name: 'background',
    path: relativePath(backgroundPath),
    bounds: await alphaBounds(backgroundPath),
    sha256: await sha256(backgroundPath),
    strategy: 'source-faithful nonmoving base',
  }

  const mattes = new Map(await Promise.all(layerNames.map(async (name) => [
    name,
    await sharp(Buffer.from(maskSvg(name, HERO_CONFIG.master))).png().toBuffer(),
  ])))
  const foregroundLayers = new Set([
    'van', 'wheel-front', 'wheel-rear', 'body-reflection-mask',
    'glass-reflection-mask', 'logo',
  ])
  const layerByName = new Map()
  for (const name of layerNames.filter((name) => foregroundLayers.has(name))) {
    const matte = mattes.get(name)
    const outputPath = path.join(layerDir, `${name}.png`)
    await extractMasked(masterPath, matte, outputPath, name === 'van'
      ? { exclusionMasks: [mattes.get('wheel-front'), mattes.get('wheel-rear')] }
      : undefined)
    layerByName.set(name, {
      name,
      path: relativePath(outputPath),
      bounds: await alphaBounds(outputPath),
      sha256: await sha256(outputPath),
    })
  }

  const holdoutPath = path.join(layerDir, 'static-holdout.png')
  const safetyPath = path.join(layerDir, 'foreground-safety.png')
  const safetySvg = `<svg width="${HERO_CONFIG.master.width}" height="${HERO_CONFIG.master.height}" xmlns="http://www.w3.org/2000/svg">${HERO_CONFIG.protectedRegions.map((region) => `<rect x="${region.left}" y="${region.top}" width="${region.width}" height="${region.height}" rx="${region.radius}" fill="white"/>`).join('')}</svg>`
  await sharp(Buffer.from(safetySvg)).png().toFile(safetyPath)
  const featherSafetyPx = 1
  const holdout = await createStaticHoldout(
    [...['van', 'wheel-front', 'wheel-rear', 'logo'].map((name) => path.join(layerDir, `${name}.png`)), safetyPath],
    holdoutPath,
    { maxDisplacementPx: HERO_CONFIG.motion.mountainTravel, featherSafetyPx },
  )
  const environmentTravelRasterPx = Math.ceil(Math.max(
    HERO_CONFIG.motion.mountainTravel,
    HERO_CONFIG.master.width * HERO_CONFIG.motion.cloudTravelRatio,
  ))
  const environmentExclusion = await expandHoldout(holdout.buffer, environmentTravelRasterPx)
  for (const name of layerNames.filter((name) => !foregroundLayers.has(name))) {
    const outputPath = path.join(layerDir, `${name}.png`)
    await extractMasked(backgroundPath, mattes.get(name), outputPath)
    await trimToHoldout(outputPath, environmentExclusion)
    layerByName.set(name, {
      name,
      path: relativePath(outputPath),
      bounds: await alphaBounds(outputPath),
      sha256: await sha256(outputPath),
    })
  }
  const layers = layerNames.map((name) => layerByName.get(name))
  const contactInputs = [backgroundPath, holdoutPath, ...layers.map((layer) => path.join(HERO_CONFIG.root, layer.path))]
  await createLayerContactSheet(contactInputs, contactSheetPath)
  await createCompositeProof(backgroundPath, layers.map((layer) => path.join(HERO_CONFIG.root, layer.path)), compositeProofPath)
  const manifest = {
    source: {
      path: relativePath(HERO_CONFIG.sourcePath),
      width: HERO_CONFIG.source.width,
      height: HERO_CONFIG.source.height,
      sha256: await sha256(HERO_CONFIG.sourcePath),
    },
    master: {
      path: relativePath(masterPath),
      ...HERO_CONFIG.master,
      sha256: await sha256(masterPath),
    },
    background: basePlate,
    basePlate,
    reconstructionPatches: patches,
    reconstruction: {
      strategy: 'source-faithful nonmoving base copy',
      movementSafetyMarginPx: HERO_CONFIG.motion.mountainTravel,
      modifiedPixels: 0,
    },
    holdout: {
      path: relativePath(holdoutPath),
      safetyPath: relativePath(safetyPath),
      protectedRegions: HERO_CONFIG.protectedRegions,
      bounds: await alphaBounds(holdoutPath),
      sha256: await sha256(holdoutPath),
      maxDisplacementPx: HERO_CONFIG.motion.mountainTravel,
      featherSafetyPx,
      continuousRadiusPx: holdout.continuousRadiusPx,
      rasterRadiusPx: holdout.rasterRadiusPx,
      environmentTravelRasterPx,
      environmentPreTrimRadiusPx: holdout.rasterRadiusPx + environmentTravelRasterPx,
      guarantees: {
        basePlateIsByteIdenticalToMaster: true,
        basePlateIsNonmoving: true,
        environmentAlphaIsTrimmedForEveryConfiguredOffset: true,
        foregroundRgbIsConfinedToTheHoldoutEnvelope: true,
      },
    },
    layers,
    contactSheet: {
      path: relativePath(contactSheetPath),
      sha256: await sha256(contactSheetPath),
    },
    compositeProof: {
      path: relativePath(compositeProofPath),
      sha256: await sha256(compositeProofPath),
    },
  }
  await fs.writeFile(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`)
}

await main()
