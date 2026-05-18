# Product Requirements Document

## Product
Handsfree PDF Reader

## One-line definition
A browser-based PDF reader that lets users navigate pages using webcam-detected wink and head-turn gestures, without foot pedals or external hardware.

## Problem
People reading sheet music, papers, manuals, or presentation material often need hands-free navigation. Existing solutions are usually hardware pedals or native apps. That creates friction around setup, portability, and cost.

## Users
### Primary
- musicians using digital sheet music
- researchers and heavy PDF readers
- presenters working from PDF material

### Secondary
- accessibility users who benefit from lightweight hands-free navigation

## Core value
- works in the browser
- no extra hardware required
- privacy-first local processing
- architecture prepared for future React Native expansion

## MVP goals
- Upload and render a PDF in-browser
- Start/stop webcam processing
- Support left/right wink navigation
- Support left/right head-turn navigation
- Show runtime feedback for camera and gesture state
- Expose threshold + cooldown controls for tuning

## Non-goals
- cloud sync
- annotation
- OCR or semantic document understanding
- collaborative features
- full mobile app in phase one

## Functional requirements
1. User can upload a local PDF file.
2. App renders the current page into a canvas viewer.
3. App shows current page / total pages.
4. User can start webcam capture.
5. Left and right wink are interpreted into navigation actions.
6. Head turn left and right are interpreted into navigation actions.
7. Gesture triggers respect cooldown and threshold configuration.
8. User can stop webcam capture without affecting PDF viewing.
9. All camera processing stays local in-browser.

## Non-functional requirements
- Gesture interpretation should be deterministic and testable.
- App should still be usable without webcam access.
- Architecture should keep reusable logic separate from browser-specific code.
- MVP should build and run locally with a documented flow.

## Success metrics
- PDF load success rate
- successful gesture-to-page-turn rate
- false-positive rate under default thresholds
- time to first successful setup
- repeat usability in a second session

## Risks
- bundle size from MediaPipe and PDF worker
- inconsistent lighting/webcam quality
- false positives from natural blinking
- gesture fatigue over long reading sessions

## Release recommendation
Phase 1 should ship as a browser MVP for testing with real users before investing in calibration, smart scroll, or mobile packaging.
