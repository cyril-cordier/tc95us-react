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
  /**
   * Borne la largeur de la cellule et coupe le texte, le survol en montrant
   * la totalité. Pour les champs libres, dont une saisie longue comprime
   * toutes les autres colonnes. `true` applique la largeur par défaut, un
   * nombre la fixe en rem.
   */
  truncateColumn?: boolean | number
  /** Étiquette dans le formulaire quand elle dépend de la ligne éditée (le tableau garde `label`). */
  labelFor?: (draft: Partial<T>) => string
  /**
   * Masque le champ dans le formulaire quand la ligne éditée ne s'y prête
   * pas. La valeur déjà saisie n'est pas effacée : rebasculer sur un type
   * qui l'utilise la retrouve intacte.
   */
  showFor?: (draft: Partial<T>) => boolean
  /** Types de fichiers d'un champ `image`, quand ils dépendent de la ligne éditée. */
  acceptFor?: (draft: Partial<T>) => string
  /** Largeur du champ dans le formulaire, sur 12. */
  span?: number
  /**
   * Champ qui, laissé vide en modification, conserve sa valeur actuelle : le
   * formulaire ajoute la mention correspondante et `required` ne vaut plus
   * qu'à la création. C'est à `prepareUpdate` de retirer la valeur vide de la
   * charge envoyée.
   */
  blankKeepsCurrent?: boolean
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
  /**
   * Lignes retirées de la liste par défaut et révélées par un interrupteur.
   * Pour les contenus archivés, qui représentent les deux tiers de la classe
   * sans jamais s'afficher sur le site.
   */
  archived?: { label: string; match: (item: T) => boolean }
  /**
   * Classement par flèches monter / descendre, appuyé sur le champ `weight`.
   * Celui-ci disparaît alors du formulaire : l'ordre se règle en déplaçant
   * les lignes, sans avoir à comprendre qu'un nombre plus grand remonte.
   */
  orderable?: boolean
  /**
   * Ajoute une recherche plein texte au-dessus du tableau. Elle porte sur tous
   * les champs textuels de la ressource, pas seulement sur les colonnes
   * affichées : on cherche souvent un bloc d'après son texte.
   */
  searchable?: boolean
  /**
   * Champ proposé en filtre déroulant au-dessus du tableau. Les choix sont
   * déduits des valeurs réellement présentes, pour ne pas lister des
   * emplacements qu'aucune ligne n'utilise.
   */
  filterBy?: Extract<keyof T, string>
  /**
   * Droits dépendant de l'utilisateur connecté, évalués au rendu comme un
   * hook. Garde-fou d'interface uniquement : rien n'empêche un appel direct
   * à l'API, seul le serveur pourrait le refuser.
   */
  usePermissions?: () => {
    /** Motif empêchant la modification de cette ligne, ou `undefined`. */
    editBlocked?: (item: T) => string | undefined
    /** Motif empêchant la suppression, ou `undefined`. Une ligne peut rester
     *  modifiable sans être supprimable — son propre compte, par exemple. */
    deleteBlocked?: (item: T) => string | undefined
    /** Champs retirés du formulaire. */
    hiddenFields?: readonly Extract<keyof T, string>[]
  }
  /** Options dépendant d'autres données (ex. la liste des joueurs du challenge). */
  useOptions?: () => Record<string, readonly string[]>
  /** Ajuste le brouillon avant création (champs dérivés, valeurs par défaut). */
  prepareCreate?: (draft: Partial<T>) => Partial<T>
  /** Ajuste l'objet avant mise à jour (retirer un mot de passe vide, etc.). */
  prepareUpdate?: (item: T) => T
}
