'use client'

type StartMediaRecorderOptions = {
  mimeType?: string // ✅ 녹음 포맷 지정(예: 'audio/webm', 'audio/mp4')
  audioBitsPerSecond?: number // ✅ 오디오 비트레이트(품질/용량에 영향). 미지정 시 브라우저 기본값
  timesliceMs?: number // ✅ 지정하면 N ms마다 ondataavailable 이벤트로 chunk가 주기적으로 떨어짐
  constraints?: MediaStreamConstraints // ✅ getUserMedia에 넘길 제약(기본은 {audio:true})
}

type StartMediaRecorderResult =
  | { ok: true; recorder: MediaRecorder; stream: MediaStream } // ✅ 성공: recorder/stream 반환
  | { ok: false; reason: string } // ✅ 실패: 실패 이유 문자열 반환

const DEFAULT_CONSTRAINTS: MediaStreamConstraints = { audio: true } // ✅ 기본은 마이크 오디오만
const ALLOWED_MIME_TYPES = ['audio/mp4', 'audio/webm'] // ✅ 허용할 mimeType 화이트리스트
const DEFAULT_MIME_TYPE = 'audio/webm' // ✅ 선호 기본 포맷(대체로 브라우저 지원이 좋음)

export async function startMediaRecorder(
  options: StartMediaRecorderOptions = {}, // ✅ 옵션 안 주면 빈 객체로 기본 처리
): Promise<StartMediaRecorderResult> {
  // ✅ SSR(서버)에서는 window/navigator가 없으므로 즉시 실패 처리
  // ✅ 브라우저여도 mediaDevices.getUserMedia가 없으면 녹음 불가(구형/제한 환경)
  if (typeof window === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
    return { ok: false, reason: 'media_devices_unavailable' }
  }

  // ✅ 호출자가 mimeType을 지정했다면, 허용 리스트에 있는 값인지 먼저 검증
  // ✅ (실수로 'audio/wav' 같은 걸 넘겼을 때 조기 실패)
  if (options.mimeType && !ALLOWED_MIME_TYPES.includes(options.mimeType)) {
    return { ok: false, reason: 'unsupported_mime_type' } // ✅ 허용하지 않는 포맷
  }

  try {
    // ✅ 마이크(또는 지정한 constraints)에 대한 권한 요청 + 스트림 획득
    // ✅ options.constraints가 있으면 그것을, 없으면 기본 {audio:true} 사용
    const stream = await navigator.mediaDevices.getUserMedia(
      options.constraints ?? DEFAULT_CONSTRAINTS,
    )

    // ✅ 우선 사용자가 지정한 mimeType을 쓰고, 없으면 DEFAULT_MIME_TYPE('audio/webm')을 선호
    const preferredMimeType = options.mimeType ?? DEFAULT_MIME_TYPE

    // ✅ 브라우저가 preferredMimeType을 지원하면 그걸 사용
    // ✅ 지원하지 않으면 허용 리스트(ALLOWED_MIME_TYPES) 중 지원되는 첫 타입을 찾음
    const mimeType = MediaRecorder.isTypeSupported(preferredMimeType)
      ? preferredMimeType
      : ALLOWED_MIME_TYPES.find((type) => MediaRecorder.isTypeSupported(type))

    // ✅ 허용 리스트 중에서도 브라우저가 지원하는 타입이 하나도 없으면 실패
    if (!mimeType) {
      return { ok: false, reason: 'unsupported_mime_type' } // ✅ 녹음 포맷 지원 불가
    }

    // ✅ MediaRecorder 생성(스트림 + 옵션)
    // ✅ mimeType은 위에서 "지원되는 값"으로 확정된 값만 들어옴
    // ✅ audioBitsPerSecond는 옵션으로 넘기되, 없으면 undefined(브라우저 기본값)
    const recorder = new MediaRecorder(stream, {
      mimeType,
      audioBitsPerSecond: options.audioBitsPerSecond,
    })

    // ✅ timesliceMs가 있으면 chunk 단위로 주기적 데이터 제공(ondataavailable 여러 번)
    // ✅ 없으면 stop() 호출 시점에 한 번에 데이터가 모이는 형태가 많음
    if (options.timesliceMs) {
      recorder.start(options.timesliceMs) // ✅ N ms마다 dataavailable 발생
    } else {
      recorder.start() // ✅ 기본 start(브라우저 구현에 따라 chunk 주기 없이 모을 수 있음)
    }

    // ✅ 성공 결과 반환: recorder(녹음 제어), stream(마이크 스트림)
    return { ok: true, recorder, stream }
  } catch (error) {
    // ✅ 권한 거부, 디바이스 없음, HTTPS 아님, 기타 예외 등
    console.error('Failed to start media recorder', error)
    return { ok: false, reason: 'start_failed' } // ✅ 시작 실패(포괄적)
  }
}
