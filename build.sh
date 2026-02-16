#!/bin/bash

# 환경 선택 (dev, prod, release)
ENV=${1:-dev}

if [ "$ENV" != "dev" ] && [ "$ENV" != "prod" ] && [ "$ENV" != "release" ]; then
  echo "Usage: ./build.sh [dev|prod|release] [--no-cache]"
  exit 1
fi

# 두 번째 인자에 --no-cache 넣으면 캐시 끔
NO_CACHE_FLAG=""
if [ "${2:-}" = "--no-cache" ]; then
  NO_CACHE_FLAG="--no-cache"
fi

# 환경별 .env 파일 로드
ENV_FILE=".env.$ENV"
if [ -f "$ENV_FILE" ]; then
  echo "📝 Loading $ENV_FILE file..."
  set -a
  source "$ENV_FILE"
  set +a
elif [ -f .env ]; then
  echo "📝 Loading .env file..."
  set -a
  source .env
  set +a
else
  echo "⚠️  .env file not found, using environment variables"
fi

echo "🚀 Building Docker image for $ENV environment..."

# 환경별 환경변수 설정
if [ "$ENV" = "dev" ]; then
  NEXT_PUBLIC_KAKAO_REST_API_KEY=${NEXT_PUBLIC_KAKAO_REST_API_KEY}
  NEXT_PUBLIC_KAKAO_REDIRECT_URI=${NEXT_PUBLIC_DEV_KAKAO_REDIRECT_URI}
  NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_DEV_API_BASE_URL}
  NEXT_PUBLIC_SECURE=${NEXT_PUBLIC_DEV_SECURE:-false}
  NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_DEV_SERVER_URL}
  NEXT_PUBLIC_GOOGLE_ANALYTICS=${NEXT_PUBLIC_DEV_GOOGLE_ANALYTICS}
  IMAGE_TAG="imyme-frontend:dev"
elif [ "$ENV" = "prod" ]; then
  NEXT_PUBLIC_KAKAO_REST_API_KEY=${NEXT_PUBLIC_KAKAO_REST_API_KEY}
  NEXT_PUBLIC_KAKAO_REDIRECT_URI=${NEXT_PUBLIC_KAKAO_REDIRECT_URI}
  NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
  NEXT_PUBLIC_SECURE=${NEXT_PUBLIC_SECURE:-true}
  NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
  NEXT_PUBLIC_GOOGLE_ANALYTICS=${NEXT_PUBLIC_GOOGLE_ANALYTICS}
  IMAGE_TAG="imyme-frontend:prod"
else
  # release 환경
  NEXT_PUBLIC_KAKAO_REST_API_KEY=${NEXT_PUBLIC_KAKAO_REST_API_KEY}
  NEXT_PUBLIC_KAKAO_REDIRECT_URI=${NEXT_PUBLIC_KAKAO_REDIRECT_URI}
  NEXT_PUBLIC_API_BASE_URL=${NEXT_PUBLIC_API_BASE_URL}
  NEXT_PUBLIC_SECURE=${NEXT_PUBLIC_SECURE:-true}
  NEXT_PUBLIC_SERVER_URL=${NEXT_PUBLIC_SERVER_URL}
  NEXT_PUBLIC_GOOGLE_ANALYTICS=${NEXT_PUBLIC_GOOGLE_ANALYTICS}
  IMAGE_TAG="imyme-frontend:release"
fi

# Git 커밋 해시로 캐시 무효화
COMMIT_HASH=$(git rev-parse --short HEAD)

# Docker 빌드
docker build $NO_CACHE_FLAG \
  --build-arg NEXT_PUBLIC_API_BASE_URL="$NEXT_PUBLIC_API_BASE_URL" \
  --build-arg NEXT_PUBLIC_SERVER_URL="$NEXT_PUBLIC_SERVER_URL" \
  --build-arg NEXT_PUBLIC_KAKAO_REDIRECT_URI="$NEXT_PUBLIC_KAKAO_REDIRECT_URI" \
  --build-arg NEXT_PUBLIC_KAKAO_REST_API_KEY="$NEXT_PUBLIC_KAKAO_REST_API_KEY" \
  --build-arg NEXT_PUBLIC_SECURE="$NEXT_PUBLIC_SECURE" \
  --build-arg NEXT_PUBLIC_GOOGLE_ANALYTICS="$NEXT_PUBLIC_GOOGLE_ANALYTICS" \
  --build-arg CACHE_BUST="$COMMIT_HASH" \
  -t $IMAGE_TAG \
  .

if [ $? -eq 0 ]; then
  echo "✅ Build successful: $IMAGE_TAG"
  ECR_REPO="219268921033.dkr.ecr.ap-northeast-2.amazonaws.com/imyme-frontend"
  AWS_REGION="ap-northeast-2"

  # ECR 태그
  docker tag $IMAGE_TAG $ECR_REPO:$COMMIT_HASH
  docker tag $IMAGE_TAG $ECR_REPO:$ENV-latest

  echo ""
  echo "📦 Tagged images:"
  echo "  $ECR_REPO:$COMMIT_HASH"
  echo "  $ECR_REPO:$ENV-latest"
  echo ""

  # ECR 로그인
  echo "🔐 Logging in to ECR..."
  aws ecr get-login-password --region $AWS_REGION | docker login --username AWS --password-stdin 219268921033.dkr.ecr.$AWS_REGION.amazonaws.com

  if [ $? -eq 0 ]; then
    # ECR 푸시
    echo "📤 Pushing images to ECR..."
    docker push $ECR_REPO:$COMMIT_HASH
    docker push $ECR_REPO:$ENV-latest

    if [ $? -eq 0 ]; then
      echo ""
      echo "✅ Successfully pushed to ECR!"
      echo "  - $ECR_REPO:$COMMIT_HASH"
      echo "  - $ECR_REPO:$ENV-latest"
    else
      echo "❌ Push failed"
      exit 1
    fi
  else
    echo "❌ ECR login failed"
    exit 1
  fi
else
  echo "❌ Build failed"
  exit 1
fi
