// src/shared/lib/WebVitalsTracker.tsx
'use client'

import { useReportWebVitals } from 'next/web-vitals'

import { reportWebVitals as sendMetrics } from './webVitals' // Renaming for clarity

// This is a client component that exists only to activate the useReportWebVitals hook.
export function WebVitalsTracker() {
  // The hook takes the reporting function as an argument.
  useReportWebVitals(sendMetrics)

  // This component does not render anything to the DOM.
  return null
}
