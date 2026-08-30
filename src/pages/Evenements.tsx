import { Link } from 'react-router-dom'
import { CONTENT_SLOTS } from '@/api/contents'
import { ContentSlot } from '@/components/content/ContentSlot'
import { TwoColumnPage } from '@/components/layout/TwoColumnPage'
import { EventList } from '@/components/public/EventList'
import { PageHeader } from '@/components/ui/PageHeader'

export default function Evenements() {
  return (
    <TwoColumnPage
      main={
        <>
          <PageHeader title="Animations et évènements">
            Retrouvez ici le détail de toutes les animations et évènements du TC Us.
          </PageHeader>

          <p>
            <Link to="/calendrier">Voir le calendrier des évènements</Link>
          </p>

          <EventList />
        </>
      }
      aside={
        <ContentSlot
          slot={CONTENT_SLOTS.motAnimateurs}
          heading="Le mot des animateurs"
          signature
        />
      }
    />
  )
}
