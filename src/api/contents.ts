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

export const CONTENT_SLOT_OPTIONS = Object.values(CONTENT_SLOTS)

/** Tous les blocs d'un emplacement donné, déjà triés par importance. */
export function useContentSlot(slot: ContentSlot) {
  const query = useCollection(contentsResource)

  return {
    ...query,
    blocks: (query.data ?? []).filter((content) => content.title === slot),
  }
}

export type { Content }
