import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
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

export default function Admin() {
  const { user } = useAuth()

  return (
    <Container fluid>
      <PageHeader title="Administration">
        {user
          ? `Connecté en tant que ${user.firstname} ${user.lastname}`
          : null}
      </PageHeader>

      <Tab.Container defaultActiveKey="contents">
        <Row className="g-4">
          <Col md={3} xl={2}>
            <Nav variant="pills" className="flex-column sticky-nav">
              {SECTIONS.map((section) => (
                <Nav.Item key={section.key}>
                  <Nav.Link eventKey={section.key}>{section.label}</Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>

          <Col md={9} xl={10}>
            <Tab.Content>
              {SECTIONS.map((section) => (
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
    </Container>
  )
}
