# Architecture Document: Hands-Free PDF Reader (MVP)

## 1. Overview

The Hands-Free PDF Reader is designed as a client-side, browser-based web application with a strong emphasis on privacy. All core functionalities, including PDF rendering and gesture detection, will execute entirely within the user's browser environment. No webcam data, PDF content, or gesture-derived information will be transmitted to any external servers.

## 2. High-Level Architecture

```
+-----------------------------------------------------------------------+
| User's Web Browser                                                    |
|                                                                       |
| +---------------------+      +---------------------+      +--------+ |
| |  User Interface (UI)  |      |  PDF Renderer       |      |  Data  | |
| |  (HTML, CSS, JS)    |<---->|  (PDF.js)           |<---->|  Store | |
| +----------^----------+      +----------^----------+      | (Local | |
|            |                          |                     | Storage)| |
|            |                          |                     +--------+ |
|            |                          |                               |
|            |      +-------------------+-------------------+           |
|            |      | Webcam & Gesture Detection Module       |           |
|            +----->| (getUserMedia, Face Tracking Library) |<----------+
|                   +---------------------------------------+           |
|                                                                       |
+-----------------------------------------------------------------------+
```

## 3. Component Breakdown

### 3.1. User Interface (UI)

-   **Technologies:** HTML, CSS, Vanilla JavaScript (or a lightweight framework if deemed necessary for maintainability, but vanilla for MVP simplicity).
-   **Responsibilities:**
    -   Displays the main application layout, including PDF viewing area and controls.
    -   Handles user interactions (e.g., file upload, webcam start/stop buttons).
    -   Provides visual feedback for gesture detection.
    -   Orchestrates data flow between other modules.

### 3.2. PDF Renderer

-   **Technology:** PDF.js (Mozilla's PDF rendering library for HTML5).
-   **Responsibilities:**
    -   Loads and parses PDF files provided by the user.
    -   Renders PDF pages onto HTML `<canvas>` elements for display in the UI.
    -   Manages current page state and navigates between pages upon request.

### 3.3. Webcam & Gesture Detection Module

-   **Technologies:**
    -   `navigator.mediaDevices.getUserMedia()` for webcam access.
    -   A client-side face tracking library (e.g., MediaPipe Face Mesh, or a custom WebAssembly/JS implementation) to perform:
        -   Face detection.
        -   Facial landmark extraction (for wink detection).
        -   Head pose estimation (for nod/shake detection).
-   **Responsibilities:**
    -   Initializes and manages the webcam stream.
    -   Continuously processes video frames to detect facial gestures (wink, head nod, head shake).
    -   Emits events or calls callbacks when a valid gesture is detected, signaling the UI to navigate.
    -   Ensures all processing is done locally within the browser context.

### 3.4. Data Store (Local Storage)

-   **Technology:** Browser's `localStorage` or `IndexedDB`.
-   **Responsibilities:**
    -   Temporarily stores the loaded PDF file (e.g., as a `File` object or `ArrayBuffer`) for rendering.
    -   May store user preferences (e.g., last viewed page, if implemented in a later stage).
    -   Crucially, **no sensitive data or webcam feed frames are persisted or transmitted.**

## 4. Data Flow

1.  **User Action:** User uploads a PDF via UI (drag-and-drop or file input).
2.  **PDF Loading:** UI passes the PDF `File` or `ArrayBuffer` to the PDF Renderer.
3.  **PDF Display:** PDF Renderer loads the PDF and renders the first page to a `<canvas>` element in the UI.
4.  **Webcam Start:** User clicks `[Start Webcam]`. UI requests webcam access via `getUserMedia()`.
5.  **Frame Processing:** Webcam & Gesture Detection Module receives video frames from the webcam stream.
6.  **Gesture Detection:** Module analyzes frames for winks, head nods, or head shakes.
7.  **Navigation Event:** Upon detecting a valid gesture, the module signals the UI (e.g., via a custom event or callback) with the detected gesture type.
8.  **Page Change:** UI receives the gesture event and instructs the PDF Renderer to navigate to the next or previous page.
9.  **Visual Feedback:** UI displays temporary visual confirmation of the gesture and page change.

## 5. Security & Privacy Considerations

-   **Client-Side Processing:** All sensitive data (webcam feed) remains within the user's browser. No data is sent to a backend server for processing or storage.
-   **Permissions:** Webcam access requires explicit user permission, managed by the browser.
-   **Local Storage:** Only non-sensitive, transient data (like the PDF itself for active viewing) will be stored locally. Users can clear browser data at any time.

## 6. Development Environment & Tools

-   **Text Editor/IDE:** VS Code.
-   **Package Management:** npm/yarn (for PDF.js and any face tracking library).
-   **Build Tool:** Webpack/Rollup (for bundling and optimization).
-   **Linting/Formatting:** ESLint, Prettier.
