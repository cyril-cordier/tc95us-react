import { CONTENT_SLOTS } from '@/api/contents'
import { ContentSlot } from '@/components/content/ContentSlot'
import { TwoColumnPage } from '@/components/layout/TwoColumnPage'
import { PageHeader } from '@/components/ui/PageHeader'

export default function Equipements() {
  return (
    <TwoColumnPage
      main={
        <>
          <PageHeader title="Nos installations" />
          <ContentSlot slot={CONTENT_SLOTS.installations} />
        </>
      }
      aside={
        <ContentSlot
          slot={CONTENT_SLOTS.motPresident}
          heading="Le mot du Président"
          signature
        />
      }
    />
  )
}
