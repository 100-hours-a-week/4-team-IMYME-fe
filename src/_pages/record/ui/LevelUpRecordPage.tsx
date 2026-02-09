'use client'

import { FeedbackLoader } from '@/features/levelup-feedback'
import { MicrophoneBox, useLevelUpRecordController } from '@/features/record'
import { LevelUpHeader, AlertModal, RecordTipBox, SubjectHeader, Button } from '@/shared'

const RECORD_PROGRESS_VALUE = 100
const RECORD_STEP_LABEL = '3/3'
export function LevelUpRecordPage() {
  const {
    data,
    isSubmittingFeedback,
    uploadStatus,
    isStartingWarmup,
    warmupError,
    isMicAlertOpen,
    isBackAlertOpen,
    isRecording,
    isPaused,
    elapsedSeconds,
    recordedBlob,
    handleMicClick,
    handleBackConfirm,
    handleBackCancel,
    handleMicAlertOpenChange,
    handleBackAlertOpenChange,
    handleRecordingComplete,
  } = useLevelUpRecordController()

  return (
    <div className="flex h-full w-full flex-1 flex-col">
      <LevelUpHeader
        variant="recording"
        onBack={() => handleBackAlertOpenChange(true)}
        progressValue={RECORD_PROGRESS_VALUE}
        stepLabel={RECORD_STEP_LABEL}
      />
      <SubjectHeader
        variant="in_progress"
        categoryValue={data?.categoryName ?? ''}
        keywordValue={data?.keywordName ?? ''}
      />
      {isSubmittingFeedback || uploadStatus === 'PENDING' ? (
        <FeedbackLoader status="PENDING" />
      ) : (
        <MicrophoneBox
          isStartingWarmup={isStartingWarmup}
          warmupError={warmupError}
          onMicClick={handleMicClick}
          title="음성으로 말해보세요."
          description="버튼을 눌러 녹음을 시작하세요."
          errorMessage="녹음 시작에 실패했습니다. 메인으로 이동합니다."
          isMicDisabled={Boolean(recordedBlob)}
          isRecording={isRecording}
          isPaused={isPaused}
          elapsedSeconds={elapsedSeconds}
        />
      )}
      <RecordTipBox />
      <div className="mt-auto mb-6 flex w-full items-center justify-center gap-4 pt-4">
        <Button
          variant="record_confirm_btn"
          onClick={handleRecordingComplete}
          disabled={isSubmittingFeedback}
        >
          녹음 완료 및 피드백 받기
        </Button>
      </div>
      <AlertModal
        open={isBackAlertOpen}
        onOpenChange={handleBackAlertOpenChange}
        title="학습을 취소하시겠습니까?"
        description="현재 생성한 카드가 삭제될 수 있습니다."
        action="나가기"
        cancel="계속하기"
        onAction={handleBackConfirm}
        onCancel={handleBackCancel}
      />
      <AlertModal
        open={isMicAlertOpen}
        onOpenChange={handleMicAlertOpenChange}
        title="마이크 권한이 필요합니다."
        description="브라우저 설정에서 마이크 권한을 허용해주세요."
        action="확인"
        cancel="닫기"
        onAction={() => handleMicAlertOpenChange(false)}
        onCancel={() => handleMicAlertOpenChange(false)}
      />
    </div>
  )
}
