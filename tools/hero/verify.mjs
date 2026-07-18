import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import ffmpegPath from 'ffmpeg-static'
import sharp from 'sharp'
import { HERO_CONFIG } from './config.mjs'
import { renderFrame } from './render-frames.mjs'

const REQUIRED_FILES = ['hero-v3.mp4', 'hero-v3.webm', 'poster-v3.webp', 'poster-v3.jpg', 'mobile-v3.mp4', 'mobile-v3.webp']

export function compareRawFrames(a, b) {
  if (a.length !== b.length) throw new Error('Frame buffers must have equal length')
  let maxDelta = 0
  let totalDelta = 0
  let changedPixels = 0
  for (let i = 0; i < a.length; i += 4) {
    const delta = Math.max(Math.abs(a[i] - b[i]), Math.abs(a[i + 1] - b[i + 1]), Math.abs(a[i + 2] - b[i + 2]))
    maxDelta = Math.max(maxDelta, delta)
    totalDelta += delta
    if (delta > 0) changedPixels += 1
  }
  return { maxDelta, meanDelta: totalDelta / (a.length / 4), changedPixels }
}

export function verifyManifest(manifest) {
  const missing = REQUIRED_FILES.filter((name) => !manifest.files.includes(name))
  if (missing.length) throw new Error(`Export manifest is missing: ${missing.join(', ')}`)
  if (manifest.durationSeconds !== HERO_CONFIG.durationSeconds) throw new Error('Unexpected export duration')
  if (manifest.fps !== HERO_CONFIG.fps) throw new Error('Unexpected export frame rate')
  return true
}

export function verifyEncodedBoundary(name, boundary, normal) {
  const codecNoiseCeiling = 1.25
  if (boundary.meanDelta > codecNoiseCeiling) {
    throw new Error(`${name} loop boundary exceeds codec-noise budget: ${boundary.meanDelta.toFixed(3)} vs adjacent ${normal.meanDelta.toFixed(3)}`)
  }
  const floor = Math.max(normal.meanDelta, 0.001)
  const ratio = boundary.meanDelta / floor
  if (boundary.meanDelta > 0.5 && (ratio < 0.4 || ratio > 2.5)) {
    throw new Error(`${name} loop boundary differs from normal motion: ${boundary.meanDelta.toFixed(3)} vs adjacent ${normal.meanDelta.toFixed(3)}`)
  }
  return true
}

function run(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { windowsHide: true })
    let output = ''
    child.stdout.on('data', (chunk) => { output += chunk })
    child.stderr.on('data', (chunk) => { output += chunk })
    child.on('error', reject)
    child.on('close', (code) => code === 0 ? resolve(output) : reject(new Error(`${path.basename(command)} failed (${code})\n${output}`)))
  })
}

async function rawPng(input) {
  return (await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })).data
}

async function decodeFrames(video, tempDir) {
  const pattern = path.join(tempDir, 'frame-%02d.png')
  const penultimate = HERO_CONFIG.encodedFrames - 2
  const final = HERO_CONFIG.encodedFrames - 1
  await run(ffmpegPath, ['-hide_banner', '-y', '-i', video, '-vf', `select='eq(n\\,0)+eq(n\\,1)+eq(n\\,${penultimate})+eq(n\\,${final})'`, '-vsync', '0', pattern])
  const files = (await fs.readdir(tempDir)).filter((name) => name.endsWith('.png')).sort()
  if (files.length !== 4) throw new Error(`Expected four decoded boundary frames from ${path.basename(video)}, received ${files.length}`)
  return Promise.all(files.map((name) => rawPng(path.join(tempDir, name))))
}

async function inspectVideo(filePath, expected) {
  const output = await run(ffmpegPath, ['-hide_banner', '-i', filePath, '-map', '0:v:0', '-f', 'null', '-'])
  const duration = Number((output.match(/Duration: (\d+):(\d+):(\d+(?:\.\d+)?)/) || []).slice(1).reduce((total, value, index) => total + Number(value) * [3600, 60, 1][index], 0))
  const geometry = output.match(/\b(\d{3,5})x(\d{3,5})\b/)
  const fps = Number((output.match(/(\d+(?:\.\d+)?) fps/) || [])[1])
  const frameCount = Number((output.match(/frame=\s*(\d+)/g) || []).at(-1)?.replace(/\D/g, ''))
  const hasAudio = /Audio:/.test(output)
  if (!geometry || geometry[1] !== String(expected.width) || geometry[2] !== String(expected.height)) throw new Error(`${path.basename(filePath)} has unexpected dimensions`)
  if (Math.abs(duration - HERO_CONFIG.durationSeconds) > 0.05) throw new Error(`${path.basename(filePath)} has unexpected duration: ${duration}`)
  if (fps !== HERO_CONFIG.fps) throw new Error(`${path.basename(filePath)} has unexpected fps: ${fps}`)
  if (frameCount !== HERO_CONFIG.encodedFrames) throw new Error(`${path.basename(filePath)} has unexpected frame count: ${frameCount}`)
  if (hasAudio) throw new Error(`${path.basename(filePath)} must not contain audio`)
  return { width: expected.width, height: expected.height, durationSeconds: duration, fps, frameCount, audio: false, bytes: (await fs.stat(filePath)).size }
}

async function assetInfo(name) {
  const filePath = path.join(HERO_CONFIG.publicDir, name)
  const metadata = await sharp(filePath).metadata()
  return { width: metadata.width, height: metadata.height, bytes: (await fs.stat(filePath)).size, format: metadata.format }
}

async function verifyVideo(name, expected) {
  const video = path.join(HERO_CONFIG.publicDir, name)
  const tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hero-loop-'))
  try {
    const [first, second, penultimate, final] = await decodeFrames(video, tempDir)
    const boundary = compareRawFrames(final, first)
    const normal = compareRawFrames(penultimate, final)
    verifyEncodedBoundary(name, boundary, normal)
    return { ...(await inspectVideo(video, expected)), boundary, normal, boundaryRatio: normal.meanDelta === 0 ? 0 : boundary.meanDelta / normal.meanDelta }
  } finally {
    await fs.rm(tempDir, { recursive: true, force: true })
  }
}

async function main() {
  const zero = await renderFrame(0, 'desktop')
  const end = await renderFrame(HERO_CONFIG.validationFrame, 'desktop')
  const raw = compareRawFrames(await rawPng(zero), await rawPng(end))
  if (raw.maxDelta !== 0) throw new Error('Unencoded validation frame differs from frame zero')

  const files = REQUIRED_FILES
  await Promise.all(files.map(async (name) => fs.access(path.join(HERO_CONFIG.publicDir, name))))
  const assets = {
    'hero-v3.mp4': await verifyVideo('hero-v3.mp4', HERO_CONFIG.desktop),
    'hero-v3.webm': await verifyVideo('hero-v3.webm', HERO_CONFIG.desktop),
    'mobile-v3.mp4': await verifyVideo('mobile-v3.mp4', HERO_CONFIG.mobile),
    'poster-v3.webp': await assetInfo('poster-v3.webp'),
    'poster-v3.jpg': await assetInfo('poster-v3.jpg'),
    'mobile-v3.webp': await assetInfo('mobile-v3.webp'),
  }
  const manifest = { passed: true, files, durationSeconds: HERO_CONFIG.durationSeconds, fps: HERO_CONFIG.fps, encodedFrames: HERO_CONFIG.encodedFrames, assets }
  verifyManifest(manifest)
  const loopReport = {
    passed: true,
    unencoded: { sha256: crypto.createHash('sha256').update(zero).digest('hex'), comparison: raw },
    encoded: Object.fromEntries(['hero-v3.mp4', 'hero-v3.webm', 'mobile-v3.mp4'].map((name) => [name, assets[name]])),
  }
  await fs.mkdir(HERO_CONFIG.outputDir, { recursive: true })
  await fs.writeFile(path.join(HERO_CONFIG.outputDir, 'export-manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  await fs.writeFile(path.join(HERO_CONFIG.outputDir, 'loop-report.json'), `${JSON.stringify(loopReport, null, 2)}\n`)
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) await main()
