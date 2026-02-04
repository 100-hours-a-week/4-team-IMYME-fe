import { KeywordItemType } from '../model/keywordItem'

interface KeywordItemProps {
  keyword: KeywordItemType
  onClick: (keywordId: KeywordItemType) => void
  isSelected?: boolean
}

export function KeywordItem({ keyword, onClick, isSelected = false }: KeywordItemProps) {
  const selectedClassName = isSelected ? ' w-full text-primary' : ''

  return (
    <div
      key={keyword.id}
      className={`cursor-pointer pt-2 ${selectedClassName}`}
    >
      <p
        className="text-md ml-4 font-semibold"
        onClick={() => onClick(keyword)}
      >
        {keyword.keywordName}
      </p>
    </div>
  )
}
