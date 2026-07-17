# BusemNaCzas.pl Responsive Cinematic Site Refactor

**Date:** 2026-07-17

**Status:** Approved direction

**Selected concept:** A — Cinematic conversion layer

**Primary mobile action:** `Zadzwoń`

**Copy policy:** Tighten Polish copy while preserving every verified business fact

## Supersession

This design supersedes `2026-07-17-bolt-hero-recreation-design.md` for the current implementation. That earlier document required the page outside the hero to remain unchanged. The current user request explicitly authorizes a full-site refactor and selects an over-video conversion hero.

The older deterministic animated-artwork specifications and the existing `hero-v3.*` pipeline remain historical references. The supplied `van_16x9_upscaled_1080p.mp4` is now the visual source of truth for the new hero.

## Objective

Refactor the complete React/Vite landing page into one coherent, premium automotive rental experience. The hero is the visual and conversion thesis: a supplied road film, legible Polish service copy, a prominent brand mark, and immediate phone contact. The remaining page should continue that hierarchy rather than feel like unrelated cards appended below a video.

The result must work intentionally on mobile devices. Mobile is not a compressed desktop layout; it receives its own media crop, copy length, navigation behavior, safe-area handling, CTA behavior, and verification matrix.

## Non-Negotiable Requirements

- Use the supplied 1920 × 1080, 5.08-second video as the only hero-motion source.
- Do not use AI video, generative fill, scene extension, or invented vehicle imagery.
- Use the supplied logo artwork, but never display its baked checkerboard background.
- Keep `+48 514 574 594` and `tel:+48514574594` exact.
- Preserve all verified vehicle, pricing, pickup, service-area, mileage, insurance, and equipment facts.
- Tighten copy for clarity; do not invent availability, reviews, urgency, deposits, legal terms, or other business claims.
- Preserve keyboard access, labels, semantic landmarks, focus visibility, reduced-motion support, and honest demo-only form behavior.
- Avoid horizontal overflow and obscured content at all supported viewports.

## Visual Direction

The page uses a calm automotive palette: deep blue-black for the hero and contact close, true white for primary information, soft cool grey for supporting sections, and the existing brand blue for actions and active states. Typography remains `Inter Tight` for display and `Inter` for body/UI to preserve current brand continuity.

Premium character comes from the road film, disciplined typography, exact spacing, thin rules, and fewer stronger compositions. The refactor must avoid generic rental-template patterns: decorative gradients, excessive rounded cards, fake statistics, floating glass panels, oversized icons, and scattered animation.

## Information Architecture

The page order becomes:

1. Fixed navigation and cinematic conversion hero.
2. One compact proof rail: 9 miejsc, kategoria B, klimatyzacja, OC/AC, manual, cena od 180 zł/doba.
3. Vehicle showcase for the two Renault Trafic LONG vans.
4. Pricing placed earlier, immediately after the fleet.
5. Benefits and practical rental conditions.
6. Pickup locations and service area.
7. Gallery with accessible lightbox.
8. Additional services.
9. FAQ.
10. Contact section with phone-first hierarchy and honest local form confirmation.
11. Compact footer with full brand lockup and essential links.

The current placeholder testimonials are removed from the public flow until verified reviews exist. The duplicated hero trust row and quick-feature rail are consolidated into one proof rail.

## Hero Structure

The hero remains owned by `src/App.tsx` and `public/assets`, following repository contracts. It contains four layers in one stable layout box:

1. Responsive poster picture.
2. Responsive video sources.
3. Directional contrast treatment that protects the text zone.
4. Semantic hero content and actions.

The video is decorative. The hero's H1, supporting copy, phone link, reservation link, and proof points remain real DOM content.

### Desktop

- Hero min-height is `max(680px, calc(100svh - var(--nav-height)))`; content padding prevents clipping on shorter desktop windows.
- Video fills the surface without bars or stretching.
- Van remains the dominant subject in the center-right field.
- A restrained left-to-right dark treatment protects the copy without making the film look filtered.
- Brand wordmark sits at the upper-left inside the navigation safe zone in an intentional white capsule.
- Desktop navigation stays readable over the film, then transitions to an opaque white header after scrolling.
- Hero H1 uses the clear service proposition: `Wynajem 9-osobowych Renault Trafic`.
- Supporting copy states the LONG format, local service area, and short-/long-term rental without invented claims.
- Primary button is the phone link. Secondary button scrolls to the contact/reservation section.
- Compact proof pills remain subordinate to the two actions.

### Mobile

- Target composition is validated first at 390 × 844, then at the complete viewport matrix.
- Hero uses `100svh`/`100dvh` carefully, with safe-area padding and a minimum-height fallback for short screens.
- A dedicated portrait derivative frames the vehicle intentionally; browser-side cover cropping is not the only mobile strategy.
- Logo capsule stays top-left; menu button stays top-right. Neither overlaps the vehicle, copy, or device cutout area.
- Copy sits in the lower protected zone with a stronger bottom gradient.
- Mobile uses the same H1 copy as desktop, with breakpoint-specific line wrapping and type scale rather than alternate hidden wording.
- Primary `Zadzwoń` and secondary `Zarezerwuj` controls are at least 48px high and fit without wrapping.
- Proof items use a horizontal clipped/scrollable row only when necessary; they never force page overflow.
- Existing fixed mobile CTA is hidden while hero actions are visible and appears only after the hero leaves the viewport. It includes bottom safe-area padding.
- Short landscape phones receive a reduced hero height and simpler copy arrangement rather than a full-height crop.

## Hero Media Contract

The supplied file is already a flattened moving image. A new deterministic source-video preparation path will create web derivatives without altering scene content.

Logical outputs:

- `hero-v4.mp4` — desktop H.264, silent, fast-start.
- `hero-v4.webm` — desktop WebM fallback/preference where supported.
- `poster-v4.webp` and `poster-v4.jpg` — desktop poster.
- `mobile-v4.mp4` — intentional portrait crop, silent, fast-start.
- `mobile-v4.webm` — mobile WebM where output quality and browser support are acceptable.
- `mobile-v4.webp` — mobile poster.

The current video has visibly different start and end compositions. It will play once and hold its final frame rather than expose a jump through continuous looping. No fake ping-pong motion or ghosted crossfade is introduced. Playback starts muted, inline, and automatically when allowed.

Use `preload="metadata"`. Poster stays behind the video so autoplay failure still produces a complete hero. Reduced-motion and data-saving users receive the poster without autoplay. Video failure must not collapse the hero or hide essential content.

Media preparation remains offline and deterministic. Tests must validate dimensions, duration, codec/container expectations, missing audio, and file-size budgets. Target maxima are 4 MB for desktop MP4, 3 MB for desktop WebM, 2.2 MB for mobile MP4, 1.8 MB for mobile WebM, and 250 KB for each poster. Generated reports remain under `output/hero-production`; browser assets remain under `public/assets`.

## Logo Treatment

The attached 1448 × 1086 PNG is RGB and its checkerboard is baked into the pixels. It must not be used raw.

Create two faithful derivatives from the supplied artwork:

- A compact wordmark lockup for navigation and hero use.
- A full lockup for the footer.

Background cleanup must preserve the exact black, white, and blue artwork, lettering, vehicle silhouette, and proportions. Do not generatively redraw or reinterpret the mark. Validate edges against both dark and white backgrounds. Export transparent WebP/PNG assets with explicit intrinsic dimensions.

The hero/navigation wordmark sits in a small white capsule because this gives reliable contrast over every video frame and matches the approved mockup. The capsule is part of the interface, not baked into the video. The full lockup remains larger in the footer.

## Site-Wide Refactor

### Navigation

- Add the compact wordmark at the left.
- Preserve anchor labels and mobile menu behavior.
- Keep phone access and reservation action on desktop.
- Use a predictable transparent-to-white scroll state.
- Lock body scroll while the mobile menu is open and return focus correctly when it closes.

### Proof Rail

- Replace duplicate trust/feature groups with one concise rail.
- Use short factual labels and restrained separators.
- On mobile, use a two-column, three-row grid with readable labels; do not introduce horizontal page scrolling.

### Fleet

- Retain the two-vehicle selector and all verified specifications.
- Improve image framing and reduce nested-card appearance.
- Keep tab semantics and keyboard operation.
- Keep motion subtle and disabled under reduced motion.

### Pricing

- Move pricing directly after the fleet.
- Preserve every current price, duration, limit, and note.
- Make the recommended tier clear without fake scarcity.
- Keep phone/contact actions immediately available.

### Benefits, Locations, Gallery, Services, FAQ

- Recompose these sections using stronger grids, fewer boxed cards, and consistent heading rhythm.
- Preserve map title, locations, service areas, gallery alt text, lightbox behavior, service prices, and FAQ facts.
- Gallery dialog must trap/restore focus and close by button, Escape, or backdrop.
- Map stays lazy-loaded and must not dominate mobile performance.

### Contact and Footer

- Phone remains the strongest contact path.
- Secondary reservation link scrolls to the contact form.
- Required fields and status announcement remain accessible.
- The form must continue to state truthfully that it is a local/demo confirmation until a real delivery endpoint is configured.
- Footer uses the full logo lockup, phone, core anchors, copyright, privacy label, and map link.

## Copy Rules

- Polish copy may be shortened, reordered, and made more conversational.
- Facts in `src/content.ts` remain authoritative.
- Do not change numeric values, place names, equipment, service prices, phone number, or rental limits without new source evidence.
- Use direct local language, not luxury-car clichés.
- Avoid `najlepszy`, `natychmiast`, `zawsze dostępny`, unsupported review claims, and fabricated urgency.
- Keep one descriptive H1 and clear H2 section hierarchy.

## Motion System

Motion personality is premium and controlled:

- Hero film is the main motion event.
- Content entrances use small distance and opacity with one consistent easing.
- Hover feedback stays below 150ms; section entrances remain below 600ms.
- No parallax, bounce, cursor effects, spinning icons, or infinite DOM animation.
- `prefers-reduced-motion: reduce` removes nonessential movement and prevents hero playback.
- Lenis must not interfere with focus movement, anchor navigation, or reduced-motion behavior.

## Component and Data Boundaries

- `src/content.ts` remains the single factual content source.
- `src/App.tsx` owns page composition and hero media mapping.
- `src/components/Nav.tsx` owns navigation and mobile menu state.
- Existing focused components continue to own fleet, gallery, FAQ, and contact interactions.
- A small hero component may be extracted if it reduces `App.tsx` complexity, but it must not introduce a state library or media abstraction layer.
- Media output paths use one immutable configuration object or colocated constants.
- Update the child `AGENTS.md` contracts for `public/assets` and `tools/hero` so the new `v4` source-video path does not falsely inherit `v3`-only four-second/static-region rules.
- No CMS, booking engine, analytics SDK, or backend is added in this refactor.

## Failure and Loading Behavior

- Poster is visible before first decoded video frame.
- Autoplay rejection leaves poster, logo, content, and actions intact.
- Media decode/source failure leaves the same complete static hero.
- Slow networks do not block semantic content or navigation.
- Missing map or gallery image does not remove contact paths.
- Contact form validation uses native controls and an announced status.
- No JavaScript exception may leave navigation or primary phone link unusable.

## Accessibility Requirements

- One H1 and logical heading order.
- Skip link to main content.
- Native links and buttons; no click-only `div` controls.
- Visible `:focus-visible` states against dark and light surfaces.
- Minimum 24 × 24px WCAG 2.2 targets; primary mobile actions target 48px or larger.
- Sufficient contrast across every sampled hero frame.
- Decorative video hidden from assistive technology; logo has concise brand alt text only where it is the active home link.
- Mobile navigation and gallery dialog manage focus and Escape correctly.
- Layout remains usable at 200% zoom and with Windows high contrast where practical.

## Verification Strategy

### Automated

- Add a failing test before changing hero production behavior.
- Update `src/App.test.tsx` for the new hero asset names, no-loop contract, primary phone CTA, secondary reservation CTA, logo link, poster, and mobile source.
- Add focused tests for mobile CTA visibility state, mobile menu focus behavior, gallery focus restoration, and factual copy preservation.
- Run `npm test -- --run src/App.test.tsx`.
- Run `npm run build`.
- Extend and run hero source-video verification through the repository's `tools/hero` ownership boundary.

### Browser

Verify at minimum:

- 360 × 640
- 375 × 667
- 390 × 844
- 412 × 915
- 430 × 932
- 844 × 390 landscape
- 768 × 1024 tablet
- 1024 × 768
- 1440 × 900
- 1920 × 1080

For each relevant viewport, inspect first screen, navigation, CTA reachability, media crop, logo clarity, section flow, and horizontal overflow. Also verify reduced motion, 200% zoom, keyboard-only navigation, autoplay rejection/static fallback, console errors, and failed media requests.

## Acceptance Criteria

- Approved cinematic concept A is recognizable on desktop and mobile.
- Supplied video is the only hero-motion source.
- Logo is clean, readable, checkerboard-free, and positioned upper-left in the approved white capsule.
- `Zadzwoń` is the primary mobile action; `Zarezerwuj` remains secondary.
- Mobile hero composition is intentional at every listed phone viewport.
- No action, logo, copy, or menu collides with safe areas or sticky UI.
- No horizontal overflow exists from 320px upward.
- Video does not expose an abrupt loop seam because it plays once and holds.
- Reduced-motion and autoplay-failure states remain complete and attractive.
- Pricing, vehicles, locations, service areas, equipment, phone number, and limits match source facts.
- Placeholder testimonials are not presented as real customer reviews.
- Navigation, vehicle tabs, gallery, FAQ, phone links, reservation anchor, and contact validation work by keyboard and pointer.
- Targeted tests, hero verification, and production build pass.
- Desktop and mobile screenshots receive final visual comparison against the approved mockup.

## Explicit Non-Goals

- No booking backend or payment system.
- No email delivery integration without endpoint credentials/configuration.
- No CMS or admin panel.
- No invented reviews, urgency, availability, or legal terms.
- No AI-generated vehicle/video content or generative scene extension.
- No visual imitation of generic SaaS or luxury-supercar templates.
