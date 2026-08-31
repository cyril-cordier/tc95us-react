import { useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import { CONTENT_SLOTS, DOCUMENT_SLOTS, useSlotUrls } from '@/api/contents'
import { downloadFile } from '@/lib/download'
import { ContentSlot } from '@/components/content/ContentSlot'
import { TwoColumnPage } from '@/components/layout/TwoColumnPage'
import { TarifTables } from '@/components/public/TarifTables'
import { PageHeader } from '@/components/ui/PageHeader'

/**
 * Les liens ne vivent plus dans le code : chaque bouton attend l'URL du bloc
 * `contents` portant son emplacement, et disparaît tant que ce bloc n'existe
 * pas. Un document retiré de l'admin retire donc son bouton, sans qu'il reste
 * un lien mort ou périmé en dur ici.
 */
const SUBSCRIPTION_FORM_SLOT = DOCUMENT_SLOTS.ficheInscription

const FFT_DOCUMENTS = [
  {
    slot: DOCUMENT_SLOTS.certificatMedical,
    label: 'Modèle de certificat médical FFT',
    variant: 'primary',
  },
  {
    slot: DOCUMENT_SLOTS.questionnaireSanteMineurs,
    label: 'Questionnaire santé (mineurs)',
    variant: 'info',
  },
  {
    slot: DOCUMENT_SLOTS.attestationSanteMineurs,
    label: 'Attestation questionnaire de santé (mineurs)',
    variant: 'info',
  },
] as const

/**
 * L'extension suit celle du fichier visé : l'URL étant saisie en admin, on ne
 * peut pas supposer que la fiche restera un JPEG.
 */
function subscriptionFilename(url: string): string {
  const path = url.split(/[?#]/, 1)[0]
  const extension = path.match(/\.[a-z0-9]{2,5}$/i)?.[0] ?? '.jpg'
  return `fiche_inscription_TC_Us${extension}`
}

export default function Tarifs() {
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setDownloading] = useState(false)
  const { slotUrl } = useSlotUrls()

  const subscriptionUrl = slotUrl(SUBSCRIPTION_FORM_SLOT)

  const fftDocuments = FFT_DOCUMENTS.map((document) => ({
    ...document,
    href: slotUrl(document.slot),
  })).filter((document) => document.href !== undefined)

  async function handleDownload() {
    if (!subscriptionUrl) return

    setDownloading(true)
    setError(null)

    try {
      await downloadFile(subscriptionUrl, subscriptionFilename(subscriptionUrl))
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : 'Le téléchargement a échoué.',
      )
    } finally {
      setDownloading(false)
    }
  }

  return (
    <TwoColumnPage
      main={
        <>
          {/* Le titre ne dépend plus du contenu éditorial : dans la version Vue
              le <h1> *était* le bloc « Année tarifs », donc la page se
              retrouvait sans titre dès que ce bloc manquait. */}
          <PageHeader title="Tarifs et inscription" />
          <ContentSlot slot={CONTENT_SLOTS.anneeTarifs} />

          {/* Aucun document publié : ni titre de section, ni cadre vide. */}
          {subscriptionUrl || fftDocuments.length > 0 ? (
            <section className="mb-5">
              <h2 className="h4">Documents d'inscription</h2>

              {error ? <Alert variant="danger">{error}</Alert> : null}

              <div className="d-flex flex-wrap gap-2">
                {subscriptionUrl ? (
                  <Button onClick={handleDownload} disabled={isDownloading}>
                    {isDownloading ? 'Téléchargement…' : "Fiche d'inscription"}
                  </Button>
                ) : null}

                {fftDocuments.map((document) => (
                  <Button
                    key={document.slot}
                    variant={document.variant}
                    href={document.href}
                    target="_blank"
                    rel="noreferrer"
                  >
                    {document.label}
                  </Button>
                ))}
              </div>
            </section>
          ) : null}

          <TarifTables />
        </>
      }
      aside={
        <ContentSlot
          slot={CONTENT_SLOTS.motTresorier}
          heading="Le mot du Trésorier"
          signature
        />
      }
    />
  )
}
