import { useCallback, useMemo, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCurrentUser, login } from '@/api/auth'
import { clearSessionToken, getSessionToken, setSessionToken } from '@/lib/session'
import { AuthContext, type AuthState } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  // `/users/me` n'est interrogé que si un token existe : sans ça chaque
  // visiteur anonyme déclenchait un 401 au chargement de la page d'accueil.
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchCurrentUser,
    enabled: Boolean(getSessionToken()),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const signIn = useCallback(
    async (username: string, password: string) => {
      const session = await login(username, password)
      setSessionToken(session.sessionToken)
      queryClient.setQueryData(['me'], session)
      await queryClient.invalidateQueries()
    },
    [queryClient],
  )

  const signOut = useCallback(() => {
    clearSessionToken()
    queryClient.clear()
  }, [queryClient])

  const value = useMemo<AuthState>(
    () => ({
      user: user ?? null,
      isLoading: isLoading && Boolean(getSessionToken()),
      isAuthenticated: Boolean(user),
      isAdmin: user?.admin === true,
      signIn,
      signOut,
    }),
    [user, isLoading, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
