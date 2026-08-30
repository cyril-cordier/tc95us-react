const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID ?? ''

declare global {
  interface Window {
    dataLayer?: unknown[]
    gtag?: (...args: unknown[]) => void
  }
}

let initialised = false

/**
 * Charge Google Analytics à la demande. Le script était injecté dans
 * `index.html` avec l'identifiant en dur, donc actif y compris en développement.
 */
export function initAnalytics(): void {
  if (initialised || !MEASUREMENT_ID || import.meta.env.DEV) return
  initialised = true

  const script = document.createElement('script')
  script.async = true
  script.src = `https://www.googletagmanager.com/gtag/js?id=${MEASUREMENT_ID}`
  document.head.append(script)

  window.dataLayer = window.dataLayer ?? []
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer?.push(args)
  }
  window.gtag('js', new Date())
  window.gtag('config', MEASUREMENT_ID, { send_page_view: false })
}

export function trackPageView(path: string): void {
  if (!initialised) return
  window.gtag?.('event', 'page_view', { page_path: path })
}
