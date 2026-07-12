# BusemNaCzas.pl Landing Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a premium, responsive and conversion-focused Polish landing page for 9-seat Renault Trafic rentals.

**Architecture:** React + Vite with section-focused components, centralized content data, shared motion primitives and small stateful widgets for vehicles, gallery, testimonials, FAQ and contact. Tailwind supplies layout tokens; tests exercise content fidelity and interaction behavior.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, Framer Motion, Lenis, Lucide React, Vitest, Testing Library.

## Global Constraints

- Use supplied PDF facts and the supplied hero image.
- Keep the palette 80% white, 15% black, 5% blue; no large gradients or full blue sections.
- Use Inter Tight headings and Inter body text.
- Respect reduced motion and WCAG AA.
- Placeholder testimonials must be explicitly marked in source data.

---

### Task 1: Project foundation and content contract

**Files:** create `package.json`, Vite/Tailwind/TypeScript configs, `src/content.ts`, `src/content.test.ts`, and project assets.

**Interfaces:** `siteContent` exports navigation, vehicles, pricing, locations, FAQ and placeholder testimonials.

- [ ] Write tests asserting phone, vehicle specs, pricing, locations and placeholder flags.
- [ ] Run `npm test -- --run` and confirm failure because `src/content.ts` does not exist.
- [ ] Add project configuration, content data and optimized hero asset.
- [ ] Run the content test and confirm it passes.

### Task 2: Page shell and editorial sections

**Files:** create `src/main.tsx`, `src/App.tsx`, `src/styles.css`, `src/components/Layout.tsx`, `src/components/Sections.tsx`, `src/App.test.tsx`.

**Interfaces:** `App` renders semantic anchored sections from `siteContent`; `Reveal` provides reduced-motion-safe entrances.

- [ ] Write a failing render test for H1, navigation, prices, trust signals and contact CTA.
- [ ] Run the test and confirm the missing `App` failure.
- [ ] Implement navigation, hero, quick facts, vehicles, benefits, locations, pricing, services and footer.
- [ ] Run tests and confirm they pass.

### Task 3: Conversion interactions

**Files:** create `src/components/VehicleShowcase.tsx`, `Gallery.tsx`, `Testimonials.tsx`, `Faq.tsx`, `Contact.tsx`; extend `src/App.test.tsx`.

**Interfaces:** components own only local UI state; reservation actions lead to `#kontakt`; phone actions use `tel:+48514574594`.

- [ ] Write failing interaction tests for vehicle switching, FAQ disclosure, gallery dialog and contact confirmation.
- [ ] Run tests and confirm expected failures.
- [ ] Implement accessible controls, keyboard behavior and form validation.
- [ ] Run tests and confirm they pass.

### Task 4: SEO, motion and verification

**Files:** create `index.html`, `public/robots.txt`, `public/sitemap.xml`; refine styles and responsive behavior.

**Interfaces:** metadata and JSON-LD describe the rental service without inventing unknown business facts.

- [ ] Add metadata/schema and run the full test suite.
- [ ] Run `npm run build` and correct all build errors.
- [ ] Start the app; verify navigation, gallery, FAQ, form, desktop and 390px mobile views in-browser.
- [ ] Capture screenshots and compare them with the accepted concept using image inspection; fix any material drift.
