import crypto from 'node:crypto'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import sharp from 'sharp'
import { HERO_CONFIG } from './config.mjs'
import { motionAt } from './lib/phase.mjs'

const cached = new Map()
let scenePromise

const relativePath = (filePath) => path.relative(HERO_CONFIG.root, filePath).replaceAll('\\', '/')
const formatSize = (format) => {
  if (format === 'desktop') return HERO_CONFIG.desktop
  if (format === 'mobile') return HERO_CONFIG.mobile
  throw new RangeError(`Unknown hero format: ${format}`)
}
function resizeArtwork(input, format, kernel) {
  const size = formatSize(format)
  if (format === 'mobile') {
    return sharp(input)
      .resize({ height: size.height, kernel })
      .extract({ left: 1350, top: 0, width: size.width, height: size.height })
  }
  return sharp(input).resize(size.width, size.height, { fit: 'cover', position: 'centre', kernel })
}

async function loadScene() {
  if (!scenePromise) scenePromise = (async () => {
    const manifest = JSON.parse(await fs.readFile(path.join(HERO_CONFIG.workDir, 'layer-manifest.json'), 'utf8'))
    const layers = new Map(manifest.layers.map((layer) => [layer.name, path.join(HERO_CONFIG.root, layer.path)]))
    return {
      base: path.join(HERO_CONFIG.root, manifest.basePlate.path),
      holdout: path.join(HERO_CONFIG.root, manifest.holdout.path),
      layers,
    }
  })()
  return scenePromise
}

async function preparedBase(format) {
  const key = `base:${format}`
  if (!cached.has(key)) cached.set(key, (async () => {
    const scene = await loadScene()
    const size = formatSize(format)
    return resizeArtwork(scene.base, format, sharp.kernel.lanczos3).png().toBuffer()
  })())
  return cached.get(key)
}

async function preparedHoldout(format) {
  const key = `holdout:${format}`
  if (!cached.has(key)) cached.set(key, (async () => {
    const scene = await loadScene()
    const size = formatSize(format)
    return resizeArtwork(scene.holdout, format, sharp.kernel.nearest).png().toBuffer()
  })())
  return cached.get(key)
}

const lanePath = 'M0 704L0 718L810 654L833 646L804 642 M262 941H291L1672 624V609L1641 616 M705 941H736L1672 733V716L1643 722'
const roadGuidePaths = [
  'M-160 920L1060 600',
  'M40 941L1260 604',
  'M430 941L1510 635',
  'M820 941L1672 700',
].join(' ')
const vanBodyPath = 'M766 587C769 553 772 502 783 458C792 421 817 391 850 361C900 316 954 284 1027 273L1212 255C1284 253 1345 267 1415 288L1472 307C1505 320 1519 348 1522 390L1530 524C1534 568 1527 597 1508 615C1497 626 1487 632 1478 635C1452 643 1432 633 1419 611C1408 592 1402 572 1398 551L1240 570C1236 610 1228 640 1207 660C1190 678 1163 682 1138 675C1108 667 1090 641 1082 608L1076 589L902 631C864 641 823 640 795 626C774 615 764 602 766 587Z'
const glassPath = 'M936 313L1209 274L1387 302L1443 397L1004 385Z'

function environmentOverlaySvg(motion) {
  const roadOffset = Number((-motion.roadPhase * HERO_CONFIG.motion.roadTravel).toFixed(4))
  const laneOffset = roadOffset
  return Buffer.from(`<svg width="2560" height="1440" viewBox="0 0 1672 941" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <clipPath id="road"><path d="M0 533H1672V941H0Z"/></clipPath>
      <filter id="roadBlur" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="3.8"/></filter>
      <pattern id="roadFlow" width="180" height="180" patternUnits="userSpaceOnUse" patternTransform="translate(${roadOffset} 0)">
        <path d="M-45 5L210 175M-75 55L180 225" stroke="#d9e4ea" stroke-width="5" opacity=".13" filter="url(#roadBlur)"/>
        <path d="M-60 0L200 178" stroke="#071018" stroke-width="28" opacity=".11" filter="url(#roadBlur)"/>
      </pattern>
    </defs>
    <g clip-path="url(#road)">
      <rect y="520" width="1672" height="421" fill="url(#roadFlow)" opacity=".95"/>
      <path d="${roadGuidePaths}" fill="none" stroke="#080d12" stroke-width="34" opacity=".15" stroke-linecap="round" stroke-dasharray="150 210" stroke-dashoffset="${roadOffset}" filter="url(#roadBlur)"/>
      <path d="${roadGuidePaths}" fill="none" stroke="#d7e0e5" stroke-width="8" opacity=".22" stroke-linecap="round" stroke-dasharray="90 270" stroke-dashoffset="${roadOffset}" filter="url(#roadBlur)"/>
      <path d="${lanePath}" fill="none" stroke="#eef4f6" stroke-width="10" opacity=".35" stroke-linecap="round" stroke-dasharray="90 180" stroke-dashoffset="${laneOffset}" filter="url(#roadBlur)"/>
    </g>
  </svg>`)
}

function vehicleOverlaySvg(motion) {
  return Buffer.from(`<svg width="2560" height="1440" viewBox="0 0 1672 941" xmlns="http://www.w3.org/2000/svg">
    <g fill="none" stroke="#f5fbff" stroke-width="5" opacity=".28" stroke-linecap="round">
      <path d="M1168 548A50 50 0 0 1 1213 579" transform="rotate(${motion.wheelDegrees} 1168 597)"/>
      <path d="M1472 536A38 38 0 0 1 1506 560" transform="rotate(${motion.wheelDegrees} 1472 574)"/>
    </g>
  </svg>`)
}

async function preparedOverlay(svg, format, { excludeHoldout = false } = {}) {
  const size = formatSize(format)
  const resized = await resizeArtwork(svg, format, sharp.kernel.lanczos3).png().toBuffer()
  if (!excludeHoldout) return resized
  return sharp(resized).composite([{ input: await preparedHoldout(format), blend: 'dest-out' }]).png().toBuffer()
}

async function preparedMobileBrand() {
  const key = 'mobile-brand'
  if (!cached.has(key)) cached.set(key, (async () => {
    const scene = await loadScene()
    const wordmarkCrop = await sharp(scene.layers.get('logo'))
      .extract({ left: 70, top: 800, width: 980, height: 250 })
      .png()
      .toBuffer()
    const logo = await sharp(wordmarkCrop)
      .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .resize({ width: 850 })
      .png()
      .toBuffer({ resolveWithObject: true })
    const backdrop = Buffer.from('<svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#071019" stop-opacity="0"/><stop offset="1" stop-color="#071019" stop-opacity=".68"/></linearGradient></defs><rect y="1220" width="1080" height="700" fill="url(#g)"/></svg>')
    return sharp({ create: { width: 1080, height: 1920, channels: 4, background: { r: 0, g: 0, b: 0, alpha: 0 } } })
      .composite([
        { input: backdrop },
        { input: logo.data, left: 115, top: 1920 - logo.info.height - 135 },
      ])
      .png()
      .toBuffer()
  })())
  return cached.get(key)
}

async function composeFrame({ format, motion }) {
  const size = formatSize(format)
  const image = sharp(await preparedBase(format))
  const environment = await preparedOverlay(environmentOverlaySvg(motion), format, { excludeHoldout: true })
  const vehicle = await preparedOverlay(vehicleOverlaySvg(motion), format)
  const inputs = [{ input: environment }, { input: vehicle }]
  if (format === 'mobile') inputs.push({ input: await preparedMobileBrand() })
  return image.composite(inputs)
    .png({ compressionLevel: 9 })
    .toBuffer()
}

export async function renderFrame(frame, format = 'desktop') {
  if (!Number.isInteger(frame) || frame < 0 || frame > HERO_CONFIG.validationFrame) {
    throw new RangeError(`Frame must be an integer from 0 to ${HERO_CONFIG.validationFrame}`)
  }
  const normalizedFrame = frame % HERO_CONFIG.encodedFrames
  return composeFrame({ format, motion: motionAt(normalizedFrame, format) })
}

async function writeProofSheet(format, frames) {
  const size = formatSize(format)
  const width = 480
  const height = Math.round(width * size.height / size.width)
  const inputs = await Promise.all(frames.map(async (frame, index) => ({
    input: await sharp(await renderFrame(frame, format)).resize(width, height).png().toBuffer(),
    left: index * width,
    top: 0,
  })))
  await sharp({ create: { width: width * frames.length, height, channels: 3, background: '#101820' } })
    .composite(inputs)
    .webp({ quality: 90 })
    .toFile(path.join(HERO_CONFIG.outputDir, `proof-frames-${format}.webp`))
}

async function renderSequence(format) {
  const directory = path.join(HERO_CONFIG.workDir, 'frames', format)
  await fs.mkdir(directory, { recursive: true })
  for (let frame = 0; frame < HERO_CONFIG.encodedFrames; frame += 1) {
    await fs.writeFile(path.join(directory, `frame-${String(frame).padStart(4, '0')}.png`), await renderFrame(frame, format))
  }
}

async function main() {
  const proofOnly = process.argv.includes('--proof')
  const formats = process.argv.includes('--desktop') ? ['desktop'] : process.argv.includes('--mobile') ? ['mobile'] : ['desktop', 'mobile']
  await fs.mkdir(HERO_CONFIG.outputDir, { recursive: true })
  const proofFrames = [0, 30, 60, 90, 120]
  await Promise.all(formats.map((format) => writeProofSheet(format, proofFrames)))
  if (!proofOnly) await Promise.all(formats.map(renderSequence))
  const desktopZero = await renderFrame(0, 'desktop')
  const desktopEnd = await renderFrame(HERO_CONFIG.validationFrame, 'desktop')
  const mobileZero = await renderFrame(0, 'mobile')
  const mobileEnd = await renderFrame(HERO_CONFIG.validationFrame, 'mobile')
  const digest = (buffer) => crypto.createHash('sha256').update(buffer).digest('hex')
  const report = {
    passed: desktopZero.equals(desktopEnd) && mobileZero.equals(mobileEnd),
    encodedFrames: HERO_CONFIG.encodedFrames,
    validationFrame: HERO_CONFIG.validationFrame,
    formats: {
      desktop: { frame0Sha256: digest(desktopZero), frameValidationSha256: digest(desktopEnd), dimensions: HERO_CONFIG.desktop },
      mobile: { frame0Sha256: digest(mobileZero), frameValidationSha256: digest(mobileEnd), dimensions: HERO_CONFIG.mobile },
    },
    frameDirectories: proofOnly ? undefined : Object.fromEntries(formats.map((format) => [format, relativePath(path.join(HERO_CONFIG.workDir, 'frames', format))])),
  }
  await fs.writeFile(path.join(HERO_CONFIG.outputDir, 'render-report.json'), `${JSON.stringify(report, null, 2)}\n`)
  if (!report.passed) throw new Error('Validation frame does not match frame zero before encoding')
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) await main()
