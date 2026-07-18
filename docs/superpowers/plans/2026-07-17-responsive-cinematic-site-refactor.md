# Responsive Cinematic Site Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor BusemNaCzas.pl into the approved cinematic, phone-first landing page with supplied video/logo assets and intentional mobile behavior.

**Architecture:** Keep `src/content.ts` as the factual source and preserve focused React components. Add a dedicated source-video preparation path beside the legacy `v3` artwork pipeline, extract a focused `Hero` component, add a reusable `BrandMark`, then recompose the page and its CSS around concept A. Use posters and semantic DOM as the permanent fallback; video is a nonessential enhancement.

**Tech Stack:** React 19, TypeScript 5.7, Vite 6, Vitest/Testing Library, Framer Motion 12, Lenis 1.3, Sharp 0.35, `ffmpeg-static` 5.3, CSS, Chrome DevTools browser verification.

## Global Constraints

- Use `C:\Users\Listek\Downloads\van_16x9_upscaled_1080p.mp4` as the only hero-motion source.
- Use `C:\Users\Listek\.codex\attachments\6cd8ebfe-899c-412c-836c-2e2832201bca\image-1.png` as the logo artwork source.
- Do not use AI video, generative fill, scene extension, or invented vehicle imagery.
- `Zadzwoń` is the primary mobile action; `Zarezerwuj` is secondary.
- Tighten Polish copy while preserving every verified number, place, feature, price, phone link, and rental limit.
- Hero video plays once and holds; it does not loop.
- Browser assets stay under `public/assets`; reports stay under `output/hero-production`; transient sources stay under `work/hero/v4`.
- Desktop media budgets: MP4 ≤ 4 MB, WebM ≤ 3 MB. Mobile: MP4 ≤ 2.2 MB, WebM ≤ 1.8 MB. Posters: ≤ 250 KB each.
- Minimum browser matrix: 360×640, 375×667, 390×844, 412×915, 430×932, 844×390, 768×1024, 1024×768, 1440×900, 1920×1080.
- Preserve user-owned worktree changes. Before every commit, run `git diff --cached --name-only` and stage only task paths. If a touched file already had unrelated edits, review the complete staged diff before committing.
- Do not add a CMS, booking backend, analytics SDK, payment system, or fabricated reviews.

## File Structure

### Create

- `tools/hero/source-video-config.mjs` — immutable `v4` source-video paths, dimensions, filenames, and budgets.
- `tools/hero/prepare-source-video.mjs` — deterministic FFmpeg derivatives and posters from supplied MP4.
- `tools/hero/verify-source-video.mjs` — codec, geometry, duration, audio, poster, and budget verification.
- `tools/hero/prepare-logo.mjs` — deterministic crop/resize/export from approved cleaned logo image.
- `tools/hero/tests/source-video.test.mjs` — `v4` command and manifest contracts.
- `tools/hero/tests/logo.test.mjs` — transparency and output contract.
- `src/components/BrandMark.tsx` — wordmark/full-lockup renderer with stable dimensions.
- `src/components/Hero.tsx` — responsive poster/video/content composition and save-data/reduced-motion behavior.
- `src/components/ProofRail.tsx` — consolidated factual proof row.
- `src/components/MobileCta.tsx` — CTA shown only after the hero leaves the viewport.
- `src/styles/base.css` — tokens, reset, typography, focus, shared layout.
- `src/styles/hero.css` — navigation, hero, brand, proof rail, mobile CTA.
- `src/styles/sections.css` — fleet, pricing, benefits, map, gallery, services, FAQ, contact, footer.
- `src/styles/responsive.css` — tablet, phone, short-landscape, reduced-motion, high-contrast rules.

### Modify

- `.gitignore` — ignore `.superpowers/` visual-companion artifacts and transient `work/hero/v4/` sources.
- `package.json` — add `hero:v4:*` scripts.
- `src/App.tsx` — approved page order and new component composition.
- `src/App.test.tsx` — hero, copy, section order, CTA, and accessibility contracts.
- `src/content.ts` — tightened factual copy and proof data; remove placeholder testimonials.
- `src/components/Nav.tsx` — brand, mobile-menu focus/scroll behavior, transparent-to-white state.
- `src/components/Gallery.tsx` — dialog focus lifecycle and keyboard trapping.
- `src/components/Contact.tsx` — phone-first hierarchy and honest demo status.
- `src/components/VehicleShowcase.tsx` — tightened CTA/copy and stable reduced-motion transition.
- `src/styles.css` — import the four focused stylesheets.
- `src/test/setup.ts` — controllable IntersectionObserver and matchMedia mocks.
- `public/assets/AGENTS.md` — describe `v4` supplied-video contract while retaining legacy `v3` history.
- `tools/hero/AGENTS.md` — describe source-video path and verifier ownership.
- `tools/hero/README.md` — document `hero:v4:build` input and outputs.

### Delete

- `src/components/Testimonials.tsx` — removes demonstrative testimonials from public UI.

---

### Task 1: Build the deterministic `v4` source-video pipeline

**Files:**
- Create: `tools/hero/source-video-config.mjs`
- Create: `tools/hero/prepare-source-video.mjs`
- Create: `tools/hero/verify-source-video.mjs`
- Create: `tools/hero/tests/source-video.test.mjs`
- Modify: `package.json`
- Modify: `tools/hero/AGENTS.md`
- Modify: `tools/hero/README.md`
- Modify: `public/assets/AGENTS.md`
- Input: `work/hero/v4/source.mp4`
- Output: `public/assets/hero-v4.mp4`, `public/assets/hero-v4.webm`, `public/assets/mobile-v4.mp4`, `public/assets/mobile-v4.webm`, `public/assets/poster-v4.webp`, `public/assets/poster-v4.jpg`, `public/assets/mobile-v4.webp`

**Interfaces:**
- Produces: `SOURCE_VIDEO_CONFIG`, `buildSourceVideoJobs(): Array<{name:string,args:string[]}>`, `verifySourceManifest(manifest): true`.
- Consumes: `ffmpeg-static`, Sharp, supplied MP4 copied to `work/hero/v4/source.mp4`.

- [ ] **Step 1: Write the failing source-video contract test**

```js
// tools/hero/tests/source-video.test.mjs
import assert from 'node:assert/strict'
import test from 'node:test'
import { SOURCE_VIDEO_CONFIG } from '../source-video-config.mjs'
import { buildSourceVideoJobs } from '../prepare-source-video.mjs'
import { verifySourceManifest } from '../verify-source-video.mjs'

test('v4 config names every approved derivative and plays once', () => {
  assert.equal(SOURCE_VIDEO_CONFIG.loop, false)
  assert.equal(SOURCE_VIDEO_CONFIG.fps, 30)
  assert.deepEqual(SOURCE_VIDEO_CONFIG.requiredFiles, [
    'hero-v4.mp4', 'hero-v4.webm', 'mobile-v4.mp4', 'mobile-v4.webm',
    'poster-v4.webp', 'poster-v4.jpg', 'mobile-v4.webp',
  ])
})

test('v4 encode jobs are silent, fast-started, and portrait-aware', () => {
  const jobs = buildSourceVideoJobs()
  const desktop = jobs.find(({ name }) => name === 'hero-v4.mp4')
  const mobile = jobs.find(({ name }) => name === 'mobile-v4.mp4')
  assert.ok(desktop.args.includes('-an'))
  assert.ok(desktop.args.includes('+faststart'))
  assert.ok(mobile.args.join(' ').includes('crop=900:1440'))
  assert.ok(mobile.args.includes('-an'))
})

test('v4 manifest enforces all outputs and byte budgets', () => {
  const files = Object.fromEntries(SOURCE_VIDEO_CONFIG.requiredFiles.map((name) => [name, { bytes: 100_000 }]))
  assert.equal(verifySourceManifest({ fps: 30, audio: false, files }), true)
  files['mobile-v4.mp4'].bytes = SOURCE_VIDEO_CONFIG.budgets['mobile-v4.mp4'] + 1
  assert.throws(() => verifySourceManifest({ fps: 30, audio: false, files }), /budget/)
})
```

- [ ] **Step 2: Run the test and confirm the missing-module failure**

Run:

```powershell
npm.cmd run test:hero -- --test-name-pattern="v4"
```

Expected: FAIL because `source-video-config.mjs`, `prepare-source-video.mjs`, and `verify-source-video.mjs` do not exist.

- [ ] **Step 3: Add the immutable source-video configuration**

```js
// tools/hero/source-video-config.mjs
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const requiredFiles = [
  'hero-v4.mp4', 'hero-v4.webm', 'mobile-v4.mp4', 'mobile-v4.webm',
  'poster-v4.webp', 'poster-v4.jpg', 'mobile-v4.webp',
]

export const SOURCE_VIDEO_CONFIG = Object.freeze({
  root,
  sourcePath: path.join(root, 'work/hero/v4/source.mp4'),
  publicDir: path.join(root, 'public/assets'),
  outputDir: path.join(root, 'output/hero-production'),
  desktop: Object.freeze({ width: 1920, height: 1080 }),
  mobile: Object.freeze({ width: 900, height: 1440 }),
  fps: 30,
  durationSeconds: 5.076923,
  loop: false,
  requiredFiles: Object.freeze(requiredFiles),
  budgets: Object.freeze({
    'hero-v4.mp4': 4_000_000,
    'hero-v4.webm': 3_000_000,
    'mobile-v4.mp4': 2_200_000,
    'mobile-v4.webm': 1_800_000,
    'poster-v4.webp': 250_000,
    'poster-v4.jpg': 250_000,
    'mobile-v4.webp': 250_000,
  }),
})
```

- [ ] **Step 4: Implement deterministic FFmpeg jobs and posters**

Implement `buildSourceVideoJobs()` with these exact filter contracts:

```js
const desktopFilter = 'fps=30,scale=1920:1080:flags=lanczos'
const mobileFilter = "fps=30,scale=-2:1440:flags=lanczos,crop=900:1440:x='(iw-ow)*0.58':y=0"

const common = (filter) => [
  '-hide_banner', '-y', '-i', SOURCE_VIDEO_CONFIG.sourcePath,
  '-t', String(SOURCE_VIDEO_CONFIG.durationSeconds), '-vf', filter, '-an',
]

export function buildSourceVideoJobs() {
  const out = (name) => path.join(SOURCE_VIDEO_CONFIG.publicDir, name)
  return [
    { name: 'hero-v4.mp4', args: [...common(desktopFilter), '-c:v', 'libx264', '-crf', '22', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out('hero-v4.mp4')] },
    { name: 'hero-v4.webm', args: [...common(desktopFilter), '-c:v', 'libvpx-vp9', '-crf', '32', '-b:v', '0', '-deadline', 'good', '-cpu-used', '2', out('hero-v4.webm')] },
    { name: 'mobile-v4.mp4', args: [...common(mobileFilter), '-c:v', 'libx264', '-crf', '24', '-preset', 'slow', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', out('mobile-v4.mp4')] },
    { name: 'mobile-v4.webm', args: [...common(mobileFilter), '-c:v', 'libvpx-vp9', '-crf', '34', '-b:v', '0', '-deadline', 'good', '-cpu-used', '2', out('mobile-v4.webm')] },
  ]
}
```

`main()` must: assert the source exists, create output directories, run every job with `ffmpeg-static`, decode the first desktop/mobile frames, write WebP/JPEG posters with Sharp, and save `v4-ffmpeg-commands.txt` under `output/hero-production`.

- [ ] **Step 5: Implement verification and package scripts**

`verifySourceManifest()` must use the configured required list and exact budgets:

```js
export function verifySourceManifest(manifest) {
  if (manifest.fps !== SOURCE_VIDEO_CONFIG.fps) throw new Error('Unexpected v4 frame rate')
  if (manifest.audio !== false) throw new Error('v4 hero must be silent')
  for (const name of SOURCE_VIDEO_CONFIG.requiredFiles) {
    const entry = manifest.files[name]
    if (!entry) throw new Error(`Missing v4 output: ${name}`)
    if (entry.bytes > SOURCE_VIDEO_CONFIG.budgets[name]) {
      throw new Error(`${name} exceeds byte budget`)
    }
  }
  return true
}
```

Add scripts:

```json
"hero:v4:prepare": "node tools/hero/prepare-source-video.mjs",
"hero:v4:verify": "node tools/hero/verify-source-video.mjs",
"hero:v4:build": "npm run hero:v4:prepare && npm run hero:v4:verify"
```

Update both child `AGENTS.md` files and `tools/hero/README.md` to state that `v3` is the legacy generated-artwork loop, while `v4` is a supplied 5.08-second source-video derivative that plays once.

- [ ] **Step 6: Copy the approved source, build, and verify**

Run:

```powershell
New-Item -ItemType Directory -Force 'work\hero\v4' | Out-Null
Copy-Item -LiteralPath 'C:\Users\Listek\Downloads\van_16x9_upscaled_1080p.mp4' -Destination 'work\hero\v4\source.mp4' -Force
npm.cmd run test:hero
npm.cmd run hero:v4:build
```

Expected: all Node tests pass; verifier writes `output/hero-production/v4-export-manifest.json`; every configured file exists and stays within its byte budget.

- [ ] **Step 7: Commit the pipeline**

```powershell
git add package.json tools/hero/source-video-config.mjs tools/hero/prepare-source-video.mjs tools/hero/verify-source-video.mjs tools/hero/tests/source-video.test.mjs tools/hero/AGENTS.md tools/hero/README.md public/assets/AGENTS.md public/assets/hero-v4.mp4 public/assets/hero-v4.webm public/assets/mobile-v4.mp4 public/assets/mobile-v4.webm public/assets/poster-v4.webp public/assets/poster-v4.jpg public/assets/mobile-v4.webp
git diff --cached --check
git commit -m "feat: prepare verified responsive hero video"
```

---

### Task 2: Prepare faithful logo assets and a reusable brand component

**Files:**
- Create: `tools/hero/prepare-logo.mjs`
- Create: `tools/hero/tests/logo.test.mjs`
- Create: `src/components/BrandMark.tsx`
- Input: `work/hero/v4/logo-clean.png`
- Output: `public/assets/logo-wordmark-v4.webp`, `public/assets/logo-full-v4.webp`, `public/assets/logo-full-v4.png`

**Interfaces:**
- Produces: `BrandMark({ variant: 'wordmark' | 'full', className?: string })`.
- Consumes: one visually approved background-removed edit of the attached 1448 × 1086 logo.

- [ ] **Step 1: Create the exact background-removal edit using the imagegen skill**

Use the attached logo as the referenced image and this instruction:

```text
Remove only the grey checkerboard background and make it transparent. Preserve every existing pixel-level design decision: exact van silhouette, clock, speed streaks, blue hands, black/white/blue colors, lettering, spelling “busemnaczas.pl”, and “WYNAJEM BUSÓW OSOBOWYCH”. Do not redraw, restyle, sharpen, replace, or add anything. Keep the original 1448 × 1086 canvas and placement.
```

Inspect the result at original detail. Reject it if any letter, vehicle contour, clock tick, or color changed. Save the accepted output as `work/hero/v4/logo-clean.png`.

- [ ] **Step 2: Write the failing transparency/export test**

```js
// tools/hero/tests/logo.test.mjs
import assert from 'node:assert/strict'
import fs from 'node:fs/promises'
import path from 'node:path'
import test from 'node:test'
import sharp from 'sharp'
import { SOURCE_VIDEO_CONFIG } from '../source-video-config.mjs'

for (const name of ['logo-wordmark-v4.webp', 'logo-full-v4.webp', 'logo-full-v4.png']) {
  test(`${name} exists, has alpha, and stays compact`, async () => {
    const file = path.join(SOURCE_VIDEO_CONFIG.publicDir, name)
    const metadata = await sharp(file).metadata()
    assert.equal(metadata.hasAlpha, true)
    const expected = name.startsWith('logo-wordmark') ? { width: 520, height: 120 } : { width: 720, height: 540 }
    assert.equal(metadata.width, expected.width)
    assert.equal(metadata.height, expected.height)
    assert.ok((await fs.stat(file)).size < 250_000)
  })
}
```

- [ ] **Step 3: Run the test and confirm missing outputs**

Run:

```powershell
npm.cmd run test:hero -- --test-name-pattern="logo"
```

Expected: FAIL with missing `logo-*-v4` assets.

- [ ] **Step 4: Implement deterministic logo crops/exports**

```js
// tools/hero/prepare-logo.mjs
import fs from 'node:fs/promises'
import path from 'node:path'
import sharp from 'sharp'
import { SOURCE_VIDEO_CONFIG } from './source-video-config.mjs'

const input = path.join(SOURCE_VIDEO_CONFIG.root, 'work/hero/v4/logo-clean.png')
const out = (name) => path.join(SOURCE_VIDEO_CONFIG.publicDir, name)

await fs.access(input)
await fs.mkdir(SOURCE_VIDEO_CONFIG.publicDir, { recursive: true })

await sharp(input).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ width: 720, height: 540, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 94, alphaQuality: 100 })
  .toFile(out('logo-full-v4.webp'))

await sharp(input).trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ width: 720, height: 540, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .png({ compressionLevel: 9 })
  .toFile(out('logo-full-v4.png'))

await sharp(input).extract({ left: 130, top: 600, width: 1180, height: 220 })
  .trim({ background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .resize({ width: 520, height: 120, fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
  .webp({ quality: 96, alphaQuality: 100 })
  .toFile(out('logo-wordmark-v4.webp'))
```

- [ ] **Step 5: Add the brand component and verify both variants**

```tsx
// src/components/BrandMark.tsx
type BrandMarkProps = {
  variant?: 'wordmark' | 'full'
  className?: string
}

export function BrandMark({ variant = 'wordmark', className = '' }: BrandMarkProps) {
  const full = variant === 'full'
  return <img
    className={`brand-mark brand-mark--${variant} ${className}`.trim()}
    src={full ? '/assets/logo-full-v4.webp' : '/assets/logo-wordmark-v4.webp'}
    width={full ? 720 : 520}
    height={full ? 540 : 120}
    alt="BusemNaCzas.pl"
    decoding="async"
  />
}
```

Run `node tools/hero/prepare-logo.mjs`, `npm.cmd run test:hero`, then inspect both assets on dark and white backgrounds at 100% and 200% zoom.

- [ ] **Step 6: Commit the logo assets/component**

```powershell
git add tools/hero/prepare-logo.mjs tools/hero/tests/logo.test.mjs src/components/BrandMark.tsx public/assets/logo-wordmark-v4.webp public/assets/logo-full-v4.webp public/assets/logo-full-v4.png
git diff --cached --check
git commit -m "feat: add responsive brand lockups"
```

---

### Task 3: Implement the phone-first hero, branded navigation, and deferred mobile CTA

**Files:**
- Create: `src/components/Hero.tsx`
- Create: `src/components/MobileCta.tsx`
- Modify: `src/components/Nav.tsx`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/test/setup.ts`

**Interfaces:**
- Consumes: `BrandMark`, `siteContent.phone`, `hero-v4.*`, `mobile-v4.*`, `poster-v4.*`.
- Produces: `<Hero />` with `id="hero"`; `<MobileCta />` that renders only after the hero exits.

- [ ] **Step 1: Replace old hero assertions with the failing `v4`/CTA contract**

```tsx
// Add `within` to the Testing Library import. Put these assertions in an async test.
const heading = screen.getByRole('heading', { level: 1, name: 'Wynajem 9-osobowych Renault Trafic' })
const hero = heading.closest('section')
expect(hero).not.toBeNull()
const heroView = within(hero as HTMLElement)
expect(heroView.getByRole('link', { name: /Zadzwoń.*514 574 594/ })).toHaveAttribute('href', 'tel:+48514574594')
expect(heroView.getByRole('link', { name: 'Zarezerwuj' })).toHaveAttribute('href', '#kontakt')
expect(screen.getByRole('img', { name: 'BusemNaCzas.pl' })).toHaveAttribute('src', '/assets/logo-wordmark-v4.webp')
const video = await heroView.findByTestId('hero-video')
expect(video).not.toHaveAttribute('loop')
expect(video).toHaveAttribute('autoplay')
expect(video).toHaveAttribute('playsinline')
expect(video).toHaveAttribute('poster', '/assets/poster-v4.webp')
expect(video.querySelector('source[src="/assets/mobile-v4.webm"]')).toHaveAttribute('media', '(max-width: 680px)')
expect(video.querySelector('source[src="/assets/mobile-v4.mp4"]')).toHaveAttribute('media', '(max-width: 680px)')
expect(video.querySelector('source[src="/assets/hero-v4.webm"]')).toBeInTheDocument()
expect(video.querySelector('source[src="/assets/hero-v4.mp4"]')).toBeInTheDocument()
```

Add a second test that calls `setReducedMotion(true)` before render, awaits one effect turn with `waitFor`, and expects no `hero-video`, while the poster, H1, logo, and phone link remain. Restore `setReducedMotion(false)` in `afterEach`.

- [ ] **Step 2: Run the focused app test and confirm old hero failure**

Run:

```powershell
npm.cmd test -- --run src/App.test.tsx
```

Expected: FAIL on missing `v4` hero, brand link, and primary phone CTA.

- [ ] **Step 3: Add deterministic media-preference detection and Hero**

```tsx
// src/components/Hero.tsx
import { Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { siteContent } from '../content'

type NetworkInformation = { saveData?: boolean }

export function Hero() {
  const [allowVideo, setAllowVideo] = useState(false)
  useEffect(() => {
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const connection = (navigator as Navigator & { connection?: NetworkInformation }).connection
    setAllowVideo(!reduced && !connection?.saveData)
  }, [])

  return <section className="hero" id="hero" aria-labelledby="hero-title">
    <picture className="hero-poster" aria-hidden="true">
      <source media="(max-width: 680px)" srcSet="/assets/mobile-v4.webp" />
      <source srcSet="/assets/poster-v4.webp" type="image/webp" />
      <img src="/assets/poster-v4.jpg" width="1920" height="1080" alt="" />
    </picture>
    {allowVideo && <video data-testid="hero-video" className="hero-video" autoPlay muted playsInline preload="metadata" poster="/assets/poster-v4.webp" aria-hidden="true">
      <source media="(max-width: 680px)" src="/assets/mobile-v4.webm" type="video/webm" />
      <source media="(max-width: 680px)" src="/assets/mobile-v4.mp4" type="video/mp4" />
      <source src="/assets/hero-v4.webm" type="video/webm" />
      <source src="/assets/hero-v4.mp4" type="video/mp4" />
    </video>}
    <div className="hero-shade" aria-hidden="true" />
    <div className="container hero-content">
      <p className="eyebrow">Wynajem busów osobowych · Wieruszów i okolice</p>
      <h1 id="hero-title">Wynajem 9-osobowych Renault Trafic</h1>
      <p className="hero-lead">Dwa busy LONG, przejrzyste ceny i prosty kontakt przed każdą trasą.</p>
      <div className="hero-actions">
        <a className="button button-primary" href={siteContent.phone.href}><Phone size={18} />Zadzwoń · {siteContent.phone.display}</a>
        <a className="button button-secondary button-on-dark" href="#kontakt">Zarezerwuj</a>
      </div>
    </div>
  </section>
}
```

- [ ] **Step 4: Add branded navigation with focus/scroll lifecycle**

Use `BrandMark` inside the home link. Add `Escape` handling, body-scroll lock while open, focus the first mobile link after opening, and restore focus to the menu button after closing. The home link contract is:

```tsx
<a className="nav-brand" href="#top" aria-label="BusemNaCzas.pl — strona główna">
  <BrandMark />
</a>
```

The button retains `aria-expanded`, `aria-controls="mobile-navigation"`, and the existing Polish open/close labels.

- [ ] **Step 5: Add MobileCta using IntersectionObserver**

```tsx
// src/components/MobileCta.tsx
import { Phone } from 'lucide-react'
import { useEffect, useState } from 'react'
import { siteContent } from '../content'

export function MobileCta() {
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const hero = document.getElementById('hero')
    if (!hero) return
    const observer = new IntersectionObserver(([entry]) => setVisible(!entry.isIntersecting), { threshold: 0.05 })
    observer.observe(hero)
    return () => observer.disconnect()
  }, [])
  if (!visible) return null
  return <div className="mobile-cta" data-testid="mobile-cta">
    <a href={siteContent.phone.href}><Phone />Zadzwoń</a>
    <a href="#kontakt">Zarezerwuj</a>
  </div>
}
```

Update `src/test/setup.ts` so the mocks are controllable:

```ts
let reducedMotion = false
let intersectionCallback: IntersectionObserverCallback | undefined

export function setReducedMotion(value: boolean) { reducedMotion = value }
export function triggerIntersection(isIntersecting: boolean) {
  intersectionCallback?.([{ isIntersecting } as IntersectionObserverEntry], {} as IntersectionObserver)
}

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: query === '(prefers-reduced-motion: reduce)' && reducedMotion,
    media: query,
    onchange: null,
    addListener: () => {}, removeListener: () => {},
    addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => false,
  }),
})

class TestIntersectionObserver {
  readonly root = null
  readonly rootMargin = '0px'
  readonly thresholds = [0]
  constructor(callback: IntersectionObserverCallback) { intersectionCallback = callback }
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return [] }
}
Object.defineProperty(window, 'IntersectionObserver', { writable: true, value: TestIntersectionObserver })
```

Import the two helpers in `App.test.tsx`. Assert the CTA is absent in hero, call `act(() => triggerIntersection(false))`, then expect it to appear.

- [ ] **Step 6: Compose Hero/Nav/MobileCta and pass tests**

Replace the current media-only hero and separate white intro with `<Nav />`, `<Hero />`, and `<MobileCta />`. Run:

```powershell
npm.cmd test -- --run src/App.test.tsx
npm.cmd run build
```

Expected: focused tests PASS; TypeScript/Vite build PASS.

- [ ] **Step 7: Commit hero and navigation**

```powershell
git add src/components/Hero.tsx src/components/MobileCta.tsx src/components/Nav.tsx src/App.tsx src/App.test.tsx src/test/setup.ts
git diff --cached --check
git commit -m "feat: build phone-first cinematic hero"
```

---

### Task 4: Recompose the page around factual conversion flow

**Files:**
- Create: `src/components/ProofRail.tsx`
- Modify: `src/content.ts`
- Modify: `src/App.tsx`
- Modify: `src/App.test.tsx`
- Modify: `src/components/Contact.tsx`
- Modify: `src/components/VehicleShowcase.tsx`
- Delete: `src/components/Testimonials.tsx`

**Interfaces:**
- Produces: `siteContent.proof`, tightened facts, and page order `hero → proof → fleet → pricing → benefits → locations → gallery → services → FAQ → contact`.
- Consumes: existing verified prices, vehicles, equipment, places, services, and FAQs.

- [ ] **Step 1: Write failing factual/order tests**

```tsx
const headings = screen.getAllByRole('heading', { level: 2 }).map((node) => node.textContent)
expect(headings).toEqual([
  'Dwa busy. Pełna swoboda podróży.',
  'Im dłuższa podróż, tym lepsza stawka.',
  'Wszystko, czego potrzeba w trasie.',
  'Blisko początku Twojej trasy.',
  'Gotowy na drogę.',
  'Jeszcze mniej logistyki po Twojej stronie.',
  'Najważniejsze odpowiedzi przed drogą.',
  'Ustalmy termin Twojej podróży.',
])
expect(screen.queryByText('Przykładowe opinie')).not.toBeInTheDocument()
expect(screen.getByText('Od 180 zł / doba')).toBeInTheDocument()
expect(screen.getByText('Galewice')).toBeInTheDocument()
expect(screen.getByText('Łęka Mroczeńska')).toBeInTheDocument()
```

- [ ] **Step 2: Run the test and confirm section-order/placeholder failures**

Run `npm.cmd test -- --run src/App.test.tsx`.

Expected: FAIL because pricing still follows gallery/locations and testimonials still render.

- [ ] **Step 3: Add factual proof data and component**

```ts
// inside siteContent
proof: ['9 miejsc', 'Kategoria B', 'Klimatyzacja', 'OC / AC', 'Manual', 'Od 180 zł / doba'],
```

```tsx
// src/components/ProofRail.tsx
import { Check } from 'lucide-react'
import { siteContent } from '../content'

export function ProofRail() {
  return <section className="proof-rail" aria-label="Najważniejsze informacje">
    <div className="container proof-grid">
      {siteContent.proof.map((item) => <span key={item}><Check aria-hidden="true" />{item}</span>)}
    </div>
  </section>
}
```

- [ ] **Step 4: Reorder App and tighten copy without changing facts**

Remove `Testimonials` import/section. Place pricing immediately after `VehicleShowcase`. Use the exact approved H2 list from Step 1. Preserve all values in `siteContent.vehicles`, `pricing`, `faqs`, `serviceAreas`, and `pickupLocations`. Change vehicle CTA to `Zadzwoń w sprawie tego busa` and link it to `siteContent.phone.href`.

- [ ] **Step 5: Keep contact honest and phone-first**

Keep native required fields. Use this status copy after valid local submission:

```tsx
<p className="form-status full-field" role="status">
  <CheckCircle2 />Dziękujemy. Formularz demonstracyjny nie wysyła wiadomości — zadzwoń pod {siteContent.phone.display}, aby potwierdzić termin.
</p>
```

- [ ] **Step 6: Run focused tests and build**

Run:

```powershell
npm.cmd test -- --run src/App.test.tsx
npm.cmd run build
```

Expected: PASS; no testimonial content appears; facts and new order pass.

- [ ] **Step 7: Commit the page flow**

```powershell
git add src/content.ts src/components/ProofRail.tsx src/components/Contact.tsx src/components/VehicleShowcase.tsx src/App.tsx src/App.test.tsx
git rm src/components/Testimonials.tsx
git diff --cached --check
git commit -m "refactor: focus landing page conversion flow"
```

---

### Task 5: Harden gallery, menu, and reduced-motion accessibility

**Files:**
- Modify: `src/components/Gallery.tsx`
- Modify: `src/components/Nav.tsx`
- Modify: `src/components/VehicleShowcase.tsx`
- Modify: `src/components/Reveal.tsx`
- Modify: `src/App.test.tsx`

**Interfaces:**
- Produces: gallery dialog that autofocuses close, traps Tab, closes with Escape/backdrop/button, and restores trigger focus.
- Consumes: existing gallery image list and `MotionConfig reducedMotion="user"`.

- [ ] **Step 1: Add failing focus-lifecycle tests**

```tsx
const trigger = screen.getByRole('button', { name: 'Powiększ zdjęcie: Szary Renault Trafic z przodu' })
await user.click(trigger)
const close = screen.getByRole('button', { name: 'Zamknij podgląd' })
expect(close).toHaveFocus()
await user.keyboard('{Escape}')
expect(trigger).toHaveFocus()

const menuButton = screen.getByRole('button', { name: 'Otwórz menu' })
await user.click(menuButton)
expect(screen.getByLabelText('Nawigacja mobilna').querySelector('a')).toHaveFocus()
await user.keyboard('{Escape}')
expect(menuButton).toHaveFocus()
```

- [ ] **Step 2: Run tests and confirm focus assertions fail**

Run `npm.cmd test -- --run src/App.test.tsx`.

Expected: FAIL because current dialog/menu do not manage focus.

- [ ] **Step 3: Implement gallery focus ownership**

Add `triggerRefs`, `closeRef`, and `lastActiveIndex`. On open, save the trigger index and focus close in `requestAnimationFrame`. On close, restore the saved trigger. Add a dialog `onKeyDown` that keeps Tab between the close button and any future dialog focusables. Keep Escape and backdrop behavior.

```tsx
const close = () => {
  setActive(null)
  requestAnimationFrame(() => triggerRefs.current[lastActiveIndex.current]?.focus())
}

const trapFocus = (event: React.KeyboardEvent<HTMLDivElement>) => {
  if (event.key === 'Escape') { event.preventDefault(); close(); return }
  if (event.key !== 'Tab') return
  const focusable = [...event.currentTarget.querySelectorAll<HTMLElement>('button, [href], [tabindex]:not([tabindex="-1"])')]
    .filter((element) => !element.hasAttribute('disabled'))
  if (!focusable.length) return
  const first = focusable[0]
  const last = focusable[focusable.length - 1]
  if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus() }
  if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus() }
}
```

The dialog root must be:

```tsx
<div ref={dialogRef} className="lightbox" role="dialog" aria-modal="true" aria-label={active[1]} onKeyDown={trapFocus}>
  <img src={active[0]} alt={active[1]} />
  <button ref={closeRef} type="button" onClick={close} aria-label="Zamknij podgląd">×</button>
</div>
```

- [ ] **Step 4: Complete mobile-menu Escape/focus behavior**

Use refs for the trigger and first mobile link. The menu-close function restores trigger focus only for keyboard/Escape close; anchor clicks close without disrupting native hash focus. Preserve `aria-expanded`, `aria-controls`, and the two Polish labels.

- [ ] **Step 5: Verify reduced motion**

Keep `Reveal` at `{ opacity: 0, y: 20 } → { opacity: 1, y: 0 }`, 0.5 seconds, easing `[0.22,1,0.36,1]`. When `useReducedMotion()` is true, render without initial/viewport animation. In `VehicleShowcase`, set transition duration to `0` when reduced motion is true.

- [ ] **Step 6: Run tests and commit**

```powershell
npm.cmd test -- --run src/App.test.tsx
npm.cmd run build
git add src/components/Gallery.tsx src/components/Nav.tsx src/components/VehicleShowcase.tsx src/components/Reveal.tsx src/App.test.tsx
git diff --cached --check
git commit -m "fix: harden keyboard and motion accessibility"
```

Expected: tests/build PASS; focus assertions pass.

---

### Task 6: Implement the approved visual system and mobile layout

**Files:**
- Create: `src/styles/base.css`
- Create: `src/styles/hero.css`
- Create: `src/styles/sections.css`
- Create: `src/styles/responsive.css`
- Modify: `src/styles.css`
- Modify: `.gitignore`

**Interfaces:**
- Produces: stable selectors already used by Tasks 2–5; no React API changes.
- Consumes: concept A layout, existing brand colors, Inter/Inter Tight loaded by `index.html`.

- [ ] **Step 1: Split the stylesheet entrypoint and ignore companion artifacts**

```css
/* src/styles.css */
@import './styles/base.css';
@import './styles/hero.css';
@import './styles/sections.css';
@import './styles/responsive.css';
```

Append `.superpowers/` and `/work/hero/v4/` to `.gitignore` so the visual companion, supplied source video, and cleaned working logo cannot be committed accidentally.

- [ ] **Step 2: Add exact base tokens and focus contract**

```css
:root {
  color: #111820;
  background: #fff;
  font-family: Inter, sans-serif;
  font-synthesis: none;
  --blue: #0865c5;
  --blue-dark: #064f9c;
  --navy: #0b1822;
  --ink: #111820;
  --muted: #66717b;
  --line: #dfe5ea;
  --soft: #f4f6f7;
  --nav-height: 82px;
  --ease-premium: cubic-bezier(.22,1,.36,1);
}
* { box-sizing: border-box; }
html { scroll-behavior: smooth; scroll-padding-top: calc(var(--nav-height) + 16px); }
body { margin: 0; min-width: 320px; overflow-x: clip; color: var(--ink); background: #fff; }
a { color: inherit; text-decoration: none; }
img, video { display: block; max-width: 100%; }
.container { width: min(1200px, calc(100% - 48px)); margin-inline: auto; }
.skip-link { position: fixed; z-index: 200; left: 16px; top: 12px; transform: translateY(-180%); }
.skip-link:focus { transform: none; }
:focus-visible { outline: 3px solid #58a6ff; outline-offset: 3px; }
```

- [ ] **Step 3: Add hero/navigation composition**

Critical contracts:

```css
.site-nav { position: fixed; z-index: 50; inset: 0 0 auto; height: var(--nav-height); color: #fff; transition: background .3s, color .3s, box-shadow .3s; }
.site-nav--scrolled, .site-nav--open { color: var(--ink); background: rgba(255,255,255,.96); box-shadow: 0 10px 36px rgba(11,24,34,.08); backdrop-filter: blur(16px); }
.nav-brand { width: clamp(158px, 15vw, 210px); min-height: 44px; padding: 8px 12px; display: flex; align-items: center; border-radius: 10px; background: #fff; }
.hero { position: relative; min-height: max(680px, calc(100svh - var(--nav-height))); overflow: hidden; isolation: isolate; color: #fff; background: var(--navy); }
.hero-poster, .hero-video, .hero-shade { position: absolute; inset: 0; width: 100%; height: 100%; }
.hero-poster img, .hero-video { width: 100%; height: 100%; object-fit: cover; object-position: 56% center; }
.hero-shade { z-index: 1; background: linear-gradient(90deg, rgba(4,11,17,.93) 0%, rgba(4,11,17,.62) 42%, rgba(4,11,17,.06) 74%), linear-gradient(0deg, rgba(4,9,14,.58), transparent 48%); }
.hero-content { position: relative; z-index: 2; min-height: inherit; padding-top: calc(var(--nav-height) + 120px); padding-bottom: 72px; display: flex; flex-direction: column; justify-content: flex-end; align-items: flex-start; }
.hero-content h1 { max-width: 720px; margin: 14px 0 20px; font: 650 clamp(54px,6vw,88px)/.94 'Inter Tight',sans-serif; letter-spacing: -.06em; text-wrap: balance; }
.hero-lead { max-width: 560px; margin: 0; color: #d9e0e6; font-size: 17px; line-height: 1.55; }
.hero-actions { display: flex; gap: 12px; margin-top: 30px; }
```

- [ ] **Step 4: Recompose all section surfaces without repeated card styling**

Implement these exact layout contracts in `sections.css`:

- `.proof-grid`: six equal desktop columns with thin separators; two columns/three rows on mobile.
- `.section`: 112px desktop vertical padding, 72px mobile.
- `.section-heading`: max-width 760px; H2 uses `clamp(40px,5vw,68px)` and line-height `1`.
- `.vehicle-grid`: 3:2 media/content grid desktop, one column mobile; preserve tabs/arrows.
- `.pricing-grid`: four columns desktop, two tablet, one phone; recommended tier uses blue top rule, not scale.
- `.benefit-grid`: three columns with shared hairline grid, no independent floating shadows.
- `.locations-grid`: 0.8fr/1.2fr desktop, one column phone; map height 520px desktop/360px phone.
- `.gallery-grid`: three equal columns desktop, two phone; square tiles and visible close button.
- `.service-row`: shared-rule list, not detached cards.
- `.faq-grid`: 0.8fr/1.2fr desktop and one column mobile.
- `.contact-section`: navy background with white text; 0.85fr/1.15fr desktop and one column mobile.
- `.footer-top`: brand, anchors, phone in three columns; stacked mobile.

Keep border radii between 10px and 18px, shadows below `rgba(11,24,34,.10)`, and brand blue limited to actions/active/focus states.

```css
.section { padding-block: 112px; }
.section-heading { max-width: 760px; margin-bottom: 48px; }
.section-heading h2 { margin: 0; font: 650 clamp(40px,5vw,68px)/1 'Inter Tight',sans-serif; letter-spacing: -.045em; text-wrap: balance; }
.proof-grid { display: grid; grid-template-columns: repeat(6,1fr); }
.proof-grid > * { min-height: 76px; display: flex; align-items: center; justify-content: center; gap: 8px; border-inline-start: 1px solid var(--line); }
.vehicle-grid { display: grid; grid-template-columns: 3fr 2fr; gap: clamp(40px,6vw,88px); align-items: center; }
.pricing-grid { display: grid; grid-template-columns: repeat(4,1fr); border-block: 1px solid var(--line); }
.price-card { border-inline-start: 1px solid var(--line); border-radius: 0; box-shadow: none; }
.price-card.is-recommended { border-top: 4px solid var(--blue); }
.benefit-grid { display: grid; grid-template-columns: repeat(3,1fr); border: 1px solid var(--line); }
.benefit-grid > * { border-inline-end: 1px solid var(--line); border-bottom: 1px solid var(--line); }
.locations-grid, .faq-grid { display: grid; grid-template-columns: .8fr 1.2fr; gap: clamp(40px,6vw,88px); }
.locations-map { min-height: 520px; }
.gallery-grid { display: grid; grid-template-columns: repeat(3,1fr); gap: 12px; }
.gallery-grid img { aspect-ratio: 1; width: 100%; object-fit: cover; }
.service-row { display: grid; grid-template-columns: 1fr auto; gap: 24px; padding-block: 24px; border-top: 1px solid var(--line); }
.contact-section { color: #fff; background: var(--navy); }
.contact-grid { display: grid; grid-template-columns: .85fr 1.15fr; gap: clamp(40px,7vw,96px); }
.footer-top { display: grid; grid-template-columns: 1fr auto auto; gap: 48px; align-items: start; }
```

- [ ] **Step 5: Add phone, short-landscape, reduced-motion, and high-contrast rules**

```css
@media (max-width: 680px) {
  :root { --nav-height: 68px; }
  .container { width: min(100% - 32px, 1200px); }
  .hero { min-height: 100svh; min-height: 100dvh; }
  .hero-poster img, .hero-video { object-position: 58% center; }
  .hero-shade { background: linear-gradient(180deg, rgba(4,11,17,.52), transparent 32%, rgba(4,11,17,.22) 50%, rgba(4,9,14,.95) 88%); }
  .hero-content { padding-top: 104px; padding-bottom: calc(28px + env(safe-area-inset-bottom)); }
  .hero-content h1 { max-width: 11ch; font-size: clamp(42px,13vw,58px); }
  .hero-lead { max-width: 34ch; font-size: 14px; }
  .hero-actions { width: 100%; display: grid; grid-template-columns: 1.08fr .92fr; }
  .hero-actions .button { min-width: 0; min-height: 50px; padding-inline: 12px; }
  .mobile-cta { padding-bottom: calc(10px + env(safe-area-inset-bottom)); }
  .section { padding-block: 72px; }
  .proof-grid { grid-template-columns: repeat(2,1fr); }
  .vehicle-grid, .locations-grid, .faq-grid, .contact-grid, .footer-top { grid-template-columns: 1fr; }
  .pricing-grid { grid-template-columns: 1fr; }
  .benefit-grid { grid-template-columns: 1fr; }
  .locations-map { min-height: 360px; }
  .gallery-grid { grid-template-columns: repeat(2,1fr); }
}
@media (min-width: 681px) and (max-width: 1024px) { .pricing-grid { grid-template-columns: repeat(2,1fr); } }
@media (max-height: 500px) and (orientation: landscape) {
  .hero { min-height: 520px; }
  .hero-content { padding-top: 100px; padding-bottom: 28px; }
  .hero-content h1 { max-width: 620px; font-size: 46px; }
  .hero-lead { display: none; }
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { animation-duration: .01ms !important; animation-iteration-count: 1 !important; transition-duration: .01ms !important; }
}
@media (forced-colors: active) {
  .button, .nav-brand, .price-card, .faq-item { border: 1px solid CanvasText; }
}
```

- [ ] **Step 6: Run build and inspect CSS regressions**

Run:

```powershell
npm.cmd test -- --run src/App.test.tsx
npm.cmd run build
```

Expected: PASS; no missing CSS import; no TypeScript errors.

- [ ] **Step 7: Commit visual system**

```powershell
git add .gitignore src/styles.css src/styles/base.css src/styles/hero.css src/styles/sections.css src/styles/responsive.css
git diff --cached --check
git commit -m "style: apply cinematic responsive design system"
```

---

### Task 7: Verify the complete desktop/mobile experience and close defects

**Files:**
- Modify as defects require: `src/**/*.tsx`, `src/**/*.css`, `tools/hero/**/*.mjs`
- Produce: `output/hero-production/final-browser-audit.md`

**Interfaces:**
- Consumes: production build, `v4` media manifest, browser viewport matrix.
- Produces: evidence-backed completion report with screenshots, console/network state, and remaining limitations.

- [ ] **Step 1: Run all automated gates**

```powershell
npm.cmd run test:hero
npm.cmd run hero:v4:verify
npm.cmd test -- --run src/App.test.tsx
npm.cmd run build
```

Expected: all commands exit 0. Confirm tests actually assert `v4`, no-loop, phone-first CTA, mobile CTA observer, section order, and focus lifecycle.

- [ ] **Step 2: Start production-like preview**

```powershell
npm.cmd run preview -- --host 127.0.0.1
```

Use the emitted localhost URL. Do not validate only against Vite dev mode.

- [ ] **Step 3: Capture the required viewport matrix**

For each global-constraint viewport, capture the first screen and one full-page screenshot. Record:

```text
viewport | hero crop | logo | nav | H1/CTA | overflow | sticky CTA | result
```

At 390×844 compare directly to approved concept A. At 844×390 verify reduced hero copy and no occlusion. At 320px width perform an additional overflow smoke check even though it is below the main screenshot matrix.

- [ ] **Step 4: Verify interaction and accessibility manually**

Keyboard-only sequence must reach skip link, logo, nav, hero phone, reservation, vehicle tabs, gallery, FAQ, form, and footer in logical order. Verify:

- mobile menu opens, traps/contains focus, closes with Escape, and restores focus;
- gallery opens with close focused, traps Tab, closes three ways, and restores trigger focus;
- FAQ announces `aria-expanded` state;
- phone links use exact `tel:+48514574594`;
- 200% zoom has no lost content or horizontal page scrolling;
- reduced motion shows poster only and removes entrances;
- emulated `saveData=true` shows poster only;
- forced media failure leaves poster, logo, copy, and actions intact.

- [ ] **Step 5: Verify console, network, and performance**

Confirm zero console errors and zero failed first-party requests. Inspect the network to prove the selected mobile source is not the desktop encode at ≤680px. Run mobile Lighthouse accessibility/best-practices snapshot and fix critical/serious accessibility findings. Confirm media byte sizes against `v4-export-manifest.json`.

- [ ] **Step 6: Fix discovered defects one at a time**

For each defect: add or strengthen the smallest relevant automated assertion when feasible, reproduce it, patch only its owning file, rerun the focused test, then recapture the affected viewport. Do not bundle unrelated polish into one fix.

- [ ] **Step 7: Write the final audit artifact**

Create `output/hero-production/final-browser-audit.md` with:

```markdown
# Final Browser Audit

## Automated gates
- test:hero: PASS
- hero:v4:verify: PASS
- App.test.tsx: PASS
- build: PASS

## Viewports
| Viewport | Hero | Logo | CTA | Overflow | Result |
| --- | --- | --- | --- | --- | --- |

## Accessibility
- Keyboard path: PASS
- Reduced motion: PASS
- 200% zoom: PASS

## Network and media
- Console errors: 0
- Failed first-party requests: 0
- Mobile source selection: PASS
- Byte budgets: PASS

## Limitations
- Contact form remains an honest local demonstration until a delivery endpoint is configured.
```

Fill every viewport row with observed evidence and add the exact integer Lighthouse accessibility score under Accessibility. Do not write the audit until the value is measured.

- [ ] **Step 8: Commit verified defect fixes and audit**

```powershell
git add output/hero-production/final-browser-audit.md
git diff --cached --check
git commit -m "test: verify responsive landing experience"
```

Commit every discovered defect immediately after its focused verification, staging only the exact owning source/test files. Before each commit, inspect `git diff --cached --name-only` and unstage generated intermediates, `.superpowers`, `work/hero`, or unrelated user files.

---

## Final Completion Gate

Do not declare completion until all explicit acceptance criteria in `docs/superpowers/specs/2026-07-17-responsive-cinematic-site-refactor-design.md` have direct evidence in source, test output, media manifest, and browser audit. A green build alone is insufficient.
