import { NextResponse } from 'next/server'
import { register, Histogram } from 'prom-client'

// NOTE: prom-client creates a global registry by default.
// This is okay for single-process applications like a Next.js server.

// Create histograms for each Web Vital.
// A histogram is used because it allows for aggregating measures
// and calculating quantiles (e.g., p95, p99), which are more useful
// for performance metrics than simple averages.
const fcpHistogram = new Histogram({
  name: 'nextjs_fcp',
  help: 'First Contentful Paint (in ms)',
  labelNames: [],
  buckets: [100, 200, 500, 1000, 1500, 2500, 4000], // Buckets in milliseconds
})

const lcpHistogram = new Histogram({
  name: 'nextjs_lcp',
  help: 'Largest Contentful Paint (in ms)',
  labelNames: [],
  buckets: [500, 1000, 1500, 2500, 4000, 6000],
})

const clsHistogram = new Histogram({
  name: 'nextjs_cls',
  help: 'Cumulative Layout Shift',
  labelNames: [],
  buckets: [0.1, 0.25, 0.5, 1],
})

const inpHistogram = new Histogram({
  name: 'nextjs_inp',
  help: 'Interaction to Next Paint (in ms)',
  labelNames: [],
  buckets: [100, 200, 300, 500, 1000], // Common INP thresholds
})

const ttfbHistogram = new Histogram({
  name: 'nextjs_ttfb',
  help: 'Time to First Byte (in ms)',
  labelNames: [],
  buckets: [50, 100, 200, 300, 500, 800, 1200, 2000],
})
// A map to easily access the correct histogram
const histograms: Record<string, Histogram> = {
  FCP: fcpHistogram,
  LCP: lcpHistogram,
  CLS: clsHistogram,
  INP: inpHistogram,
  TTFB: ttfbHistogram,
}

/**
 * Handles GET requests to /api/metrics.
 * This is the endpoint that Prometheus will scrape.
 */
export async function GET() {
  try {
    const metrics = await register.metrics()
    return new NextResponse(metrics, {
      status: 200,
      headers: {
        'Content-Type': register.contentType,
      },
    })
  } catch (error) {
    console.error('Error getting metrics:', error)
    return new NextResponse('Error getting metrics', { status: 500 })
  }
}

/**
 * Handles POST requests to /api/metrics.
 * This is the endpoint that the client-side web-vitals reporter will call.
 */
export async function POST(request: Request) {
  try {
    const { name, value } = await request.json()
    const histogram = histograms[name]

    if (histogram) {
      histogram.observe(value)
    } else {
      // Log if an unexpected metric is received
      console.warn(`Received unknown metric: ${name}`)
    }

    return new NextResponse('Metric received', { status: 202 })
  } catch (error) {
    console.error('Error receiving metric:', error)
    return new NextResponse('Error receiving metric', { status: 400 })
  }
}
