# 4-team-IMYME-fe

4 Team IMYME FE 레포지토리입니다!

## 프로젝트 세팅 & 초기화

### 요구사항

- Node.js (권장: LTS)
- pnpm 10.27.0

### 설치

```bash
pnpm install
```

### 개발 서버 실행

```bash
pnpm dev
```

### 빌드 스크립트 허용 (선택)

Next.js 이미지 최적화 등에 필요한 네이티브 모듈(`sharp`)이 막혀 있을 수 있습니다.

```bash
pnpm approve-builds
```

### 기타 스크립트

```bash
pnpm lint
pnpm test
pnpm build
```

## 프로젝트 구조

- `src/app`: Next.js App Router
- `src/shared`: 공용 UI/유틸/훅
