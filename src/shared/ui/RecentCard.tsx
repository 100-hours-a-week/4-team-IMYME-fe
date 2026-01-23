import { ArrowRight } from 'lucide-react'

interface RecentCardProps {
  cardName?: string
  cardCategory?: string
}

export function RecentCard({ cardName = 'null', cardCategory = 'null' }: RecentCardProps) {
  return (
    <div className="border-secondary flex min-h-12.5 min-w-80 items-center justify-evenly rounded-xl border bg-white">
      <p className="ml-5 text-sm font-semibold">{cardName}</p>
      <div className="bg-secondary text-primary mr-3 ml-auto min-h-5 min-w-18 rounded-xl text-center text-sm">
        {cardCategory}
      </div>
      <ArrowRight className="mr-2" />
    </div>
  )
}
