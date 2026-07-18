# Purpose

React/Vite landing site and deterministic premium hero-media pipeline.

# Ownership

Root owns build scripts, site-wide contracts, and the Child DOX Index.

# Local Contracts

- Hero production uses supplied flattened source only; no AI video or generative fill.
- Preserve existing Polish rental content and accessibility behavior.
- Browser assets stay under `public/assets`; generated reports stay under `output/hero-production`.

# Verification

- `npm test -- --run src/App.test.tsx`
- `npm run build`
- `npm run hero:verify` when hero assets change

# Child DOX Index

- `src/AGENTS.md` — React UI, styling, and tests.
- `public/assets/AGENTS.md` — browser-served hero and site media.
- `tools/hero/AGENTS.md` — extraction, rendering, encoding, and loop verification.
