# Purpose

Browser-served vehicle, gallery, logo, font, and static hero assets.

# Ownership

The active hero uses `hero-static.webp` on desktop, `hero-static-1280.webp` on tablet, and `hero-mobile-portrait.webp` at mobile widths up to 680px.

# Local Contracts

- The hero is static; do not add video or synthetic motion.
- Hero filenames and dimensions are defined in `tools/hero/browser-assets.json`.
- Keep generated intermediates and reports out of this directory.

# Work Guidance

- Replace hero media only through `tools/hero`.

# Verification

- `pnpm run hero:verify`
- Desktop and mobile browser checks.

# Child DOX Index

- No child DOX files.
