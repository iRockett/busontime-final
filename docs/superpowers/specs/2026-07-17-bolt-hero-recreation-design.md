# BusemNaCzas.pl Bolt Hero Recreation Design

## Goal

Recreate the current BusemNaCzas.pl landing page in Bolt.new without redesigning it. Preserve the existing Polish content, component order, interaction model, accessibility behavior, typography, colors, spacing, and conversion paths. Replace only the hero-media presentation with the supplied clean 1920 x 1080 video and supplied brand mark, adapted for reliable desktop and mobile rendering.

## Source of Truth

- Current repository UI and CSS are canonical.
- Video source: `van_16x9_upscaled_1080p.mp4`, 1920 x 1080, H.264, 5.08 seconds, silent hero use.
- Logo source: `ChatGPT Image 17 lip 2026, 01_21_51 (1).png`, 1448 x 1086.
- Existing site copy, data, assets, links, and accessibility behavior must not be rewritten or invented.
- Current hero structure remains media-only; the H1, supporting copy, trust signals, and primary CTAs remain in the white section below it.

## Chosen Approach

Use a hybrid responsive hero:

1. Keep the logo as an independent responsive DOM overlay rather than burning it into the video.
2. Use the supplied 16:9 video as the desktop master.
3. Produce a dedicated mobile derivative from the same video so mobile framing is intentional rather than a browser-generated full-height crop.
4. Generate matching desktop and mobile posters from their first visible frames.
5. Preserve the current reduced-motion fallback by hiding video and showing the matching poster.

This approach keeps the logo sharp, permits breakpoint-specific placement, avoids destructive re-encoding when logo position changes, and prevents the van from being severely cropped on portrait screens.

## Logo Preparation

The supplied PNG does not contain transparency; the visible checkerboard is baked into its RGB pixels. It must not be placed directly over the video.

Create a clean transparent brand asset before Bolt integration:

- Reconstruct or trace the mark with clean antialiased edges.
- Preserve the original black, white, and blue brand colors and proportions.
- Remove every checkerboard pixel and grey fringe.
- Export `busemnaczas-logo-hero.svg` as the preferred overlay.
- Export `busemnaczas-logo-hero.webp` as a transparent fallback.
- Add a restrained outline or shadow only when needed for contrast; do not place the mark in an opaque card.
- Keep the accessible brand name available in markup even if the overlay image is decorative.

Bolt receives the finished transparent assets. Bolt is not responsible for automatic background removal.

## Media Outputs

Prepare and upload these exact logical assets:

- `hero-desktop.mp4`: H.264, 1920 x 1080, web optimized, fast-start.
- `hero-desktop.webm`: VP9 or AV1-compatible WebM where Bolt supports it.
- `hero-desktop-poster.webp`: first-frame-matched 1920 x 1080 poster.
- `hero-mobile.mp4`: H.264 mobile derivative, target 1080 x 1350.
- `hero-mobile.webm`: WebM equivalent of the mobile derivative.
- `hero-mobile-poster.webp`: first-frame-matched 1080 x 1350 poster.

Preserve the 5.08-second loop and visual timing. Remove audio tracks if present. Compression must avoid visible banding in the sky, edge ringing around the van, or wheel artifacts. The first decoded frame and poster must match closely enough to prevent a startup flash.

## Desktop Hero

- Preserve current navigation height of 82px.
- Hero media height remains `calc(100svh - 82px)` with a 560px minimum.
- Video covers the hero without black bars.
- Keep the van on the right and the darker open sky on the left.
- Place the transparent logo in the left visual field below the navigation safe area.
- Logo width uses `clamp(280px, 34vw, 520px)`.
- Keep at least 6vw left clearance and enough top clearance to avoid navigation overlap.
- Use only a restrained shadow or contrast halo. No glass card, headline, CTA, gradient banner, decorative badge, or added copy over the video.
- Poster, video, and overlay occupy one stable layout box to prevent cumulative layout shift.

## Mobile Hero

Mobile must not stretch the 16:9 desktop source into a full portrait viewport.

- Preserve the existing 68px mobile navigation.
- Hero height is capped with `min(70svh, 132vw)`, with practical bounds near 460px to 620px.
- Use the dedicated mobile source at widths up to 680px.
- Frame around the van with a right-biased subject position while retaining road context and most of the vehicle.
- Keep the vehicle's front, windshield, cabin, wheels, and enough rear body visible to read naturally.
- Place the logo in the upper sky safe area, centered or slightly left, at a maximum width near 82vw and 320px.
- Keep logo clear of the navigation and fixed bottom CTA.
- Do not show black bars, blurred filler bands, stretched pixels, abrupt breakpoint jumps, or horizontal overflow.
- Keep the existing fixed `Zadzwoń` and `Zarezerwuj` CTA bar. The shorter hero should reveal the white conversion section sooner than the old full-height mobile treatment.

## Existing UI Preservation

Bolt may change only:

- hero video and poster source mapping;
- transparent logo overlay markup and styles;
- desktop/mobile hero height, crop, and overlay positioning;
- reduced-motion and media-loading behavior required by the new assets;
- tests that assert the hero asset contract.

Bolt must preserve:

- all Polish copy and punctuation;
- navigation labels, links, scroll behavior, and mobile menu;
- intro, trust row, quick features, vehicle selector, benefits, locations, gallery, pricing, services, testimonials, FAQ, contact, footer, and mobile CTA;
- phone number and all `tel:` targets;
- colors, fonts, spacing, borders, radii, shadows, and restrained motion outside the hero;
- semantic heading structure, keyboard behavior, focus states, labels, and reduced-motion support;
- truthful demo-only contact-form behavior;
- existing SEO and structured data unless an asset URL must be updated.

No new header logo is added. Branding belongs inside the hero media surface and existing footer.

## Conversion Rules

- Keep primary conversion actions in the existing white intro and mobile sticky CTA.
- Make the logo readable immediately without competing with the van.
- Ensure mobile users see the beginning of the conversion section without an unnecessary full-screen media wall.
- Do not add fake urgency, countdowns, availability claims, review claims, chat widgets, popups, floating social buttons, extra forms, or invented business information.
- Do not add text over the moving image; this protects legibility and keeps the current UI hierarchy intact.

## Component Boundaries

Keep the existing app structure. The hero remains a focused section containing:

- responsive poster picture;
- responsive video sources;
- one brand overlay wrapper;
- no business copy or CTA logic.

Media-path values may live in the hero component or a small immutable configuration object. Do not introduce a CMS, media service, new state library, or new abstraction layer for this change.

## Loading and Failure Behavior

- Use `autoPlay`, `muted`, `loop`, `playsInline`, and `preload="metadata"`.
- Prefer WebM, retain MP4 fallback.
- Keep poster visible beneath video until playback begins.
- If autoplay fails, the poster and logo remain a complete hero.
- If a source fails, avoid blank or collapsed media; poster stays visible.
- Under `prefers-reduced-motion: reduce`, do not play or display the moving video.
- Keep a dark image-derived fallback background behind all media.

## Accessibility

- Treat video as decorative or supplementary; all essential information remains below it.
- Keep a useful section label for the hero.
- Make the logo image decorative when the section label already supplies the brand name, avoiding duplicate announcements.
- Preserve keyboard navigation, focus visibility, touch targets, semantic landmarks, and one-H1 hierarchy.
- Motion preference must work before playback, not only after JavaScript initialization.

## Bolt.new Execution Strategy

Use staged prompts and reject scope drift after every stage:

1. Import the existing repository and confirm the current page renders unchanged.
2. Upload the prepared media and transparent logo assets with exact filenames.
3. Change hero sources and overlay only; do not touch other sections.
4. Implement the desktop hero and verify composition at 1440 x 1000 and 1024 x 768.
5. Implement the mobile source, capped height, and logo placement; verify at 430 x 932, 390 x 844, and 360 x 800.
6. Add poster, playback-failure, and reduced-motion behavior.
7. Compare screenshots against the current site and correct only measurable hero differences.
8. Run focused tests and production build before deployment.

Bolt must receive repeated instructions that this is a reconstruction and responsive media-integration task, not a redesign.

## Acceptance Criteria

- Current site outside the hero is visually and functionally unchanged.
- Correct 1920 x 1080 supplied video plays on desktop.
- Dedicated mobile source is selected at 680px and below.
- Logo has real transparency, clean edges, correct colors, and no checkerboard residue.
- Desktop logo occupies open left sky without covering the van or navigation.
- Mobile logo remains readable and does not collide with navigation or sticky CTA.
- Van framing looks intentional at all five validation viewports.
- No black bars, stretched media, horizontal overflow, breakpoint flash, missing request, or console error.
- Poster appears immediately and closely matches the first decoded frame.
- Reduced-motion mode displays a complete static hero.
- Autoplay failure leaves a complete static hero.
- Existing phone links, menu, CTAs, gallery, FAQ, form, and vehicle controls still work.
- Existing focused tests pass.
- Production build passes.

## Explicit Non-Goals

- No redesign of the landing page.
- No copywriting changes.
- No new sections or functionality.
- No generative video extension or generative fill.
- No logo animation.
- No parallax, cursor effects, bounce, or continuous DOM animation.
- No booking backend, analytics, CMS, or form integration.
