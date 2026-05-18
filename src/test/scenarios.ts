export const manualTestScenarios = [
  {
    id: 'pdf-load-basic',
    title: 'Load a valid PDF',
    steps: ['Open app', 'Upload a valid PDF file', 'Confirm page 1 renders'],
    expected: 'Canvas shows first page and page count updates',
  },
  {
    id: 'gesture-left-wink',
    title: 'Left wink navigation',
    steps: ['Load a multi-page PDF', 'Start webcam', 'Perform a clear left wink'],
    expected: 'Viewer moves to previous page once',
  },
  {
    id: 'gesture-right-wink',
    title: 'Right wink navigation',
    steps: ['Load a multi-page PDF', 'Start webcam', 'Perform a clear right wink'],
    expected: 'Viewer moves to next page once',
  },
  {
    id: 'gesture-head-turn',
    title: 'Head turn navigation',
    steps: ['Load a multi-page PDF', 'Start webcam', 'Turn head left then right beyond threshold'],
    expected: 'Viewer changes page according to turn direction',
  },
  {
    id: 'camera-permission-denied',
    title: 'Camera denied',
    steps: ['Open app', 'Start webcam', 'Deny browser permission'],
    expected: 'Readable error message appears and app remains usable for PDF viewing',
  },
]
