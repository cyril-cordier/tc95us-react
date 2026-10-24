import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseMutationResult,
  type UseQueryResult,
} from '@tanstack/react-query'
import { parseBatch, parseResource } from '@/lib/parseClient'
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
      const items = await parseResource<T>(resource.path).list(resource.query)
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

/**
 * Réécrit l'ordre de plusieurs lignes d'un coup.
 *
 * Trois précautions, chacune mesurée sur un cas réel :
 * — un seul aller-retour, par le lot Parse, plutôt qu'une requête par ligne ;
 * — seul le champ `weight` est transmis, là où republier l'objet entier
 *   renverrait aussi son contenu, soit des centaines de kilo-octets sur un
 *   bloc éditorial portant une image en base64 ;
 * — le cache est corrigé sur place au lieu d'être invalidé : on connaît
 *   exactement les nouvelles valeurs, et un rechargement de la classe
 *   `contents` coûte près d'un mégaoctet.
 */
export function useReorder<T extends ParseObject>(
  resource: Resource<T>,
): UseMutationResult<unknown, Error, { objectId: string; weight: number }[]> {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (changes: { objectId: string; weight: number }[]) =>
      parseBatch(
        changes.map((change) => ({
          method: 'PUT' as const,
          path: `${resource.path}/${change.objectId}`,
          body: { weight: change.weight },
        })),
      ),
    onSuccess: (outcomes, changes) => {
      queryClient.setQueryData<T[]>([resource.key], (current) => {
        if (!current) return current

        // L'horodatage vient de la réponse de Parse, pas d'une horloge
        // locale : la colonne « Modifié le » reste exacte sans rechargement.
        const patches = new Map(
          changes.map((change, index) => [
            change.objectId,
            {
              weight: change.weight,
              updatedAt: outcomes[index]?.success?.updatedAt as string | undefined,
            },
          ]),
        )

        const next = current.map((item) => {
          const patch = patches.get(item.objectId)
          if (!patch) return item

          return {
            ...item,
            weight: patch.weight,
            ...(patch.updatedAt ? { updatedAt: patch.updatedAt } : {}),
          } as T
        })

        return resource.sort ? [...next].sort(resource.sort) : next
      })
    },
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
