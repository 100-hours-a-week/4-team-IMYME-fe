import { ModeButton } from '@/features/mode'
import { RecentCard, RecentListHeader } from '@/shared'
import { ProfileDashboard } from '@/widgets/profile'

const cardData = {
  cardName: 'Spring Bean',
  cardCategory: 'Spring',
}

export function MainPage() {
  return (
    <>
      <ProfileDashboard />
      <ModeButton variant="levelup" />
      <RecentListHeader variant="levelup" />
      <div className="mt-5 flex flex-col items-center gap-4">
        <RecentCard />
        <RecentCard
          cardName={cardData.cardName}
          cardCategory={cardData.cardCategory}
        />
      </div>
    </>
  )
}
