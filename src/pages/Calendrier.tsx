import Container from 'react-bootstrap/Container'
import { PageHeader } from '@/components/ui/PageHeader'
import { ResponsiveEmbed } from '@/components/ui/ResponsiveEmbed'

const CALENDAR_EMBED =
  'https://calendar.google.com/calendar/embed?height=600&wkst=1&bgcolor=%234285F4&ctz=Europe%2FParis&src=dGM5NXVzQGdtYWlsLmNvbQ&src=ZnIuZnJlbmNoI2hvbGlkYXlAZ3JvdXAudi5jYWxlbmRhci5nb29nbGUuY29t&color=%23039BE5&color=%230B8043&showTitle=0&showTz=0&showCalendars=0'

export default function Calendrier() {
  return (
    <Container>
      <PageHeader title="Calendrier des évènements">
        Toutes les animations et évènements du TC Us, dans un seul agenda.
      </PageHeader>

      <ResponsiveEmbed src={CALENDAR_EMBED} title="Calendrier du TC Us" />
    </Container>
  )
}
