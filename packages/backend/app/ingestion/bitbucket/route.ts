import { NextRequest, NextResponse } from 'next/server'
import {
  crawlBitbucketRepo,
  getBitbucketBranches,
  validateBitbucketCredentials,
} from '@/lib/services/bitbucket-ingestion'
import { createIngestionJob, getIngestionJobStatus } from '@/lib/services/documentation-ingestion'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      workspace,
      repoSlug,
      branch = 'main',
      username,
      appPassword,
    } = body

    // Validate required fields
    if (!workspace || !repoSlug || !username || !appPassword) {
      return NextResponse.json(
        { error: 'Missing required fields: workspace, repoSlug, username, appPassword' },
        { status: 400 }
      )
    }

    // Validate credentials
    const isValid = await validateBitbucketCredentials(workspace, repoSlug, username, appPassword)
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid Bitbucket credentials or repository not found' },
        { status: 401 }
      )
    }

    // Create ingestion job
    const jobId = await createIngestionJob('bitbucket', `${workspace}/${repoSlug}`, branch)

    // Start crawling in the background
    crawlBitbucketRepo(
      { workspace, repoSlug, branch, username, appPassword },
      jobId
    ).catch((error) => {
      console.error('Bitbucket crawl failed:', error)
    })

    return NextResponse.json({
      jobId,
      status: 'started',
      message: `Started scanning ${workspace}/${repoSlug} on branch ${branch}`,
    })
  } catch (error) {
    console.error('Bitbucket ingestion error:', error)
    return NextResponse.json(
      { error: 'Failed to start Bitbucket ingestion' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  const action = req.nextUrl.searchParams.get('action')
  const jobId = req.nextUrl.searchParams.get('jobId')

  // Get job status
  if (jobId) {
    const job = await getIngestionJobStatus(jobId)

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(job)
  }

  // Get branches
  if (action === 'branches') {
    const workspace = req.nextUrl.searchParams.get('workspace')
    const repoSlug = req.nextUrl.searchParams.get('repoSlug')
    const username = req.nextUrl.searchParams.get('username')
    const appPassword = req.nextUrl.searchParams.get('appPassword')

    if (!workspace || !repoSlug || !username || !appPassword) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      )
    }

    try {
      const branches = await getBitbucketBranches(workspace, repoSlug, username, appPassword)
      return NextResponse.json({ branches })
    } catch (error) {
      return NextResponse.json(
        { error: 'Failed to fetch branches' },
        { status: 500 }
      )
    }
  }

  return NextResponse.json(
    { error: 'Missing jobId or action parameter' },
    { status: 400 }
  )
}
