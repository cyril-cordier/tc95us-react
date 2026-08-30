import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Loader } from '@/components/ui/Loader'
import { useAuth } from './useAuth'

/**
 * Garde de route déclarative. L'ancien `router.beforeEach` lisait localStorage
 * à chaque navigation et redirigeait avec `window.location.href`, ce qui
 * rechargeait toute l'application à chaque fois.
 */
export function RequireAuth({ adminOnly = false }: { adminOnly?: boolean }) {
  const { isAuthenticated, isAdmin, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) return <Loader label="Vérification de la session…" />

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  if (adminOnly && !isAdmin) return <Navigate to="/mon-compte" replace />

  return <Outlet />
}
