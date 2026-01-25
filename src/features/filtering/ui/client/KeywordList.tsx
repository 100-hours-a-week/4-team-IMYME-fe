import { KeywordItemType } from '@/entities/keyword'
import { KeywordItem } from '@/entities/keyword/ui/KeywordItem'

type KeywordListProps = {
  isLoading: boolean
  error: Error | null
  keywords: KeywordItemType[]
  onKeywordClick: (keyword: KeywordItemType) => void
}

export function KeywordList({ keywords, onKeywordClick }: KeywordListProps) {
  return (
    <div className="h-full overflow-y-scroll">
      {keywords.length > 0
        ? keywords.map((keyword: KeywordItemType) => (
            <KeywordItem
              key={keyword.id}
              keyword={keyword}
              onClick={onKeywordClick}
            />
          ))
        : null}
    </div>
  )
}
