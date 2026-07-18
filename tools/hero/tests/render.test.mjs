import assert from 'node:assert/strict'
import test from 'node:test'
import sharp from 'sharp'
import { HERO_CONFIG } from '../config.mjs'
import { renderFrame } from '../render-frames.mjs'

async function rawFrame(frame, format = 'desktop') {
  return sharp(await renderFrame(frame, format)).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
}

function compareRegion(a, b, region) {
  let totalDelta = 0
  let changedPixels = 0
  const pixels = region.width * region.height
  for (let y = region.top; y < region.top + region.height; y += 1) {
    for (let x = region.left; x < region.left + region.width; x += 1) {
      const offset = (y * a.info.width + x) * a.info.channels
      const delta = Math.max(
        Math.abs(a.data[offset] - b.data[offset]),
        Math.abs(a.data[offset + 1] - b.data[offset + 1]),
        Math.abs(a.data[offset + 2] - b.data[offset + 2]),
      )
      totalDelta += delta
      if (delta > 2) changedPixels += 1
    }
  }
  return { meanDelta: totalDelta / pixels, changedRatio: changedPixels / pixels }
}

test('road travel is visibly different one quarter into the loop', async () => {
  const [start, quarter] = await Promise.all([rawFrame(0), rawFrame(30)])
  const road = compareRegion(start, quarter, { left: 0, top: 560, width: 1920, height: 520 })
  assert.ok(road.meanDelta >= 1.5, `road motion is imperceptible: mean delta ${road.meanDelta}`)
  assert.ok(road.changedRatio >= 0.2, `road motion affects too little of the frame: ${road.changedRatio}`)
})

test('frame 120 is byte-identical to frame zero before encoding', async () => {
  assert.deepEqual(await renderFrame(120, 'desktop'), await renderFrame(0, 'desktop'))
})

test('desktop and mobile frames have exact export geometry', async () => {
  const desktop = await sharp(await renderFrame(0, 'desktop')).metadata()
  const mobile = await sharp(await renderFrame(0, 'mobile')).metadata()
  assert.deepEqual([desktop.width, desktop.height], [1920, 1080])
  assert.deepEqual([mobile.width, mobile.height], [1080, 1920])
})

test('sky, logo, and van body remain fixed while wheels and road move', async () => {
  const [start, midpoint] = await Promise.all([rawFrame(0), rawFrame(60)])
  const sky = compareRegion(start, midpoint, { left: 0, top: 0, width: 1920, height: 300 })
  const logo = compareRegion(start, midpoint, { left: 35, top: 230, width: 725, height: 555 })
  const vanBody = compareRegion(start, midpoint, { left: 920, top: 210, width: 800, height: 250 })
  assert.ok(sky.meanDelta < 0.001, `sky drifted: ${sky.meanDelta}`)
  assert.ok(sky.changedRatio < 0.0001, `sky changed: ${sky.changedRatio}`)
  assert.ok(logo.meanDelta < 0.001, `logo region drifted: ${logo.meanDelta}`)
  assert.ok(logo.changedRatio < 0.0001, `logo region changed: ${logo.changedRatio}`)
  assert.ok(vanBody.meanDelta < 0.001, `van body drifted: ${vanBody.meanDelta}`)
  assert.ok(vanBody.changedRatio < 0.0001, `van body changed: ${vanBody.changedRatio}`)
})
