import { useCallback, useMemo } from 'react'
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

  const setupHint = useMemo(() => {
    if (!hasDocument) return 'Start by uploading a PDF.'
    if (!gesture.isRunning) return 'PDF loaded. Start the webcam when you are ready.'
    return 'Reader is live. Turn your head left or right to move pages.'
  }, [gesture.isRunning, hasDocument])

  return (
    <main className="app-shell">
      <section className="hero panel panel--compact">
        <div className="hero__content">
          <div>
            <p className="eyebrow">Hands-free PDF navigation</p>
            <h1>Turn pages with horizontal head movement.</h1>
            <p className="hero__copy">
              Upload a PDF, start the webcam, and navigate pages with left/right head turns while keeping all camera processing inside the browser.
            </p>
          </div>
          <div className="hero__chips">
            <StatusPill tone={hasDocument ? 'good' : 'warn'}>{hasDocument ? 'PDF loaded' : 'Waiting for PDF'}</StatusPill>
            <StatusPill tone={gesture.isRunning ? 'good' : 'neutral'}>{gesture.isRunning ? 'Webcam active' : 'Webcam idle'}</StatusPill>
            <StatusPill tone="neutral">Horizontal axis only</StatusPill>
          </div>
        </div>
        <div className="hero__hint">{setupHint}</div>
      </section>

      <section className="layout-grid">
        <div className="stack stack--sidebar">
          <ControlsPanel
            config={gesture.config}
            onConfigChange={gesture.setConfig}
            onFileSelect={openFile}
            webcamRunning={gesture.isRunning}
            webcamLoading={gesture.isLoading}
            cameraFacingMode={gesture.cameraFacingMode}
            onStartWebcam={gesture.start}
            onStopWebcam={gesture.stop}
            onSwitchCamera={gesture.switchCamera}
          />
          <WebcamPanel
            videoRef={gesture.videoRef}
            running={gesture.isRunning}
            error={gesture.error}
            initStage={gesture.initStage}
            lastGesture={gesture.lastGesture}
            debugLines={gesture.debugLines}
            pointerGuide={gesture.pointerGuide}
            cooldownRemainingMs={gesture.cooldownRemainingMs}
            autoLockCountdownMs={gesture.autoLockCountdownMs}
            guideToast={gesture.guideToast}
            onSetManualBaseline={gesture.setManualBaseline}
            onSetManualThresholdOffset={gesture.setManualThresholdOffset}
            onResetManualBaseline={gesture.resetManualBaseline}
          />
        </div>

        <div className="stack stack--reader">
          <PdfStage canvasRef={canvasRef} viewerState={viewerState} hasDocument={hasDocument} />

          <section className="panel panel--compact">
            <div className="panel__header panel__header--split">
              <h2>Runtime status</h2>
              {loading ? <StatusPill>Loading PDF…</StatusPill> : null}
            </div>
            <div className="stack compact status-summary">
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
