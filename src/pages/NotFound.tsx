import Container from 'react-bootstrap/Container'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'

export default function NotFound() {
  return (
    <Container className="text-center">
      <PageHeader title="Page introuvable">
        Cette page n'existe pas ou a été déplacée.
      </PageHeader>
      <Link to="/">Retour à l'accueil</Link>
    </Container>
  )
}
