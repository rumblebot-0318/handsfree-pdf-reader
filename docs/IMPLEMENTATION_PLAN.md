# Hands-Free PDF Reader Implementation Plan (MVP)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a browser-based, hands-free PDF reader using webcam wink detection and head/nose direction for page navigation, focusing on MVP features, client-side processing, and privacy.

**Architecture:** A single-page web application with distinct modules for UI, PDF rendering (PDF.js), and webcam/gesture detection (using `getUserMedia` and a face tracking library). All processing occurs client-side.

**Tech Stack:** HTML, CSS, JavaScript (Vanilla JS for MVP), PDF.js, a client-side face tracking library (e.g., MediaPipe Face Mesh or similar), npm/yarn, Webpack.

---

## 1. Project Setup and Basic HTML Structure

### Task 1.1: Initialize Project and Basic Files

**Files:**
- Create: `package.json`
- Create: `webpack.config.js`
- Create: `public/index.html`
- Create: `src/index.js`
- Create: `src/style.css`

- [ ] **Step 1: Initialize npm project**

```bash
npm init -y
```

- [ ] **Step 2: Install Webpack and necessary loaders**

```bash
npm install --save-dev webpack webpack-cli html-webpack-plugin style-loader css-loader
```

- [ ] **Step 3: Create `webpack.config.js`**
    (Minimal configuration for HTML, CSS, JS bundling)

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development', // or 'production'
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    static: './dist',
  },
};
```

- [ ] **Step 4: Create `public/index.html`**
    (Basic HTML structure with root div)

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Hands-Free PDF Reader</title>
</head>
<body>
    <div id="app"></div>
</body>
</html>
```

- [ ] **Step 5: Create `src/index.js`**
    (Entry point JavaScript file)

```javascript
import './style.css';

document.getElementById('app').innerHTML = `
    <h1>Hands-Free PDF Reader</h1>
    <div id="controls">
        <input type="file" id="pdf-input" accept=".pdf" />
        <button id="start-webcam">Start Webcam</button>
        <button id="stop-webcam" disabled>Stop Webcam</button>
    </div>
    <div id="pdf-viewer">
        <canvas id="pdf-canvas"></canvas>
        <div id="page-info">Page: <span id="current-page">0</span> / <span id="total-pages">0</span></div>
    </div>
    <div id="gesture-feedback"></div>
`;

console.log('App initialized!');
```

- [ ] **Step 6: Create `src/style.css`**
    (Minimal CSS for basic layout)

```css
body {
    font-family: sans-serif;
    margin: 20px;
    background-color: #f4f4f4;
}

#app {
    max-width: 1000px;
    margin: 0 auto;
    background-color: #fff;
    padding: 20px;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
}

#pdf-viewer {
    margin-top: 20px;
    border: 1px solid #ccc;
    display: flex;
    flex-direction: column;
    align-items: center;
}

#pdf-canvas {
    border: 1px solid #eee;
    margin-bottom: 10px;
}

#controls button {
    margin-left: 10px;
    padding: 8px 15px;
}

#gesture-feedback {
    margin-top: 10px;
    height: 20px;
    font-weight: bold;
    color: #007bff;
}
```

- [ ] **Step 7: Add Webpack dev server script**
    (Add to `package.json` scripts)

```json
{
  "name": "handsfree-pdf-reader",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "scripts": {
    "start": "webpack serve --open",
    "build": "webpack --mode production",
    "test": "echo "Error: no test specified" && exit 1"
  },
  "keywords": [],
  "author": "",
  "license": "ISC",
  "devDependencies": {
    "css-loader": "^6.10.0",
    "html-webpack-plugin": "^5.6.0",
    "style-loader": "^3.3.4",
    "webpack": "^5.90.3",
    "webpack-cli": "^5.1.4",
    "webpack-dev-server": "^4.11.1"
  }
}
```

- [ ] **Step 8: Commit**

```bash
git add package.json webpack.config.js public/index.html src/index.js src/style.css
git commit -m "feat: Initialize project with Webpack and basic UI structure"
```

## 2. PDF Rendering Integration

### Task 2.1: Integrate PDF.js

**Files:**
- Modify: `src/index.js`
- Create: `src/pdf-renderer.js`

- [ ] **Step 1: Install PDF.js**

```bash
npm install pdfjs-dist
```

- [ ] **Step 2: Create `src/pdf-renderer.js`**
    (Module to handle PDF loading and rendering)

```javascript
import * as pdfjsLib from 'pdfjs-dist/build/pdf.mjs';
import pdfjsWorker from 'pdfjs-dist/build/pdf.worker.mjs';

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

let pdfDoc = null;
let currentPageNum = 1;
let canvas = null;
let pageInfoElement = null;
let totalPagesElement = null;

export function initPdfRenderer(canvasEl, pageInfoEl, totalPagesEl) {
    canvas = canvasEl;
    pageInfoElement = pageInfoEl;
    totalPagesElement = totalPagesEl;
}

export async function loadPdf(file) {
    const fileReader = new FileReader();
    fileReader.onload = async () => {
        const arrayBuffer = fileReader.result;
        pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        totalPagesElement.textContent = pdfDoc.numPages;
        currentPageNum = 1;
        renderPage(currentPageNum);
    };
    fileReader.readAsArrayBuffer(file);
}

export function nextPage() {
    if (pdfDoc && currentPageNum < pdfDoc.numPages) {
        currentPageNum++;
        renderPage(currentPageNum);
        return true;
    }
    return false;
}

export function prevPage() {
    if (pdfDoc && currentPageNum > 1) {
        currentPageNum--;
        renderPage(currentPageNum);
        return true;
    }
    return false;
}

async function renderPage(num) {
    const page = await pdfDoc.getPage(num);
    const viewport = page.getViewport({ scale: 1.5 }); // Adjust scale as needed
    canvas.height = viewport.height;
    canvas.width = viewport.width;

    const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport: viewport,
    };
    await page.render(renderContext).promise;
    pageInfoElement.textContent = num;
}
```

- [ ] **Step 3: Update `src/index.js` to use `pdf-renderer.js`**
    (Import and use the PDF rendering functions)

```javascript
import './style.css';
import { initPdfRenderer, loadPdf, nextPage, prevPage } from './pdf-renderer';

document.getElementById('app').innerHTML = `
    <h1>Hands-Free PDF Reader</h1>
    <div id="controls">
        <input type="file" id="pdf-input" accept=".pdf" />
        <button id="start-webcam">Start Webcam</button>
        <button id="stop-webcam" disabled>Stop Webcam</button>
    </div>
    <div id="pdf-viewer">
        <canvas id="pdf-canvas"></canvas>
        <div id="page-info">Page: <span id="current-page">0</span> / <span id="total-pages">0</span></div>
    </div>
    <div id="gesture-feedback"></div>
`;

const pdfInput = document.getElementById('pdf-input');
const startWebcamBtn = document.getElementById('start-webcam');
const stopWebcamBtn = document.getElementById('stop-webcam');
const pdfCanvas = document.getElementById('pdf-canvas');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');
const gestureFeedbackDiv = document.getElementById('gesture-feedback');

initPdfRenderer(pdfCanvas, currentPageSpan, totalPagesSpan);

pdfInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadPdf(file);
    }
});

// Basic manual navigation for testing purposes (will be replaced by gestures)
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        if (nextPage()) {
            gestureFeedbackDiv.textContent = 'Manual: Next Page';
            setTimeout(() => gestureFeedbackDiv.textContent = '', 1000);
        }
    } else if (event.key === 'ArrowLeft') {
        if (prevPage()) {
            gestureFeedbackDiv.textContent = 'Manual: Previous Page';
            setTimeout(() => gestureFeedbackDiv.textContent = '', 1000);
        }
    }
});


console.log('App initialized!');
```

- [ ] **Step 4: Update webpack.config.js for worker support**

```javascript
const HtmlWebpackPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  mode: 'development', // or 'production'
  entry: './src/index.js',
  output: {
    filename: 'bundle.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
  module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader'],
      },
      { // Rule for pdf.worker.mjs
        test: /pdf\.worker\.mjs$/,
        type: 'asset/resource',
        generator: {
          filename: 'workers/[name][ext]',
        },
      },
      { // Rule for pdf.mjs
        test: /pdf\.mjs$/,
        resolve: {
          fullySpecified: false, // Allows importing pdf.mjs without .mjs extension
        },
      },
    ],
  },
  plugins: [
    new HtmlWebpackPlugin({
      template: './public/index.html',
      filename: 'index.html',
    }),
  ],
  devServer: {
    static: './dist',
  },
};
```

- [ ] **Step 5: Commit**

```bash
git add package.json src/index.js src/pdf-renderer.js webpack.config.js
git commit -m "feat: Integrate PDF.js for document rendering and basic navigation"
```

## 3. Webcam Integration

### Task 3.1: Setup Webcam Stream

**Files:**
- Modify: `src/index.js`
- Create: `src/webcam-manager.js`

- [ ] **Step 1: Create `src/webcam-manager.js`**
    (Module to handle webcam access and stream)

```javascript
let video = null;
let stream = null;
let onFrameCallback = null;
let animationFrameId = null;

export function initWebcam(videoEl, frameCallback) {
    video = videoEl;
    onFrameCallback = frameCallback;
    video.setAttribute('playsinline', '');
    video.muted = true; // Mute video to avoid feedback
}

export async function startWebcam() {
    try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        video.srcObject = stream;
        await video.play();
        // Start processing frames
        requestAnimationFrame(processFrame);
        return true;
    } catch (err) {
        console.error('Error accessing webcam:', err);
        return false;
    }
}

export function stopWebcam() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
    }
    if (video) {
        video.srcObject = null;
    }
    if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
    }
}

function processFrame() {
    if (video && video.readyState === video.HAVE_ENOUGH_DATA && onFrameCallback) {
        // Here, you could draw the video frame to a canvas
        // and then pass that canvas to a gesture detection library.
        // For now, we just pass the video element.
        onFrameCallback(video);
    }
    if (stream) { // Only continue if webcam is still active
        animationFrameId = requestAnimationFrame(processFrame);
    }
}
```

- [ ] **Step 2: Update `src/index.js` to integrate `webcam-manager.js`**
    (Add video element and call webcam functions)

```javascript
import './style.css';
import { initPdfRenderer, loadPdf, nextPage, prevPage } from './pdf-renderer';
import { initWebcam, startWebcam, stopWebcam } from './webcam-manager';

document.getElementById('app').innerHTML = `
    <h1>Hands-Free PDF Reader</h1>
    <div id="controls">
        <input type="file" id="pdf-input" accept=".pdf" />
        <button id="start-webcam">Start Webcam</button>
        <button id="stop-webcam" disabled>Stop Webcam</button>
    </div>
    <div id="pdf-viewer">
        <canvas id="pdf-canvas"></canvas>
        <div id="page-info">Page: <span id="current-page">0</span> / <span id="total-pages">0</span></div>
    </div>
    <div id="gesture-feedback"></div>
    <video id="webcam-video" style="display:none;"></video> <!-- Hidden video element for webcam stream -->
`;

const pdfInput = document.getElementById('pdf-input');
const startWebcamBtn = document.getElementById('start-webcam');
const stopWebcamBtn = document.getElementById('stop-webcam');
const pdfCanvas = document.getElementById('pdf-canvas');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');
const gestureFeedbackDiv = document.getElementById('gesture-feedback');
const webcamVideo = document.getElementById('webcam-video'); // New video element

initPdfRenderer(pdfCanvas, currentPageSpan, totalPagesSpan);
initWebcam(webcamVideo, (videoElement) => {
    // This callback will be called for each video frame.
    // Gesture detection logic will go here in subsequent tasks.
    // console.log('Processing video frame...');
});

pdfInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadPdf(file);
    }
});

startWebcamBtn.addEventListener('click', async () => {
    startWebcamBtn.disabled = true;
    if (await startWebcam()) {
        stopWebcamBtn.disabled = false;
        gestureFeedbackDiv.textContent = 'Webcam Started!';
    } else {
        startWebcamBtn.disabled = false;
        gestureFeedbackDiv.textContent = 'Webcam Failed to Start.';
    }
    setTimeout(() => gestureFeedbackDiv.textContent = '', 2000);
});

stopWebcamBtn.addEventListener('click', () => {
    stopWebcam();
    startWebcamBtn.disabled = false;
    stopWebcamBtn.disabled = true;
    gestureFeedbackDiv.textContent = 'Webcam Stopped.';
    setTimeout(() => gestureFeedbackDiv.textContent = '', 2000);
});

// Basic manual navigation for testing purposes (will be replaced by gestures)
document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') {
        if (nextPage()) {
            gestureFeedbackDiv.textContent = 'Manual: Next Page';
            setTimeout(() => gestureFeedbackDiv.textContent = '', 1000);
        }
    } else if (event.key === 'ArrowLeft') {
        if (prevPage()) {
            gestureFeedbackDiv.textContent = 'Manual: Previous Page';
            setTimeout(() => gestureFeedbackDiv.textContent = '', 1000);
        }
    }
});


console.log('App initialized!');
```

- [ ] **Step 3: Commit**

```bash
git add src/index.js src/webcam-manager.js
git commit -m "feat: Integrate webcam stream management"
```

## 4. Gesture Detection (Wink, Head Nod/Shake)

### Task 4.1: Integrate Face Tracking Library (e.g., MediaPipe Face Mesh)

**Files:**
- Modify: `src/webcam-manager.js`
- Create: `src/gesture-detector.js`
- Modify: `public/index.html` (for MediaPipe CDN if used this way)
- Modify: `webpack.config.js` (if local installation of MediaPipe)

**(Note: This task is complex and will involve significant research and integration. For MVP, we'll outline the conceptual steps and use a placeholder for the actual gesture logic.)**

- [ ] **Step 1: Research and choose a client-side face tracking library**
    (Example: MediaPipe Face Mesh via CDN or npm package, or a smaller alternative)

- [ ] **Step 2: Install/integrate chosen library**
    (e.g., `npm install @mediapipe/face_mesh` or add CDN script to `index.html`)

- [ ] **Step 3: Create `src/gesture-detector.js`**
    (Module to initialize and run face tracking, detect gestures)

```javascript
import { FaceMesh } from '@mediapipe/face_mesh';
import * as TWEEN from '@tweenjs/tween.js'; // Potentially for smooth head movement detection

// Constants for gesture detection thresholds (example values)
const WINK_THRESHOLD = 0.2; // Eye Aspect Ratio threshold
const NOD_THRESHOLD_PITCH = 10; // Degrees for head pitch change
const SHAKE_THRESHOLD_YAW = 15; // Degrees for head yaw change
const GESTURE_DEBOUNCE_MS = 1000; // Cooldown period for gestures

let faceMesh = null;
let gestureCallback = null;
let lastGestureTime = 0;

// Store recent head poses to detect movement
const headPoseHistory = [];
const HEAD_POSE_HISTORY_SIZE = 10; // Number of frames to store

export async function initGestureDetector(callback) {
    gestureCallback = callback;
    faceMesh = new FaceMesh({
        locateFile: (file) => {
            return `https://cdn.jsdelivr.net/npm/@mediapipe/face_mesh/${file}`;
        }
    });

    faceMesh.setOptions({
        maxNumFaces: 1,
        refineLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
    });

    faceMesh.onResults(onResults);
    console.log('Gesture Detector initialized.');
}

export async function detectGestures(videoElement) {
    if (faceMesh) {
        await faceMesh.send({ image: videoElement });
    }
}

function onResults(results) {
    if (results.multiFaceLandmarks && results.multiFaceLandmarks.length > 0) {
        const landmarks = results.multiFaceLandmarks[0];
        // Placeholder for actual detection logic
        const currentTimestamp = Date.now();

        // 1. Wink Detection (Left/Right)
        const leftEye = [landmarks[33], landmarks[160], landmarks[158], landmarks[133], landmarks[153], landmarks[144]]; // Example indices for left eye
        const rightEye = [landmarks[362], landmarks[385], landmarks[387], landmarks[263], landmarks[373], landmarks[380]]; // Example indices for right eye

        const leftEAR = calculateEAR(leftEye);
        const rightEAR = calculateEAR(rightEye);

        if (currentTimestamp - lastGestureTime > GESTURE_DEBOUNCE_MS) {
            if (leftEAR < WINK_THRESHOLD && rightEAR > (WINK_THRESHOLD * 1.5)) { // Left wink
                gestureCallback('wink-left');
                lastGestureTime = currentTimestamp;
            } else if (rightEAR < WINK_THRESHOLD && leftEAR > (WINK_THRESHOLD * 1.5)) { // Right wink
                gestureCallback('wink-right');
                lastGestureTime = currentTimestamp;
            }
        }

        // 2. Head Nod/Shake Detection (requires more advanced pose estimation)
        // MediaPipe Face Mesh provides 3D landmarks, which can be used to estimate head pose (pitch, yaw, roll).
        // This is a simplification; a proper implementation would involve solving PnP or similar.

        // For MVP, we can track changes in specific landmark positions (e.g., nose tip)
        // or integrate a dedicated pose estimation library.

        // Placeholder for head pose (pitch, yaw, roll) - conceptual
        const headPitch = 0; // Derived from landmarks
        const headYaw = 0; // Derived from landmarks

        headPoseHistory.push({ pitch: headPitch, yaw: headYaw, timestamp: currentTimestamp });
        if (headPoseHistory.length > HEAD_POSE_HISTORY_SIZE) {
            headPoseHistory.shift();
        }

        if (headPoseHistory.length === HEAD_POSE_HISTORY_SIZE && (currentTimestamp - lastGestureTime > GESTURE_DEBOUNCE_MS)) {
            const firstPose = headPoseHistory[0];
            const lastPose = headPoseHistory[HEAD_POSE_HISTORY_SIZE - 1];

            // Simple nod detection: significant change in pitch
            if (Math.abs(lastPose.pitch - firstPose.pitch) > NOD_THRESHOLD_PITCH) {
                if (lastPose.pitch > firstPose.pitch) { // Nod down
                    gestureCallback('nod-down');
                } else { // Nod up (if needed)
                    // gestureCallback('nod-up');
                }
                lastGestureTime = currentTimestamp;
            }
            // Simple shake detection: significant change in yaw
            else if (Math.abs(lastPose.yaw - firstPose.yaw) > SHAKE_THRESHOLD_YAW) {
                if (lastPose.yaw > firstPose.yaw) { // Shake right
                    gestureCallback('shake-right');
                } else { // Shake left
                    gestureCallback('shake-left');
                }
                lastGestureTime = currentTimestamp;
            }
        }

    }
}

// Helper function to calculate Eye Aspect Ratio (EAR)
function calculateEAR(eyeLandmarks) {
    // P1, P2, P3, P4, P5, P6 are typically the 6 eye landmarks
    // (vertical_1, vertical_2, horizontal_1, horizontal_2, vertical_3, vertical_4)
    // d1 = ||P2 - P6||
    // d2 = ||P3 - P5||
    // d3 = ||P1 - P4||
    // EAR = (d1 + d2) / (2 * d3)

    if (eyeLandmarks.length < 6) return 1.0; // Return a high value if not enough landmarks

    const dist = (p1, p2) => Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2));

    const p1 = eyeLandmarks[3]; // Horizontal start
    const p4 = eyeLandmarks[0]; // Horizontal end
    const p2 = eyeLandmarks[1]; // Vertical top 1
    const p6 = eyeLandmarks[5]; // Vertical bottom 1
    const p3 = eyeLandmarks[2]; // Vertical top 2
    const p5 = eyeLandmarks[4]; // Vertical bottom 2

    const d_vertical_1 = dist(p2, p6);
    const d_vertical_2 = dist(p3, p5);
    const d_horizontal = dist(p1, p4);

    if (d_horizontal === 0) return 1.0; // Avoid division by zero

    return (d_vertical_1 + d_vertical_2) / (2.0 * d_horizontal);
}
```

- [ ] **Step 4: Update `src/webcam-manager.js` to call `gesture-detector.js`**
    (Pass video frames to the detector)

```javascript
import { initGestureDetector, detectGestures } from './gesture-detector'; // Import new functions

let video = null;
let stream = null;
let onFrameCallback = null; // This will now be the gesture detection callback
let animationFrameId = null;

export async function initWebcam(videoEl, gestureDetectedCallback) { // Renamed callback
    video = videoEl;
    onFrameCallback = gestureDetectedCallback; // Now directly pass gesture detected callback
    video.setAttribute('playsinline', '');
    video.muted = true; // Mute video to avoid feedback

    await initGestureDetector(onFrameCallback); // Initialize gesture detector
}

// ... (startWebcam, stopWebcam functions remain similar)

function processFrame() {
    if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
        detectGestures(video); // Pass video element to gesture detector
    }
    if (stream) {
        animationFrameId = requestAnimationFrame(processFrame);
    }
}
```

- [ ] **Step 5: Update `src/index.js` to handle gesture events**
    (Map gestures to PDF navigation)

```javascript
import './style.css';
import { initPdfRenderer, loadPdf, nextPage, prevPage } from './pdf-renderer';
import { initWebcam, startWebcam, stopWebcam } from './webcam-manager'; // Updated import

document.getElementById('app').innerHTML = `
    <h1>Hands-Free PDF Reader</h1>
    <div id="controls">
        <input type="file" id="pdf-input" accept=".pdf" />
        <button id="start-webcam">Start Webcam</button>
        <button id="stop-webcam" disabled>Stop Webcam</button>
    </div>
    <div id="pdf-viewer">
        <canvas id="pdf-canvas"></canvas>
        <div id="page-info">Page: <span id="current-page">0</span> / <span id="total-pages">0</span></div>
    </div>
    <div id="gesture-feedback"></div>
    <video id="webcam-video" style="display:none;"></video> <!-- Hidden video element for webcam stream -->
`;

const pdfInput = document.getElementById('pdf-input');
const startWebcamBtn = document.getElementById('start-webcam');
const stopWebcamBtn = document.getElementById('stop-webcam');
const pdfCanvas = document.getElementById('pdf-canvas');
const currentPageSpan = document.getElementById('current-page');
const totalPagesSpan = document.getElementById('total-pages');
const gestureFeedbackDiv = document.getElementById('gesture-feedback');
const webcamVideo = document.getElementById('webcam-video');

initPdfRenderer(pdfCanvas, currentPageSpan, totalPagesSpan);

// Gesture detection callback
async function handleGesture(gestureType) {
    let feedbackText = '';
    let navigated = false;
    switch (gestureType) {
        case 'wink-right':
        case 'nod-down':
            navigated = nextPage();
            feedbackText = 'Next Page';
            break;
        case 'wink-left':
        case 'shake-left': // Assuming shake-left for previous, shake-right for next (configurable)
            navigated = prevPage();
            feedbackText = 'Previous Page';
            break;
        // Add more gesture mappings as needed
    }

    if (navigated) {
        gestureFeedbackDiv.textContent = `Gesture: ${feedbackText}`;
        setTimeout(() => gestureFeedbackDiv.textContent = '', 1500);
    }
}

initWebcam(webcamVideo, handleGesture); // Pass the gesture handler to webcam manager

pdfInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (file) {
        loadPdf(file);
    }
});

startWebcamBtn.addEventListener('click', async () => {
    startWebcamBtn.disabled = true;
    gestureFeedbackDiv.textContent = 'Starting Webcam...';
    if (await startWebcam()) {
        stopWebcamBtn.disabled = false;
        gestureFeedbackDiv.textContent = 'Webcam Started! Looking for gestures...';
    } else {
        startWebcamBtn.disabled = false;
        gestureFeedbackDiv.textContent = 'Webcam Failed to Start. Check permissions.';
    }
    setTimeout(() => gestureFeedbackDiv.textContent = '', 3000);
});

stopWebcamBtn.addEventListener('click', () => {
    stopWebcam();
    startWebcamBtn.disabled = false;
    stopWebcamBtn.disabled = true;
    gestureFeedbackDiv.textContent = 'Webcam Stopped.';
    setTimeout(() => gestureFeedbackDiv.textContent = '', 2000);
});

// Remove manual navigation (will be replaced by gestures)
// document.addEventListener('keydown', (event) => {
//     if (event.key === 'ArrowRight') {
//         if (nextPage()) {
//             gestureFeedbackDiv.textContent = 'Manual: Next Page';
//             setTimeout(() => gestureFeedbackDiv.textContent = '', 1000);
//         }
//     } else if (event.key === 'ArrowLeft') {
//         if (prevPage()) {
//             gestureFeedbackDiv.textContent = 'Manual: Previous Page';
//             setTimeout(() => gestureFeedbackDiv.textContent = '', 1000);
//         }
//     }
// });

console.log('App initialized!');
```

- [ ] **Step 6: Commit**

```bash
git add src/index.js src/webcam-manager.js src/gesture-detector.js
git commit -m "feat: Integrate face tracking and basic gesture detection for navigation"
```
