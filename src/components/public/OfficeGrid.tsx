import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { useCollection } from '@/api/hooks'
import { officeResource } from '@/api/resources'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Loader } from '@/components/ui/Loader'

export function OfficeGrid() {
  const { data, isPending, error } = useCollection(officeResource)

  if (isPending) return <Loader />
  if (error) return <ErrorMessage error={error} />

  const members = data ?? []
  if (members.length === 0) {
    return <p className="text-muted">Le bureau sera présenté prochainement.</p>
  }

  return (
    <Row xs={1} sm={2} lg={3} className="g-4">
      {members.map((member) => (
        <Col key={member.objectId}>
          <Card className="h-100 text-center">
            <Card.Body>
              <Card.Title as="h2" className="h4 text-tc-blue">
                {member.name}
              </Card.Title>
              <Card.Subtitle className="mb-3 text-muted">
                {member.function}
              </Card.Subtitle>
              {member.image ? (
                <img
                  src={member.image}
                  alt={member.name}
                  className="office-portrait"
                  loading="lazy"
                />
              ) : null}
            </Card.Body>
          </Card>
        </Col>
      ))}
    </Row>
  )
}
