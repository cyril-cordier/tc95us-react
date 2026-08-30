import Card from 'react-bootstrap/Card'
import { useCollection } from '@/api/hooks'
import { eventsResource } from '@/api/resources'
import { ErrorMessage } from '@/components/ui/ErrorMessage'
import { Loader } from '@/components/ui/Loader'
import { RichText } from '@/components/ui/RichText'

export function EventList() {
  const { data, isPending, error } = useCollection(eventsResource)

  if (isPending) return <Loader />
  if (error) return <ErrorMessage error={error} />

  const events = data ?? []
  if (events.length === 0) {
    return <p className="text-muted">Aucun évènement programmé pour le moment.</p>
  }

  return (
    <div className="d-grid gap-4">
      {events.map((event) => (
        <Card key={event.objectId}>
          {event.image ? (
            <Card.Img variant="top" src={event.image} alt="" loading="lazy" />
          ) : null}

          <Card.Body>
            <Card.Title as="h2" className="h4">
              {event.title}
            </Card.Title>
            {event.date ? <Card.Subtitle className="text-muted mb-3">{event.date}</Card.Subtitle> : null}

            <RichText html={event.details} />
          </Card.Body>

          <Card.Footer className="text-muted small">
            {[event.place, event.hour, event.price].filter(Boolean).join(' — ')}
          </Card.Footer>
        </Card>
      ))}
    </div>
  )
}
