import Container from 'react-bootstrap/Container'
import { CONTENT_SLOTS } from '@/api/contents'
import { ContentSlot } from '@/components/content/ContentSlot'
import { PageHeader } from '@/components/ui/PageHeader'

export default function Reglement() {
  return (
    <Container>
      <PageHeader title="Le règlement du club" />
      <ContentSlot slot={CONTENT_SLOTS.reglementClub} />
    </Container>
  )
}
