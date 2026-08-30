import Container from 'react-bootstrap/Container'
import { PageHeader } from '@/components/ui/PageHeader'

export default function MentionsLegales() {
  return (
    <Container className="prose">
      <PageHeader title="Mentions légales" />

      <h2 className="h5">Éditeur</h2>
      <address>
        Tennis Club de Us
        <br />
        10 Résidence du Fort
        <br />
        95450 Us
      </address>
      <p>Président : Philippe BEROULE</p>

      <h2 className="h5">Hébergement</h2>
      <p>
        Netlify — site statique déployé depuis le dépôt du projet. Les données du
        club sont hébergées sur un serveur Parse.
      </p>

      <h2 className="h5">Développement</h2>
      <p>
        Site conçu par Cyril CORDIER pour le Tennis Club de Us, dans le cadre d'un
        projet de fin de formation chez Epitech Coding Academy, puis réécrit en
        React.
      </p>
      <p>Stack : React 18, TypeScript, Vite, React Router, TanStack Query.</p>
    </Container>
  )
}
