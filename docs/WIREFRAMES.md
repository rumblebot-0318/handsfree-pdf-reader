# Wireframes: Hands-Free PDF Reader (MVP)

## 1. Overview

This document outlines the conceptual wireframes for the Minimum Viable Product (MVP) of the Hands-Free PDF Reader. The focus is on a clean, functional interface that prioritizes PDF content and gesture-based navigation, with minimal on-screen controls.

## 2. Main Application View

```
+-------------------------------------------------------------------+
| [App Title]                                                       |
|                                                                   |
| +-------------------------------------------------------------+   |
| |  [PDF Display Area]                                         |   |
| |                                                             |   |
| |  (Rendering of the current PDF page)                        |   |
| |                                                             |   |
| |  (Page number: 1/10)                                        |   |
| |                                                             |   |
| +-------------------------------------------------------------+   |
|                                                                   |
| +-------------------------------------------------------------+   |
| | [Upload PDF Button]  [Start Webcam] [Stop Webcam]             |   |
| +-------------------------------------------------------------+   |
|                                                                   |
| (Optional: Small, subtle visual feedback for gesture detection)   |
| (e.g., "Wink detected -> Next Page")                              |
+-------------------------------------------------------------------+
```

### 2.1. Initial State (No PDF Loaded, Webcam Off)

-   **Main Area:** Displays a prompt to "Upload a PDF to begin" or a placeholder.
-   **Controls:**
    -   `[Upload PDF Button]` (prominently displayed, possibly also drag-and-drop zone).
    -   `[Start Webcam]` button (initially enabled).
    -   `[Stop Webcam]` button (initially disabled).
-   **Page Number:** Not displayed.
-   **Gesture Feedback:** Not displayed.

### 2.2. PDF Loaded, Webcam Off

-   **Main Area:** Displays the first page of the loaded PDF.
-   **Controls:**
    -   `[Upload PDF Button]` (still available, possibly less prominent).
    -   `[Start Webcam]` button (enabled).
    -   `[Stop Webcam]` button (disabled).
-   **Page Number:** "1 / [Total Pages]".
-   **Gesture Feedback:** Not displayed.

### 2.3. PDF Loaded, Webcam On

-   **Main Area:** Displays the current page of the PDF.
-   **Controls:**
    -   `[Upload PDF Button]` (available).
    -   `[Start Webcam]` button (disabled).
    -   `[Stop Webcam]` button (enabled).
-   **Page Number:** "X / [Total Pages]".
-   **Gesture Feedback:**
    -   A small, temporary overlay or text message appears when a gesture is successfully detected.
    -   Example: "-> Next Page", "<- Prev Page". This disappears after a short delay (e.g., 1-2 seconds).
    -   The feedback should be non-intrusive and not obscure the PDF content significantly.

## 3. PDF Upload Interaction

### 3.1. Drag-and-Drop

-   **Visual Cue:** When a user drags a file over the application window, a "Drop PDF here" overlay might appear over the `[PDF Display Area]`.
-   **Action:** Dropping a `.pdf` file initiates loading and displays the first page.

### 3.2. Button Click

-   **Action:** Clicking `[Upload PDF Button]` opens a native file selection dialog.
-   **Outcome:** Selecting a `.pdf` file initiates loading and displays the first page.

## 4. Webcam Control Interaction

### 4.1. Start Webcam

-   **Action:** Clicking `[Start Webcam]` prompts the user for camera access (browser default).
-   **Outcome (Success):** Webcam feed starts processing (not necessarily displayed to user, but active). `[Start Webcam]` disables, `[Stop Webcam]` enables. Gesture detection becomes active.
-   **Outcome (Failure/Denial):** An error message or notification appears (e.g., "Webcam access denied or failed"). Both buttons remain in their initial state.

### 4.2. Stop Webcam

-   **Action:** Clicking `[Stop Webcam]` halts webcam processing.
-   **Outcome:** `[Start Webcam]` enables, `[Stop Webcam]` disables. Gesture detection becomes inactive.

## 5. Gesture Feedback Examples

-   **Wink (Left/Right):** "Wink Detected: Next Page" or "Wink Detected: Previous Page"
-   **Head Nod:** "Head Nod Detected: Next Page"
-   **Head Shake:** "Head Shake Detected: Previous Page"

These messages are brief and disappear quickly.
