import { useMemo } from 'react'
import { useCollection } from './hooks'
import type { Resource } from './resources'
import { byWeightDesc } from '@/lib/sort'
import type { Content } from '@/types'

/**
 * Les blocs éditoriaux sont tous stockés dans la même classe `contents` et
 * discriminés par leur `title`. Ces constantes remplacent les chaînes recopiées
 * à la main dans chaque page Vue (une faute de frappe = bloc invisible).
 */
export const CONTENT_SLOTS = {
  home: 'Texte page Accueil',
  installations: 'Les installations',
  reglementClub: 'Règlement du Club',
  anneeTarifs: 'Année tarifs (page Tarifs)',
  motPresident: 'Le mot du Président (page Installations)',
  motTresorier: 'Le mot du Trésorier (page Tarifs)',
  motSecretaire: 'Le mot de la Secrétaire (page Nous trouver)',
  motResponsableEquipes: 'Le mot du Responsable Equipes (page Championnats)',
  motAnimateurs: 'Le mot des Animateurs (page Anim et Evts)',
  experienceChallenger: 'Expérience de Challenger (page rglt challenge)',
  reglementChallenge: 'Règlement du Challenge (page rglt challenge)',
  archive: 'Contenu sauvegardé (non affiché)',
} as const

export type ContentSlot = (typeof CONTENT_SLOTS)[keyof typeof CONTENT_SLOTS]

/**
 * Emplacements réservés aux liens de documents. Le bloc `contents` n'y porte
 * pas de HTML mais une URL, rangée dans `description` — ça rend les liens
 * modifiables depuis l'admin sans rien changer au schéma Parse.
 */
export const DOCUMENT_SLOTS = {
  ficheInscription: 'Document — Fiche d’inscription',
  certificatMedical: 'Document — Certificat médical FFT',
  questionnaireSanteMineurs: 'Document — Questionnaire santé (mineurs)',
  attestationSanteMineurs: 'Document — Attestation questionnaire santé (mineurs)',
} as const

export type DocumentSlot = (typeof DOCUMENT_SLOTS)[keyof typeof DOCUMENT_SLOTS]

/**
 * Emplacements dont le bloc porte une image de la page plutôt que du texte.
 * Même mécanique que les documents — c'est une URL rangée dans un bloc — mais
 * le champ photo du formulaire suffit, sans le détour du PDF.
 */
export const MEDIA_SLOTS = {
  photoBureau: 'Photo du bureau (page Accueil)',
} as const

export type MediaSlot = (typeof MEDIA_SLOTS)[keyof typeof MEDIA_SLOTS]

/** Tout emplacement dont le bloc désigne un fichier par son URL. */
export type UrlSlot = DocumentSlot | MediaSlot

export const CONTENT_SLOT_OPTIONS = [
  ...Object.values(CONTENT_SLOTS),
  ...Object.values(DOCUMENT_SLOTS),
  ...Object.values(MEDIA_SLOTS),
]

const DOCUMENT_SLOT_VALUES: readonly string[] = Object.values(DOCUMENT_SLOTS)

const URL_SLOT_VALUES: readonly string[] = [
  ...DOCUMENT_SLOT_VALUES,
  ...Object.values(MEDIA_SLOTS),
]

/**
 * Vrai pour un emplacement attendant un document téléchargeable. Sert au
 * formulaire d'admin, qui n'y ouvre l'envoi aux PDF que dans ce cas.
 */
export function isDocumentSlot(title?: string): boolean {
  return title !== undefined && DOCUMENT_SLOT_VALUES.includes(title)
}

/** Vrai pour tout emplacement porteur d'une URL, document ou image. */
export function isUrlSlot(title?: string): boolean {
  return title !== undefined && URL_SLOT_VALUES.includes(title)
}

/**
 * Même classe que `contentsResource`, moins les archives.
 *
 * Les blocs archivés ne s'affichent sur aucune page, mais ils pèsent 95 % de
 * la classe : l'éditeur riche y a enregistré des images collées en base64,
 * jusqu'à 400 Ko pour un seul bloc. Les écarter côté serveur ramène la lecture
 * d'environ 900 Ko à une quarantaine. L'administration continue d'utiliser
 * `contentsResource`, puisqu'elle doit pouvoir rouvrir ces archives.
 */
const publicContentsResource: Resource<Content> = {
  key: 'contents-public',
  path: '/classes/contents',
  sort: byWeightDesc,
  query: {
    where: JSON.stringify({ title: { $ne: CONTENT_SLOTS.archive } }),
  },
}

/** Tous les blocs d'un emplacement donné, déjà triés par importance. */
export function useContentSlot(slot: ContentSlot) {
  const query = useCollection(publicContentsResource)

  return {
    ...query,
    blocks: (query.data ?? []).filter((content) => content.title === slot),
  }
}

const URL_PATTERN = /https?:\/\/[^\s"'<>]+/i

/**
 * Cherche l'URL du fichier dans les trois champs où elle peut légitimement se
 * trouver : la description, l'image (que le téléversement remplit tout seul)
 * et le contenu (si l'URL a été collée dans l'éditeur). Sur ces emplacements
 * aucun de ces champs n'a d'autre usage : mieux vaut les accepter tous que
 * faire disparaître le fichier parce que la saisie s'est faite dans la
 * mauvaise case.
 */
function findSlotUrl(content: Content): string | undefined {
  for (const field of [content.description, content.image, content.content]) {
    const match = field?.match(URL_PATTERN)
    if (match) return match[0]
  }

  return undefined
}

/**
 * Résout les URLs des fichiers publiés en base, documents comme images.
 *
 * Les contenus arrivent déjà triés par importance décroissante : pour un
 * emplacement donné, le premier bloc rencontré gagne. On peut donc préparer un
 * remplaçant avec une importance plus faible sans supprimer celui en place.
 */
export function useSlotUrls() {
  const query = useCollection(publicContentsResource)
  const { data } = query

  const urls = useMemo(() => {
    const found = new Map<string, string>()

    for (const content of data ?? []) {
      if (!isUrlSlot(content.title) || found.has(content.title)) continue

      const url = findSlotUrl(content)
      if (url) found.set(content.title, url)
    }

    return found
  }, [data])

  return {
    ...query,
    /** URL saisie en base pour cet emplacement, `undefined` si le bloc n'existe pas. */
    slotUrl: (slot: UrlSlot) => urls.get(slot),
  }
}

export type { Content }
