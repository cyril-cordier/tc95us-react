import type { ReactNode } from 'react'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'

/** Gabarit « contenu principal + colonne éditoriale » partagé par cinq pages. */
export function TwoColumnPage({
  main,
  aside,
}: {
  main: ReactNode
  aside?: ReactNode
}) {
  return (
    <Container fluid>
      <Row className="g-4">
        <Col xs={12} lg={aside ? 8 : 12}>
          {main}
        </Col>
        {aside ? (
          <Col xs={12} lg={4}>
            <aside className="side-panel">{aside}</aside>
          </Col>
        ) : null}
      </Row>
    </Container>
  )
}
