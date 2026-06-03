import type { RefObject } from 'react'
import type { ViewerState } from '../types'

interface PdfStageProps {
  canvasRef: RefObject<HTMLCanvasElement>
  viewerState: ViewerState
  hasDocument: boolean
}

export function PdfStage({ canvasRef, viewerState, hasDocument }: PdfStageProps) {
  return (
    <section className="panel panel--viewer">
      <div className="panel__header panel__header--split panel__header--reader">
        <div>
          <h2>Reader</h2>
          <p>Hands-free PDF navigation with privacy-first browser processing.</p>
        </div>
        <div className="page-chip">
          Page {viewerState.page} / {viewerState.totalPages}
        </div>
      </div>

      <div className="page-index-banner">
        Current page index: <strong>{viewerState.page}</strong>
      </div>

      <div className="viewer-surface">
        {hasDocument ? null : (
          <div className="empty-state empty-state--reader">
            <strong>Upload a PDF to begin.</strong>
            <span>Then start the webcam and use left/right head movement to turn pages.</span>
          </div>
        )}
        <canvas ref={canvasRef} className={hasDocument ? 'pdf-canvas visible' : 'pdf-canvas'} />
      </div>
    </section>
  )
}
