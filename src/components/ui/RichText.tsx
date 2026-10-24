/**
 * Espaces insécables qui ne séparent que des mots.
 *
 * Les textes du site viennent de copier-coller de traitement de texte : leurs
 * mots sont reliés par des `&nbsp;` — soixante-onze dans un seul bloc — si
 * bien qu'une phrase entière ne forme qu'un « mot » aux yeux du navigateur. Il
 * ne peut alors que la laisser déborder de l'écran, ou la couper en plein
 * milieu d'un mot. On leur rend donc leur caractère sécable.
 *
 * L'exception préserve la typographie française, qui veut un espace insécable
 * devant une ponctuation double : « rénovation&nbsp;! » ne doit pas voir son
 * point d'exclamation passer seul à la ligne suivante.
 *
 * Volontairement sans look-behind : la syntaxe n'est reconnue qu'à partir de
 * Safari 16.4, et une expression non comprise casse le module au chargement.
 */
const JOINING_NBSP = /(?:&nbsp;|\xa0)(?!\s*(?:[!?:;»]|&(?:raquo|hellip);))/g

/**
 * Rend le HTML produit par l'éditeur de l'admin.
 *
 * Le contenu vient exclusivement du back-office du club (comptes administrateurs
 * authentifiés) : c'est la même confiance que le `v-html` de la version Vue.
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  return (
    <div
      className={className ? `rich-text ${className}` : 'rich-text'}
      dangerouslySetInnerHTML={{ __html: html.replace(JOINING_NBSP, ' ') }}
    />
  )
}
