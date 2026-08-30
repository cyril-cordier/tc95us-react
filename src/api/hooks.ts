import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { parseResource } from '@/lib/parseClient'
import type { Resource } from './resources'
import type { ParseObject } from '@/types'

/**
 * Un seul jeu de hooks pour toutes les classes Parse : la version Vue avait
 * 9 modules Vuex qui répétaient chacun list / get / create / update / delete
 * avec leurs propres getters et mutations.
 */

function coerce<T extends ParseObject>(
  resource: Resource<T>,
  draft: Partial<T>,
): Record<string, unknown> {
  const payload: Record<string, unknown> = { ...draft }

  for (const field of resource.numeric ?? []) {
    if (field in payload) payload[field] = Number(payload[field]) || 0
  }

  // Parse refuse les champs qu'il gère lui-même.
  delete payload.objectId
  delete payload.createdAt
  delete payload.updatedAt

  return payload
}

export function useCollection<T extends ParseObject>(
  resource: Resource<T>,
  options: { enabled?: boolean } = {},
): UseQueryResult<T[], Error> {
  return useQuery({
    queryKey: [resource.key],
    enabled: options.enabled ?? true,
    queryFn: async () => {
      const items = await parseResource<T>(resource.path).list()
      return resource.sort ? [...items].sort(resource.sort) : items
    },
  })
}

export function useCreate<T extends ParseObject>(
  resource: Resource<T>,
): UseMutationResult<unknown, Error, Partial<T>> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (draft: Partial<T>) =>
      parseResource<T>(resource.path).create(coerce(resource, draft) as Partial<T>),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource.key] }),
  })
}

export function useUpdate<T extends ParseObject>(
  resource: Resource<T>,
): UseMutationResult<unknown, Error, T> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (item: T) =>
      parseResource<T>(resource.path).update(
        item.objectId,
        coerce(resource, item) as Partial<T>,
      ),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource.key] }),
  })
}

export function useRemove<T extends ParseObject>(
  resource: Resource<T>,
): UseMutationResult<unknown, Error, string> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (objectId: string) => parseResource<T>(resource.path).remove(objectId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [resource.key] }),
  })
}
