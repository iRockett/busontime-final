# Premium Automotive Hero Animation Design

**Date:** 2026-07-14  
**Project:** BusemNaCzas.pl landing page  
**Source:** `codex-clipboard-cc99548b-aa40-4e3b-895b-210d17bde433.png` (1672 x 939)  
**Motion identity:** quiet, controlled, premium automotive

## Objective

Turn the supplied single-frame branded Renault Trafic hero into a deterministic, seamless 2.5D driving loop suitable for a premium automotive landing page. The van and logo remain visually anchored while the surrounding road scene communicates constant forward travel. The result must avoid generative-video artifacts, exaggerated movement, endpoint easing, camera drift, and visible loop seams.

The production pipeline will not use AI video generation. It will use handcrafted mattes, non-generative image processing, a deterministic frame renderer, FFmpeg encoding, and browser-based validation.

## Source Analysis and Layer Model

The supplied artwork is a flattened composite, so extraction will be driven by carefully authored masks and edge cleanup. Every extracted foreground layer receives a small protected edge expansion and color decontamination pass to prevent halos.

| Layer | Approximate source region | Depth | Motion treatment |
| --- | --- | --- | --- |
| Sky | upper frame | far | fixed base with an independently drifting cloud plate |
| Clouds | upper and center sky | far ambient | extremely slow one-direction wrapped drift |
| Mountains | horizon behind the van | far background | tiny wrapped lateral parallax, no reversal |
| Trees and roadside | horizon and right edge | background | slow backward wrapped travel with directional blur |
| Guardrails | middle horizon | midground | medium-speed backward travel with controlled blur |
| Road | lower half | foreground | perspective-mapped continuous backward texture flow |
| Lane markings | lower foreground | foreground accent | constant-speed perspective flow synchronized to road phase |
| Van body | right-center foreground | hero subject | near-fixed mount, sub-pixel vibration and suspension only |
| Wheels | two visible wheel regions | hero detail | masked rotational highlight treatment synchronized to road speed |
| Body reflections | van paint and glass | hero detail | low-opacity moving reflection bands constrained to the vehicle mask |
| Logo and wordmark | left-center | interface/brand | perfectly fixed and protected from scene motion |

Occluded areas exposed by parallax will be reconstructed from nearby source pixels using cloning, gradient continuation, texture synthesis from existing pixels, blur, and grain matching. No generative fill will be used. Movement amplitudes will remain small enough that reconstruction is never asked to invent major scene content.

## Composition Architecture

The master compositor will be deterministic and frame-addressable. Given a frame number, it produces the same pixels on every render. This makes the loop testable and allows all export formats to share an identical visual timeline.

The scene will be rendered in three motion families:

1. **Primary travel:** road, lane markings, guardrails, and trees flow backward at constant phase velocity. Perspective and speed ratios provide depth without moving the camera.
2. **Secondary vehicle motion:** the van receives a low-amplitude periodic vertical offset, a smaller pitch component, restrained wheel-highlight rotation, and subtle reflections. The van silhouette remains effectively locked.
3. **Ambient depth:** mountains and clouds move through slow wrapped phases. These layers never oscillate backward and never compete with the vehicle or logo.

Motion blur will be generated from sub-frame temporal samples or directional convolution, depending on the layer. The road receives the strongest blur, guardrails and trees less, mountains almost none, and the van remains sharp. Background depth of field will be baked per layer rather than animated, preventing focus breathing.

## Timeline and Seamless Loop Contract

- Master duration: 6 seconds.
- Master frame rate: 30 fps.
- Encoded frames: 0 through 179.
- Validation frame: frame 180, evaluated at the same phase as frame 0.
- All translations use modulo-wrapped phase functions.
- Vehicle vibration and suspension use integer-cycle periodic functions.
- Reflection bands are fully transparent at their wrap boundary.
- There is no endpoint easing, reverse travel, random noise, or accumulated camera transform.

The renderer will compare frame 0 and validation frame 180 at pixel level. The expected result is exact identity before lossy encoding. The encoded-loop boundary will then be checked by comparing decoded frames around the final-to-first transition. Frame 180 will not be encoded, avoiding a duplicated-frame pause while preserving the mathematical equality of the loop boundary.

## Motion Values

The final values may be tuned during browser review, but must remain within these limits:

- Van vertical suspension: no more than 1.5 master pixels peak amplitude.
- Van pitch: no more than 0.035 degrees.
- Camera vibration: no more than 0.6 master pixels and always periodic.
- Mountain parallax: no more than 3 master pixels over the complete loop.
- Cloud displacement: no more than 1.5% of master width over the loop.
- Reflection opacity: no more than 9% over bodywork and 6% over glass.
- Logo displacement: exactly zero.
- Road and lane movement: linear phase velocity for the complete loop.

## Quality Enhancement and Upscale

The 1672 x 939 source will be converted into a 2560 x 1440 production master. Because the source does not contain native 1440p detail, the enhancement will focus on perceived clarity rather than fabricated texture:

- high-quality Lanczos or equivalent resampling;
- edge-aware selective sharpening on the van, logo, and lane markings;
- restrained denoising in gradients and sky;
- fine grain reintroduction to prevent banding;
- 10-bit or high-bit-depth intermediate processing when supported;
- final downsampled 1920 x 1080 web encode from the 1440p master for cleaner edges;
- dedicated mobile crop rendered from the master rather than scaling the desktop encode.

Sharpening will be masked away from already-contrasty logo edges and thin guardrail lines to prevent ringing.

## Outputs

The production package will contain:

- `hero.mp4`: 1920 x 1080, H.264, silent, web optimized, fast-start metadata.
- `hero.webm`: 1920 x 1080, VP9, silent, two-pass or constrained-quality encode.
- `poster.webp`: 1920 x 1080, high-quality WebP.
- `poster.jpg`: 1920 x 1080, progressive JPEG fallback.
- `mobile.mp4`: portrait-responsive crop, H.264, silent and fast-start optimized.
- `mobile.webp`: matching mobile poster.
- 2560 x 1440 lossless or visually lossless master intermediate.
- Layered source package containing extracted plates, masks, renderer configuration, and reconstruction assets.
- After Effects JSX project-builder script that imports the layers and creates the composition when After Effects is available.
- FFmpeg command log and an export manifest containing dimensions, codecs, frame rates, durations, and file sizes.

A verified native `.aep` cannot be produced on this machine because After Effects is not installed. The JSX builder and layered assets are the portable project deliverable; opening the builder in After Effects will create the project structure for saving as `.aep`.

## Website Integration

The current single-source hero video will be upgraded to provide WebM and MP4 sources in preferred order, responsive desktop/mobile media selection, matching poster assets, fixed intrinsic dimensions, and an opaque background fallback. The existing accessible label, muted autoplay, inline playback, and reduced-motion behavior will be preserved.

The video container will retain a stable aspect/layout box before media load, preventing layout shift. The first visible frame and poster will be visually matched to prevent startup flicker. Mobile positioning will keep both the logo and vehicle legible without relying on browser-side pan animation.

## Validation

Validation will cover:

1. **Deterministic loop:** frame 0 equals validation frame 180 before encoding.
2. **Encoded boundary:** no luminance or geometry spike from the last decoded frame into the first.
3. **Visual review:** desktop and mobile screenshots at loop start, midpoint, and boundary.
4. **Playback:** autoplay, muted playback, inline playback, looping, WebM/MP4 fallback, and poster behavior.
5. **Performance:** no layout shift attributable to the hero, acceptable media size, stable rendering, and no continuously expensive DOM animation above the video.
6. **Accessibility:** reduced-motion users receive the static poster; the logo remains readable; video remains decorative/informational rather than essential to accessing content.
7. **Regression:** existing tests, TypeScript build, production build, and hero-specific assertions pass.

If review reveals excessive motion, visible reconstruction, compression noise, mobile cropping problems, or a loop-boundary discontinuity, the renderer settings or encode parameters will be adjusted and the complete validation cycle repeated.

## Acceptance Criteria

- The van appears mounted to the camera and remains nearly fixed.
- Road travel is continuous, forward-only, and constant-speed.
- Secondary vehicle motion is visible only on attentive viewing.
- Logo and wordmark remain sharp and stationary.
- Loop boundary is mathematically periodic and visually seamless.
- No AI-video artifacts, breathing, morphing, or camera drift appear.
- Desktop and mobile assets load without layout shift or poster flicker.
- Final presentation feels restrained and premium rather than spectacular or exaggerated.
- All requested export formats and production documentation are present.

