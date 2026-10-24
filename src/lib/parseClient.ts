import { clearSessionToken, getSessionToken } from './session'
import type { ParseObject } from '@/types'

const API_URL = import.meta.env.VITE_PARSE_API_URL ?? ''

/** Erreur porteuse du code Parse, pour distinguer un 401 d'un vrai plantage. */
export class ParseError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: number,
  ) {
    super(message)
    this.name = 'ParseError'
  }
}

function buildHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    'X-Parse-Application-Id': import.meta.env.VITE_PARSE_APPLICATION_ID ?? '',
    'X-Parse-REST-API-Key': import.meta.env.VITE_PARSE_REST_API_KEY ?? '',
    'X-Parse-Javascript-Key': import.meta.env.VITE_PARSE_JAVASCRIPT_KEY ?? '',
    'Content-Type': 'application/json',
  }

  const token = getSessionToken()
  if (token) headers['X-Parse-Session-Token'] = token

  return headers
}

/** Code Parse d'un jeton de session périmé ou révoqué. */
const INVALID_SESSION_TOKEN = 209

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
  query?: Record<string, string>,
): Promise<T> {
  const search = query ? `?${new URLSearchParams(query)}` : ''
  const payload = body === undefined ? undefined : JSON.stringify(body)

  // `buildHeaders` relit le jeton à chaque appel : une fois effacé, le
  // renvoi part en anonyme.
  const send = () =>
    fetch(`${API_URL}${path}${search}`, { method, headers: buildHeaders(), body: payload })

  let response = await send()
  let result = await response.json().catch(() => ({}))

  /**
   * Un jeton périmé rendait tout le site inutilisable, pages publiques
   * comprises : l'en-tête part sur chaque requête et Parse refuse la requête
   * entière au lieu de l'ignorer. On oublie le jeton et on rejoue en anonyme,
   * faute de quoi il faudrait vider le navigateur à la main.
   */
  if (!response.ok && (result as { code?: number }).code === INVALID_SESSION_TOKEN) {
    clearSessionToken()
    response = await send()
    result = await response.json().catch(() => ({}))
  }

  if (!response.ok) {
    throw new ParseError(
      (result as { error?: string }).error ?? `Erreur ${response.status}`,
      response.status,
      (result as { code?: number }).code,
    )
  }

  return result as T
}

interface QueryResponse<T> {
  results: T[]
}

/**
 * Client CRUD pour une classe Parse. Remplace les 9 modules Vuex qui
 * ré-implémentaient chacun les mêmes 5 appels.
 */
export function parseResource<T extends ParseObject>(path: string) {
  return {
    async list(query?: Record<string, string>): Promise<T[]> {
      const { results } = await request<QueryResponse<T>>('GET', path, undefined, query)
      return results
    },
    get(objectId: string): Promise<T> {
      return request<T>('GET', `${path}/${objectId}`)
    },
    create(draft: Partial<T>): Promise<{ objectId: string; createdAt: string }> {
      return request('POST', path, draft)
    },
    update(objectId: string, draft: Partial<T>): Promise<{ updatedAt: string }> {
      return request('PUT', `${path}/${objectId}`, draft)
    },
    remove(objectId: string): Promise<unknown> {
      return request('DELETE', `${path}/${objectId}`)
    },
  }
}

/** Une opération et son issue, telles que Parse les expose dans un lot. */
export interface BatchOperation {
  method: 'POST' | 'PUT' | 'DELETE'
  path: string
  body?: unknown
}

interface BatchOutcome {
  success?: Record<string, unknown>
  error?: { error?: string; code?: number }
}

/** Parse refuse les lots plus longs ; on découpe à la limite documentée. */
const BATCH_LIMIT = 50

/**
 * Applique plusieurs écritures en une requête.
 *
 * Parse renvoie une issue par opération, dans l'ordre d'envoi, et répond 200
 * même lorsque certaines ont échoué : il faut donc inspecter chaque entrée.
 */
export async function parseBatch(
  operations: BatchOperation[],
): Promise<BatchOutcome[]> {
  const outcomes: BatchOutcome[] = []

  for (let start = 0; start < operations.length; start += BATCH_LIMIT) {
    const chunk = operations.slice(start, start + BATCH_LIMIT)
    outcomes.push(
      ...(await request<BatchOutcome[]>('POST', '/batch', { requests: chunk })),
    )
  }

  const failed = outcomes.find((outcome) => outcome.error)
  if (failed) throw new ParseError(failed.error?.error ?? 'Écriture refusée.', 400)

  return outcomes
}

export { request as parseRequest }
