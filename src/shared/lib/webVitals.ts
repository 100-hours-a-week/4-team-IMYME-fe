// src/shared/lib/webVitals.ts
import type { NextWebVitalsMetric } from 'next/app'

export function reportWebVitals(metric: NextWebVitalsMetric) {
  console.log('reportWebVitals called:', metric)

  const body = JSON.stringify({
    name: metric.name,
    value: metric.value,
  })

  if (navigator.sendBeacon) {
    navigator.sendBeacon('/api/metrics', body)
  } else {
    fetch('/api/metrics', {
      method: 'POST',
      body,
      keepalive: true,
    })
  }
}
