import Container from 'react-bootstrap/Container'
import { OfficeGrid } from '@/components/public/OfficeGrid'
import { PageHeader } from '@/components/ui/PageHeader'

export default function Bureau() {
  return (
    <Container>
      <PageHeader title="Les membres du bureau du TC Us" />
      <OfficeGrid />
    </Container>
  )
}
