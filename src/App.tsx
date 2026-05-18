import { useCallback } from 'react'
import { ControlsPanel } from './components/ControlsPanel'
import { PdfStage } from './components/PdfStage'
import { WebcamPanel } from './components/WebcamPanel'
import { StatusPill } from './components/StatusPill'
import { applyGestureToViewer } from './core/navigation'
import { useGestureController } from './hooks/useGestureController'
import { usePdfViewer } from './hooks/usePdfViewer'
import type { GestureEvent } from './types'

export default function App() {
  const { canvasRef, viewerState, setViewerState, openFile, loading, error: pdfError, hasDocument } = usePdfViewer()

  const handleGesture = useCallback(
    (event: GestureEvent) => {
      setViewerState((current) => applyGestureToViewer(current, event.action))
    },
    [setViewerState],
  )

  const gesture = useGestureController(handleGesture)

  return (
    <main className="app-shell">
      <section className="hero panel">
        <div>
          <p className="eyebrow">Hands-free reading MVP</p>
          <h1>Handsfree PDF Reader</h1>
          <p className="hero__copy">
            Browser-first PDF navigation using wink and head-turn gestures, designed so the gesture logic can later move into a React Native app with minimal rewrites.
          </p>
        </div>
        <div className="hero__chips">
          <StatusPill tone="good">Local-first privacy</StatusPill>
          <StatusPill tone="neutral">React + TS</StatusPill>
          <StatusPill tone="neutral">Portable core logic</StatusPill>
        </div>
      </section>

      <section className="layout-grid">
        <div className="stack">
          <ControlsPanel
            config={gesture.config}
            onConfigChange={gesture.setConfig}
            onFileSelect={openFile}
            webcamRunning={gesture.isRunning}
            webcamLoading={gesture.isLoading}
            onStartWebcam={gesture.start}
            onStopWebcam={gesture.stop}
          />
          <WebcamPanel
            videoRef={gesture.videoRef}
            running={gesture.isRunning}
            error={gesture.error}
            initStage={gesture.initStage}
            lastGesture={gesture.lastGesture}
          />
        </div>

        <div className="stack">
          <PdfStage canvasRef={canvasRef} viewerState={viewerState} hasDocument={hasDocument} />

          <section className="panel">
            <div className="panel__header panel__header--split">
              <h2>Runtime status</h2>
              {loading ? <StatusPill>Loading PDF…</StatusPill> : null}
            </div>
            <div className="stack compact">
              {pdfError ? <StatusPill tone="warn">{pdfError}</StatusPill> : null}
              <StatusPill tone={hasDocument ? 'good' : 'warn'}>
                {hasDocument ? `Document loaded · ${viewerState.totalPages} pages` : 'No document loaded yet'}
              </StatusPill>
              <StatusPill tone={gesture.isRunning ? 'good' : 'neutral'}>
                {gesture.isRunning ? 'Gesture loop active' : 'Gesture loop idle'}
              </StatusPill>
            </div>
          </section>
        </div>
      </section>
    </main>
  )
}
