# E2E Smoke Test Plan

## Purpose
Add browser-level validation after the current unit-test baseline.

## Candidate smoke flows
1. app boots and renders layout
2. upload control is visible
3. webcam start button is visible
4. threshold controls render
5. runtime status panel renders

## Deferred flows
These should be added when browser test fixtures are ready:
- upload a real sample PDF and confirm page counter changes
- mock webcam permission denied state
- mock gesture event injection and verify page transition

## Recommended tool
Playwright

## Why deferred
The current MVP is validated at the core-logic level plus manual guide. Browser E2E should come next once stable fixture PDFs and webcam mocking strategy are added.
