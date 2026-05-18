# Test Guide

## Goals
- Verify the browser MVP loads and renders PDFs reliably.
- Verify gesture navigation behaves predictably under realistic scenarios.
- Verify the architecture stays portable for a later React Native client.

## Test Matrix

### 1. PDF loading
- Upload a valid PDF under 5 MB.
- Upload a multi-page PDF over 50 pages.
- Upload a non-PDF file and confirm graceful failure.
- Reload the page and upload again.

Expected:
- Valid PDFs render page 1.
- Page count updates correctly.
- Invalid files surface a readable error.

### 2. Gesture control
- Start webcam with no PDF loaded.
- Start webcam with PDF loaded.
- Trigger left wink repeatedly.
- Trigger right wink repeatedly.
- Turn head left/right past threshold.
- Blink naturally without intentional wink.

Expected:
- Webcam starts/stops cleanly.
- Intended gestures move page once per cooldown window.
- Natural blinks should not repeatedly trigger navigation.

### 3. Threshold tuning
- Lower wink threshold and test false positives.
- Raise wink threshold and test missed detections.
- Lower yaw threshold and test sensitivity.
- Raise cooldown to 2000 ms and confirm slower repeat triggers.

Expected:
- Controls immediately affect runtime behavior.
- Thresholds help tune reliability per user.

### 4. Privacy and failure states
- Deny camera permission.
- Disconnect camera while app is open.
- Use low-light conditions.
- Load PDF, then stop webcam.

Expected:
- Permission errors are visible.
- App still supports PDF viewing even without camera.
- No network dependency for document rendering.

### 5. Portability checks
- Confirm `src/core` contains gesture + navigation logic without DOM-specific React code.
- Confirm browser-specific integrations stay in hooks/lib/components.

Expected:
- Core logic is portable to a future React Native app.

## Manual Regression Checklist
- [ ] App boots without console-breaking runtime errors.
- [ ] PDF upload works.
- [ ] First page renders.
- [ ] Gesture camera starts.
- [ ] Left wink maps to previous page.
- [ ] Right wink maps to next page.
- [ ] Head left maps to previous page.
- [ ] Head right maps to next page.
- [ ] Cooldown prevents multi-fire.
- [ ] Camera stop releases stream.

## Suggested Test Assets
- One short 3-page PDF
- One long 50+ page PDF
- One invalid `.txt` file renamed as `.pdf`
- Low-light room setup
- Laptop webcam and external webcam
