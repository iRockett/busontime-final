import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import ffmpegPath from 'ffmpeg-static'
import sharp from 'sharp'
import { HERO_CONFIG } from '../config.mjs'
import { compareRawFrames, verifyEncodedBoundary, verifyManifest } from '../verify.mjs'

function runFfmpeg(args) {
  return new Promise((resolve, reject) => {
    const child = spawn(ffmpegPath, args, { windowsHide: true })
    let output = ''
    child.stderr.on('data', (chunk) => { output += chunk })
    child.on('error', reject)
    child.on('close', (code) => code === 0 ? resolve() : reject(new Error(output)))
  })
}

async function rgba(input) {
  return (await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true })).data
}

test('identical RGBA frames report zero error', () => {
  const frame = Buffer.from([0, 16, 255, 255, 22, 44, 66, 255])
  assert.deepEqual(compareRawFrames(frame, frame), { maxDelta: 0, meanDelta: 0, changedPixels: 0 })
})

test('encoded boundary matches normal one-frame motion instead of hiding a jump', () => {
  assert.doesNotThrow(() => verifyEncodedBoundary('clean.mp4', { meanDelta: 0.82 }, { meanDelta: 0.78 }))
  assert.doesNotThrow(() => verifyEncodedBoundary('mobile.mp4', { meanDelta: 0.397 }, { meanDelta: 0.141 }))
  assert.throws(
    () => verifyEncodedBoundary('broken.mp4', { meanDelta: 5.672 }, { meanDelta: 5.079 }),
    /loop boundary exceeds/,
  )
  assert.throws(
    () => verifyEncodedBoundary('faded.mp4', { meanDelta: 0.818 }, { meanDelta: 0.018 }),
    /loop boundary differs from normal motion/,
  )
})

test('manifest enforces all requested deliverables', () => {
  assert.doesNotThrow(() => verifyManifest({
    files: ['hero-v3.mp4', 'hero-v3.webm', 'poster-v3.webp', 'poster-v3.jpg', 'mobile-v3.mp4', 'mobile-v3.webp'],
    durationSeconds: HERO_CONFIG.durationSeconds,
    fps: 30,
  }))
})

test('shipped desktop video starts on its poster without a corrupt flash', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'hero-shipped-frame-'))
  t.after(() => fs.rm(directory, { recursive: true, force: true }))
  const decoded = path.join(directory, 'frame.png')
  await runFfmpeg([
    '-hide_banner', '-y', '-i', path.join(HERO_CONFIG.publicDir, 'hero-v3.mp4'),
    '-vf', 'select=eq(n\\,0)', '-frames:v', '1', decoded,
  ])
  const comparison = compareRawFrames(await rgba(decoded), await rgba(path.join(HERO_CONFIG.publicDir, 'poster-v3.webp')))
  assert.ok(comparison.meanDelta < 8, `first video frame diverges from poster: mean delta ${comparison.meanDelta}`)
})

test('shipped desktop video never exposes large compositor tiles', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'hero-shipped-frame-'))
  t.after(() => fs.rm(directory, { recursive: true, force: true }))
  const decoded = path.join(directory, 'frame.png')
  await runFfmpeg([
    '-hide_banner', '-y', '-i', path.join(HERO_CONFIG.publicDir, 'hero-v3.mp4'),
    '-vf', `select=eq(n\\,${Math.round(HERO_CONFIG.encodedFrames * 2 / 3)})`, '-frames:v', '1', decoded,
  ])
  const comparison = compareRawFrames(await rgba(decoded), await rgba(path.join(HERO_CONFIG.publicDir, 'poster-v3.webp')))
  assert.ok(comparison.meanDelta < 3.5, `frame 120 exposes corrupted tiles: mean delta ${comparison.meanDelta}`)
})
