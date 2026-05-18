import type { RefObject } from 'react'
import type { GestureEvent } from '../types'
import { StatusPill } from './StatusPill'

interface WebcamPanelProps {
  videoRef: RefObject<HTMLVideoElement>
  running: boolean
  error: string | null
  lastGesture: GestureEvent | null
}

export function WebcamPanel({ videoRef, running, error, lastGesture }: WebcamPanelProps) {
  return (
    <section className="panel">
      <div className="panel__header panel__header--split">
        <div>
          <h2>Gesture camera</h2>
          <p>Local webcam processing only. No video leaves the browser.</p>
        </div>
        <StatusPill tone={running ? 'good' : 'warn'}>{running ? 'Live' : 'Stopped'}</StatusPill>
      </div>

      <div className="webcam-frame">
        <video ref={videoRef} autoPlay muted playsInline />
      </div>

      <div className="stack compact">
        {error ? <StatusPill tone="warn">{error}</StatusPill> : null}
        {lastGesture ? <StatusPill tone="good">{lastGesture.label} · {lastGesture.action} · {(lastGesture.confidence * 100).toFixed(0)}%</StatusPill> : null}
      </div>
    </section>
  )
}
