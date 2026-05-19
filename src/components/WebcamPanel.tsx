import type { RefObject } from 'react'
import type { GestureEvent } from '../types'
import { StatusPill } from './StatusPill'

interface WebcamPanelProps {
  videoRef: RefObject<HTMLVideoElement>
  running: boolean
  error: string | null
  initStage: 'idle' | 'camera-starting' | 'camera-live' | 'vision-loading' | 'vision-live' | 'vision-failed'
  lastGesture: GestureEvent | null
  debugLines: string[]
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

export function WebcamPanel({ videoRef, running, error, initStage, lastGesture, debugLines }: WebcamPanelProps) {
  return (
    <section className="panel">
      <div className="panel__header panel__header--split">
        <div>
          <h2>Gesture camera</h2>
          <p>Local webcam processing only. No video leaves the browser.</p>
        </div>
        <StatusPill tone={running ? 'good' : 'warn'}>{describeStage(initStage)}</StatusPill>
      </div>

      <div className="webcam-frame webcam-frame--debug">
        <video ref={videoRef} autoPlay muted playsInline />
        <div className="webcam-debug-overlay">
          <strong>Gesture debug</strong>
          <div>stage: {describeStage(initStage)}</div>
          <div>last: {lastGesture ? `${lastGesture.label} / ${lastGesture.action}` : 'none'}</div>
        </div>
      </div>

      <div className="stack compact">
        {error ? <StatusPill tone="warn">{error}</StatusPill> : null}
        {initStage === 'vision-failed' ? <StatusPill tone="warn">Try reopening the camera, reducing open apps, or retrying on a stronger network.</StatusPill> : null}
        {lastGesture ? <StatusPill tone="good">{lastGesture.label} · {lastGesture.action} · {(lastGesture.confidence * 100).toFixed(0)}%</StatusPill> : null}
        <div className="debug-console">
          <div className="debug-console__title">console</div>
          {debugLines.length === 0 ? <div className="debug-console__line">No landmark events yet.</div> : null}
          {debugLines.map((line, index) => (
            <div key={`${line}-${index}`} className="debug-console__line">{line}</div>
          ))}
        </div>
      </div>
    </section>
  )
}
