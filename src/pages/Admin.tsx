import { useState } from 'react'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Nav from 'react-bootstrap/Nav'
import Row from 'react-bootstrap/Row'
import Tab from 'react-bootstrap/Tab'
import {
  challengeResultsAdmin,
  challengeUsersAdmin,
  championnatsAdmin,
  contentsAdmin,
  eventsAdmin,
  officeAdmin,
  productsAdmin,
  tarifsAdmin,
  usersAdmin,
} from '@/components/admin/configs'
import { ResourceManager } from '@/components/admin/ResourceManager'
import { useAuth } from '@/auth/useAuth'
import { PageHeader } from '@/components/ui/PageHeader'

/**
 * Les neuf écrans partagent le même composant : seule leur configuration change.
 */
const SECTIONS = [
  { key: 'contents', label: 'Contenus', config: contentsAdmin },
  { key: 'events', label: 'Évènements', config: eventsAdmin },
  { key: 'tarifs', label: 'Tarifs', config: tarifsAdmin },
  { key: 'championnats', label: 'Championnats', config: championnatsAdmin },
  { key: 'challengeusers', label: 'Joueurs du challenge', config: challengeUsersAdmin },
  { key: 'challengeresults', label: 'Résultats du challenge', config: challengeResultsAdmin },
  { key: 'office', label: 'Membres du bureau', config: officeAdmin },
  { key: 'products', label: 'Produits', config: productsAdmin },
  { key: 'users', label: 'Utilisateurs', config: usersAdmin },
] as const

/**
 * Sections repliées derrière un interrupteur : elles ne servent qu'en saison de
 * challenge et encombrent le menu le reste de l'année.
 */
const CHALLENGE_KEYS: readonly string[] = ['challengeusers', 'challengeresults']

const DEFAULT_KEY = 'contents'

export default function Admin() {
  const { user } = useAuth()
  const [showChallenge, setShowChallenge] = useState(false)
  const [activeKey, setActiveKey] = useState<string>(DEFAULT_KEY)

  const sections = SECTIONS.filter(
    (section) => showChallenge || !CHALLENGE_KEYS.includes(section.key),
  )

  function handleToggleChallenge(next: boolean) {
    setShowChallenge(next)

    // Masquer les onglets alors que l'un d'eux est actif laisserait son panneau
    // affiché sans entrée de menu pour y revenir : on rebascule sur les contenus.
    if (!next && CHALLENGE_KEYS.includes(activeKey)) setActiveKey(DEFAULT_KEY)
  }

  return (
    <Container fluid>
      <PageHeader title="Administration">
        {user
          ? `Connecté en tant que ${user.firstname} ${user.lastname}`
          : null}
      </PageHeader>

      {/* Onglets pilotés plutôt que libres : l'interrupteur doit pouvoir
          ramener la sélection sur une section encore visible. */}
      <Tab.Container
        activeKey={activeKey}
        onSelect={(key) => setActiveKey(key ?? DEFAULT_KEY)}
      >
        <Row className="g-4">
          <Col md={3} xl={2}>
            <Nav variant="pills" className="flex-column sticky-nav">
              {sections.map((section) => (
                <Nav.Item key={section.key}>
                  <Nav.Link eventKey={section.key}>{section.label}</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>

          <Col md={9} xl={10}>
            <Tab.Content>
              {sections.map((section) => (
                <Tab.Pane key={section.key} eventKey={section.key} mountOnEnter>
                  {/* Le type exact varie d'une section à l'autre ; la config
                      porte déjà la garantie de cohérence entre resource et champs. */}
                  <ResourceManager config={section.config as never} />
                </Tab.Pane>
              ))}
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>

      <Form.Check
        type="switch"
        id="toggle-challenge-sections"
        className="text-muted mt-4"
        label="Afficher les sections du challenge (joueurs et résultats)"
        checked={showChallenge}
        onChange={(event) => handleToggleChallenge(event.target.checked)}
      />
    </Container>
  )
}
