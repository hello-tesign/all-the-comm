# Editorial integration QA

This is an isolated, read-only local test of `http://127.0.0.1:4173/`. It does not operate the user's existing browser tab or submit inquiries. Every browser context blocks methods other than GET, HEAD and OPTIONS.

## Latest result — 1,434 / 1,434 passed

The current company-first HOME build is the final scope of this report. **All 1,434 unique checks passed; no unresolved failures remain.** See `final-summary.json` for the exact check IDs and selected evidence.

- Chromium, Firefox and WebKit: 36 Korean page inspections (six routes at 1440×900 and 390×844) and 18 English page inspections (six routes at 1440×900), for 54 selected page records.
- HOME, ABOUT and WORKS were rechecked in all engines and both widths after the new hero build. These 18 records replace the prior versions; unchanged PROCESS, TEAM, CONTACT and English records are retained.
- The HOME hero contains one audience photograph, agency copy and three company proof points. Portfolio scenes, case tabs and individual project links are absent from the hero. Contact, services and projects links all reach their actual destinations.
- The previous WebKit desktop `/works/#projects` viewport-position failure is resolved. Both services and projects anchor destinations now pass in all engines and widths.
- 286 selected image-state observations passed. These count tested page and selection states, not distinct image files.
- No unresolved JavaScript, console, HTTP, network or write-request failures. Firefox's deliberate back navigation initially canceled pending font downloads; a destination-font-ready recheck passed at both widths, with 21 font responses per viewport all returning 200 and no console errors.
- The six English HTML files retain their visible markup and embedded English copy. The public English project API retains the original project scope and pre-edit English title/summary.
- Counts: Chromium 472, Firefox 474, WebKit 474, plus 14 source/API checks. The engines expose slightly different immediately visible image states; counts were collected from actual assertions rather than a preset target.

Final evidence: `company-hero-revision/` (18 latest Korean page screenshots and engine JSON), `integration/` (retained unchanged page evidence), `english-project-api.json`, and `final-summary.json`. The latter lists which 54 screenshots apply to the final scope. Earlier versions remain available but are not added to the final count.

`summarize-final.cjs` replaces checks by page scope and targeted check ID. It does not add retries to the unique total. This is functional evidence for a local build, not a production deployment or an aesthetic approval.

## Historical editorial baseline — superseded where noted

- Chromium, Firefox and WebKit: six Korean routes at 1440×900 and 390×844, six English routes at 1440×900; 54 page inspections.
- 1,470 unique check IDs: 1,469 passed and one unresolved WebKit desktop HOME → `/works/#projects` viewport-position check.
- 300 image-state observations passed. These include the same file in different pages and selected states; they are not 300 distinct image files.
- No JavaScript, console, HTTP errors or attempted writes. Four Firefox lazy image requests were canceled during intentional page navigation. The affected images loaded successfully afterward; a bounded network recheck also passed.
- English visible HTML (including navigation) matches the six pre-edit files after excluding the embedded bilingual JSON payload. English values inside that payload match separately.
- The baseline is historical evidence. The later company-first HOME request and ABOUT/WORKS changes have now replaced the affected page results in the latest result above.

## Evidence and corrections

- `check.cjs`: current integration script, defaulting to the company-first hero. `QA_ROUTES`, `QA_OUTPUT`, `QA_SKIP_EN`, and `BROWSER` allow scoped reruns. Set `QA_OUTPUT` to a fresh evidence directory to preserve earlier records.
- `integration/{chromium,firefox,webkit}.json`: full engine records and image observations; 54 viewport screenshots in the same directory.
- `integration/baseline-summary.json`: unique ID aggregation, failures and exact before/after corrections.
- `first-pass/`: original Chromium results and sandbox Firefox `_page` failure, preserved unchanged.
- `recheck-chromium.cjs` / `integration/chromium-targeted.json`: six corrected test conditions. The final book caption credits the author directly, so an obsolete literal phrase was removed; menu Escape now waits up to one second for the native dialog close event and focus restoration. All six passed.
- `recheck-firefox-network.cjs` / `integration/firefox-network-targeted.json`: separates intentional navigation cancellation from network/HTTP failure, then verifies the returned HOME images. Passed.
- `recheck-firefox-fonts.cjs` / `company-hero-revision/firefox-font-targeted.json`: waits for destination font readiness before intentionally going back. Both viewport checks passed and replace the two initial Firefox console conditions; the original cancellation logs remain in `company-hero-revision/firefox.json`.

Corrections replace existing check IDs; they are never added to the unique total. The Firefox environment failure is not a site regression. Source files and the server store were not changed by QA.
