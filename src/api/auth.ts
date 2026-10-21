import { parseRequest } from '@/lib/parseClient'
import type { SessionUser, User } from '@/types'

export function login(username: string, password: string): Promise<SessionUser> {
  const query = new URLSearchParams({ username, password })
  return parseRequest<SessionUser>('GET', `/login?${query}`)
}

/**
 * Déclenche l'envoi du mail de réinitialisation, sur le champ `email` du
 * compte — pas sur son `username`.
 *
 * Parse répond 200 même pour une adresse inconnue, afin de ne pas révéler
 * quels comptes existent : l'interface ne peut donc pas distinguer les deux
 * cas, et ne doit pas essayer.
 */
export function requestPasswordReset(email: string): Promise<unknown> {
  return parseRequest('POST', '/requestPasswordReset', { email })
}

/**
 * Invalide la session côté serveur. Le token courant part dans les en-têtes,
 * donc l'appel doit précéder son effacement local.
 */
export function logout(): Promise<unknown> {
  return parseRequest('POST', '/logout')
}

export function fetchCurrentUser(): Promise<User> {
  return parseRequest<User>('GET', '/users/me')
}

export function updateUser(objectId: string, patch: Partial<User>): Promise<unknown> {
  return parseRequest('PUT', `/users/${objectId}`, patch)
}

export function createUser(
  draft: Partial<User> & { password: string },
): Promise<unknown> {
  return parseRequest('POST', '/users', draft)
}

export function deleteUser(objectId: string): Promise<unknown> {
  return parseRequest('DELETE', `/users/${objectId}`)
}
