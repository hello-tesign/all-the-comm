# KO PC typography interaction review

Date: 2026-10-13. Local preview: `http://127.0.0.1:4173/`.

## Result

The larger Korean desktop typography does not introduce visible clipping, horizontal overflow, header collisions, or broken service/role selection in the reviewed pages. The main HOME headline retains its original scale: 72px at 1060px and 80.64px at 1440px. Screenshots were directly inspected, including the Firefox final header and inquiry form.

| Browser | Viewport | Coverage | Final scoped result |
| --- | --- | --- | --- |
| Chromium | 1060×1000, 1440×1000 | HOME header/headline, WORKS 10 service tabs, TEAM 9 role panels, CONTACT form/footer | Included in 110/110 |
| WebKit | 1060×1000 | WORKS 10 service tabs, CONTACT form/footer | Included in 110/110 |
| Firefox | 1060×1000 | WORKS 10 service tabs, CONTACT form/footer | 17/17 |

These are 127 unique scoped checks; targeted remeasurements are replacements, not additional passes. This report does not include the parent task's separate full typography comparison, mobile, or English checks.

## Visible controls and layout

- WORKS service tabs and TEAM role panels select the matching content; tab labels fit and keyboard End navigation works.
- Navigation, language control, CTA, service/role tabs, and visible inquiry controls meet the 44px height criterion. Firefox menu items are 51.2px, the language control is 44px, and the header CTA is 48px.
- Visible inquiry inputs are 48px high; the textarea is approximately 154px. Labels, placeholder copy, service options, and footer content fit.
- No JavaScript errors or attempted write requests were observed. Chromium/WebKit console-error collection was also empty. Forms were not submitted or filled.

## Original flags preserved and explained

`results.json` retains the initial Chromium/WebKit result of 105/110. Only the following five measurements were corrected in `results-final.json`, using the targeted evidence in `rechecks.json`:

1. Two WORKS poster measurements used `scrollHeight > clientHeight` on the existing “WALK / AND SEE” artwork text. Its preserved 18px type and 17.1px line height intentionally produce a smaller line box. Overflow is visible, and the actual text range is fully within both clipping ancestors. Direct screenshot inspection confirms no glyph clipping. This artwork is not newly scaled site typography.
2. Three CONTACT measurements counted the existing `aria-hidden="true"` honeypot field as a visible input. The seven visible text fields were rechecked; all meet the requested height and reading criteria.

`firefox-final.json` retains the original 15/17 result. Its two flags are the existing logo image link's height of 40.37px at 1060px. The logo is 185px wide at this breakpoint and retains its original aspect ratio. This is a pre-existing clickable-area exception, not a typography regression. The parent explicitly retained the logo unchanged. `firefox-scoped-final.json` applies the same menu/language/CTA scope used in the Chromium/WebKit checks and records 17/17; it does not claim that the logo target itself meets 44px.

The first sandboxed Firefox attempt failed in Playwright `newPage` with `Cannot read properties of undefined (reading '_page')`. One approved escalated run of the same independent, read-only localhost check succeeded. This was a browser execution limitation, not an application failure.

## Evidence and limits

- Main script: `check.cjs`; targeted five-flag check: `recheck.cjs`; latest-build Firefox script: `firefox-final.cjs`.
- Final measurements: `results-final.json`, `rechecks.json`, `firefox-scoped-final.json`.
- Original measurements remain in `results.json` and `firefox-final.json`.
- Representative images: `chromium-1060-home-top.png`, `chromium-1060-team-panel-8.png`, `chromium-1060-existing-poster-detail.png`, `firefox-final-works-header.png`, `firefox-final-contact-form.png`, `firefox-final-contact-footer.png`.
- Chromium/WebKit checks preceded the final build that changed only HOME small numbering and three residual shorthand declarations. WORKS, TEAM, and CONTACT were unchanged. Firefox ran against the final build; the parent independently checked the final typography comparison.
- No source, build, or application data was changed by this review. This is local browser evidence and does not establish production deployment or successful inquiry delivery.
