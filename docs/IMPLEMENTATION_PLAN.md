# Implementation Plan

## Goal
Ship a browser MVP with portable gesture/navigation core logic and enough testing to validate the concept with real users.

## Phase 1 — foundation
### Deliverables
- React + TypeScript + Webpack app shell
- README architecture diagrams
- core gesture/navigation modules
- PDF viewer hook
- webcam gesture hook

### Acceptance criteria
- project installs and builds locally
- README explains architecture and portability split
- app shell renders without runtime-breaking errors

## Phase 2 — MVP interaction loop
### Deliverables
- PDF upload + render
- webcam start/stop
- wink and head-turn navigation
- status UI and threshold controls

### Acceptance criteria
- user can upload PDF and see first page
- user can start webcam and see live preview
- default gestures move pages in both directions
- stopping webcam releases stream cleanly

## Phase 3 — testing baseline
### Deliverables
- automated unit tests for gesture engine
- automated unit tests for navigation logic
- scenario coverage test
- manual QA document

### Acceptance criteria
- `npm run test:build && npm test` passes
- test guide includes runtime/manual checks
- core logic remains framework-light and testable

## Phase 4 — quality pass
### Deliverables
- remove duplicated/dead files
- tighten docs around RN portability
- prepare E2E smoke-test slot

### Acceptance criteria
- repository structure is coherent
- docs match actual code structure
- no obvious duplicate source modules remain

## Suggested next backlog
1. add calibration flow and profile model
2. lazy-load MediaPipe and PDF worker assets
3. add Playwright smoke tests for PDF upload and UI boot
4. split `src/core` into a reusable package boundary
5. introduce mode presets for sheet music / paper / presenter
