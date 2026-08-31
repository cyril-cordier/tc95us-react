import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { fetchCurrentUser, login, logout } from '@/api/auth'
import { clearSessionToken, getSessionToken, setSessionToken } from '@/lib/session'
import { AuthContext, type AuthState } from './context'

export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  /**
   * La présence d'un token est tenue dans un état React, et pas seulement lue
   * dans localStorage au moment du rendu.
   *
   * `queryClient.clear()` ne suffit pas à déconnecter : il détruit les entrées
   * du cache mais ne pousse aucun nouveau résultat aux observateurs déjà
   * montés (`QueryObserver` ne s'abonne pas à l'évènement « removed » du
   * cache). Sans changement d'état, React ne réaffichait rien et la barre de
   * navigation restait celle d'un utilisateur connecté.
   */
  const [token, setToken] = useState(getSessionToken)

  // `/users/me` n'est interrogé que si un token existe : sans ça chaque
  // visiteur anonyme déclenchait un 401 au chargement de la page d'accueil.
  const { data: user, isLoading } = useQuery({
    queryKey: ['me'],
    queryFn: fetchCurrentUser,
    enabled: Boolean(token),
    retry: false,
    staleTime: 5 * 60 * 1000,
  })

  const signIn = useCallback(
    async (username: string, password: string) => {
      const session = await login(username, password)
      setSessionToken(session.sessionToken)
      setToken(session.sessionToken)
      queryClient.setQueryData(['me'], session)
      await queryClient.invalidateQueries()
    },
    [queryClient],
  )

  const signOut = useCallback(() => {
    // Invalider la session côté Parse — sans quoi le token resterait
    // utilisable jusqu'à son expiration. La déconnexion locale ne dépend pas
    // de la réponse : un réseau coupé ne doit pas laisser l'interface
    // connectée. L'appel précède l'effacement, il a besoin du token.
    if (getSessionToken()) void logout().catch(() => {})

    clearSessionToken()
    // C'est ce changement d'état qui provoque le rendu : le cache vidé juste
    // après, la requête `['me']` est reconstruite à zéro et `user` repasse à
    // `undefined`.
    setToken(null)
    queryClient.clear()
  }, [queryClient])

  const value = useMemo<AuthState>(
    () => ({
      user: user ?? null,
      isLoading: isLoading && Boolean(token),
      isAuthenticated: Boolean(user),
      isAdmin: user?.admin === true,
      signIn,
      signOut,
    }),
    [user, isLoading, token, signIn, signOut],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
