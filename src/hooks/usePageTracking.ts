import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { initAnalytics, trackPageView } from '@/lib/analytics'

export function usePageTracking(): void {
  const { pathname } = useLocation()

  useEffect(() => {
    initAnalytics()
    trackPageView(pathname)
  }, [pathname])
}
