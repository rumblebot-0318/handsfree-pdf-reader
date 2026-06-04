import { useRef, useState, type PointerEvent as ReactPointerEvent, type RefObject } from 'react'
import type { GestureEvent } from '../types'
import { StatusPill } from './StatusPill'

interface WebcamPanelProps {
  videoRef: RefObject<HTMLVideoElement>
  running: boolean
  error: string | null
  initStage: 'idle' | 'camera-starting' | 'camera-live' | 'vision-loading' | 'vision-live' | 'vision-failed'
  lastGesture: GestureEvent | null
  debugLines: string[]
  pointerGuide: { centerX: number; baseline: number; leftTarget: number; rightTarget: number; manual: boolean; offset: number } | null
  cooldownRemainingMs: number
  autoLockCountdownMs: number
  guideToast: string | null
  onSetManualBaseline: (value: number) => void
  onSetManualThresholdOffset: (value: number) => void
  onResetManualBaseline: () => void
}

function describeStage(stage: WebcamPanelProps['initStage']) {
  switch (stage) {
    case 'camera-starting':
      return 'Requesting camera…'
    case 'camera-live':
      return 'Camera live, gesture model pending'
    case 'vision-loading':
      return 'Loading gesture model…'
    case 'vision-live':
      return 'Gesture model live'
    case 'vision-failed':
      return 'Camera live, gesture model failed'
    default:
      return 'Stopped'
  }
}

type DragMode = 'baseline' | 'left' | 'right' | null

export function WebcamPanel({ videoRef, running, error, initStage, lastGesture, debugLines, pointerGuide, cooldownRemainingMs, autoLockCountdownMs, guideToast, onSetManualBaseline, onSetManualThresholdOffset, onResetManualBaseline }: WebcamPanelProps) {
  const [debugOpen, setDebugOpen] = useState(false)
  const dragModeRef = useRef<DragMode>(null)

  const updateFromPointer = (clientX: number, rect: DOMRect) => {
    if (!pointerGuide || !dragModeRef.current) return
    const ratio = Math.min(0.96, Math.max(0.04, (clientX - rect.left) / rect.width))

    if (dragModeRef.current === 'baseline') {
      onSetManualBaseline(ratio)
      return
    }

    const nextOffset = Math.abs(ratio - pointerGuide.baseline)
    onSetManualThresholdOffset(nextOffset)
  }

  const beginDrag = (mode: Exclude<DragMode, null>) => (event: ReactPointerEvent<HTMLButtonElement>) => {
    const frame = event.currentTarget.closest('.webcam-frame') as HTMLDivElement | null
    if (!frame) return
    dragModeRef.current = mode
    event.currentTarget.setPointerCapture(event.pointerId)
    updateFromPointer(event.clientX, frame.getBoundingClientRect())
  }

  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    dragModeRef.current = null
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
  }

  return (
    <section className="panel panel--compact">
      <div className="panel__header panel__header--split">
        <div>
          <h2>Gesture camera</h2>
          <p>Drag the center or side handles to tune page-turn target lines.</p>
        </div>
        <StatusPill tone={running ? 'good' : 'warn'}>{describeStage(initStage)}</StatusPill>
      </div>

      <div
        className="webcam-frame webcam-frame--debug webcam-frame--pip"
        onPointerMove={(event) => {
          if (!dragModeRef.current) return
          updateFromPointer(event.clientX, event.currentTarget.getBoundingClientRect())
        }}
      >
        <video ref={videoRef} autoPlay muted playsInline />
        {pointerGuide ? (
          <div className="pointer-guide">
            <div className="pointer-guide__line pointer-guide__line--left" style={{ left: `${pointerGuide.leftTarget * 100}%` }} />
            <div className="pointer-guide__line pointer-guide__line--baseline" style={{ left: `${pointerGuide.baseline * 100}%` }} />
            <div className="pointer-guide__line pointer-guide__line--right" style={{ left: `${pointerGuide.rightTarget * 100}%` }} />
            <div className="pointer-guide__pointer" style={{ left: `${pointerGuide.centerX * 100}%` }} />
            <button
              type="button"
              className="pointer-guide__handle pointer-guide__handle--left"
              style={{ left: `${pointerGuide.leftTarget * 100}%` }}
              onPointerDown={beginDrag('left')}
              onPointerUp={endDrag}
            >
              L
            </button>
            <button
              type="button"
              className="pointer-guide__handle pointer-guide__handle--baseline"
              style={{ left: `${pointerGuide.baseline * 100}%` }}
              onPointerDown={beginDrag('baseline')}
              onPointerUp={endDrag}
            >
              C
            </button>
            <button
              type="button"
              className="pointer-guide__handle pointer-guide__handle--right"
              style={{ left: `${pointerGuide.rightTarget * 100}%` }}
              onPointerDown={beginDrag('right')}
              onPointerUp={endDrag}
            >
              R
            </button>
          </div>
        ) : null}
        {cooldownRemainingMs > 0 ? (
          <div className="cooldown-overlay">
            <div className="cooldown-overlay__count">{Math.ceil(cooldownRemainingMs / 1000)}</div>
            <div className="cooldown-bar">
              <div className="cooldown-bar__fill" style={{ width: `${100 - (cooldownRemainingMs / 3000) * 100}%` }} />
            </div>
          </div>
        ) : null}
        {guideToast ? <div className="guide-toast">{guideToast}</div> : null}
        <div className="webcam-debug-overlay">
          <strong>Gesture guide</strong>
          <div>stage: {describeStage(initStage)}</div>
          <div>last: {lastGesture ? `${lastGesture.label} / ${lastGesture.action}` : 'none'}</div>
          <div>baseline: {pointerGuide?.manual ? 'manual' : 'auto'}</div>
          {autoLockCountdownMs > 0 ? <div>lock in: {(autoLockCountdownMs / 1000).toFixed(1)}s</div> : null}
          {pointerGuide ? <div>range: ±{(pointerGuide.offset * 100).toFixed(0)}%</div> : null}
        </div>
      </div>

      <div className="stack compact">
        {error ? <StatusPill tone="warn">{error}</StatusPill> : null}
        {initStage === 'vision-failed' ? <StatusPill tone="warn">Try reopening the camera, reducing open apps, or retrying on a stronger network.</StatusPill> : null}
        {autoLockCountdownMs > 0 ? <StatusPill>Locking baseline in {Math.ceil(autoLockCountdownMs / 1000)}… Hold still and face forward.</StatusPill> : null}
        {lastGesture ? <StatusPill tone="good">{lastGesture.label} · {lastGesture.action} · {(lastGesture.confidence * 100).toFixed(0)}%</StatusPill> : null}
        {pointerGuide ? (
          <div className="guide-readout">
            <span>Center {Math.round(pointerGuide.baseline * 100)}%</span>
            <span>Left {Math.round(pointerGuide.leftTarget * 100)}%</span>
            <span>Right {Math.round(pointerGuide.rightTarget * 100)}%</span>
          </div>
        ) : null}
        <div className="button-row button-row--compact button-row--wrap">
          <button className="button button--secondary" onClick={onResetManualBaseline}>Reset guide</button>
          <button className="button button--ghost" onClick={() => setDebugOpen((value) => !value)}>
            {debugOpen ? 'Hide debug' : 'Show debug'}
          </button>
        </div>
        {debugOpen ? (
          <div className="debug-console">
            <div className="debug-console__title">console</div>
            {debugLines.length === 0 ? <div className="debug-console__line">No landmark events yet.</div> : null}
            {debugLines.map((line, index) => (
              <div key={`${line}-${index}`} className="debug-console__line">{line}</div>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
