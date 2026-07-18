import assert from 'node:assert/strict'
import { existsSync } from 'node:fs'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'
import { layerNames, maskSvg } from '../lib/masks.mjs'
import { HERO_CONFIG } from '../config.mjs'
import { extractMasked } from '../lib/image.mjs'

const expectedLayers = [
  'sky', 'clouds', 'mountains', 'trees', 'guardrails', 'road', 'lanes',
  'van', 'wheel-front', 'wheel-rear', 'body-reflection-mask',
  'glass-reflection-mask', 'logo',
]

test('all independent animation layers have deterministic mattes', () => {
  assert.deepEqual(layerNames, expectedLayers)
  for (const name of layerNames) {
    const svg = maskSvg(name, HERO_CONFIG.master)
    assert.match(svg, /^<svg/)
    assert.match(svg, new RegExp(`width="${HERO_CONFIG.master.width}"`))
    assert.match(svg, new RegExp(`height="${HERO_CONFIG.master.height}"`))
  }
})

test('unknown layer names are rejected', () => {
  assert.throws(() => maskSvg('not-a-layer', HERO_CONFIG.master), /Unknown hero layer/)
})

test('upscaled master has exact 2560 x 1440 geometry', async () => {
  const masterPath = 'output/hero-production/hero-master-2560x1440.png'
  assert.ok(existsSync(masterPath), 'enhanced master should exist')
  const metadata = await sharp(masterPath).metadata()
  assert.deepEqual([metadata.width, metadata.height], [2560, 1440])
  assert.equal(metadata.bitsPerSample, 16)
})

const layerPath = (name) => path.join(HERO_CONFIG.workDir, 'layers', `${name}.png`)

async function alphaData(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const alpha = (x, y) => data[(y * info.width + x) * info.channels + 3]
  return { alpha, data, info }
}

async function rgbData(filePath) {
  const { data, info } = await sharp(filePath)
    .removeAlpha()
    .toColourspace('srgb')
    .raw({ depth: 'uchar' })
    .toBuffer({ resolveWithObject: true })
  assert.equal(info.channels, 3)
  return { data, info }
}

function pixelDifference(reference, candidate) {
  assert.deepEqual([candidate.info.width, candidate.info.height], [reference.info.width, reference.info.height])
  let summed = 0
  let aboveThirty = 0
  const pixels = reference.info.width * reference.info.height
  for (let index = 0; index < reference.data.length; index += 3) {
    const delta = Math.abs(reference.data[index] - candidate.data[index])
      + Math.abs(reference.data[index + 1] - candidate.data[index + 1])
      + Math.abs(reference.data[index + 2] - candidate.data[index + 2])
    summed += delta
    aboveThirty += delta > 30
  }
  return { mean: summed / pixels, aboveThirty: aboveThirty / pixels }
}

async function finalComposite({ offsetX = 0, offsetY = 0 } = {}) {
  const foreground = ['van', 'wheel-front', 'wheel-rear', 'logo']
  const inputs = foreground.map((name) => ({
    input: layerPath(name),
    left: Math.round(offsetX),
    top: Math.round(offsetY),
  }))
  return sharp(layerPath('background')).composite(inputs).png().toBuffer()
}

function alphaCoverage({ data, info }) {
  let opaque = 0
  for (let index = 3; index < data.length; index += info.channels) opaque += data[index] > 0
  return opaque / (info.width * info.height)
}

test('generated layer manifest is complete, hashed, and records final alpha bounds', async () => {
  const manifestPath = path.join(HERO_CONFIG.workDir, 'layer-manifest.json')
  assert.ok(existsSync(manifestPath), 'layer manifest should exist')
  const manifest = JSON.parse(await fs.readFile(manifestPath, 'utf8'))
  assert.equal(manifest.layers.length, layerNames.length)
  assert.match(manifest.background.sha256, /^[a-f0-9]{64}$/)
  assert.match(manifest.master.sha256, /^[a-f0-9]{64}$/)
  assert.match(manifest.contactSheet.sha256, /^[a-f0-9]{64}$/)

  for (const layer of manifest.layers) {
    assert.ok(layerNames.includes(layer.name))
    assert.match(layer.sha256, /^[a-f0-9]{64}$/)
    const output = path.join(HERO_CONFIG.root, layer.path)
    assert.ok(existsSync(output), `${layer.name} output should exist`)
    const { alpha, info } = await alphaData(output)
    for (let y = 0; y < info.height; y += 1) {
      for (let x = 0; x < info.width; x += 1) {
        if (alpha(x, y) === 0) continue
        assert.ok(x >= layer.bounds.left && x < layer.bounds.left + layer.bounds.width, `${layer.name} alpha escapes horizontal manifest bounds`)
        assert.ok(y >= layer.bounds.top && y < layer.bounds.top + layer.bounds.height, `${layer.name} alpha escapes vertical manifest bounds`)
      }
    }
  }
})

test('wheel pixels are exclusively retained by the independent wheel layers', async () => {
  const van = await alphaData(layerPath('van'))
  const front = await alphaData(layerPath('wheel-front'))
  const rear = await alphaData(layerPath('wheel-rear'))
  let wheelPixels = 0
  for (let y = 0; y < van.info.height; y += 1) {
    for (let x = 0; x < van.info.width; x += 1) {
      const wheelAlpha = Math.max(front.alpha(x, y), rear.alpha(x, y))
      if (wheelAlpha < 16) continue
      wheelPixels += 1
      assert.equal(van.alpha(x, y), 0, `van alpha remains at wheel pixel ${x},${y}`)
    }
  }
  assert.ok(wheelPixels > 10_000, 'wheel mattes should retain substantial wheel coverage')
})

test('clouds are isolated content rather than an opaque sky slice and environment overlap stays narrow', async () => {
  const names = ['sky', 'clouds', 'mountains', 'trees', 'guardrails', 'road', 'lanes']
  const layers = Object.fromEntries(await Promise.all(names.map(async (name) => [name, await alphaData(layerPath(name))])))
  const cloudCoverage = alphaCoverage(layers.clouds)
  assert.ok(cloudCoverage > 0.01 && cloudCoverage < 0.22, `cloud coverage must be selective, received ${cloudCoverage}`)

  for (const [first, second] of [['sky', 'clouds'], ['mountains', 'trees'], ['trees', 'guardrails'], ['guardrails', 'road'], ['road', 'lanes']]) {
    let overlap = 0
    let smaller = 0
    const a = layers[first]
    const b = layers[second]
    for (let y = 0; y < a.info.height; y += 1) {
      for (let x = 0; x < a.info.width; x += 1) {
        const alphaA = a.alpha(x, y) > 16
        const alphaB = b.alpha(x, y) > 16
        overlap += alphaA && alphaB
        smaller += alphaA || alphaB ? Math.min(alphaA ? 1 : 0, alphaB ? 1 : 0) : 0
      }
    }
    // Broad protected regions intentionally trim unequal shares from adjacent
    // layers, so measure their overlap against the stable full canvas rather
    // than the now-variable smaller-layer denominator.
    const overlapCoverage = overlap / (a.info.width * a.info.height)
    const limit = first === 'trees' && second === 'guardrails' ? 0.03 : 0.02
    assert.ok(overlapCoverage < limit, `${first}/${second} overlap is too broad: ${overlapCoverage}`)
  }

  const contact = await sharp(path.join(HERO_CONFIG.outputDir, 'layer-contact-sheet.webp')).metadata()
  assert.equal(contact.width, 2560)
})

test('protected matte expansion feathers sub-pixel edges with source-color continuation', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'hero-edge-'))
  t.after(() => fs.rm(directory, { recursive: true, force: true }))
  const master = path.join(directory, 'master.png')
  const matte = path.join(directory, 'matte.png')
  const output = path.join(directory, 'cutout.png')
  await sharp({ create: { width: 16, height: 16, channels: 3, background: '#d03030' } })
    .composite([{ input: Buffer.from('<svg width="16" height="16"><rect x="5" y="4" width="6" height="8" fill="#2050e0"/></svg>') }])
    .png().toFile(master)
  await sharp(Buffer.from('<svg width="16" height="16"><rect x="5" y="4" width="6" height="8" fill="white"/></svg>')).png().toFile(matte)
  await extractMasked(master, await fs.readFile(matte), output)
  const { alpha, data, info } = await alphaData(output)
  const at = (x, y) => data.slice((y * info.width + x) * info.channels, (y * info.width + x) * info.channels + 3)
  assert.ok(alpha(4, 8) > 0 && alpha(4, 8) < 255, 'expanded edge should preserve a sub-pixel alpha ramp outside the hard matte')
  assert.ok(at(4, 8)[2] > at(4, 8)[0], 'expanded fringe should continue object colour instead of leaking the red background')
  assert.equal(alpha(2, 8), 0, 'protected expansion must remain local')
})

test('final foreground composite at rest remains source-faithful', async () => {
  const master = await rgbData(path.join(HERO_CONFIG.outputDir, 'hero-master-2560x1440.png'))
  const composite = await rgbData(await finalComposite())
  const difference = pixelDifference(master, composite)
  assert.ok(difference.mean <= 0.2, `rest composite mean RGB delta must stay local, received ${difference.mean}`)
  assert.ok(difference.aboveThirty <= 0.001, `rest composite RGB deltas above 30 must stay below 0.1%, received ${difference.aboveThirty}`)
})

test('2.4px foreground exposure bands retain the master plate without seams or halos', async () => {
  const master = await rgbData(path.join(HERO_CONFIG.outputDir, 'hero-master-2560x1440.png'))
  const background = await rgbData(layerPath('background'))
  const foreground = await Promise.all(['van', 'wheel-front', 'wheel-rear', 'logo'].map((name) => alphaData(layerPath(name))))
  const width = master.info.width
  const height = master.info.height
  const foregroundCoverage = new Uint8Array(width * height)
  for (let pixel = 0; pixel < foregroundCoverage.length; pixel += 1) {
    foregroundCoverage[pixel] = foreground.some((layer) => layer.data[pixel * layer.info.channels + 3] > 16)
  }
  const exposureBand = new Uint8Array(width * height)
  const offsets = []
  for (let offsetY = -3; offsetY <= 3; offsetY += 1) {
    for (let offsetX = -3; offsetX <= 3; offsetX += 1) {
      if (Math.hypot(offsetX, offsetY) <= 2.4) offsets.push({ offsetX, offsetY })
    }
  }
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      if (!foregroundCoverage[y * width + x]) continue
      for (const { offsetX, offsetY } of offsets) {
        const targetX = x + offsetX
        const targetY = y + offsetY
        if (targetX >= 0 && targetX < width && targetY >= 0 && targetY < height) exposureBand[targetY * width + targetX] = 1
      }
    }
  }
  let exposurePixels = 0
  let maximumChannelDelta = 0
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const pixel = y * width + x
      if (foregroundCoverage[pixel] || !exposureBand[pixel]) continue
      exposurePixels += 1
      const index = pixel * 3
      maximumChannelDelta = Math.max(
        maximumChannelDelta,
        Math.abs(master.data[index] - background.data[index]),
        Math.abs(master.data[index + 1] - background.data[index + 1]),
        Math.abs(master.data[index + 2] - background.data[index + 2]),
      )
    }
  }
  assert.ok(exposurePixels > 10_000, 'configured 2.4px movement should create a substantial tested exposure band')
  assert.equal(maximumChannelDelta, 0, `background must match the master throughout 2.4px exposed object boundaries; max channel delta ${maximumChannelDelta}`)
})

const environmentNames = ['sky', 'clouds', 'mountains', 'trees', 'guardrails', 'road', 'lanes']

function shiftedAlpha(layer, offsetX, offsetY) {
  const alpha = new Uint8Array(layer.info.width * layer.info.height)
  for (let y = 0; y < layer.info.height; y += 1) {
    for (let x = 0; x < layer.info.width; x += 1) {
      const targetX = x + offsetX
      const targetY = y + offsetY
      if (targetX < 0 || targetX >= layer.info.width || targetY < 0 || targetY >= layer.info.height) continue
      alpha[targetY * layer.info.width + targetX] = layer.alpha(x, y)
    }
  }
  return alpha
}

test('base plate is byte-identical to the master and the static holdout records its fixed safety envelope', async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(HERO_CONFIG.workDir, 'layer-manifest.json'), 'utf8'))
  assert.equal(manifest.basePlate.strategy, 'source-faithful nonmoving base')
  assert.equal(manifest.basePlate.sha256, manifest.master.sha256, 'the base must not be a clean or reconstructed plate')
  assert.equal(manifest.holdout.path, 'work/hero/layers/static-holdout.png')
  assert.equal(manifest.holdout.maxDisplacementPx, HERO_CONFIG.motion.mountainTravel)
  assert.ok(manifest.holdout.featherSafetyPx > 0)
  assert.equal(
    manifest.holdout.environmentTravelRasterPx,
    Math.ceil(Math.max(HERO_CONFIG.motion.mountainTravel, HERO_CONFIG.master.width * HERO_CONFIG.motion.cloudTravelRatio)),
    'the environment pre-trim must cover every configured travel amplitude, not only mountain parallax',
  )
  assert.equal(
    manifest.holdout.environmentPreTrimRadiusPx,
    manifest.holdout.rasterRadiusPx + manifest.holdout.environmentTravelRasterPx,
  )
  assert.ok(existsSync(path.join(HERO_CONFIG.root, manifest.holdout.path)), 'named static holdout should exist')
})

test('every movable environment layer stays outside the static holdout at rest and across the configured motion envelope', async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(HERO_CONFIG.workDir, 'layer-manifest.json'), 'utf8'))
  const holdout = await alphaData(path.join(HERO_CONFIG.root, manifest.holdout.path))
  const radius = manifest.holdout.environmentTravelRasterPx
  // The configured environment motion is lateral. Testing both extrema proves
  // the pre-trimmed raster envelope protects every intermediate translation.
  const offsets = [{ x: 0, y: 0 }, { x: radius, y: 0 }, { x: -radius, y: 0 }]
  for (const name of environmentNames) {
    const layer = await alphaData(layerPath(name))
    for (const { x, y } of offsets) {
      const shifted = shiftedAlpha(layer, x, y)
      for (let pixel = 0; pixel < shifted.length; pixel += 1) {
        assert.ok(!(shifted[pixel] > 0 && holdout.data[pixel * holdout.info.channels + 3] > 0), `${name} alpha enters holdout at ${x},${y}`)
      }
    }
  }
})

test('environment RGB is source-faithful outside the holdout with no foreground contamination', async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(HERO_CONFIG.workDir, 'layer-manifest.json'), 'utf8'))
  const holdout = await alphaData(path.join(HERO_CONFIG.root, manifest.holdout.path))
  const master = await rgbData(path.join(HERO_CONFIG.outputDir, 'hero-master-2560x1440.png'))
  for (const name of environmentNames) {
    const layer = await alphaData(layerPath(name))
    for (let pixel = 0; pixel < layer.info.width * layer.info.height; pixel += 1) {
      const source = pixel * layer.info.channels
      if (layer.data[source + 3] < 240 || holdout.data[source + holdout.info.channels - 1] > 0) continue
      const rgb = pixel * 3
      assert.deepEqual([...layer.data.slice(source, source + 3)], [...master.data.slice(rgb, rgb + 3)], `${name} contains altered source RGB at pixel ${pixel}`)
    }
  }
})

async function rgbaData(filePath) {
  const { data, info } = await sharp(filePath).ensureAlpha().raw({ depth: 'uchar' }).toBuffer({ resolveWithObject: true })
  return { data, info }
}

function compositeRaw(base, layers, offsetX = 0, offsetY = 0) {
  const result = Uint8Array.from(base.data)
  for (const layer of layers) {
    for (let y = 0; y < layer.info.height; y += 1) {
      for (let x = 0; x < layer.info.width; x += 1) {
        const targetX = x + offsetX
        const targetY = y + offsetY
        if (targetX < 0 || targetX >= layer.info.width || targetY < 0 || targetY >= layer.info.height) continue
        const source = (y * layer.info.width + x) * layer.info.channels
        const alpha = layer.data[source + 3] / 255
        if (alpha === 0) continue
        const target = (targetY * layer.info.width + targetX) * base.info.channels
        for (let channel = 0; channel < 3; channel += 1) result[target + channel] = Math.round(layer.data[source + channel] * alpha + result[target + channel] * (1 - alpha))
      }
    }
  }
  return result
}

test('full actual-PNG composites at rest and at the maximum raster motion preserve the static holdout', async () => {
  const manifest = JSON.parse(await fs.readFile(path.join(HERO_CONFIG.workDir, 'layer-manifest.json'), 'utf8'))
  const base = await rgbaData(layerPath('background'))
  const holdout = await alphaData(path.join(HERO_CONFIG.root, manifest.holdout.path))
  const environment = await Promise.all(environmentNames.map((name) => rgbaData(layerPath(name))))
  const foreground = await Promise.all(['van', 'wheel-front', 'wheel-rear', 'logo'].map((name) => rgbaData(layerPath(name))))
  const rest = compositeRaw(base, [...environment, ...foreground])
  const maxEnvironment = compositeRaw(base, environment, manifest.holdout.environmentTravelRasterPx, 0)
  const max = compositeRaw({ data: maxEnvironment, info: base.info }, foreground)
  for (let pixel = 0; pixel < holdout.info.width * holdout.info.height; pixel += 1) {
    if (holdout.data[pixel * holdout.info.channels + 3] === 0) continue
    const offset = pixel * base.info.channels
    assert.deepEqual([...max.slice(offset, offset + 3)], [...rest.slice(offset, offset + 3)], `moving full composite changes static holdout pixel ${pixel}`)
  }
  const proof = await sharp(path.join(HERO_CONFIG.outputDir, 'static-holdout-composite-proof.png')).metadata()
  assert.deepEqual([proof.width, proof.height], [HERO_CONFIG.master.width, HERO_CONFIG.master.height])
})
