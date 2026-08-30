import { CONTENT_SLOTS } from '@/api/contents'
import { ContentSlot } from '@/components/content/ContentSlot'
import { TwoColumnPage } from '@/components/layout/TwoColumnPage'
import { ChampionnatTable } from '@/components/public/ChampionnatTable'
import { PageHeader } from '@/components/ui/PageHeader'

export default function Championnats() {
  return (
    <TwoColumnPage
      main={
        <>
          <PageHeader title="Championnats par équipes">
            Les résultats des rencontres par équipes du TC Us.
          </PageHeader>

          <ChampionnatTable />
        </>
      }
      aside={
        <ContentSlot
          slot={CONTENT_SLOTS.motResponsableEquipes}
          heading="Le mot du Responsable des équipes"
          signature
        />
      }
    />
  )
}
