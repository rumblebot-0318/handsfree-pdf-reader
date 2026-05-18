# Architecture

## Summary
Handsfree PDF Reader is a browser-first React + TypeScript application that keeps platform-specific code at the edges and keeps portable business logic in a small core layer. The immediate target is a desktop web MVP. The medium-term target is a React Native client that can reuse gesture interpretation and navigation state logic.

## Architecture goals
- Keep webcam, PDF rendering, and browser APIs isolated from reusable logic.
- Keep gesture interpretation deterministic and testable.
- Preserve a clean path to React Native by minimizing DOM assumptions outside UI/hooks.
- Process camera data locally in-browser.

## Layered design

### 1. UI layer
Files:
- `src/App.tsx`
- `src/components/*`
- `src/styles/app.css`

Responsibilities:
- Present upload, webcam, and reader controls
- Render status and feedback
- Bind gesture events to viewer updates

### 2. Platform integration layer
Files:
- `src/hooks/usePdfViewer.ts`
- `src/hooks/useGestureController.ts`
- `src/lib/pdf.ts`

Responsibilities:
- Talk to browser APIs (`getUserMedia`, canvas)
- Talk to MediaPipe face landmark detection
- Talk to PDF.js rendering
- Expose UI-friendly state and callbacks

### 3. Portable core layer
Files:
- `src/core/defaults.ts`
- `src/core/gesture-engine.ts`
- `src/core/navigation.ts`
- `src/types/index.ts`

Responsibilities:
- Turn face landmarks into gesture events
- Map gestures into document navigation intent
- Hold shared configuration defaults and types

This is the layer intended for later reuse in React Native.

## Runtime data flow
1. User uploads a PDF.
2. `usePdfViewer` reads the file and loads it with PDF.js.
3. Page 1 is rendered into canvas.
4. User starts webcam processing.
5. `useGestureController` opens the camera and starts a MediaPipe detection loop.
6. Landmarks are passed into `gesture-engine.ts`.
7. The gesture engine returns a gesture event when a wink/head turn crosses threshold and cooldown requirements.
8. `navigation.ts` converts gesture action into a new page state.
9. `usePdfViewer` re-renders the active page.

## Portability strategy

### What should stay portable
- Gesture thresholds
- Landmark interpretation heuristics
- Navigation rules
- Calibration model shape
- Shared types

### What remains web-only
- PDF.js rendering
- Browser `canvas`
- Browser `video`
- `navigator.mediaDevices.getUserMedia`
- MediaPipe browser runtime and asset loading

### React Native migration plan
When a mobile app is introduced:
- Move `src/core/*` and shared types into a reusable package boundary
- Replace browser webcam hook with RN camera integration
- Replace PDF.js canvas rendering with native/mobile document rendering
- Keep gesture output contract stable: `GestureEvent -> navigation state`

## Risks
- MediaPipe bundle size is large for first load
- Webcam quality and lighting variance can reduce wink reliability
- Natural blinking may create false positives if thresholds are too low
- PDF worker asset size affects build and first interaction time

## Mitigations
- Keep thresholds configurable in UI
- Enforce cooldown to suppress repeated triggers
- Later add lazy loading for MediaPipe/PDF heavy assets
- Add calibration flow before expanding beyond MVP

## Testing strategy
Automated tests currently focus on the portable core:
- gesture detection logic
- navigation state updates
- test scenario coverage

Manual/browser validation covers:
- PDF upload and render
- webcam permission handling
- gesture runtime behavior
- threshold tuning behavior

## Future architecture upgrades
- Extract `src/core` into a package
- Add calibration storage and profile persistence
- Add feature-flagged document modes (sheet music / paper / presenter)
- Add browser E2E tests for smoke coverage
- Lazy load MediaPipe and PDF worker assets
