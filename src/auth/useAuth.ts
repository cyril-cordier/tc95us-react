import { useContext } from 'react'
import { AuthContext, type AuthState } from './context'

export function useAuth(): AuthState {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth doit être utilisé dans <AuthProvider>')
  return context
}
