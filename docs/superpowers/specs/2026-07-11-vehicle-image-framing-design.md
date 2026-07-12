# Vehicle image framing design

## Goal

Show the complete Renault Trafic inside the existing vehicle card while preserving a fully filled, premium image frame and nearly the same perceived vehicle size.

## Approved treatment

Render the vehicle photo twice inside the same media frame:

1. A full-bleed background layer using `object-fit: cover`, enlarged slightly, blurred, and darkened with a restrained overlay.
2. A sharp foreground layer using `object-fit: contain`, centered with small responsive inset spacing so the full vehicle remains visible.

The background prevents empty letterbox bands. The foreground remains the semantic image and keeps existing alt text. The decorative background is hidden from assistive technology.

## Image quality

Create a non-destructive high-resolution version of the brown Renault Trafic asset. Preserve vehicle identity, body shape, color, plate, environment, perspective, and lighting. Add no objects, text, or branding. Use the enhanced asset for both media layers.

## Interaction

Limit foreground hover scale to approximately `1.015`. Background may scale independently but must not create distracting motion. Respect `prefers-reduced-motion`.

## Responsive behavior

Desktop retains the current two-column vehicle card. Tablet and mobile retain the existing stacked card. Foreground uses responsive padding so the van remains whole at every breakpoint without materially increasing section height.

## Verification

- Whole van visible on desktop and mobile.
- Media frame fully filled with no blank bands.
- Brown and steel vehicle tabs still work.
- Image alt text remains correct.
- No overflow or layout shift.
- Existing automated tests and production build pass.
