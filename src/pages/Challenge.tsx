import Container from 'react-bootstrap/Container'
import { CONTENT_SLOTS } from '@/api/contents'
import { ContentSlot } from '@/components/content/ContentSlot'
import { PageHeader } from '@/components/ui/PageHeader'

export default function Challenge() {
  return (
    <Container>
      <PageHeader title="Le challenge du TC Us" />

      <ContentSlot slot={CONTENT_SLOTS.reglementChallenge} heading="Règlement" />
      <ContentSlot
        slot={CONTENT_SLOTS.experienceChallenger}
        heading="Expérience de challenger"
        signature
      />
    </Container>
  )
}
