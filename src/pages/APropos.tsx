import Container from 'react-bootstrap/Container'
import { Link } from 'react-router-dom'
import { PageHeader } from '@/components/ui/PageHeader'

export default function APropos() {
  return (
    <Container className="prose">
      <PageHeader title="À propos" />

      <p>
        Ce site a été conçu par Cyril CORDIER, adhérent du Tennis Club de Us et
        responsable des équipes, dans le cadre d'un projet de fin de formation chez
        Epitech Coding Academy.
      </p>

      <p>
        Prenez vos raquettes et vos balles, et venez passer un bon moment au TC Us :
        en pleine campagne, dans un cadre agréable.
      </p>

      <p>
        Pensez à{' '}
        <a href="https://tenup.fft.fr/" target="_blank" rel="noreferrer">
          réserver vos courts sur Ten'Up
        </a>
        . La météo de Us pour la semaine est disponible sur la{' '}
        <Link to="/">page d'accueil</Link>.
      </p>
    </Container>
  )
}
