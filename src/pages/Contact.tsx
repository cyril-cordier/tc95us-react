import { CONTENT_SLOTS } from '@/api/contents'
import { ContentSlot } from '@/components/content/ContentSlot'
import { TwoColumnPage } from '@/components/layout/TwoColumnPage'
import { PageHeader } from '@/components/ui/PageHeader'
import { ResponsiveEmbed } from '@/components/ui/ResponsiveEmbed'
import { RevealButton } from '@/components/ui/RevealButton'

const MAP_EMBED =
  'https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d3489.69034040954!2d1.9730069!3d49.1024893!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47e6f3f5f0ef77d1%3A0x8f51e93f41f5e8cb!2sTennis%20Club%20de%20Us!5e1!3m2!1sfr!2sfr!4v1598088797864!5m2!1sfr!2sfr'

export default function Contact() {
  return (
    <TwoColumnPage
      main={
        <>
          <PageHeader title="Contact et plan d'accès" />

          <address className="mb-4">
            <strong>Tennis Club de Us</strong>
            <br />
            jardin public (RD 28)
            <br />
            95450 Us
          </address>

          <div className="mb-4">
            <RevealButton
              label="Contacter le club par téléphone"
              href="tel:+33642093035"
              value="06 42 09 30 35"
              variant="outline-primary"
            />
            <br />
            <RevealButton
              label="Contacter le club par email"
              href="mailto:tc95us@gmail.com"
              value="tc95us@gmail.com"
              variant="outline-primary"
            />
          </div>

          <ResponsiveEmbed src={MAP_EMBED} title="Plan d'accès au Tennis Club de Us" />
        </>
      }
      aside={
        <ContentSlot
          slot={CONTENT_SLOTS.motSecretaire}
          heading="Le mot de la Secrétaire"
          signature
        />
      }
    />
  )
}
