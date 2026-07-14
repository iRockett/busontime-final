# Premium Automotive Hero Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build, export, integrate, and validate a deterministic premium automotive hero loop from the supplied flattened Renault Trafic artwork without AI video generation.

**Architecture:** A Node-based offline production pipeline uses Sharp for layer extraction, masking, upscale, compositing, and frame inspection; `ffmpeg-static` performs H.264/VP9 encoding. All motion is computed from an integer frame index and wrapped phase, so frame 180 evaluates identically to frame 0 while only frames 0–179 are encoded. React serves responsive WebM/MP4 sources and matched posters, while Playwright validates playback, layout stability, reduced-motion behavior, and desktop/mobile framing.

**Tech Stack:** Node.js ESM, Sharp, FFmpeg/FFprobe-compatible probing, React 19, TypeScript, CSS, Vitest, Vite, Playwright CLI.

## Global Constraints

- Do not use AI video generation or generative fill.
- Source artwork is 1672 x 939; production master is 2560 x 1440.
- Master duration is exactly 6 seconds at 30 fps.
- Encoded frames are 0 through 179; validation frame 180 must be pixel-identical to frame 0.
- Road, lane markings, guardrails, trees, mountains, and clouds move with one-direction wrapped phases; no layer reverses direction.
- Van suspension amplitude is at most 1.5 master pixels; pitch is at most 0.035 degrees; camera vibration is at most 0.6 master pixels.
- Mountain displacement is at most 3 master pixels; cloud displacement is at most 1.5% of master width.
- Body reflection opacity is at most 9%; glass reflection opacity is at most 6%; logo displacement is exactly zero.
- The van remains nearly fixed and sharp while foreground travel receives the strongest directional blur.
- Desktop exports are 1920 x 1080; mobile motion and poster exports are 1080 x 1920.
- Reduced-motion users receive a static poster.
- The first visible video frame and poster must match closely enough to avoid startup flicker.
- Existing business copy, navigation, hero height, and non-hero sections remain unchanged.

## File Structure

| Path | Responsibility |
| --- | --- |
| `tools/hero/source/hero-source.png` | Stable workspace copy of the supplied flattened source image. |
| `tools/hero/config.mjs` | Dimensions, frame timing, layer geometry, motion limits, and output paths. |
| `tools/hero/lib/phase.mjs` | Pure periodic phase, travel, vibration, suspension, and reflection math. |
| `tools/hero/lib/masks.mjs` | Hand-authored SVG mattes for logo, van, wheels, road, horizon, and reflection regions. |
| `tools/hero/lib/image.mjs` | Sharp helpers for upscale, masked extraction, reconstruction, blur, grain, and compositing. |
| `tools/hero/extract-layers.mjs` | Builds the 1440p plate, mattes, protected hero layers, and reconstructed background layers. |
| `tools/hero/render-frames.mjs` | Deterministically renders desktop and mobile frame sequences. |
| `tools/hero/encode.mjs` | Encodes requested MP4/WebM/poster assets and records exact FFmpeg commands. |
| `tools/hero/verify.mjs` | Verifies dimensions, duration, first/validation identity, decoded boundary continuity, and manifest data. |
| `tools/hero/create-ae-project.jsx` | After Effects project-builder script using the same layer names and timing contract. |
| `tools/hero/tests/*.test.mjs` | Node tests for config, mask contracts, periodic math, export arguments, and loop checks. |
| `tools/hero/README.md` | Reproduction instructions, layer analysis, export command log location, and AE handoff notes. |
| `work/hero/` | Generated intermediate layers and frame sequences; not shipped to the browser. |
| `output/hero-production/` | Master intermediate, loop reports, FFmpeg command log, manifest, and Playwright captures. |
| `public/assets/hero.*` | Final desktop browser assets. |
| `public/assets/mobile.*` | Final mobile browser assets. |
| `src/App.tsx` | Responsive `<picture>` poster and `<video>` source integration. |
| `src/App.test.tsx` | Hero source, playback, and fallback regression assertions. |
| `src/styles.css` | Stable hero layout, responsive media switching, and reduced-motion fallback. |

---

### Task 1: Reproducible Media Toolchain and Source Contract

**Files:**
- Modify: `package.json`
- Modify: `.gitignore`
- Create: `tools/hero/source/hero-source.png`
- Create: `tools/hero/config.mjs`
- Create: `tools/hero/tests/config.test.mjs`

**Interfaces:**
- Consumes: supplied PNG from `C:\Users\Listek\AppData\Local\Temp\codex-clipboard-cc99548b-aa40-4e3b-895b-210d17bde433.png`.
- Produces: `HERO_CONFIG`, an immutable object consumed by every later production script.

- [ ] **Step 1: Add the failing configuration contract test**

```js
// tools/hero/tests/config.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import { HERO_CONFIG } from '../config.mjs'

test('hero timeline and outputs satisfy the production contract', () => {
  assert.deepEqual(HERO_CONFIG.source, { width: 1672, height: 939 })
  assert.deepEqual(HERO_CONFIG.master, { width: 2560, height: 1440 })
  assert.deepEqual(HERO_CONFIG.desktop, { width: 1920, height: 1080 })
  assert.deepEqual(HERO_CONFIG.mobile, { width: 1080, height: 1920 })
  assert.equal(HERO_CONFIG.fps, 30)
  assert.equal(HERO_CONFIG.durationSeconds, 6)
  assert.equal(HERO_CONFIG.encodedFrames, 180)
  assert.equal(HERO_CONFIG.validationFrame, 180)
  assert.equal(HERO_CONFIG.motion.logoDisplacement, 0)
  assert.ok(HERO_CONFIG.motion.suspensionAmplitude <= 1.5)
  assert.ok(HERO_CONFIG.motion.cameraVibrationAmplitude <= 0.6)
})
```

- [ ] **Step 2: Run the test and verify the missing-module failure**

Run:

```powershell
rtk proxy node --test tools/hero/tests/config.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `tools/hero/config.mjs`.

- [ ] **Step 3: Install local production dependencies and add scripts**

Run:

```powershell
rtk pnpm add -D sharp ffmpeg-static
```

Add these scripts to `package.json`:

```json
{
  "scripts": {
    "hero:extract": "node tools/hero/extract-layers.mjs",
    "hero:render": "node tools/hero/render-frames.mjs",
    "hero:encode": "node tools/hero/encode.mjs",
    "hero:verify": "node tools/hero/verify.mjs",
    "hero:build": "pnpm hero:extract && pnpm hero:render && pnpm hero:encode && pnpm hero:verify",
    "test:hero": "node --test tools/hero/tests/*.test.mjs"
  }
}
```

Preserve the existing `dev`, `build`, `test`, and `preview` scripts.

- [ ] **Step 4: Copy the source into the workspace and define the immutable config**

Run:

```powershell
rtk proxy powershell -NoProfile -Command "New-Item -ItemType Directory -Force tools/hero/source | Out-Null; Copy-Item -LiteralPath 'C:\Users\Listek\AppData\Local\Temp\codex-clipboard-cc99548b-aa40-4e3b-895b-210d17bde433.png' -Destination 'tools/hero/source/hero-source.png'"
```

Create:

```js
// tools/hero/config.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')

export const HERO_CONFIG = Object.freeze({
  root,
  sourcePath: path.join(root, 'tools/hero/source/hero-source.png'),
  workDir: path.join(root, 'work/hero'),
  outputDir: path.join(root, 'output/hero-production'),
  publicDir: path.join(root, 'public/assets'),
  source: { width: 1672, height: 939 },
  master: { width: 2560, height: 1440 },
  desktop: { width: 1920, height: 1080 },
  mobile: { width: 1080, height: 1920 },
  fps: 30,
  durationSeconds: 6,
  encodedFrames: 180,
  validationFrame: 180,
  motion: {
    suspensionAmplitude: 1.25,
    pitchDegrees: 0.03,
    cameraVibrationAmplitude: 0.45,
    mountainTravel: 2.4,
    cloudTravelRatio: 0.012,
    bodyReflectionOpacity: 0.075,
    glassReflectionOpacity: 0.05,
    logoDisplacement: 0,
  },
})
```

Append only generated intermediates to `.gitignore`:

```gitignore
work/hero/frames/
work/hero/cache/
```

- [ ] **Step 5: Run the contract test and full existing tests**

Run:

```powershell
rtk proxy node --test tools/hero/tests/config.test.mjs
rtk npm test -- --run
```

Expected: configuration test PASS; existing Vitest suite PASS.

- [ ] **Step 6: Commit the toolchain contract**

```powershell
rtk git add package.json pnpm-lock.yaml .gitignore tools/hero/source/hero-source.png tools/hero/config.mjs tools/hero/tests/config.test.mjs
rtk git commit -m "build: add deterministic hero media toolchain"
```

---

### Task 2: Layer Mattes, Reconstruction, and 1440p Enhancement

**Files:**
- Create: `tools/hero/lib/masks.mjs`
- Create: `tools/hero/lib/image.mjs`
- Create: `tools/hero/extract-layers.mjs`
- Create: `tools/hero/tests/layers.test.mjs`
- Create: generated files under `work/hero/layers/`
- Create: `output/hero-production/hero-master-2560x1440.png`

**Interfaces:**
- Consumes: `HERO_CONFIG` and `tools/hero/source/hero-source.png`.
- Produces: named PNG layers `sky`, `clouds`, `mountains`, `trees`, `guardrails`, `road`, `lanes`, `van`, `wheel-front`, `wheel-rear`, `body-reflection-mask`, `glass-reflection-mask`, and `logo`; plus a reconstructed `background` plate.

- [ ] **Step 1: Add failing mask and layer-manifest tests**

```js
// tools/hero/tests/layers.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import sharp from 'sharp'
import { layerNames, maskSvg } from '../lib/masks.mjs'
import { HERO_CONFIG } from '../config.mjs'

test('all independent animation layers have deterministic mattes', () => {
  assert.deepEqual(layerNames, [
    'sky', 'clouds', 'mountains', 'trees', 'guardrails', 'road', 'lanes',
    'van', 'wheel-front', 'wheel-rear', 'body-reflection-mask',
    'glass-reflection-mask', 'logo',
  ])
  for (const name of layerNames) {
    const svg = maskSvg(name, HERO_CONFIG.master)
    assert.match(svg, /^<svg/)
    assert.match(svg, new RegExp(`width="${HERO_CONFIG.master.width}"`))
  }
})

test('upscaled master has exact 2560 x 1440 geometry', async () => {
  const metadata = await sharp('output/hero-production/hero-master-2560x1440.png').metadata()
  assert.deepEqual([metadata.width, metadata.height], [2560, 1440])
})
```

- [ ] **Step 2: Run the tests and verify the expected failures**

```powershell
rtk proxy node --test tools/hero/tests/layers.test.mjs
```

Expected: FAIL because `masks.mjs` and the enhanced master do not exist.

- [ ] **Step 3: Implement hand-authored mattes**

Create `maskSvg(name, size)` using SVG paths and feathering. The geometry map must use source-normalized coordinates so it scales exactly with the master:

```js
// tools/hero/lib/masks.mjs
export const layerNames = [
  'sky', 'clouds', 'mountains', 'trees', 'guardrails', 'road', 'lanes',
  'van', 'wheel-front', 'wheel-rear', 'body-reflection-mask',
  'glass-reflection-mask', 'logo',
]

const shapes = {
  sky: '<path d="M0 0H1672V382C1420 368 1210 393 1010 411C760 433 486 395 0 345Z"/>',
  clouds: '<path d="M0 0H1672V385H0Z"/>',
  mountains: '<path d="M0 335C230 350 380 333 570 371C735 403 925 356 1110 386C1300 416 1480 352 1672 352V500H0Z"/>',
  trees: '<path d="M0 376C220 366 354 418 530 424C760 432 980 406 1190 412C1405 418 1538 365 1672 346V542H0Z"/>',
  guardrails: '<path d="M0 477C410 473 770 478 1110 485C1340 489 1518 471 1672 474V555H0Z"/>',
  road: '<path d="M0 494H1672V939H0Z"/>',
  lanes: '<path d="M0 575C420 604 765 634 1105 664L1672 741V939H1320L0 711Z"/>',
  van: '<path d="M742 644C757 614 765 572 770 519C778 450 801 407 850 366C902 322 955 288 1035 275L1248 254C1313 253 1384 271 1444 291C1500 311 1522 350 1528 407L1538 545C1539 589 1514 624 1475 638C1425 654 1354 652 1285 652C1250 682 1197 691 1148 674C1110 660 1082 640 1045 633C1005 648 958 651 910 646C846 649 790 652 742 644Z"/>',
  'wheel-front': '<ellipse cx="1168" cy="593" rx="58" ry="85"/>',
  'wheel-rear': '<ellipse cx="1460" cy="570" rx="39" ry="65"/>',
  'body-reflection-mask': '<path d="M784 487C850 372 983 299 1210 276C1320 274 1434 306 1495 353L1496 478C1330 419 1160 395 975 448C900 468 838 494 784 487Z"/>',
  'glass-reflection-mask': '<path d="M940 315L1209 275L1383 302L1438 395L1007 386Z"/>',
  logo: '<path d="M49 246H660V651H49Z"/>',
}

export function maskSvg(name, { width, height }) {
  const sx = width / 1672
  const sy = height / 939
  if (!shapes[name]) throw new Error(`Unknown hero layer: ${name}`)
  return `<svg width="${width}" height="${height}" viewBox="0 0 ${width} ${height}" xmlns="http://www.w3.org/2000/svg"><g transform="scale(${sx} ${sy})" fill="white">${shapes[name]}</g></svg>`
}
```

Refine the `van` and `logo` paths against alpha-preview contact sheets before accepting this task. Feather edges in `image.mjs`, not by blurring the entire extracted layer.

- [ ] **Step 4: Implement non-generative extraction and enhancement helpers**

Create `tools/hero/lib/image.mjs` with these concrete helpers:

```js
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'

const ensureParent = (filePath) => fs.mkdir(path.dirname(filePath), { recursive: true })

export async function enhancedMaster(sourcePath, outputPath, size) {
  await ensureParent(outputPath)
  return sharp(sourcePath)
    .resize(size.width, size.height, { fit: 'cover', kernel: sharp.kernel.lanczos3 })
    .median(1)
    .sharpen({ sigma: 0.65, m1: 0.4, m2: 1.2 })
    .png({ bitdepth: 16, compressionLevel: 9 })
    .toFile(outputPath)
}

export async function extractMasked(masterPath, maskBuffer, outputPath) {
  await ensureParent(outputPath)
  const matte = await sharp(maskBuffer).blur(0.65).toBuffer()
  return sharp(masterPath)
    .ensureAlpha()
    .composite([{ input: matte, blend: 'dest-in' }])
    .png({ compressionLevel: 9 })
    .toFile(outputPath)
}

export async function reconstructBackground(masterPath, patches, outputPath) {
  await ensureParent(outputPath)
  const composites = []
  for (const patch of patches) {
    const input = await sharp(masterPath)
      .extract(patch.source)
      .resize(patch.target.width, patch.target.height, { fit: 'fill' })
      .blur(patch.blur ?? 3)
      .toBuffer()
    composites.push({ input, left: patch.target.left, top: patch.target.top })
  }
  return sharp(masterPath)
    .composite(composites)
    .png({ bitdepth: 16, compressionLevel: 9 })
    .toFile(outputPath)
}

export async function createLayerContactSheet(layerPaths, outputPath) {
  await ensureParent(outputPath)
  const thumbWidth = 512
  const thumbHeight = 288
  const columns = 5
  const rows = Math.ceil(layerPaths.length / columns)
  const composites = await Promise.all(layerPaths.map(async (input, index) => ({
    input: await sharp(input).resize(thumbWidth, thumbHeight, { fit: 'contain' }).png().toBuffer(),
    left: (index % columns) * thumbWidth,
    top: Math.floor(index / columns) * thumbHeight,
  })))
  return sharp({
    create: { width: columns * thumbWidth, height: rows * thumbHeight, channels: 4, background: '#101a22' },
  }).composite(composites).webp({ quality: 88 }).toFile(outputPath)
}
```

The `patches` list passed to `reconstructBackground` must contain only clone regions sampled from the source plate and must never call a network or model API. Tune those clone rectangles against the layer contact sheet, keeping the final movement amplitudes small enough that no large invented region is necessary.

- [ ] **Step 5: Implement and run layer extraction**

`tools/hero/extract-layers.mjs` must:

1. validate source metadata;
2. create `work/hero/layers` and `output/hero-production`;
3. produce the enhanced master;
4. render and feather each SVG matte;
5. extract every named layer;
6. reconstruct the background behind the logo and van;
7. write `work/hero/layer-manifest.json` with paths, bounds, and SHA-256 hashes;
8. write `output/hero-production/layer-contact-sheet.webp`.

Run:

```powershell
rtk npm run hero:extract
rtk proxy node --test tools/hero/tests/layers.test.mjs
```

Expected: extraction exits 0; all layer tests PASS; contact sheet is 2560 pixels wide and shows no obvious white/blue mask halo.

- [ ] **Step 6: Commit the layer pipeline**

```powershell
rtk git add tools/hero/lib/masks.mjs tools/hero/lib/image.mjs tools/hero/extract-layers.mjs tools/hero/tests/layers.test.mjs output/hero-production/hero-master-2560x1440.png output/hero-production/layer-contact-sheet.webp work/hero/layer-manifest.json work/hero/layers
rtk git commit -m "feat: extract and enhance automotive hero layers"
```

---

### Task 3: Deterministic 2.5D Frame Renderer

**Files:**
- Create: `tools/hero/lib/phase.mjs`
- Create: `tools/hero/render-frames.mjs`
- Create: `tools/hero/tests/phase.test.mjs`
- Create: `tools/hero/tests/render.test.mjs`
- Create: generated desktop/mobile frames under `work/hero/frames/`

**Interfaces:**
- Consumes: `HERO_CONFIG` and layer manifest from Task 2.
- Produces: `phaseAt(frame)`, `motionAt(frame, format)`, `renderFrame(frame, format)`, and PNG sequences for desktop/mobile encoding.

- [ ] **Step 1: Add failing periodic-motion tests**

```js
// tools/hero/tests/phase.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import { motionAt, phaseAt } from '../lib/phase.mjs'

test('validation frame is mathematically identical to frame zero', () => {
  assert.equal(phaseAt(0), 0)
  assert.equal(phaseAt(180), 0)
  assert.deepEqual(motionAt(180, 'desktop'), motionAt(0, 'desktop'))
})

test('travel phases advance forward at constant speed', () => {
  const phases = [0, 1, 2, 3].map((frame) => motionAt(frame, 'desktop').roadPhase)
  assert.equal(phases[1] - phases[0], phases[2] - phases[1])
  assert.equal(phases[2] - phases[1], phases[3] - phases[2])
})

test('motion stays inside premium amplitude limits', () => {
  for (let frame = 0; frame <= 180; frame += 1) {
    const motion = motionAt(frame, 'desktop')
    assert.ok(Math.abs(motion.suspensionY) <= 1.25)
    assert.ok(Math.abs(motion.cameraX) <= 0.45)
    assert.ok(Math.abs(motion.pitchDegrees) <= 0.03)
  }
})
```

- [ ] **Step 2: Verify the tests fail before implementation**

```powershell
rtk proxy node --test tools/hero/tests/phase.test.mjs
```

Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `phase.mjs`.

- [ ] **Step 3: Implement exact periodic phase math**

```js
// tools/hero/lib/phase.mjs
import { HERO_CONFIG } from '../config.mjs'

const TAU = Math.PI * 2
const wrap01 = (value) => ((value % 1) + 1) % 1
const clean = (value) => Math.abs(value) < 1e-12 ? 0 : Number(value.toFixed(12))

export function phaseAt(frame) {
  return wrap01(frame / HERO_CONFIG.encodedFrames)
}

export function motionAt(frame, format = 'desktop') {
  const phase = phaseAt(frame)
  const angle = phase * TAU
  const mobileScale = format === 'mobile' ? 0.82 : 1
  return {
    phase,
    roadPhase: clean(phase),
    guardrailPhase: clean(wrap01(phase * 0.72)),
    treePhase: clean(wrap01(phase * 0.48)),
    mountainPhase: clean(wrap01(phase * 0.16)),
    cloudPhase: clean(wrap01(phase * 0.09)),
    suspensionY: clean(Math.sin(angle * 3) * 1.25 * mobileScale),
    cameraX: clean(Math.sin(angle * 5) * 0.45 * mobileScale),
    cameraY: clean(Math.cos(angle * 4) * 0.28 * mobileScale),
    pitchDegrees: clean(Math.sin(angle * 3) * 0.03),
    wheelDegrees: clean((phase * 360 * 3) % 360),
    reflectionPhase: clean(phase),
  }
}
```

- [ ] **Step 4: Add failing frame-identity and geometry tests**

```js
// tools/hero/tests/render.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import sharp from 'sharp'
import { renderFrame } from '../render-frames.mjs'

test('frame 180 is byte-identical to frame zero before encoding', async () => {
  const zero = await renderFrame(0, 'desktop')
  const end = await renderFrame(180, 'desktop')
  assert.deepEqual(end, zero)
})

test('desktop and mobile frames have exact export geometry', async () => {
  const desktop = await sharp(await renderFrame(0, 'desktop')).metadata()
  const mobile = await sharp(await renderFrame(0, 'mobile')).metadata()
  assert.deepEqual([desktop.width, desktop.height], [1920, 1080])
  assert.deepEqual([mobile.width, mobile.height], [1080, 1920])
})
```

- [ ] **Step 5: Implement the renderer in explicit compositing order**

`renderFrame(frame, format)` must return a PNG `Buffer` and composite in this order:

1. reconstructed sky/background;
2. wrapped cloud plate at at most 1.2% master-width travel;
3. mountains at at most 2.4 master pixels;
4. trees with backward wrapped travel and 5–7 pixel directional blur;
5. guardrail with backward wrapped travel and 3–5 pixel directional blur;
6. procedural road texture sampled from source pixels and perspective mapped toward the vanishing point;
7. lane markings sharing the road phase;
8. periodic reflection bands clipped to body/glass masks;
9. van with suspension, pitch, and sub-pixel camera vibration;
10. rotating wheel highlights clipped to the wheel masks;
11. perfectly fixed logo layer;
12. a restrained 0.25–0.4% monochrome grain pass to prevent banding.

The module must export:

```js
export async function renderFrame(frame, format = 'desktop') {
  if (!Number.isInteger(frame) || frame < 0 || frame > HERO_CONFIG.validationFrame) {
    throw new RangeError(`Frame must be an integer from 0 to ${HERO_CONFIG.validationFrame}`)
  }
  const normalizedFrame = frame % HERO_CONFIG.encodedFrames
  const motion = motionAt(normalizedFrame, format)
  return composeFrame({ frame: normalizedFrame, format, motion })
}
```

`normalizedFrame` is mandatory so frame 180 follows the identical code path and receives identical grain as frame 0.

- [ ] **Step 6: Render proof frames and inspect them before the full sequence**

Render frames `0`, `45`, `90`, `135`, and `180` for desktop and mobile, then create contact sheets:

```powershell
rtk proxy node tools/hero/render-frames.mjs --proof
rtk proxy node --test tools/hero/tests/phase.test.mjs tools/hero/tests/render.test.mjs
```

Expected: tests PASS; frame 0 and 180 hashes match; van/logo silhouette is stable across the contact sheet; no mask edge or reconstructed patch is visible at 100% view.

- [ ] **Step 7: Render the complete 180-frame sequences**

```powershell
rtk npm run hero:render
```

Expected: `work/hero/frames/desktop/frame-0000.png` through `frame-0179.png` and matching mobile frames exist; validation frame hashes are written to `output/hero-production/render-report.json`.

- [ ] **Step 8: Commit the deterministic renderer**

```powershell
rtk git add tools/hero/lib/phase.mjs tools/hero/render-frames.mjs tools/hero/tests/phase.test.mjs tools/hero/tests/render.test.mjs output/hero-production/render-report.json output/hero-production/proof-frames-desktop.webp output/hero-production/proof-frames-mobile.webp
rtk git commit -m "feat: render seamless premium automotive motion"
```

---

### Task 4: Web Encoding, Posters, and Loop Verification

**Files:**
- Create: `tools/hero/encode.mjs`
- Create: `tools/hero/verify.mjs`
- Create: `tools/hero/tests/encode.test.mjs`
- Create: `tools/hero/tests/verify.test.mjs`
- Create: `public/assets/hero.mp4`
- Create: `public/assets/hero.webm`
- Create: `public/assets/poster.webp`
- Create: `public/assets/poster.jpg`
- Create: `public/assets/mobile.mp4`
- Create: `public/assets/mobile.webp`
- Create: `output/hero-production/ffmpeg-commands.txt`
- Create: `output/hero-production/export-manifest.json`
- Create: `output/hero-production/loop-report.json`

**Interfaces:**
- Consumes: rendered frame sequences and `HERO_CONFIG`.
- Produces: requested web assets, exact reproducible FFmpeg command log, and machine-readable verification reports.

- [ ] **Step 1: Add failing encoding-argument tests**

```js
// tools/hero/tests/encode.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import { buildEncodeJobs } from '../encode.mjs'

test('desktop H.264 encode is silent, compatible, and fast-start optimized', () => {
  const job = buildEncodeJobs().find(({ name }) => name === 'hero.mp4')
  assert.ok(job.args.includes('libx264'))
  assert.ok(job.args.includes('yuv420p'))
  assert.ok(job.args.includes('+faststart'))
  assert.ok(job.args.includes('-an'))
  assert.ok(job.args.includes('30'))
})

test('desktop WebM encode uses VP9', () => {
  const job = buildEncodeJobs().find(({ name }) => name === 'hero.webm')
  assert.ok(job.args.includes('libvpx-vp9'))
  assert.ok(job.args.includes('-an'))
})
```

- [ ] **Step 2: Implement encode jobs with exact output settings**

`buildEncodeJobs()` must produce:

```js
[
  { name: 'hero.mp4', codec: 'libx264', crf: 18, preset: 'slow', pixelFormat: 'yuv420p' },
  { name: 'hero.webm', codec: 'libvpx-vp9', crf: 28, speed: 1, pixelFormat: 'yuv420p' },
  { name: 'mobile.mp4', codec: 'libx264', crf: 20, preset: 'slow', pixelFormat: 'yuv420p' },
]
```

All video jobs use `-framerate 30`, `-frames:v 180`, `-an`, and output exactly six seconds. MP4 jobs use `-movflags +faststart`. Poster assets are generated from frame 0 using Sharp at quality 90 WebP and quality 92 progressive JPEG. `mobile.webp` is generated from mobile frame 0 at quality 88.

- [ ] **Step 3: Run encoding tests and encode all assets**

```powershell
rtk proxy node --test tools/hero/tests/encode.test.mjs
rtk npm run hero:encode
```

Expected: tests PASS; all six requested browser assets exist; command log contains one complete command per encode.

- [ ] **Step 4: Add failing loop-verification tests**

```js
// tools/hero/tests/verify.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import { compareRawFrames, verifyManifest } from '../verify.mjs'

test('identical RGBA frames report zero error', () => {
  const frame = Buffer.from([0, 16, 255, 255, 22, 44, 66, 255])
  assert.deepEqual(compareRawFrames(frame, frame), { maxDelta: 0, meanDelta: 0, changedPixels: 0 })
})

test('manifest enforces all requested deliverables', () => {
  assert.doesNotThrow(() => verifyManifest({
    files: ['hero.mp4', 'hero.webm', 'poster.webp', 'poster.jpg', 'mobile.mp4', 'mobile.webp'],
    durationSeconds: 6,
    fps: 30,
  }))
})
```

- [ ] **Step 5: Implement encoded-boundary and manifest verification**

`verify.mjs` must:

1. confirm SHA-256 equality of unencoded frame 0 and validation frame 180;
2. decode the first two and final two video frames with FFmpeg into temporary lossless PNGs;
3. compare final-to-first deltas against the normal penultimate-to-final motion delta;
4. fail when boundary mean delta exceeds 1.35 times the normal adjacent-frame delta;
5. inspect codec, dimensions, frame rate, frame count, duration, audio absence, and file size;
6. write `loop-report.json` and `export-manifest.json`;
7. return a non-zero exit code on any failed acceptance check.

The raw comparison helper must return:

```js
export function compareRawFrames(a, b) {
  if (a.length !== b.length) throw new Error('Frame buffers must have equal length')
  let maxDelta = 0
  let totalDelta = 0
  let changedPixels = 0
  for (let i = 0; i < a.length; i += 4) {
    const delta = Math.max(
      Math.abs(a[i] - b[i]),
      Math.abs(a[i + 1] - b[i + 1]),
      Math.abs(a[i + 2] - b[i + 2]),
    )
    maxDelta = Math.max(maxDelta, delta)
    totalDelta += delta
    if (delta > 0) changedPixels += 1
  }
  return { maxDelta, meanDelta: totalDelta / (a.length / 4), changedPixels }
}
```

- [ ] **Step 6: Verify and tune until the loop and size gates pass**

```powershell
rtk npm run hero:verify
rtk proxy node --test tools/hero/tests/verify.test.mjs
```

Expected: PASS; six-second duration; 30 fps; 180 encoded frames; no audio; unencoded endpoint error is exactly zero; encoded boundary ratio is at most 1.35; desktop media stays within the quality-first size budget recorded in the manifest.

If VP9 or H.264 is visually noisy, adjust CRF by at most two points and re-run `hero:encode` and `hero:verify`. Do not change the motion timeline to hide compression artifacts.

- [ ] **Step 7: Commit encoded deliverables and proof reports**

```powershell
rtk git add tools/hero/encode.mjs tools/hero/verify.mjs tools/hero/tests/encode.test.mjs tools/hero/tests/verify.test.mjs public/assets/hero.mp4 public/assets/hero.webm public/assets/poster.webp public/assets/poster.jpg public/assets/mobile.mp4 public/assets/mobile.webp output/hero-production/ffmpeg-commands.txt output/hero-production/export-manifest.json output/hero-production/loop-report.json
rtk git commit -m "feat: export and verify premium hero media"
```

---

### Task 5: After Effects Project Builder and Production Documentation

**Files:**
- Create: `tools/hero/create-ae-project.jsx`
- Create: `tools/hero/README.md`
- Create: `output/hero-production/layer-map.json`

**Interfaces:**
- Consumes: layer manifest, layer PNGs, timeline values, and FFmpeg command log.
- Produces: an After Effects JSX script that creates a 2560 x 1440, 30 fps, six-second project with named layers and matching expressions.

- [ ] **Step 1: Add a static contract test for the JSX builder**

Extend `tools/hero/tests/config.test.mjs`:

```js
test('After Effects builder declares the master composition contract', async () => {
  const jsx = await fs.readFile('tools/hero/create-ae-project.jsx', 'utf8')
  assert.match(jsx, /items\.addComp\("BusemNaCzas_Hero_Master", 2560, 1440, 1, 6, 30\)/)
  assert.match(jsx, /frameDuration/)
  assert.match(jsx, /Logo_FIXED/)
  assert.match(jsx, /Van_CAMERA_MOUNTED/)
})
```

Add `import fs from 'node:fs/promises'` at the top of the test file.

- [ ] **Step 2: Implement the JSX project builder**

The script must create folders `01_PLATES`, `02_MATTES`, `03_PRECOMPS`, and `04_OUTPUT`; import the generated layer PNGs; create the master comp; create road, environment, van, and reflection precomps; set blending modes; add motion blur; and add expressions based on `time / 6` with no random or wiggle calls.

The top-level project creation must begin with:

```jsx
app.beginUndoGroup("Build BusemNaCzas Premium Hero");
var project = app.project || app.newProject();
var master = project.items.addComp("BusemNaCzas_Hero_Master", 2560, 1440, 1, 6, 30);
master.motionBlur = true;
master.shutterAngle = 120;
master.shutterPhase = -60;
```

The fixed layer names must be `Logo_FIXED` and `Van_CAMERA_MOUNTED`. The builder ends with `app.endUndoGroup();` and displays a completion message instructing the artist to save the generated project as `.aep`.

- [ ] **Step 3: Document reproduction and limitations**

`tools/hero/README.md` must include:

- source analysis and every layer name;
- `rtk npm run hero:build` reproduction command;
- exact output file table with codec, dimensions, duration, and size pulled from `export-manifest.json`;
- location of `ffmpeg-commands.txt`;
- how to run `create-ae-project.jsx` from After Effects;
- explicit statement that the JSX is the portable project builder because After Effects is not installed on this machine;
- non-AI enhancement explanation: Lanczos upscale, selective sharpening, restrained denoise, and grain control;
- validation report locations.

- [ ] **Step 4: Run tests and commit documentation**

```powershell
rtk npm run test:hero
rtk git add tools/hero/create-ae-project.jsx tools/hero/README.md output/hero-production/layer-map.json tools/hero/tests/config.test.mjs
rtk git commit -m "docs: add After Effects hero project handoff"
```

Expected: all hero tests PASS; JSX contains no `wiggle`, `random`, or time-remap easing.

---

### Task 6: Responsive React Integration Without Layout Shift

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: the six final browser assets from Task 4.
- Produces: responsive desktop/mobile video delivery, matched poster fallback, and stable reduced-motion behavior.

- [ ] **Step 1: Replace the old hero assertions with failing responsive-source assertions**

Update the existing hero portion of `src/App.test.tsx`:

```tsx
const heroVideo = screen.getByLabelText('Renault Trafic BusemNaCzas.pl w trasie')
expect(heroVideo).toHaveAttribute('autoplay')
expect(heroVideo).toHaveAttribute('loop')
expect(heroVideo).toHaveAttribute('playsinline')
expect(heroVideo).toHaveAttribute('preload', 'metadata')
expect(heroVideo).toHaveProperty('muted', true)
expect(heroVideo).toHaveAttribute('poster', '/assets/poster.webp')
expect(heroVideo.querySelector('source[media="(max-width: 680px)"]')).toHaveAttribute('src', '/assets/mobile.mp4')
expect(heroVideo.querySelector('source[type="video/webm"]')).toHaveAttribute('src', '/assets/hero.webm')
expect(heroVideo.querySelector('source[type="video/mp4"]:not([media])')).toHaveAttribute('src', '/assets/hero.mp4')
expect(screen.getByTestId('hero-poster-picture')).toBeInTheDocument()
expect(screen.queryByTestId('hero-cloud-layer')).not.toBeInTheDocument()
```

- [ ] **Step 2: Run the focused test and verify the expected failure**

```powershell
rtk npm test -- --run src/App.test.tsx
```

Expected: FAIL because the new sources and picture poster are absent.

- [ ] **Step 3: Integrate responsive posters and video sources**

Replace only the contents of `.hero-full-media` in `src/App.tsx`:

```tsx
<picture className="hero-static-poster" data-testid="hero-poster-picture" aria-hidden="true">
  <source media="(max-width: 680px)" srcSet="/assets/mobile.webp" />
  <source srcSet="/assets/poster.webp" type="image/webp" />
  <img src="/assets/poster.jpg" width="1920" height="1080" alt="" />
</picture>
<video
  className="hero-video"
  aria-label="Renault Trafic BusemNaCzas.pl w trasie"
  autoPlay
  muted
  loop
  playsInline
  preload="metadata"
  poster="/assets/poster.webp"
>
  <source media="(max-width: 680px)" src="/assets/mobile.mp4" type="video/mp4" />
  <source src="/assets/hero.webm" type="video/webm" />
  <source src="/assets/hero.mp4" type="video/mp4" />
</video>
```

Remove the browser-generated `.hero-cloud-layer`; cloud movement is now encoded and deterministic.

- [ ] **Step 4: Update CSS for stable poster/video geometry**

Replace the hero media rules with:

```css
.hero-full-media { position: relative; height: calc(100svh - 82px); min-height: 560px; overflow: hidden; background: #101a22; contain: layout paint; }
.hero-static-poster, .hero-video { position: absolute; inset: 0; width: 100%; height: 100%; }
.hero-static-poster { z-index: 0; display: block; }
.hero-static-poster img, .hero-video { width: 100%; height: 100%; object-fit: cover; object-position: center; }
.hero-video { z-index: 1; display: block; background: #101a22; }
```

In the mobile media query, retain the existing hero height and use:

```css
.hero-static-poster img, .hero-video { object-position: 50% center; }
```

Update reduced motion to:

```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { scroll-behavior: auto !important; animation-duration: .01ms !important; transition-duration: .01ms !important; }
  .hero-video { display: none; }
}
```

- [ ] **Step 5: Run regression tests and production build**

```powershell
rtk npm test -- --run
rtk npm run build
```

Expected: all Vitest tests PASS; TypeScript and Vite build PASS; no missing-asset warning.

- [ ] **Step 6: Commit site integration**

```powershell
rtk git add src/App.tsx src/App.test.tsx src/styles.css
rtk git commit -m "feat: integrate responsive premium hero media"
```

---

### Task 7: Playwright Visual, Playback, and Performance Acceptance

**Files:**
- Create: `output/playwright/hero-desktop-start.png`
- Create: `output/playwright/hero-desktop-boundary.png`
- Create: `output/playwright/hero-mobile-start.png`
- Create: `output/playwright/hero-mobile-midpoint.png`
- Create: `output/playwright/hero-reduced-motion.png`
- Create: `output/hero-production/browser-validation.json`
- Modify: `tools/hero/README.md`

**Interfaces:**
- Consumes: production build and browser assets from Tasks 4 and 6.
- Produces: browser evidence and final acceptance verdict.

- [ ] **Step 1: Run the complete automated production pipeline**

```powershell
rtk npm run hero:build
rtk npm test -- --run
rtk npm run build
```

Expected: all commands PASS with no loop, export, test, or build failure.

- [ ] **Step 2: Start the production preview server**

```powershell
rtk npm run preview -- --host 127.0.0.1 --port 4173
```

Keep the process running in its PTY session and validate `http://127.0.0.1:4173/`.

- [ ] **Step 3: Use Playwright CLI for desktop playback inspection**

Use the Playwright CLI through `npx.cmd` on Windows (the functional equivalent of the bundled shell wrapper) and open the page:

```powershell
rtk proxy npx.cmd --yes --package @playwright/cli playwright-cli open http://127.0.0.1:4173 --headed
rtk proxy npx.cmd --yes --package @playwright/cli playwright-cli snapshot
```

Verify in browser context:

- video `readyState >= 3`;
- `paused === false`, `muted === true`, and `loop === true`;
- `videoWidth === 1920` and `videoHeight === 1080` on desktop;
- current time advances across a one-second observation;
- no console errors and all hero media requests return 200;
- hero container rectangle is identical before and after metadata load.

Capture start and boundary screenshots into `output/playwright/`.

- [ ] **Step 4: Validate mobile media selection and composition**

Resize to 390 x 844 and reload. Verify the selected media has `videoWidth === 1080` and `videoHeight === 1920`, the logo and van remain visible, no horizontal overflow exists, and the fixed mobile CTA does not cover critical hero branding. Capture start and midpoint screenshots.

- [ ] **Step 5: Validate reduced-motion behavior**

Emulate `prefers-reduced-motion: reduce`, reload, and verify `.hero-video` has `display: none` while the mobile or desktop poster remains visible and fills the unchanged hero container. Capture `hero-reduced-motion.png`.

- [ ] **Step 6: Measure layout stability and playback cost**

Record:

- cumulative layout shift attributable to the hero: exactly 0;
- decoded video frame count increases during playback;
- dropped frame ratio remains below 1% over a 10-second desktop observation and below 2% on the mobile viewport;
- no main-thread animation loop is attached to the hero;
- media transfer sizes match `export-manifest.json`.

Write these values and screenshot paths to `output/hero-production/browser-validation.json` with top-level `{ "passed": true }`. If a gate fails, change only the renderer, encode settings, or hero integration responsible for the failure, then repeat Tasks 4, 6, and 7 as applicable.

- [ ] **Step 7: Perform final verification before claiming completion**

```powershell
rtk npm run test:hero
rtk npm test -- --run
rtk npm run build
rtk git status --short
```

Expected: all tests and build PASS; only intentional generated evidence or unrelated pre-existing user files remain uncommitted.

- [ ] **Step 8: Commit final browser evidence and documentation update**

```powershell
rtk git add output/playwright/hero-desktop-start.png output/playwright/hero-desktop-boundary.png output/playwright/hero-mobile-start.png output/playwright/hero-mobile-midpoint.png output/playwright/hero-reduced-motion.png output/hero-production/browser-validation.json tools/hero/README.md
rtk git commit -m "test: validate premium hero playback and performance"
```

---

## Completion Checklist

- [ ] Requested `hero.mp4`, `hero.webm`, `poster.webp`, `poster.jpg`, `mobile.mp4`, and `mobile.webp` exist and are integrated.
- [ ] 2560 x 1440 enhanced master and independent layer package exist.
- [ ] After Effects JSX project builder imports the same layers and creates the matching six-second composition.
- [ ] FFmpeg commands are recorded exactly.
- [ ] Frame 0 and validation frame 180 are pixel-identical before encoding.
- [ ] Encoded loop boundary passes the adjacent-frame continuity threshold.
- [ ] Van and logo remain visually anchored; road and environment flow backward without reversal.
- [ ] Desktop, mobile, and reduced-motion Playwright evidence passes.
- [ ] Existing Vitest suite and production build pass.
- [ ] Production README summarizes image analysis, edits, outputs, limitations, reproduction, and validation results.
