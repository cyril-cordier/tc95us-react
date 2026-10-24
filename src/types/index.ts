/** Champs que Parse Server ajoute à tout objet stocké. */
export interface ParseObject {
  objectId: string
  createdAt: string
  updatedAt: string
}

export interface Content extends ParseObject {
  /** Sert de clé d'emplacement : c'est ce titre qui décide sur quelle page le bloc s'affiche. */
  title: string
  content: string
  name: string
  fonction: string
  description: string
  image: string
  weight: number
}

export interface ClubEvent extends ParseObject {
  title: string
  details: string
  place: string
  date: string
  hour: string
  price: string
  image: string
  weight: number
}

export interface Product extends ParseObject {
  name: string
  details: string
  price: string
  image: string
  weight: number
}

export interface OfficeUser extends ParseObject {
  name: string
  function: string
  image: string
  weight: number
}

export interface Tarif extends ParseObject {
  type: TarifType
  category: string
  /** Formules de cours, dans l'ordre des colonnes du tableau public. */
  price1: string
  price2: string
  price3: string
  price4: string
  price5: string
  details: string
  weight: number
}

export type TarifType = 'Licence' | 'Cotisation' | 'Cours' | 'Forfait'

export interface Championnat extends ParseObject {
  date: string
  competition: string
  match: string
  score: string
  weight: number
}

export interface ChallengeUser extends ParseObject {
  challengename: string
  contact: string
  ranking: string
  points: number
  nbmatchs: number
  matchaverage: string
  setaverage: string
  gameaverage: string
  visible: ChallengeVisibility
  year: string
}

export type ChallengeVisibility = 'Dans le challenge' | 'Eliminé'

export interface ChallengeResult extends ParseObject {
  winner: string
  looser: string
  S1W: number
  S1L: number
  S2W: number
  S2L: number
  S3W: number
  S3L: number
  pointsW: number
  pointsL: number
  details: string
  date: string
  year: string
}

export interface User extends ParseObject {
  username: string
  firstname: string
  lastname: string
  email: string
  challengename: string
  admin: boolean
  /** Uniquement en écriture : Parse ne renvoie jamais ce champ. */
  password?: string
  /**
   * Compte protégé : seul un autre super administrateur peut le modifier
   * ou le supprimer depuis l'écran d'administration. Se règle en base.
   */
  superadmin?: boolean
}

export interface SessionUser extends User {
  sessionToken: string
}

/** Payload d'écriture : tout sauf les champs gérés par Parse. */
export type Draft<T extends ParseObject> = Omit<T, keyof ParseObject>
