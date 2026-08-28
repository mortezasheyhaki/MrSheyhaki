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
