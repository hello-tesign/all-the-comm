# Brand motion

The spatial form is drawn from the three nested cut curves of the supplied All The Communication mark. Neither the live scene nor the video composition uses a stock scene, motion preset, or catalog template.

## Live scene

- `src/motion.js`: GSAP viewport entrances and media parallax; contents stay visible until a real entrance occurs. It loads the 3D module only when `#brand-canvas` exists.
- `src/brand-scene.js`: authored extruded paths, physical materials, directional studio light, a short assembly movement, pointer response, and scroll-linked orientation.
- Three.js `WebGPURenderer` selects its WebGPU backend when available and falls back to WebGL 2. Local Chromium verification exercised the WebGL backend. Do not call that a hardware-WebGPU validation.
- Explicit pause, changing reduced-motion preferences, tab visibility, viewport visibility, low data mode, pixel-density caps, resource disposal, and static fallback are implemented.
- If a WebGL context is restored, the scene creates a fresh canvas and GPU resources. The pinned r186 WebGL disposal guard prevents another context-loss call after the browser already lost the context.
- `initMotion()` returns an idempotent cleanup function. Pending asynchronous setup is also disposed after navigation.

## Authored video

- `brand-ribbon/index.html`: Korean master, paused seekable GSAP timeline, hand-written SVG and typography.
- `brand-ribbon-en/index.html`: English version generated from the same master.
- Official SVG is used for the final identity frame; the larger spatial ribbons are derived illustrations.
- Local Manrope / Pretendard fonts and local GSAP eliminate network dependencies during export.
- Both exports are silent H.264, 1920 × 1080, 30 fps, 240 frames, 8.000 seconds.
- `public/motion/brand-film.mp4` and `brand-film-en.mp4`: actual HyperFrames output.
- `brand-poster.webp` / `brand-poster-en.webp`: web images; PNG files are full-resolution masters.

Run from the project root:

```text
npm install --prefix motion/tooling
node motion/render-brand.mjs
node motion/render-brand.mjs --lang=en
node tests/motion.cjs
```

Root project dependencies include Three.js, GSAP, Playwright, and HyperFrames. `motion/tooling` holds Windows FFmpeg/FFprobe as local developer dependencies; it is not a production dependency. No system PATH mutation is needed.

HyperFrames lint reports zero errors and one advisory about making the nested closing identity group a separate editable subcomposition. The current group remains directly editable in the source and renders correctly.

## Evidence

- `qa/export-results.json`: FFprobe metadata and SHA-256 values for both actual MP4 files.
- `qa/runtime-results.json`: last runtime test result; test the final build again after source changes.
- `qa/webkit-lifecycle.json`: WebKit home → about navigation checks.
- `qa/film-export-*.png`: decoded MP4 frames used for visual inspection.

The tests and renders establish implementation behavior and media integrity. They do not independently prove a 90-point design rating, production deployment, or real advertising performance.
