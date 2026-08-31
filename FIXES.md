# Repairs Applied — August 2026

This archive contains fixes for the confirmed issues found during the code audit.

| Area | Repair |
|---|---|
| Resource generator | `tools/generate-resources.js` no longer deletes course-level directories. It now overwrites only the route-shell `index.html` files that it generates. Hand-authored games, media, styles, and scripts are preserved. |
| Starter Unit 1A catalog | Added Food Verb Match and Food & Drinks Sort to `assets/course-data.js`. The generated Unit 1A Games page now maps to lesson `a` and displays both cards. |
| Broken local references | Corrected the School Subjects navigation and standardized affected shared theme and star-tracking resources on root-relative paths for the configured custom-domain deployment. |
| Incorrect labels | Corrected the Unit 1A game-page labels that incorrectly said Unit 5A. |
| Archived Svelte prototype | Hardened local-storage parsing, save error handling, event forwarding, array reactivity, and the three-star display logic. The archive still does not include a standalone Svelte build configuration. |

## Validation completed

The repaired source was checked for local references, route metadata, JavaScript parsing, and generator safety. All local HTML and CSS asset checks returned zero missing references; all 62 JavaScript files parsed successfully; the course metadata checker returned zero mismatches; and an isolated generator run preserved all 20 hand-authored Starter game scripts.

The repaired Unit 1A Games page was also loaded in a browser. It rendered the heading **Unit 1A Games** and both expected game cards without project-asset HTTP 404 requests or JavaScript runtime errors.

## Additional fixes — 31 Aug 2026 (low-volume audit)

| Area | Repair |
|---|---|
| Debug leftover | Removed the temporary `console.log("Learning Arcade loaded successfully.")` and its DEBUG MESSAGE comment from `learningarcade/script.js`. |

### Notes from low-volume check
- All 85 JS files parse without syntax errors.
- Image/audio references remain (expected after intentional removal); they will 404 until media is restored.
- Unit 5A still correctly lists the food games (matches AEF Starter curriculum – food & drink / breakfast topics). Unit 1A also has them per prior intentional addition.
- Root-absolute game URLs in Level 1 Unit 9 of `course-data.js` are intentional (they point outside the resources tree into `/learningarcade/`).
- Firebase client config is present (standard); ensure database rules restrict writes.

## Universal back button — 31 Aug 2026

| Area | Repair |
|---|---|
| Consistent back button | Added a single fixed circular back button (44×44px, top-left, same shape & position on every page). Color changes by section: vocabulary = purple, grammar = green, listening = blue, reading = orange, writing = pink, speaking = teal. |
| CSS | Full styles added to `learningarcade/style.css`, `learningarcade/theme.css`, and root `theme.css`. Both `.skill-back-btn` and `.site-back-btn` share the same look. |
| Behavior | Small enhancer in `learningarcade/script.js`: buttons with `data-back-one` prefer `history.back()` when possible. |

### How to use on any page
```html
<a class="skill-back-btn" href="../" data-back-one aria-label="Back" title="Back"><span aria-hidden="true">←</span></a>
```
Place it inside a container that has the section class (e.g. `<main class="grammar">`) so the correct color is applied.

## Appwrite scores fix (TablesDB constructor)
- CDN upgraded to appwrite@26.2.0 (TablesDB export).
- firebase-scores.js hardened with TablesDB/Databases fallback.

## Profile in header + mobile polish
- Profile icon moved into `.arcade-nav` (end of header) via theme.js; floating `.profile-fab` hidden.
- Back button z-index raised; mobile nav touch targets 44px; safe-area aware.
