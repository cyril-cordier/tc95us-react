import { byFrenchDateDesc, byWeightDesc } from '@/lib/sort'
import type {
  ChallengeResult,
  ChallengeUser,
  Championnat,
  ClubEvent,
  Content,
  OfficeUser,
  ParseObject,
  Product,
  Tarif,
  User,
} from '@/types'

export interface Resource<T extends ParseObject> {
  /** Clé de cache React Query. */
  key: string
  /** Chemin REST côté Parse. */
  path: string
  /** Ordre d'affichage appliqué après réception. */
  sort?: (a: T, b: T) => number
  /** Paramètres REST ajoutés à la lecture (`where`, `keys`…), filtrés côté serveur. */
  query?: Record<string, string>
  /** Champs à convertir en nombre avant écriture (les inputs renvoient du texte). */
  numeric?: readonly (keyof T & string)[]
}

function define<T extends ParseObject>(resource: Resource<T>): Resource<T> {
  return resource
}

export const contentsResource = define<Content>({
  key: 'contents',
  path: '/classes/contents',
  sort: byWeightDesc,
  numeric: ['weight'],
})

export const eventsResource = define<ClubEvent>({
  key: 'events',
  path: '/classes/events',
  sort: byWeightDesc,
  numeric: ['weight'],
})

export const productsResource = define<Product>({
  key: 'products',
  path: '/classes/products',
  sort: byWeightDesc,
  numeric: ['weight'],
})

export const officeResource = define<OfficeUser>({
  key: 'office',
  path: '/classes/office',
  sort: byWeightDesc,
  numeric: ['weight'],
})

export const tarifsResource = define<Tarif>({
  key: 'tarifs',
  path: '/classes/tarifs',
  sort: byWeightDesc,
  numeric: ['weight'],
})

export const championnatsResource = define<Championnat>({
  key: 'championnats',
  path: '/classes/championnats',
  sort: byWeightDesc,
  numeric: ['weight'],
})

export const challengeUsersResource = define<ChallengeUser>({
  key: 'challengeusers',
  path: '/classes/challengeusers',
  sort: (a, b) => (b.points ?? 0) - (a.points ?? 0),
  numeric: ['points', 'nbmatchs'],
})

export const challengeResultsResource = define<ChallengeResult>({
  key: 'challengeresults',
  path: '/classes/challengeresults',
  sort: byFrenchDateDesc,
  numeric: [
    'S1W', 'S1L', 'S2W', 'S2L', 'S3W', 'S3L', 'pointsW', 'pointsL',
  ],
})

export const usersResource = define<User>({
  key: 'users',
  path: '/users',
})
