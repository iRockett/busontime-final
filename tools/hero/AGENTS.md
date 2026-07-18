# Purpose

Deterministic static hero optimization and verification.

# Ownership

- `source/hero-source.png`: exact user-supplied flattened artwork.
- `browser-assets.json`: stable responsive output interface.
- `config.mjs`: immutable geometry and path contract.
- `build.mjs`: WebP production.
- `verify.mjs`: source fidelity, geometry, and static-integration checks.

# Local Contracts

- The hero is static. Do not add video, animation, generated fill, or synthetic layers.
- Desktop output is lossless and pixel-identical to the 1672x941 source.
- Browser filenames must come from `browser-assets.json`.
- Keep browser assets under `public/assets`; keep the manifest under `output/hero-production`.

# Verification

- `pnpm run test:hero`
- `pnpm run hero:build`

# Child DOX Index

- `tests/` - contract-level Node tests; no child DOX needed.
