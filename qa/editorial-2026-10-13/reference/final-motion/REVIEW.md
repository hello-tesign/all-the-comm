# Editorial integration: motion and interaction review

Local preview: `http://127.0.0.1:4173/`. Chromium and WebKit, each at 1920×1000 and 390×1000. This review does not establish production deployment.

The initial integrated run has **144 unique checks: 140 passed, 4 failed**. Every failure is the same low-contrast TEAM keyboard-focus outline, one in each browser/viewport combination. The old mint outline remained after the panel background became light. `src/editorial-presentation.css` supplies a dark green outline for the affected light surfaces. After the root build, all four exact failed checks passed on the same engines and viewport sizes. **Final unique result: 144/144**, recorded in `results-final.json`. The initial result file is retained without rewriting it as a pass; `focus-recheck.json` records the four replacements. The subsequently added dark photographic hero uses its own light focus outline.

Verified in all four environments:

- White header, complete original logo, dark navigation and visible header keyboard focus.
- Header has no horizontal overflow. Mobile menu opens, closes with Escape and restores focus.
- All eight home service tabs and all nine TEAM role tabs select exactly one corresponding panel.
- Selected tabs have readable text and 48px touch targets. TEAM has no redundant question board and retains visible deliverables.
- Desktop PROCESS has one sticky visual stage, the four chapter selections stay synchronized with their image and navigation state, and navigation to a prior chapter works.
- Mobile PROCESS retains the ordinary document sequence without a sticky stage.
- Live reduced-motion activation restores all four chapter images to their source chapters, removes the reading-progress UI, and leaves titles visible. Restoring normal motion creates one stage again on desktop and none on mobile.
- No page errors and no non-read network requests.

Directly viewed representative captures: `chromium-1920-header-focus.png`, `chromium-1920-team-selected.png`, `webkit-390-service-selected.png`, and `webkit-1920-process-step-2.png`. The full set is in this directory.

The reported skip-link box in a tall locator screenshot is a screenshot artifact. Separate reduced-motion viewport captures on TEAM and CONTACT show its unfocused bounds entirely above the viewport (`top:-100px`, `bottom:-46.4px`). Keyboard focus correctly brings it to `top:12px` after the style update. No skip-link source change was made. Details are in `skiplink.json`; the immediate focus measurement in that file precedes the style update and was independently rechecked after 200ms.

Files: `results.json` contains the 144 checks. `../check-final-motion.cjs` is the isolated, read-only test. `../check-skiplink.cjs` is the focused diagnostic. No inquiry was submitted and no build was run by this agent.
