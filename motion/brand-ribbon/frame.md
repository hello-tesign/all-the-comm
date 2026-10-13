# All The Communication / Brand motion

An authored eight-second motion composition derived from the three concentric paths in the supplied company mark. It uses no catalog layout, stock animation, generative bitmap, client identity, or invented outcome.

- Master: 1920 × 1080, 30 fps, 8 seconds, silent H.264 MP4.
- Ink: #061c25; mint: #59e3c6; ice: #c9f2ef.
- 0–1.8 s: three paths settle into one direction; title enters on separate timings.
- 1.8–5.25 s: slight spatial drift and one directional light passage.
- 5.25–7.55 s: a clean title signature resolves the composition.
- 7.55–8 s: fade to ink. Website uses an explicit play control, never mandatory autoplay.
- Timeline: GSAP paused clock registered as window.__timelines['brand-ribbon']; reproducible seek in either direction.
- Logo-like background studies are illustrative extensions of the mark. Approved logo assets remain the unmodified navigation/signature source.

Run `node motion/render-brand.mjs` from the project root after dependencies are installed. This copies the pinned local GSAP runtime into the composition, runs HyperFrames lint/render, and saves a still from the same timeline.

The English caption version is generated from the same master via `node motion/render-brand.mjs --lang=en`; it writes the `-en` poster and film. The Korean company-name signature remains an official brand identifier in both versions.
