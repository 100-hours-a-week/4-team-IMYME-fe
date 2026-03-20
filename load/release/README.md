# Release Load Test

IMYME 레벨업 모드 API 부하테스트 스크립트입니다.

## Scripts

| 파일                       | 설명                                      |
| -------------------------- | ----------------------------------------- |
| `load_solo_fetch_api.mjs`  | 순수 Node.js fetch API 기반 (의존성 없음) |
| `load_solo_playwright.mjs` | Playwright request 기반                   |

## What It Does

1. `/server/e2e/login/{vuId}`로 VU별 E2E 로그인
2. 카테고리/키워드 조회
3. 카드 생성
4. `presigned-url -> S3 upload -> upload-complete` API 호출
5. Feedback 폴링 (COMPLETED/FAILED/EXPIRED 상태까지 대기)

## Run

### Fetch API 기반 (권장)

의존성 없이 바로 실행 가능합니다.

```bash
cd /Users/wonhyeonseob/Desktop/git/MINE/fe/4-team-IMYME-fe/load/release
node load_solo_fetch_api.mjs
```

### Playwright 기반

`playwright` 패키지가 설치된 위치에서 실행하세요.

```bash
cd /Users/wonhyeonseob/Desktop/git/MINE/fe/4-team-IMYME-fe
node load/release/load_solo_playwright.mjs
```

## Env

| 변수                  | 기본값                                   | 설명                 |
| --------------------- | ---------------------------------------- | -------------------- |
| `BASE_URL`            | `https://release.imymemine.kr`           | 대상 서버            |
| `CONCURRENCY`         | `100`                                    | 동시 실행 VU 수      |
| `ITERATIONS`          | `100`                                    | VU당 반복 횟수       |
| `AUDIO_FILE`          | `./assets/sample_speech.webm`            | 업로드할 오디오 파일 |
| `POLL_INTERVAL_MS`    | `2000`                                   | 폴링 간격            |
| `FEEDBACK_TIMEOUT_MS` | `600000` (fetch) / `180000` (playwright) | 피드백 대기 타임아웃 |

## Example

```bash
BASE_URL=https://release.imymemine.kr \
CONCURRENCY=50 \
ITERATIONS=10 \
node load_solo_fetch_api.mjs
```

## Assets

`assets/` 폴더에 테스트용 오디오 파일이 포함되어 있습니다.

- `sample_speech.webm` - 기본 테스트 오디오
- `sample_speech.wav` - WAV 포맷
- `sample_voice*.webm/aiff` - 추가 샘플
