'use client'

import { useKeywordList } from '../../filtering/model/useKeywordList'

import type { KeywordItemType } from '@/entities/keyword'

type KeywordSelectListProps = {
  accessToken: string
  categoryId: number | null
  selectedKeywordId: number | null
  onKeywordSelect: (keyword: KeywordItemType) => void
}

export function KeywordSelectList({
  accessToken,
  categoryId,
  selectedKeywordId,
  onKeywordSelect,
}: KeywordSelectListProps) {
  const {
    data: keywords = [],
    isLoading,
    isError,
  } = useKeywordList({
    categoryId,
    accessToken,
  })

  if (!categoryId) {
    return <p>카테고리를 선택해 주세요.</p>
  }

  if (isLoading) {
    return <p>키워드를 불러오는 중입니다.</p>
  }

  if (isError) {
    return <p>키워드를 불러오지 못했습니다.</p>
  }

  if (keywords.length === 0) {
    return <p>키워드 정보가 존재하지 않습니다.</p>
  }

  return (
    <div className="itmes-center flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto">
      {keywords.map((keyword) => {
        const isSelected = selectedKeywordId === keyword.id
        const selectedClassName = isSelected ? 'border border-secondary' : ''

        return (
          <button
            key={keyword.id}
            type="button"
            onClick={() => onKeywordSelect(keyword)}
            className={`flex min-h-10 w-80 cursor-pointer items-center justify-center rounded-2xl bg-white ${selectedClassName}`}
          >
            <p>{keyword.keywordName}</p>
          </button>
        )
      })}
    </div>
  )
}
