import { ArrowLeft, Lock, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { Link, useLocation, useParams } from 'react-router-dom'
import FullPageSpinner from '../../components/ui/FullPageSpinner'
import { apiErrorMessage } from '../../services/api'
import { downloadService } from '../../services/orderService'
import { loadPdfJs } from '../../utils/pdfjs'

const ZOOMS = [0.75, 1, 1.25, 1.5]

/**
 * Reads a purchased guide inside the dashboard. Pages are drawn onto
 * canvases with pdf.js, so the browser's own PDF viewer — with its
 * download and print buttons — never opens. Right-click, text selection,
 * Ctrl+S / Ctrl+P and printing are blocked too. This stops casual saving;
 * it cannot stop screenshots.
 */
export default function ReaderPage() {
  const { itemId } = useParams()
  const { state } = useLocation()
  const title = state?.title || 'Your guide'
  const containerRef = useRef(null)
  const [pdf, setPdf] = useState(null)
  const [error, setError] = useState('')
  const [zoom, setZoom] = useState(1)

  useEffect(() => {
    let cancelled = false
    Promise.all([loadPdfJs(), downloadService.read(itemId)])
      .then(([pdfjs, data]) => pdfjs.getDocument({ data }).promise)
      .then((doc) => !cancelled && setPdf(doc))
      .catch((err) => !cancelled && setError(err?.response ? apiErrorMessage(err) : err.message))
    return () => {
      cancelled = true
    }
  }, [itemId])

  // Draw every page whenever the document or zoom changes.
  useEffect(() => {
    if (!pdf || !containerRef.current) return
    let cancelled = false
    const box = containerRef.current
    box.innerHTML = ''

    ;(async () => {
      const width = box.clientWidth
      const ratio = window.devicePixelRatio || 1
      for (let n = 1; n <= pdf.numPages && !cancelled; n++) {
        const page = await pdf.getPage(n)
        const base = page.getViewport({ scale: 1 })
        const viewport = page.getViewport({ scale: (width / base.width) * zoom * ratio })
        const canvas = document.createElement('canvas')
        canvas.width = viewport.width
        canvas.height = viewport.height
        canvas.style.width = `${viewport.width / ratio}px`
        canvas.className = 'mx-auto block max-w-none rounded-md bg-white shadow-[0_10px_40px_rgba(0,0,0,0.5)]'
        box.appendChild(canvas)
        await page.render({ canvasContext: canvas.getContext('2d'), viewport }).promise
      }
    })()

    return () => {
      cancelled = true
    }
  }, [pdf, zoom])

  // Block the usual ways of saving or printing while the reader is open.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.ctrlKey || e.metaKey) && ['s', 'p'].includes(e.key.toLowerCase())) e.preventDefault()
    }
    const style = document.createElement('style')
    style.textContent = '@media print { body { display: none !important; } }'
    document.head.appendChild(style)
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
      style.remove()
    }
  }, [])

  const zoomIndex = ZOOMS.indexOf(zoom)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <Link to="/dashboard/downloads" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" /> My guides
        </Link>
        <h1 className="flex-1 truncate text-xl font-bold text-slate-900">{title}</h1>
        {pdf && <span className="text-sm text-slate-500">{pdf.numPages} {pdf.numPages === 1 ? 'page' : 'pages'}</span>}
        <div className="flex items-center gap-1 rounded-full border border-slate-200 p-1">
          <button type="button" aria-label="Zoom out" disabled={zoomIndex <= 0} onClick={() => setZoom(ZOOMS[zoomIndex - 1])} className="rounded-full p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-40">
            <ZoomOut className="h-4 w-4" />
          </button>
          <span className="w-12 text-center text-xs text-slate-500">{Math.round(zoom * 100)}%</span>
          <button type="button" aria-label="Zoom in" disabled={zoomIndex >= ZOOMS.length - 1} onClick={() => setZoom(ZOOMS[zoomIndex + 1])} className="rounded-full p-1.5 text-slate-500 hover:text-slate-900 disabled:opacity-40">
            <ZoomIn className="h-4 w-4" />
          </button>
        </div>
      </div>

      <p className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-500">
        <Lock className="h-3.5 w-3.5 text-brand-500" /> Licensed to your account — please don’t share or copy.
      </p>

      {error ? (
        <p className="rounded-xl border border-red-500/40 bg-red-500/10 p-4 text-sm text-red-300">{error}</p>
      ) : !pdf ? (
        <FullPageSpinner />
      ) : null}

      <div
        ref={containerRef}
        onContextMenu={(e) => e.preventDefault()}
        onDragStart={(e) => e.preventDefault()}
        className="mx-auto grid max-w-[900px] select-none gap-4 overflow-x-auto"
      />
    </div>
  )
}
