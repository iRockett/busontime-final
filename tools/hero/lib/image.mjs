import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ensureParent = (filePath) => fs.mkdir(path.dirname(filePath), { recursive: true })

const EDGE = Object.freeze({ expansion: 1, feather: 0.6, colorSearch: 3 })

function dilateAlpha(alpha, width, height, radius) {
  if (radius <= 0) return Uint8Array.from(alpha)
  const expanded = new Uint8Array(alpha.length)
  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      let value = 0
      for (let offsetY = -radius; offsetY <= radius; offsetY += 1) {
        const sampleY = y + offsetY
        if (sampleY < 0 || sampleY >= height) continue
        for (let offsetX = -radius; offsetX <= radius; offsetX += 1) {
          const sampleX = x + offsetX
          if (sampleX < 0 || sampleX >= width) continue
          value = Math.max(value, alpha[sampleY * width + sampleX])
        }
      }
      expanded[y * width + x] = value
    }
  }
  return expanded
}

async function alphaPng(alpha, width, height) {
  const rgba = Buffer.alloc(width * height * 4)
  for (let pixel = 0; pixel < alpha.length; pixel += 1) {
    const offset = pixel * 4
    rgba[offset] = 255
    rgba[offset + 1] = 255
    rgba[offset + 2] = 255
    rgba[offset + 3] = alpha[pixel]
  }
  return sharp(rgba, { raw: { width, height, channels: 4 } }).png({ compressionLevel: 9 }).toBuffer()
}

async function rawAlpha(input) {
  const { data, info } = await sharp(input).ensureAlpha().raw({ depth: 'uchar' }).toBuffer({ resolveWithObject: true })
  const alpha = new Uint8Array(info.width * info.height)
  for (let index = 0, pixel = 0; pixel < alpha.length; index += info.channels, pixel += 1) alpha[pixel] = data[index + info.channels - 1]
  return { alpha, width: info.width, height: info.height }
}

async function featheredMatte(maskBuffer, edge = EDGE) {
  const matte = await rawAlpha(maskBuffer)
  const expanded = dilateAlpha(matte.alpha, matte.width, matte.height, edge.expansion)
  const { data } = await sharp(Buffer.from(expanded), {
    raw: { width: matte.width, height: matte.height, channels: 1 },
  }).blur(edge.feather).greyscale().raw().toBuffer({ resolveWithObject: true })
  const alpha = new Uint8Array(expanded.length)
  for (let index = 0; index < alpha.length; index += 1) alpha[index] = Math.max(matte.alpha[index], data[index])
  return { ...matte, alpha }
}

async function rgbPixels(input) {
  const { data, info } = await sharp(input).removeAlpha().toColourspace('srgb').raw({ depth: 'uchar' }).toBuffer({ resolveWithObject: true })
  if (info.channels !== 3) throw new Error(`Expected RGB master pixels, received ${info.channels} channels`)
  return data
}

function nearestProtectedColor(source, matte, width, height, x, y, search) {
  for (let distance = 1; distance <= search; distance += 1) {
    for (let offsetY = -distance; offsetY <= distance; offsetY += 1) {
      for (let offsetX = -distance; offsetX <= distance; offsetX += 1) {
        if (Math.max(Math.abs(offsetX), Math.abs(offsetY)) !== distance) continue
        const sampleX = x + offsetX
        const sampleY = y + offsetY
        if (sampleX < 0 || sampleX >= width || sampleY < 0 || sampleY >= height) continue
        const index = sampleY * width + sampleX
        if (matte[index] < 240) continue
        return index
      }
    }
  }
  return -1
}

export async function enhancedMaster(sourcePath, outputPath, size) {
  await ensureParent(outputPath)
  return sharp(sourcePath)
    .resize(size.width, size.height, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .blur(0.3)
    .sharpen({ sigma: 0.65, m1: 0.4, m2: 1.2 })
    .toColourspace('rgb16')
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

/**
 * Applies a protected, expanded matte without baking background colours into
 * the fractional edge. Exclusion mattes are applied after feathering so an
 * independently animated foreground part (the wheels) never remains in body.
 */
export async function extractMasked(masterPath, maskBuffer, outputPath, { exclusionMasks = [], edge = EDGE } = {}) {
  await ensureParent(outputPath)
  const matte = await featheredMatte(maskBuffer, edge)
  const source = await rgbPixels(masterPath)
  if (source.length !== matte.width * matte.height * 3) throw new Error('Master and matte geometry must match')

  for (const exclusion of exclusionMasks) {
    const excluded = await rawAlpha(exclusion)
    if (excluded.width !== matte.width || excluded.height !== matte.height) throw new Error('Exclusion matte geometry must match')
    const protectedExclusion = dilateAlpha(excluded.alpha, excluded.width, excluded.height, edge.expansion + 1)
    for (let index = 0; index < matte.alpha.length; index += 1) {
      if (protectedExclusion[index] > 0) matte.alpha[index] = 0
    }
  }

  const rgba = Buffer.alloc(matte.width * matte.height * 4)
  for (let y = 0; y < matte.height; y += 1) {
    for (let x = 0; x < matte.width; x += 1) {
      const pixel = y * matte.width + x
      const output = pixel * 4
      const alpha = matte.alpha[pixel]
      if (alpha === 0) continue
      let colorPixel = pixel
      if (matte.alpha[pixel] < 240) {
        const protectedPixel = nearestProtectedColor(source, matte.alpha, matte.width, matte.height, x, y, edge.colorSearch)
        if (protectedPixel >= 0) colorPixel = protectedPixel
      }
      const sourceOffset = colorPixel * 3
      rgba[output] = source[sourceOffset]
      rgba[output + 1] = source[sourceOffset + 1]
      rgba[output + 2] = source[sourceOffset + 2]
      rgba[output + 3] = alpha
    }
  }

  return sharp(rgba, { raw: { width: matte.width, height: matte.height, channels: 4 } })
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

export async function reconstructBackground(masterPath, patches, outputPath) {
  await ensureParent(outputPath)
  if (patches.length === 0) return fs.copyFile(masterPath, outputPath)
  const composites = []
  for (const patch of patches) {
    let input = await sharp(masterPath)
      .extract(patch.source)
      .resize(patch.target.width, patch.target.height, { fit: 'fill' })
      .blur(patch.blur ?? 3)
      .toBuffer()
    if (patch.feather) {
      const inset = Math.max(1, patch.feather / 2)
      const matte = Buffer.from(`<svg width="${patch.target.width}" height="${patch.target.height}" xmlns="http://www.w3.org/2000/svg"><defs><filter id="f" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="${patch.feather / 2}"/></filter></defs><rect x="${inset}" y="${inset}" width="${patch.target.width - inset * 2}" height="${patch.target.height - inset * 2}" rx="${inset}" fill="white" filter="url(#f)"/></svg>`)
      input = await sharp(input).ensureAlpha().composite([{ input: matte, blend: 'dest-in' }]).png().toBuffer()
    }
    composites.push({ input, left: patch.target.left, top: patch.target.top })
  }
  return sharp(masterPath).composite(composites).toColourspace('rgb16').png({ compressionLevel: 9 }).toFile(outputPath)
}

/**
 * Builds the fixed occlusion matte from final foreground PNG alpha, rather
 * than attempting to invent a clean plate beneath flattened artwork.
 */
export async function createStaticHoldout(layerPaths, outputPath, { maxDisplacementPx, featherSafetyPx }) {
  await ensureParent(outputPath)
  const foreground = await Promise.all(layerPaths.map(rawAlpha))
  const [{ width, height }] = foreground
  if (foreground.some((layer) => layer.width !== width || layer.height !== height)) throw new Error('Foreground alpha geometry must match')
  const union = new Uint8Array(width * height)
  for (const layer of foreground) {
    for (let pixel = 0; pixel < union.length; pixel += 1) union[pixel] = Math.max(union[pixel], layer.alpha[pixel])
  }
  const continuousRadiusPx = maxDisplacementPx + featherSafetyPx
  const rasterRadiusPx = Math.ceil(continuousRadiusPx)
  const alpha = dilateAlpha(union, width, height, rasterRadiusPx)
  const buffer = await alphaPng(alpha, width, height)
  await fs.writeFile(outputPath, buffer)
  return { buffer, width, height, continuousRadiusPx, rasterRadiusPx }
}

export async function expandHoldout(holdoutBuffer, radiusPx) {
  const holdout = await rawAlpha(holdoutBuffer)
  return alphaPng(dilateAlpha(holdout.alpha, holdout.width, holdout.height, radiusPx), holdout.width, holdout.height)
}

/** Remove all movable pixels that could enter the fixed holdout during travel. */
export async function trimToHoldout(layerPath, exclusionBuffer) {
  const layer = await sharp(layerPath).ensureAlpha().raw({ depth: 'uchar' }).toBuffer({ resolveWithObject: true })
  const exclusion = await rawAlpha(exclusionBuffer)
  if (layer.info.width !== exclusion.width || layer.info.height !== exclusion.height) throw new Error('Layer and holdout geometry must match')
  for (let pixel = 0; pixel < exclusion.alpha.length; pixel += 1) {
    if (exclusion.alpha[pixel] > 0) layer.data[pixel * layer.info.channels + 3] = 0
  }
  return sharp(layer.data, { raw: { width: layer.info.width, height: layer.info.height, channels: layer.info.channels } })
    .png({ compressionLevel: 9 })
    .toFile(layerPath)
}

export async function createCompositeProof(basePath, layerPaths, outputPath) {
  await ensureParent(outputPath)
  return sharp(basePath).composite(layerPaths.map((input) => ({ input }))).png({ compressionLevel: 9 }).toFile(outputPath)
}

export async function createLayerContactSheet(layerPaths, outputPath) {
  await ensureParent(outputPath)
  const thumbWidth = 512
  const thumbHeight = 288
  const columns = 5
  const rows = Math.ceil(layerPaths.length / columns)
  const composites = await Promise.all(layerPaths.map(async (input, index) => ({
    input: await sharp(input).resize(thumbWidth, thumbHeight, { fit: 'contain', background: { r: 16, g: 26, b: 34, alpha: 1 } }).png().toBuffer(),
    left: (index % columns) * thumbWidth,
    top: Math.floor(index / columns) * thumbHeight,
  })))
  return sharp({
    create: { width: columns * thumbWidth, height: rows * thumbHeight, channels: 4, background: '#101a22' },
  }).composite(composites).webp({ quality: 88 }).toFile(outputPath)
}
