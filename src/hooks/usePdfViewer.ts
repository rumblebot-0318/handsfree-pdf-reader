import { useCallback, useEffect, useRef, useState } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'
import { loadPdf, renderPage } from '../lib/pdf'
import type { ViewerState } from '../types'

const initialViewerState: ViewerState = {
  page: 1,
  totalPages: 1,
  scale: 1.25,
}

export function usePdfViewer() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null)
  const [viewerState, setViewerState] = useState<ViewerState>(initialViewerState)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const renderCurrentPage = useCallback(async () => {
    if (!pdf || !canvasRef.current) return
    try {
      await renderPage({
        pdf,
        pageNumber: viewerState.page,
        scale: viewerState.scale,
        canvas: canvasRef.current,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to render PDF page')
    }
  }, [pdf, viewerState.page, viewerState.scale])

  useEffect(() => {
    void renderCurrentPage()
  }, [renderCurrentPage])

  const openFile = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)
    try {
      const buffer = new Uint8Array(await file.arrayBuffer())
      const nextPdf = await loadPdf(buffer)
      setPdf(nextPdf)
      setViewerState({
        page: 1,
        totalPages: nextPdf.numPages,
        scale: initialViewerState.scale,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to open PDF file')
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    canvasRef,
    viewerState,
    setViewerState,
    openFile,
    loading,
    error,
    hasDocument: Boolean(pdf),
  }
}
