import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import os from 'node:os'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'
import { reconstructBackground } from '../lib/image.mjs'

test('reconstruction patches feather into the source plate', async (t) => {
  const directory = await fs.mkdtemp(path.join(os.tmpdir(), 'hero-reconstruct-'))
  t.after(() => fs.rm(directory, { recursive: true, force: true }))
  const sourcePath = path.join(directory, 'source.png')
  const outputPath = path.join(directory, 'output.png')
  await sharp({ create: { width: 100, height: 40, channels: 3, background: '#ff0000' } })
    .composite([{ input: Buffer.from('<svg width="20" height="40"><rect width="20" height="40" fill="#0000ff"/></svg>'), left: 80, top: 0 }])
    .png()
    .toFile(sourcePath)
  await reconstructBackground(sourcePath, [{
    source: { left: 80, top: 0, width: 20, height: 40 },
    target: { left: 20, top: 0, width: 60, height: 40 },
    blur: 0.3,
    feather: 10,
  }], outputPath)

  const { data, info } = await sharp(outputPath).raw().toBuffer({ resolveWithObject: true })
  const pixel = (x, y) => [...data.subarray((y * info.width + x) * info.channels, (y * info.width + x) * info.channels + 3)]
  assert.ok(pixel(20, 20)[0] > pixel(20, 20)[2], 'patch edge should retain more source red than patch blue')
  assert.ok(pixel(50, 20)[2] > pixel(50, 20)[0], 'patch centre should contain more patch blue than source red')
})
