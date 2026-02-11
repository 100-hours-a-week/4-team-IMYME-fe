'use client'

import { KeywordItemType } from '@/entities/keyword'
import { KeywordItem } from '@/entities/keyword/ui/KeywordItem'

type KeywordListProps = {
  isLoading: boolean
  error: Error | null
  keywords: KeywordItemType[]
  onKeywordClick: (keyword: KeywordItemType) => void
  selectedKeywordId: number | null
}

export function KeywordList({ keywords, onKeywordClick, selectedKeywordId }: KeywordListProps) {
  return (
    <div className="h-full min-h-0 overflow-y-scroll">
      {keywords.length > 0
        ? keywords.map((keyword: KeywordItemType) => (
            <KeywordItem
              key={keyword.id}
              keyword={keyword}
              onClick={onKeywordClick}
              isSelected={selectedKeywordId === keyword.id}
            />
          ))
        : null}
    </div>
  )
}
