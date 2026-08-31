import type { ReactNode } from 'react'
import type { Resource } from '@/api/resources'
import type { ParseObject } from '@/types'

export type FieldType =
  | 'text'
  | 'textarea'
  | 'richtext'
  | 'number'
  | 'select'
  | 'image'
  | 'radio'
  | 'boolean'
  | 'password'

export interface FieldDef<T> {
  name: Extract<keyof T, string>
  label: string
  type?: FieldType
  /** Choix figés pour `select` / `radio`. */
  options?: readonly string[]
  /** Clé d'une liste d'options calculée à l'exécution (voir `useOptions`). */
  optionsFrom?: string
  /** Affiche le champ comme colonne du tableau. */
  column?: boolean
  /** Colonne sans intitulé visible (l'en-tête reste annoncé aux lecteurs d'écran). */
  hideColumnLabel?: boolean
  /** Rendu personnalisé dans le tableau (score groupé, badge…). */
  render?: (item: T) => ReactNode
  /** Étiquette dans le formulaire quand elle dépend de la ligne éditée (le tableau garde `label`). */
  labelFor?: (draft: Partial<T>) => string
  /** Types de fichiers d'un champ `image`, quand ils dépendent de la ligne éditée. */
  acceptFor?: (draft: Partial<T>) => string
  /** Largeur du champ dans le formulaire, sur 12. */
  span?: number
  /** Champ absent du formulaire de modification (ex. mot de passe). */
  createOnly?: boolean
  required?: boolean
}

export interface ResourceAdminConfig<T extends ParseObject> {
  /** Titre de l'écran, ex. « Gestion des évènements ». */
  title: string
  /** Nom au singulier, utilisé dans les boutons et confirmations. */
  singular: string
  resource: Resource<T>
  fields: FieldDef<T>[]
  /** Texte identifiant une ligne dans la confirmation de suppression. */
  describe: (item: T) => string
  /** Options dépendant d'autres données (ex. la liste des joueurs du challenge). */
  useOptions?: () => Record<string, readonly string[]>
  /** Ajuste le brouillon avant création (champs dérivés, valeurs par défaut). */
  prepareCreate?: (draft: Partial<T>) => Partial<T>
  /** Ajuste l'objet avant mise à jour (retirer un mot de passe vide, etc.). */
  prepareUpdate?: (item: T) => T
}
