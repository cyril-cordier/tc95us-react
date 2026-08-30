import { useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import { CONTENT_SLOTS } from '@/api/contents'
import { downloadFile } from '@/lib/download'
import { ContentSlot } from '@/components/content/ContentSlot'
import { TwoColumnPage } from '@/components/layout/TwoColumnPage'
import { TarifTables } from '@/components/public/TarifTables'
import { PageHeader } from '@/components/ui/PageHeader'

const SUBSCRIPTION_FORM_URL =
  'https://res.cloudinary.com/dcp7bq2a1/image/upload/v1693091734/tc95us/US23-INSCRIPTION-250823_npyiai.jpg'

const FFT_DOCUMENTS = [
  {
    label: 'Modèle de certificat médical FFT',
    href: 'https://www.fft.fr/sites/default/files/documents/modele_certificat_medical_0%20(1).pdf_0.pdf',
    variant: 'primary',
  },
  {
    label: 'Questionnaire santé (mineurs)',
    href: 'https://www.fft.fr/sites/default/files/documents/QUESTIONNAIRE%20DE%20SANTE%20MINEURS.pdf',
    variant: 'info',
  },
  {
    label: 'Attestation questionnaire de santé (mineurs)',
    href: 'https://www.fft.fr/sites/default/files/documents/modele_attestation_mineur.pdf.pdf',
    variant: 'info',
  },
]

export default function Tarifs() {
  const [error, setError] = useState<string | null>(null)
  const [isDownloading, setDownloading] = useState(false)

  async function handleDownload() {
    setDownloading(true)
    setError(null)

    try {
      await downloadFile(SUBSCRIPTION_FORM_URL, 'fiche_inscription_TC_Us.jpg')
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

          <section className="mb-5">
            <h2 className="h4">Documents d'inscription</h2>

            {error ? <Alert variant="danger">{error}</Alert> : null}

            <div className="d-flex flex-wrap gap-2">
              <Button onClick={handleDownload} disabled={isDownloading}>
                {isDownloading ? 'Téléchargement…' : "Fiche d'inscription"}
              </Button>

              {FFT_DOCUMENTS.map((document) => (
                <Button
                  key={document.href}
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
