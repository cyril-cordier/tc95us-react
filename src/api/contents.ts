import { useMemo } from 'react'
import { useCollection } from './hooks'
import { contentsResource } from './resources'
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

export const CONTENT_SLOT_OPTIONS = [
  ...Object.values(CONTENT_SLOTS),
  ...Object.values(DOCUMENT_SLOTS),
]

const DOCUMENT_SLOT_VALUES: readonly string[] = Object.values(DOCUMENT_SLOTS)

/** Vrai pour un emplacement dont la description porte l'URL d'un document. */
export function isDocumentSlot(title?: string): boolean {
  return title !== undefined && DOCUMENT_SLOT_VALUES.includes(title)
}

/** Tous les blocs d'un emplacement donné, déjà triés par importance. */
export function useContentSlot(slot: ContentSlot) {
  const query = useCollection(contentsResource)

  return {
    ...query,
    blocks: (query.data ?? []).filter((content) => content.title === slot),
  }
}

/**
 * Résout les URLs des documents publiés en base.
 *
 * Les contenus arrivent déjà triés par importance décroissante : pour un
 * emplacement donné, le premier bloc rencontré gagne. On peut donc préparer un
 * remplaçant avec une importance plus faible sans supprimer le lien en place.
 */
const URL_PATTERN = /https?:\/\/[^\s"'<>]+/i

/**
 * Cherche l'URL du document dans les trois champs où elle peut légitimement
 * se trouver : la description (le champ documenté), l'image (que le
 * téléversement remplit tout seul) et le contenu (si l'URL a été collée dans
 * l'éditeur). Sur un emplacement « Document — … » aucun de ces champs n'a
 * d'autre usage : mieux vaut les accepter tous que faire disparaître le bouton
 * parce que la saisie s'est faite dans la mauvaise case.
 */
function findDocumentUrl(content: Content): string | undefined {
  for (const field of [content.description, content.image, content.content]) {
    const match = field?.match(URL_PATTERN)
    if (match) return match[0]
  }

  return undefined
}

export function useDocumentUrls() {
  const query = useCollection(contentsResource)
  const { data } = query

  const urls = useMemo(() => {
    const found = new Map<string, string>()

    for (const content of data ?? []) {
      if (!isDocumentSlot(content.title) || found.has(content.title)) continue

      const url = findDocumentUrl(content)
      if (url) found.set(content.title, url)
    }

    return found
  }, [data])

  return {
    ...query,
    /** URL saisie en base pour cet emplacement, `undefined` si le bloc n'existe pas. */
    documentUrl: (slot: DocumentSlot) => urls.get(slot),
  }
}

export type { Content }
