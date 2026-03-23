import Script from 'next/script'

export function GoogleAnalytics({ gaId }: { gaId: string }) {
  // 개발 환경에서는 GA 스크립트를 로드하지 않는다.
  if (process.env.NODE_ENV !== 'production') {
    return null
  }

  return (
    <>
      {/* 브라우저 onload 이후에 gtag 라이브러리를 로드해 초기 렌더 경로 영향 최소화 */}
      <Script
        id="google-analytics-src"
        strategy="lazyOnload"
        src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
      />
      {/* dataLayer/gtag를 초기화하고 현재 페이지 기준 GA 설정을 등록 */}
      <Script
        id="google-analytics"
        strategy="lazyOnload"
        dangerouslySetInnerHTML={{
          __html: `
		if (window.__GA_GTAG_INITIALIZED__) {
		  // 이미 초기화된 경우 중복 config 실행 방지
		} else {
		  window.__GA_GTAG_INITIALIZED__ = true;
		window.dataLayer = window.dataLayer || [];
		function gtag(){dataLayer.push(arguments);}
		window.gtag = window.gtag || gtag;
		gtag('js', new Date());

		gtag('config', '${gaId}');
		}
		`,
        }}
      />
    </>
  )
}
