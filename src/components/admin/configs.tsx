import { CONTENT_SLOT_OPTIONS, CONTENT_SLOTS, isDocumentSlot } from '@/api/contents'
import { useCollection } from '@/api/hooks'
import { useAuth } from '@/auth/useAuth'
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
export const contentsAdmin: ResourceAdminConfig<Content> = {
  title: 'Gestion des contenus',
  singular: 'un contenu',
  resource: contentsResource,
  describe: (content) => content.description || content.title,
  // Une trentaine de blocs répartis sur une quinzaine d'emplacements : sans
  // filtre ni recherche, retrouver le bon tient du défilement patient.
  searchable: true,
  filterBy: 'title',
  archived: {
    label: 'Afficher les contenus sauvegardés',
    match: (content) => content.title === CONTENT_SLOTS.archive,
  },
  orderable: true,
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
  ],
}

export const eventsAdmin: ResourceAdminConfig<ClubEvent> = {
  title: 'Gestion des évènements',
  singular: 'un évènement',
  resource: eventsResource,
  describe: (event) => event.title,
  orderable: true,
  fields: [
    { name: 'title', label: 'Titre', column: true, required: true },
    { name: 'details', label: 'Détails', type: 'richtext' },
    { name: 'place', label: 'Lieu', column: true, span: 4 },
    { name: 'date', label: 'Date', column: true, span: 4 },
    { name: 'hour', label: 'Horaires', column: true, span: 4 },
    { name: 'price', label: 'Tarif', column: true, span: 8 },
    { name: 'image', label: 'Affiche', type: 'image' },
  ],
}

export const productsAdmin: ResourceAdminConfig<Product> = {
  title: 'Gestion des produits',
  singular: 'un produit',
  resource: productsResource,
  describe: (product) => product.name,
  orderable: true,
  fields: [
    { name: 'name', label: 'Nom', column: true, required: true, span: 8 },
    { name: 'price', label: 'Prix', column: true, span: 4 },
    { name: 'details', label: 'Détails', type: 'textarea', column: true },
    { name: 'image', label: 'Photo', type: 'image' },
  ],
}

export const officeAdmin: ResourceAdminConfig<OfficeUser> = {
  title: 'Gestion des membres du bureau',
  singular: 'un membre',
  resource: officeResource,
  describe: (member) => member.name,
  orderable: true,
  fields: [
    { name: 'name', label: 'Nom', column: true, required: true, span: 6 },
    { name: 'function', label: 'Fonction', column: true, span: 6 },
    { name: 'image', label: 'Photo', type: 'image' },
  ],
}

/**
 * Seuls les cours se déclinent en formules horaires ; une licence, une
 * cotisation ou un forfait n'ont qu'un montant. Inutile de présenter cinq
 * champs vides dans les trois cas sur quatre où ils ne servent pas.
 */
const isCoursTarif = (draft: Partial<Tarif>) => draft.type === 'Cours'

export const tarifsAdmin: ResourceAdminConfig<Tarif> = {
  title: 'Gestion des tarifs',
  singular: 'un tarif',
  resource: tarifsResource,
  describe: (tarif) => `${tarif.type} — ${tarif.category}`,
  // Trois types mêlés dans une seule liste : le filtre évite de parcourir les
  // licences pour atteindre les cours.
  searchable: true,
  filterBy: 'type',
  orderable: true,
  fields: [
    {
      name: 'type',
      label: 'Type',
      type: 'select',
      options: ['Licence', 'Cotisation', 'Cours', 'Forfait'],
      column: true,
      required: true,
      span: 4,
    },
    {
      name: 'category',
      label: 'Catégorie',
      column: true,
      truncateColumn: 11,
      required: true,
      span: 8,
    },
    {
      name: 'price1',
      // En-tête du tableau : il doit couvrir les deux usages à la fois.
      label: 'Prix / 45 min',
      // Dans le formulaire en revanche, une ligne a toujours un type : seul
      // l'intitulé qui la concerne est affiché.
      labelFor: (draft) => (isCoursTarif(draft) ? '45 min' : 'Prix'),
      column: true,
      span: 4,
    },
    { name: 'price2', label: '1h', column: true, span: 4, showFor: isCoursTarif },
    {
      name: 'price4',
      label: 'Renfo. 1h+1h',
      column: true,
      span: 4,
      showFor: isCoursTarif,
    },
    { name: 'price3', label: '1h30', column: true, span: 4, showFor: isCoursTarif },
    {
      name: 'price5',
      label: 'Compét. 1h30+1h30',
      column: true,
      span: 4,
      showFor: isCoursTarif,
    },
    {
      name: 'details',
      label: 'Détails',
      // Symétrique de `price2`…`price5` : le tableau des cours n'affiche que
      // la catégorie et les prix, tandis que les licences, cotisations et
      // forfaits rendent ce texte sous leur catégorie.
      showFor: (draft) => !isCoursTarif(draft),
      column: true,
      truncateColumn: true,
      span: 8,
    },
  ],
}

export const championnatsAdmin: ResourceAdminConfig<Championnat> = {
  title: 'Gestion des championnats',
  singular: 'une rencontre',
  resource: championnatsResource,
  describe: (championnat) => `${championnat.competition} — ${championnat.match}`,
  orderable: true,
  fields: [
    { name: 'date', label: 'Date (JJ/MM/AAAA)', column: true, span: 4 },
    { name: 'competition', label: 'Compétition', column: true, span: 8 },
    { name: 'match', label: 'Rencontre', column: true, span: 8 },
    { name: 'score', label: 'Score', column: true, span: 4 },
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
  /**
   * Un compte « super administrateur » ne se modifie que depuis un autre
   * compte de ce rang, et son drapeau reste invisible aux autres — sans quoi
   * n'importe quel administrateur pourrait se l'attribuer.
   *
   * Si aucun compte ne porte encore le drapeau, personne n'est protégé et
   * personne n'est bloqué : l'écran continue de fonctionner comme avant.
   */
  usePermissions: () => {
    const { user, isSuperAdmin } = useAuth()
    const { data } = useCollection(usersResource)

    /**
     * Amorçage : tant qu'aucun compte ne porte le drapeau, tout administrateur
     * peut le poser. Sans cette ouverture, le premier super administrateur
     * serait indésignable — Parse ne crée la colonne qu'à la première
     * écriture, et le champ n'est offert qu'à ceux qui ont déjà le rang.
     *
     * La liste doit être chargée pour conclure : `undefined` ne vaut pas
     * « aucun super administrateur ».
     */
    const amorçage = data ? !data.some((account) => account.superadmin) : false
    const peutAttribuer = isSuperAdmin || amorçage

    const protege = (target: User) =>
      target.superadmin === true && !isSuperAdmin
        ? 'Compte protégé : seul un super administrateur peut le modifier.'
        : undefined

    return {
      editBlocked: protege,
      // Son propre compte reste modifiable — on doit pouvoir corriger son
      // email ou son mot de passe — mais pas supprimable : on se retrouverait
      // déconnecté, et peut-être sans plus aucun administrateur.
      deleteBlocked: (target: User) =>
        target.objectId === user?.objectId
          ? 'Vous ne pouvez pas supprimer votre propre compte.'
          : protege(target),
      hiddenFields: peutAttribuer ? [] : (['superadmin'] as const),
    }
  },
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
    {
      name: 'superadmin',
      label: 'Super administrateur (compte protégé)',
      type: 'boolean',
      span: 6,
    },
  ],
}
