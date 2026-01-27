'use client'

import type { KeywordItemType } from '@/entities/keyword'

type KeywordSelectListProps = {
  keywords: KeywordItemType[]
  selectedKeywordId: number | null
  onKeywordSelect: (keyword: KeywordItemType) => void
}

export function KeywordSelectList({
  keywords,
  selectedKeywordId,
  onKeywordSelect,
}: KeywordSelectListProps) {
  return (
    <div className="itmes-center flex flex-col gap-6">
      {keywords.map((keyword) => {
        const isSelected = selectedKeywordId === keyword.id
        const selectedClassName = isSelected ? 'border border-secondary' : ''

        return (
          <button
            key={keyword.id}
            type="button"
            onClick={() => onKeywordSelect(keyword)}
            className={`flex h-10 w-80 items-center justify-center overflow-auto rounded-2xl bg-white ${selectedClassName}`}
          >
            <p>{keyword.keywordName}</p>
          </button>
        )
      })}
    </div>
  )
}
