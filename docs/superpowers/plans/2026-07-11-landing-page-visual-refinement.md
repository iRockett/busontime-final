# Landing Page Visual Refinement Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refine navigation, hero framing, intro typography, vehicle copy, and vehicle photography while preserving the current premium layout.

**Architecture:** Keep current React component structure. Apply responsive design changes through existing CSS selectors, update one content heading, and render vehicle photography as a sharp contained foreground over an image-derived full-bleed background.

**Tech Stack:** React 19, TypeScript, Vite 6, CSS, Vitest, Testing Library.

## Global Constraints

- Preserve existing page height, primary CTA placement, and responsive stacking.
- Keep whole vehicle visible without empty bands.
- Use no new runtime dependency.
- Preserve WCAG AA and reduced-motion behavior.

---

### Task 1: Regression coverage and copy

**Files:**
- Modify: `src/App.test.tsx`
- Modify: `src/App.tsx`

**Interfaces:**
- Consumes: existing landing page render test.
- Produces: revised vehicle-section heading.

- [ ] **Step 1: Update test expectation**

Assert the page renders `Dwa busy. Pełna swoboda podróży.` and no longer renders the old heading.

- [ ] **Step 2: Run test and verify failure**

Run `pnpm exec vitest run src/App.test.tsx`.
Expected: one assertion fails because old heading remains.

- [ ] **Step 3: Update heading copy**

Replace `Dwa Trafiki. Jeden standard podróży.` with `Dwa busy. Pełna swoboda podróży.`.

- [ ] **Step 4: Run focused test**

Run `pnpm exec vitest run src/App.test.tsx`.
Expected: PASS.

### Task 2: Navigation, hero, and intro layout

**Files:**
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `.nav-inner`, `.desktop-nav`, `.hero-full-media`, `.intro-grid`, `.hero-subtitle`, `.hero-body`.
- Produces: centered desktop nav, slightly zoomed-out hero, wider heading column, responsive typography.

- [ ] **Step 1: Center desktop navigation**

Use absolute centering at desktop widths while retaining phone and CTA on the right. Reset positioning below the desktop breakpoint.

- [ ] **Step 2: Zoom hero out**

Use `object-fit: contain` for the sharp hero image over an image-derived cover background. Keep logo in the source image; its best location remains left-center because it balances the van on the right. Reduce its perceived size through the contained framing.

- [ ] **Step 3: Refine intro columns**

Set the left column to approximately 56%, cap heading width near 573px, keep two-line wrap, use a slightly tighter fluid heading size, set subtitle to `clamp(24px, 2.18vw, 27.35px)`, and body to 17px.

- [ ] **Step 4: Check responsive overrides**

Confirm mobile remains single-column, thumb-friendly, and free of horizontal overflow.

### Task 3: Vehicle image framing

**Files:**
- Modify: `src/components/VehicleShowcase.tsx`
- Modify: `src/styles.css`

**Interfaces:**
- Consumes: `vehicle.image` string.
- Produces: `.vehicle-media-bg` decorative background and `.vehicle-media-image` semantic foreground.

- [ ] **Step 1: Add layered media markup**

Render a background `<span aria-hidden="true">` using `backgroundImage: url(vehicle.image)` and keep one semantic `<img>` with existing alt text.

- [ ] **Step 2: Add full-frame CSS**

Use cover + blur for background, contain + centered padding for foreground, `isolation: isolate`, and restrained overlay. Limit hover scale to 1.015.

- [ ] **Step 3: Verify both vehicle tabs**

Confirm brown and steel images switch, remain centered, and show complete vans at desktop and mobile widths.

### Task 4: Full verification

**Files:**
- Test: `src/App.test.tsx`
- Test: `src/content.test.ts`

**Interfaces:**
- Consumes: completed UI changes.
- Produces: verified production build.

- [ ] **Step 1: Run full tests**

Run `pnpm exec vitest run`.
Expected: 7 tests pass.

- [ ] **Step 2: Run build**

Run `npm run build`.
Expected: exit code 0.

- [ ] **Step 3: Live browser QA**

At `http://localhost:5173/`, verify centered nav, complete hero image, exact intro typography, revised heading, complete vehicle image, both tabs, no console errors, and no horizontal overflow.
