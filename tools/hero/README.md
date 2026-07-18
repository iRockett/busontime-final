# Static hero media pipeline

The pipeline copies the exact supplied 1672x941 artwork into efficient responsive WebP deliverables. It performs no animation, compositing, generative fill, model calls, or network processing.

## Stable interface

```powershell
pnpm run hero:build
pnpm run hero:verify
```

`browser-assets.json` is the shared output contract:

- `public/assets/hero-static.webp` - lossless, pixel-identical desktop source.
- `public/assets/hero-static-1280.webp` - 1280x720 mobile transfer variant.

`output/hero-production/static-export-manifest.json` records hashes, dimensions, sizes, and the static integration result.

## Source replacement

Replace only `source/hero-source.png`, keep its 1672x941 geometry, then run `pnpm run hero:build`. The verifier rejects video elements in the React hero and rejects a desktop output that is not pixel-identical to the supplied source.
