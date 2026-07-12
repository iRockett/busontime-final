# Hero Video Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hero image with an enhanced, full-frame, accessible background video.

**Architecture:** Produce one optimized MP4 asset, render it with native HTML video, and retain current image as poster and reduced-motion fallback. CSS owns cover behavior and viewport framing.

**Tech Stack:** React, TypeScript, CSS, FFmpeg, Vitest, Vite.

## Global Constraints

- No black bars.
- No audio track.
- Preserve current hero size.
- No new runtime dependency.

---

### Task 1: Regression test

**Files:**
- Modify: `src/App.test.tsx`

- [ ] Add assertions for autoplay, muted, loop, playsInline, poster, and MP4 source.
- [ ] Run focused test and confirm failure before markup exists.

### Task 2: Enhanced video asset

**Files:**
- Create: `public/assets/busemnaczas-hero.mp4`

- [ ] Encode source at 1920×1080 using Lanczos scaling, mild unsharp filtering, H.264 CRF 19, `yuv420p`, fast start, and no audio.
- [ ] Verify codec, dimensions, duration, pixel format, and missing audio stream with FFprobe.

### Task 3: Hero integration

**Files:**
- Modify: `src/App.tsx`
- Modify: `src/styles.css`

- [ ] Replace picture markup with semantic video plus poster fallback.
- [ ] Apply cover sizing, centered crop, 1.015 scale, and reduced-motion poster fallback.
- [ ] Preserve desktop and mobile hero heights.

### Task 4: Verification

**Files:**
- Test: `src/App.test.tsx`
- Test: `src/content.test.ts`

- [ ] Run full Vitest suite.
- [ ] Run production build.
- [ ] Verify desktop and mobile hero framing in live browser with no console errors or overflow.
