import { Suspense } from 'react'
import { Outlet, ScrollRestoration } from 'react-router-dom'
import { Footer } from './Footer'
import { Navbar } from './Navbar'
import { Loader } from '@/components/ui/Loader'
import { usePageTracking } from '@/hooks/usePageTracking'

export function Layout() {
  usePageTracking()

  return (
    <div className="app-shell">
      <Navbar />

      <main className="app-content">
        <Suspense fallback={<Loader />}>
          <Outlet />
        </Suspense>
      </main>

      <Footer />
      <ScrollRestoration />
    </div>
  )
}
