import { getSessionToken } from './session'
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

async function request<T>(
  method: string,
  path: string,
  body?: unknown,
): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    method,
    headers: buildHeaders(),
    body: body === undefined ? undefined : JSON.stringify(body),
  })

  const payload = await response.json().catch(() => ({}))

  if (!response.ok) {
    throw new ParseError(
      (payload as { error?: string }).error ?? `Erreur ${response.status}`,
      response.status,
      (payload as { code?: number }).code,
    )
  }

  return payload as T
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
    async list(): Promise<T[]> {
      const { results } = await request<QueryResponse<T>>('GET', path)
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

export { request as parseRequest }
