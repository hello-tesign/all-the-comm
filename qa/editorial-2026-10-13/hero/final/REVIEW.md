# Company hero: final local review

The new company hero passes **74/74 checks** in Chromium and WebKit at 1440×1000, 1920×1000 and 390×1000. This verifies the local preview, not a production deployment.

- The actual audience photograph loads in all six environments. The hero contains no project card, old case carousel or former work mosaic.
- The heading remains two lines: 72–96px on desktop and 38–48px on mobile. White and mint typography, both 48px CTAs, image credit and three assurance statements are present and fit their boundaries.
- No horizontal overflow or page errors. No write requests were made.
- The single image curtain is fully removed after its entrance. Desktop scroll translation stays within 48px. Mobile has no image motion.
- Live reduced-motion activation restores the image's original static style. Returning to normal preference does not replay the curtain. Navigating away and back leaves one readable hero.
- The previous TEAM focus-outline defect is fixed in both browsers at 1920px and 390px, and also checked at 1440px. The four exact previous failures were replaced in `../../reference/final-motion/results-final.json`, producing 144/144 unique interaction checks without adding reruns to the count. The original failed file is preserved.

Actual captures for all six configurations are in this directory. The 1440px, 1920px and mobile Chromium hero captures were directly inspected; original photo positioning, legibility, CTA location and the white header are coherent. No additional source adjustment was required after the integrated build.

`lifecycle.json` separately checks synthetic persisted pagehide/pageshow events in both engines. This verifies the cleanup and restoration hooks, not whether the browser elects to use BFCache. A transient empty `style=""` attribute in WebKit is accepted as equivalent to an absent attribute only when both computed transform and clip-path are `none`; the initial overly strict attribute assertion is preserved in `lifecycle-initial.json`.

Source delivered: `src/editorial-presentation.css` and `src/agency-hero.js`. No build was executed by this agent.
