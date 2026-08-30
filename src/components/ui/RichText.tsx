/**
 * Rend le HTML produit par l'éditeur de l'admin.
 *
 * Le contenu vient exclusivement du back-office du club (comptes administrateurs
 * authentifiés) : c'est la même confiance que le `v-html` de la version Vue.
 */
export function RichText({ html, className }: { html: string; className?: string }) {
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />
}
