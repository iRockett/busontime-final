# Hero video design

## Goal

Replace the static hero image with the supplied five-second video while filling the entire hero viewport without black bars.

## Approved treatment

- Enhance source to 1920×1080 with Lanczos scaling and mild sharpening.
- Encode high-quality H.264 MP4 with web-optimized fast start and no audio track.
- Render as autoplaying, muted, looping, inline video.
- Use `object-fit: cover`, centered positioning, and approximately 1.015 visual scale.
- Keep existing hero image as poster and fallback.
- Under `prefers-reduced-motion: reduce`, hide video and show static poster.
- Preserve current hero dimensions on desktop and mobile.

## Verification

- No black bars at desktop or mobile viewport.
- Video starts muted and loops inline.
- Poster remains visible before video load and under reduced motion.
- No layout shift or horizontal overflow.
- Automated tests and production build pass.
