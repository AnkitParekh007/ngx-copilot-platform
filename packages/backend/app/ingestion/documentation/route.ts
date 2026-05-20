import { NextRequest, NextResponse } from 'next/server'
import { createIngestionJob, crawlDocumentation, getIngestionJobStatus } from '@/lib/services/documentation-ingestion'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { url, maxPages = 100, maxDepth = 3 } = body

    if (!url) {
      return NextResponse.json(
        { error: 'URL is required' },
        { status: 400 }
      )
    }

    // Validate URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      )
    }

    // Create ingestion job
    const jobId = await createIngestionJob('documentation', url)

    // Start crawling in the background
    crawlDocumentation(url, jobId, { maxPages, maxDepth }).catch((error) => {
      console.error('Documentation crawl failed:', error)
    })

    return NextResponse.json({
      jobId,
      status: 'started',
      message: `Started crawling ${url}`,
    })
  } catch (error) {
    console.error('Documentation ingestion error:', error)
    return NextResponse.json(
      { error: 'Failed to start documentation ingestion' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const jobId = req.nextUrl.searchParams.get('jobId')

  if (!jobId) {
    return NextResponse.json(
      { error: 'Job ID is required' },
      { status: 400 }
    )
  }

  const job = await getIngestionJobStatus(jobId)

  if (!job) {
    return NextResponse.json(
      { error: 'Job not found' },
      { status: 404 }
    )
  }

  return NextResponse.json(job)
}
