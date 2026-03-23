'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/ui/tabs'

const EMPTY_FEEDBACK_MESSAGE = '피드백이 존재하지 않습니다.'
const WRAPPER_CLASSNAME = 'w-full max-w-(--frame-max-width) self-center px-7 py-5'
const TAB_CONTENT_CLASSNAME =
  'break-normal whitespace-pre-line min-h-[20vh] max-h-[40vh] w-full rounded-2xl bg-white p-3'
const COMPARE_FEEDBACK_WRAPPER_CLASSNAME = 'w-full self-center pt-3'
const COMPARE_FEEDBACK_CONTENT_CLASSNAME =
  'min-h-[10vh] w-full rounded-2xl bg-white p-3 text-sm break-normal whitespace-pre-line'
const COMPARE_FEEDBACK_LABEL = '랭커와의 비교 피드백'

type ChallengeFeedback = {
  summary?: string
  keywords?: string[]
  facts?: string
  understanding?: string
  personalized_feedback?: string
}

type ChallengeFeedbackPanelProps = {
  feedback?: ChallengeFeedback
}

const readFeedbackText = (value?: string) => value ?? EMPTY_FEEDBACK_MESSAGE

export function ChallengeFeedbackPanel({ feedback }: ChallengeFeedbackPanelProps) {
  return (
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
          <div className={TAB_CONTENT_CLASSNAME}>{readFeedbackText(feedback?.summary)}</div>
        </TabsContent>
        <TabsContent value="keywords">
          <div className={TAB_CONTENT_CLASSNAME}>
            {readFeedbackText(feedback?.keywords?.join(', '))}
          </div>
        </TabsContent>
        <TabsContent value="facts">
          <div className={TAB_CONTENT_CLASSNAME}>{readFeedbackText(feedback?.facts)}</div>
        </TabsContent>
        <TabsContent value="understanding">
          <div className={TAB_CONTENT_CLASSNAME}>{readFeedbackText(feedback?.understanding)}</div>
        </TabsContent>
      </Tabs>
      <div className={COMPARE_FEEDBACK_WRAPPER_CLASSNAME}>
        <p className="text-start text-sm font-semibold">{COMPARE_FEEDBACK_LABEL}</p>
        <div className={COMPARE_FEEDBACK_CONTENT_CLASSNAME}>
          {readFeedbackText(feedback?.personalized_feedback)}
        </div>
      </div>
    </div>
  )
}
