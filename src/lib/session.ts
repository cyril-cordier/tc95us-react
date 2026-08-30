const TOKEN_KEY = 'session-token'

/**
 * Le token vit dans localStorage, mais il est toujours *relu* au moment de la
 * requête. La version Vue construisait l'objet `headers` une seule fois au
 * chargement du module : après un login, toutes les écritures partaient encore
 * avec l'ancien token (vide au premier chargement).
 */
export function getSessionToken(): string | null {
  try {
    return window.localStorage.getItem(TOKEN_KEY)
  } catch {
    return null
  }
}

export function setSessionToken(token: string): void {
  try {
    window.localStorage.setItem(TOKEN_KEY, token)
  } catch {
    /* mode privé / stockage bloqué : la session ne survivra pas au reload */
  }
}

export function clearSessionToken(): void {
  try {
    window.localStorage.removeItem(TOKEN_KEY)
  } catch {
    /* ignore */
  }
}
