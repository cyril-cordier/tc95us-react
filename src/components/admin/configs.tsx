import { CONTENT_SLOT_OPTIONS, isDocumentSlot } from '@/api/contents'
import { useCollection } from '@/api/hooks'
import {
  challengeResultsResource,
  challengeUsersResource,
  championnatsResource,
  contentsResource,
  eventsResource,
  officeResource,
  productsResource,
  tarifsResource,
  usersResource,
} from '@/api/resources'
import type { ResourceAdminConfig } from './types'
import type {
  ChallengeResult,
  ChallengeUser,
  Championnat,
  ClubEvent,
  Content,
  OfficeUser,
  Product,
  Tarif,
  User,
} from '@/types'

// Affiché en colonne dans toutes les listes, sans intitulé : l'ordre des
// lignes suit ce chiffre, autant le lire d'un coup d'œil plutôt qu'en ouvrant
// chaque formulaire.
const WEIGHT_FIELD = {
  name: 'weight',
  label: 'Importance (tri décroissant)',
  type: 'number',
  span: 4,
  column: true,
  hideColumnLabel: true,
} as const

export const contentsAdmin: ResourceAdminConfig<Content> = {
  title: 'Gestion des contenus',
  singular: 'un contenu',
  resource: contentsResource,
  describe: (content) => content.description || content.title,
  // Une trentaine de blocs répartis sur une quinzaine d'emplacements : sans
  // filtre ni recherche, retrouver le bon tient du défilement patient.
  searchable: true,
  filterBy: 'title',
  fields: [
    {
      name: 'title',
      label: 'Emplacement sur le site',
      type: 'select',
      options: CONTENT_SLOT_OPTIONS,
      column: true,
      required: true,
      span: 4,
    },
    // Sur un emplacement « Document — … », ce champ porte l'URL du fichier ;
    // ailleurs il reste une note interne.
    {
      name: 'description',
      label: 'Description interne — ou URL, sur un emplacement « Document »',
      column: true,
      span: 8,
    },
    { name: 'content', label: 'Contenu', type: 'richtext' },
    { name: 'name', label: 'Signature — nom', column: true, span: 6 },
    { name: 'fonction', label: 'Signature — fonction', column: true, span: 6 },
    // Sur un emplacement « Document — … », le même téléversement sert à
    // héberger le fichier : le champ change de nom et accepte les PDF.
    {
      name: 'image',
      label: 'Photo',
      labelFor: (draft) =>
        isDocumentSlot(draft.title)
          ? 'Document (PDF ou image) — le fichier envoyé sert directement de lien'
          : 'Photo',
      acceptFor: (draft) =>
        isDocumentSlot(draft.title) ? 'application/pdf,image/*' : 'image/*',
      type: 'image',
    },
    WEIGHT_FIELD,
  ],
}

export const eventsAdmin: ResourceAdminConfig<ClubEvent> = {
  title: 'Gestion des évènements',
  singular: 'un évènement',
  resource: eventsResource,
  describe: (event) => event.title,
  fields: [
    { name: 'title', label: 'Titre', column: true, required: true },
    { name: 'details', label: 'Détails', type: 'richtext' },
    { name: 'place', label: 'Lieu', column: true, span: 4 },
    { name: 'date', label: 'Date', column: true, span: 4 },
    { name: 'hour', label: 'Horaires', column: true, span: 4 },
    { name: 'price', label: 'Tarif', column: true, span: 8 },
    WEIGHT_FIELD,
    { name: 'image', label: 'Affiche', type: 'image' },
  ],
}

export const productsAdmin: ResourceAdminConfig<Product> = {
  title: 'Gestion des produits',
  singular: 'un produit',
  resource: productsResource,
  describe: (product) => product.name,
  fields: [
    { name: 'name', label: 'Nom', column: true, required: true, span: 8 },
    { name: 'price', label: 'Prix', column: true, span: 4 },
    { name: 'details', label: 'Détails', type: 'textarea', column: true },
    WEIGHT_FIELD,
    { name: 'image', label: 'Photo', type: 'image' },
  ],
}

export const officeAdmin: ResourceAdminConfig<OfficeUser> = {
  title: 'Gestion des membres du bureau',
  singular: 'un membre',
  resource: officeResource,
  describe: (member) => member.name,
  fields: [
    { name: 'name', label: 'Nom', column: true, required: true, span: 6 },
    { name: 'function', label: 'Fonction', column: true, span: 6 },
    WEIGHT_FIELD,
    { name: 'image', label: 'Photo', type: 'image' },
  ],
}

export const tarifsAdmin: ResourceAdminConfig<Tarif> = {
  title: 'Gestion des tarifs',
  singular: 'un tarif',
  resource: tarifsResource,
  describe: (tarif) => `${tarif.type} — ${tarif.category}`,
  fields: [
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: ['Licence', 'Cotisation', 'Cours'],
      column: true,
      required: true,
      span: 4,
    },
    { name: 'category', label: 'Catégorie', column: true, required: true, span: 8 },
    { name: 'price1', label: 'Prix 1 (45 min pour les cours)', column: true, span: 4 },
    { name: 'price2', label: 'Prix 2 (1 h)', column: true, span: 4 },
    { name: 'price3', label: 'Prix 3 (1 h 30)', column: true, span: 4 },
    {
      name: 'details',
      label: 'Détails (saisir « Seul » pour la formule cours seul)',
      column: true,
      span: 8,
    },
    WEIGHT_FIELD,
  ],
}

export const championnatsAdmin: ResourceAdminConfig<Championnat> = {
  title: 'Gestion des championnats',
  singular: 'une rencontre',
  resource: championnatsResource,
  describe: (championnat) => `${championnat.competition} — ${championnat.match}`,
  fields: [
    { name: 'date', label: 'Date (JJ/MM/AAAA)', column: true, span: 4 },
    { name: 'competition', label: 'Compétition', column: true, span: 8 },
    { name: 'match', label: 'Rencontre', column: true, span: 8 },
    { name: 'score', label: 'Score', column: true, span: 4 },
    WEIGHT_FIELD,
  ],
}

export const challengeUsersAdmin: ResourceAdminConfig<ChallengeUser> = {
  title: 'Gestion des joueurs du challenge',
  singular: 'un joueur',
  resource: challengeUsersResource,
  describe: (player) => player.challengename,
  fields: [
    { name: 'challengename', label: 'Nom', column: true, required: true, span: 6 },
    { name: 'contact', label: 'Contact (mail / téléphone)', span: 6 },
    { name: 'ranking', label: 'Classement FFT', column: true, span: 4 },
    { name: 'points', label: 'Points', type: 'number', column: true, span: 4 },
    { name: 'nbmatchs', label: 'Matchs joués', type: 'number', column: true, span: 4 },
    { name: 'matchaverage', label: 'Match average', column: true, span: 4 },
    { name: 'setaverage', label: 'Set average', column: true, span: 4 },
    { name: 'gameaverage', label: 'Jeux average', column: true, span: 4 },
    {
      name: 'visible',
      label: 'Statut',
      type: 'radio',
      options: ['Dans le challenge', 'Eliminé'],
      column: true,
      span: 8,
    },
    { name: 'year', label: 'Saison', span: 4 },
  ],
}

export const challengeResultsAdmin: ResourceAdminConfig<ChallengeResult> = {
  title: 'Gestion des résultats du challenge',
  singular: 'un match',
  resource: challengeResultsResource,
  describe: (result) => `${result.winner} bat ${result.looser}`,
  useOptions: () => {
    const { data } = useCollection(challengeUsersResource)
    return { players: (data ?? []).map((player) => player.challengename) }
  },
  fields: [
    { name: 'date', label: 'Date (JJ/MM/AAAA)', column: true, span: 4 },
    {
      name: 'winner',
      label: 'Vainqueur',
      type: 'select',
      optionsFrom: 'players',
      column: true,
      required: true,
      span: 4,
    },
    {
      name: 'looser',
      label: 'Perdant',
      type: 'select',
      optionsFrom: 'players',
      column: true,
      required: true,
      span: 4,
    },
    { name: 'S1W', label: 'Set 1 — vainqueur', type: 'number', span: 2 },
    { name: 'S1L', label: 'Set 1 — perdant', type: 'number', span: 2 },
    { name: 'S2W', label: 'Set 2 — vainqueur', type: 'number', span: 2 },
    { name: 'S2L', label: 'Set 2 — perdant', type: 'number', span: 2 },
    { name: 'S3W', label: 'Set 3 — vainqueur', type: 'number', span: 2 },
    { name: 'S3L', label: 'Set 3 — perdant', type: 'number', span: 2 },
    {
      name: 'pointsW',
      label: 'Points vainqueur',
      type: 'number',
      column: true,
      span: 3,
    },
    {
      name: 'pointsL',
      label: 'Points perdant',
      type: 'number',
      column: true,
      span: 3,
    },
    { name: 'details', label: 'Détails', column: true, span: 6 },
    { name: 'year', label: 'Saison', span: 4 },
  ],
}

export const usersAdmin: ResourceAdminConfig<User> = {
  title: 'Gestion des utilisateurs',
  singular: 'un utilisateur',
  resource: usersResource,
  describe: (user) => `${user.firstname} ${user.lastname}`.trim() || user.username,
  // Parse impose un `username` unique ; l'email fait office d'identifiant.
  prepareCreate: (draft) => ({ ...draft, username: draft.email }),
  // Le mot de passe n'est réécrit que s'il a été saisi : laissé vide, il ne
  // part pas dans la charge, sinon Parse le prendrait au mot et remplacerait
  // celui du compte par une chaîne vide.
  prepareUpdate: (user) => {
    const next = { ...user }
    if (!next.password) delete (next as Record<string, unknown>).password
    return next
  },
  fields: [
    { name: 'firstname', label: 'Prénom', column: true, required: true, span: 6 },
    { name: 'lastname', label: 'Nom', column: true, required: true, span: 6 },
    { name: 'email', label: 'Email', column: true, required: true, span: 6 },
    { name: 'challengename', label: 'Pseudo challenge', column: true, span: 6 },
    {
      name: 'password',
      label: 'Mot de passe',
      type: 'password',
      blankKeepsCurrent: true,
      required: true,
      span: 6,
    },
    {
      name: 'admin',
      label: 'Administrateur',
      type: 'boolean',
      column: true,
      render: (user) => (user.admin ? 'Oui' : 'Non'),
      span: 6,
    },
  ],
}
