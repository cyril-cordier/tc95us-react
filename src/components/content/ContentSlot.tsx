import { useContentSlot, type ContentSlot as Slot } from '@/api/contents'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Loader } from '@/components/ui/Loader'
import { RichText } from '@/components/ui/RichText'

interface ContentSlotProps {
  slot: Slot
  /** Titre affiché au-dessus du bloc. */
  heading?: string
  /** Ajoute nom / fonction / photo sous le texte (les « mots du … »). */
  signature?: boolean
  headingAs?: 'h1' | 'h2' | 'h3'
}

/**
 * Rend un emplacement éditorial. Ce bloc — filtrer `contents` sur son titre,
 * afficher le HTML puis la signature — était recopié dans sept pages Vue.
 */
export function ContentSlot({
  slot,
  heading,
  signature = false,
  headingAs: Heading = 'h2',
}: ContentSlotProps) {
  const { blocks, isPending, error } = useContentSlot(slot)

  if (isPending) return <Loader />
  if (error) return <ErrorMessage error={error} />
  if (blocks.length === 0) return null

  return (
    <section className="content-slot">
      {heading ? <Heading className="page-title">{heading}</Heading> : null}

      {blocks.map((block) => (
        <article key={block.objectId} className="content-slot__block">
          <RichText html={block.content} />

          {/* Hors signature, l'auteur et l'image étaient tous deux ignorés :
              seul le bloc « signature » les rendait, alors que le formulaire
              d'admin permet de les renseigner sur n'importe quel emplacement.
              L'ordre reprend celui du site d'origine — texte, auteur, image. */}
          {!signature && (block.name || block.fonction) ? (
            <p className="text-muted small mb-0">
              {[block.name, block.fonction].filter(Boolean).join(' — ')}
            </p>
          ) : null}

          {!signature && block.image ? (
            <img
              src={block.image}
              alt=""
              className="content-slot__image"
              loading="lazy"
            />
          ) : null}

          {signature ? (
            <footer className="content-slot__signature">
              {block.name ? <p className="fw-semibold mb-0">{block.name}</p> : null}
              {block.fonction ? <p className="text-muted">{block.fonction}</p> : null}
              {block.image ? (
                <img
                  src={block.image}
                  alt={block.name || 'Portrait'}
                  className="content-slot__portrait"
                  loading="lazy"
                />
              ) : null}
            </footer>
          ) : null}
        </article>
      ))}
    </section>
  )
}
