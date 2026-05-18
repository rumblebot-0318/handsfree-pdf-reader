import { getDocument, GlobalWorkerOptions, type PDFDocumentProxy } from 'pdfjs-dist'

GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.mjs',
  import.meta.url,
).toString()

export async function loadPdf(source: Uint8Array): Promise<PDFDocumentProxy> {
  return getDocument({ data: source }).promise
}

export async function renderPage(params: {
  pdf: PDFDocumentProxy
  pageNumber: number
  scale: number
  canvas: HTMLCanvasElement
}) {
  const page = await params.pdf.getPage(params.pageNumber)
  const viewport = page.getViewport({ scale: params.scale })
  const context = params.canvas.getContext('2d')
  if (!context) throw new Error('Canvas 2D context unavailable')
  params.canvas.width = viewport.width
  params.canvas.height = viewport.height
  await page.render({ canvasContext: context, viewport }).promise
}
