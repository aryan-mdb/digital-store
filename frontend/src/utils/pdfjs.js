// pdf.js is only needed by the reader, so it is loaded from the CDN on first use
// instead of being bundled into every page.
const VERSION = '3.11.174'
const BASE = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${VERSION}`

let loading = null

export function loadPdfJs() {
  if (window.pdfjsLib) return Promise.resolve(window.pdfjsLib)
  if (loading) return loading

  loading = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = `${BASE}/pdf.min.js`
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${BASE}/pdf.worker.min.js`
      resolve(window.pdfjsLib)
    }
    script.onerror = () => {
      loading = null
      reject(new Error('The reader could not load. Check your connection and try again.'))
    }
    document.head.appendChild(script)
  })
  return loading
}
