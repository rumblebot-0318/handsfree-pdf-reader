# Wireframes

## Main screen

```text
┌───────────────────────────────────────────────────────────────────────┐
│ Handsfree PDF Reader                                  [status chips] │
│ Browser-first PDF navigation with portable core logic                │
├───────────────────────┬───────────────────────────────────────────────┤
│ Controls              │ Reader                                        │
│ ┌───────────────────┐ │ ┌───────────────────────────────────────────┐ │
│ │ Upload PDF        │ │ │ page canvas                               │ │
│ └───────────────────┘ │ │                                           │ │
│ [Start webcam]        │ │                                           │ │
│ [Stop webcam]         │ │                                           │ │
│                       │ │                                           │ │
│ Wink threshold        │ │                                           │ │
│ Head threshold        │ │                                           │ │
│ Cooldown              │ │                                           │ │
│                       │ │                              Page 3 / 18   │ │
├───────────────────────┤ │ └───────────────────────────────────────────┘ │
│ Gesture camera        │ ├───────────────────────────────────────────────┤
│ ┌───────────────────┐ │ Runtime status                                  │
│ │ live preview      │ │ - document loaded                               │
│ │                   │ │ - gesture loop active                           │
│ └───────────────────┘ │ - last gesture / errors                         │
└───────────────────────┴───────────────────────────────────────────────┘
```

## Interaction notes
- Reader canvas is the visual priority.
- Controls stay grouped on the left for fast tuning.
- Webcam preview and runtime feedback remain visible so users understand what the app is doing.
- The MVP does not hide complexity behind heavy setup; it exposes thresholds directly.

## Future UI extensions
- calibration wizard overlay
- document mode switcher
- multi-page sheet music layout
- smart scroll mode
