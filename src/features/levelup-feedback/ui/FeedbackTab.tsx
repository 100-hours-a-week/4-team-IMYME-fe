'use client'

import { useEffect, useMemo, useState } from 'react'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared'
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from '@/shared/ui/carousel'

import type { FeedbackItem } from '@/features/levelup-feedback/model/feedbackTypes'

type FeedbackTabProps = {
  feedbackData: FeedbackItem[]
  showButtons?: boolean
  onAttemptNoChange?: (attemptNo: number) => void
}

const CAROUSEL_CLASSNAME =
  'mx-auto flex w-full max-w-[var(--frame-max-width)] items-center justify-center px-3'
const CAROUSEL_ITEM_CLASSNAME = 'flex justify-center'
const CAROUSEL_CONTENT_WRAP_CLASSNAME = 'w-full max-w-[var(--frame-max-width)]'

const WRAPPER_CLASSNAME = 'w-full self-center px-4'
const TAB_CONTENT_CLASSNAME =
  'break-normal whitespace-pre-line min-h-[20vh] max-h-[40vh] w-full rounded-2xl bg-white p-3'

const REVIEW_SECTION_CLASSNAME = 'w-full self-center pt-3'
const REVIEW_TITLE_CLASSNAME = 'text-start text-sm font-semibold'
const REVIEW_BOX_CLASSNAME =
  'break-normal min-h-[10vh] w-full rounded-2xl bg-white p-3 whitespace-pre-line text-sm'

const DEFAULT_SHOW_BUTTONS = true
const COMMENT_CLASSNAME = 'mt-10 text-center'

export function FeedbackTab({
  feedbackData,
  showButtons = DEFAULT_SHOW_BUTTONS,
  onAttemptNoChange,
}: FeedbackTabProps) {
  const sortedFeedbackData = useMemo(
    () => [...feedbackData].sort((a, b) => b.attemptNo - a.attemptNo),
    [feedbackData],
  )

  const [api, setApi] = useState<CarouselApi | null>(null)

  useEffect(() => {
    if (!api) return

    const emit = () => {
      const idx = api.selectedScrollSnap()
      const attemptNo = sortedFeedbackData[idx]?.attemptNo
      if (attemptNo != null) onAttemptNoChange?.(attemptNo)
    }

    emit() // 최초 1회
    api.on('select', emit)
    return () => {
      api.off('select', emit)
    }
  }, [api, onAttemptNoChange, sortedFeedbackData])

  if (feedbackData.length === 0) {
    return <p className={COMMENT_CLASSNAME}>피드백 데이터가 없습니다.</p>
  }
  return (
    <>
      <Carousel
        className={CAROUSEL_CLASSNAME}
        setApi={setApi}
      >
        <CarouselContent className="flex w-full">
          {sortedFeedbackData.map((feedback) => (
            <CarouselItem
              key={feedback.id}
              className={CAROUSEL_ITEM_CLASSNAME}
            >
              <div className={CAROUSEL_CONTENT_WRAP_CLASSNAME}>
                <div className={WRAPPER_CLASSNAME}>
                  <Tabs defaultValue="summary">
                    <TabsList
                      variant="line"
                      className="w-full text-2xl text-black"
                    >
                      <TabsTrigger value="summary">요약</TabsTrigger>
                      <TabsTrigger value="keywords">키워드</TabsTrigger>
                      <TabsTrigger value="facts">팩트</TabsTrigger>
                      <TabsTrigger value="understanding">이해도</TabsTrigger>
                    </TabsList>
                    <TabsContent value="summary">
                      <div className={TAB_CONTENT_CLASSNAME}>{feedback.summary ?? ''}</div>
                    </TabsContent>
                    <TabsContent value="keywords">
                      <div className={TAB_CONTENT_CLASSNAME}>{feedback.keywords ?? ''}</div>
                    </TabsContent>
                    <TabsContent value="facts">
                      <div className={TAB_CONTENT_CLASSNAME}>{feedback.facts ?? ''}</div>
                    </TabsContent>
                    <TabsContent value="understanding">
                      <div className={TAB_CONTENT_CLASSNAME}>{feedback.understanding ?? ''}</div>
                    </TabsContent>
                  </Tabs>
                  <div className={REVIEW_SECTION_CLASSNAME}>
                    <p className={REVIEW_TITLE_CLASSNAME}>총평 및 추가 질문</p>
                    <div className={REVIEW_BOX_CLASSNAME}>{feedback.socraticFeedback ?? ''}</div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {showButtons ? (
          <>
            <CarouselPrevious
              className="left-1"
              variant="carousel_btn"
            />
            <CarouselNext
              className="right-1"
              variant="carousel_btn"
            />
          </>
        ) : null}
      </Carousel>
    </>
  )
}
