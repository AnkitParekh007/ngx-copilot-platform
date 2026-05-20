import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { 
  crawlGitHubRepo, 
  getGitHubBranches, 
  validateGitHubAccess,
  parseGitHubUrl 
} from '@/lib/services/github-ingestion'
import { createApiHandler } from '@/lib/middleware/api-handler'
import { githubIngestionSchema, ingestionJobQuerySchema, validateQuery } from '@/lib/middleware/validation'

/**
 * POST /api/ingestion/github - Start GitHub repo ingestion
 * Rate limited to 5 requests/hour (ingestion tier)
 */
export const POST = createApiHandler(
  async (request: NextRequest, { requestId, auth }, body) => {
    const { 
      owner, 
      repo, 
      repoUrl,
      branch, 
      token 
    } = body

    // Parse URL if provided instead of owner/repo
    let repoOwner = owner
    let repoName = repo

    if (repoUrl && (!owner || !repo)) {
      const parsed = parseGitHubUrl(repoUrl)
      if (!parsed) {
        return NextResponse.json(
          { error: 'Invalid GitHub URL format', code: 'INVALID_URL', requestId },
          { status: 400 }
        )
      }
      repoOwner = parsed.owner
      repoName = parsed.repo
    }

    // Validate access
    const hasAccess = await validateGitHubAccess(repoOwner!, repoName!, token)
    if (!hasAccess) {
      return NextResponse.json(
        { 
          error: 'Cannot access repository',
          message: 'Check if the repo exists and token has correct permissions.',
          hint: 'For private repos, provide a token with repo scope',
          code: 'ACCESS_DENIED',
          requestId,
        },
        { status: 403 }
      )
    }

    const supabase = await createClient()

    // Create ingestion job
    const { data: job, error: jobError } = await supabase
      .from('ingestion_jobs')
      .insert({
        type: 'github',
        source: `${repoOwner}/${repoName}`,
        branch,
        status: 'pending',
        created_by: auth.userId || null,
        metadata: {
          provider: 'github',
          owner: repoOwner,
          repo: repoName,
          hasToken: !!token,
          requestId,
        },
      })
      .select()
      .single()

    if (jobError || !job) {
      console.error(`[${requestId}] Failed to create ingestion job:`, jobError)
      throw new Error('Failed to create ingestion job')
    }

    // Start crawling in the background with proper error handling
    crawlGitHubRepo(
      { owner: repoOwner!, repo: repoName!, branch: branch!, token },
      job.id
    ).catch(async (error) => {
      console.error(`[${requestId}] GitHub crawl error:`, error)
      // Update job status on failure
      await supabase
        .from('ingestion_jobs')
        .update({ 
          status: 'failed', 
          error: error instanceof Error ? error.message : 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', job.id)
    })

    return NextResponse.json({
      success: true,
      jobId: job.id,
      message: `Started ingesting ${repoOwner}/${repoName} (branch: ${branch})`,
      requestId,
    })
  },
  {
    requireAuth: true,
    rateLimit: 'ingestion',
    bodySchema: githubIngestionSchema,
  }
)

/**
 * GET /api/ingestion/github - Get job status or list branches
 * Token is passed via X-GitHub-Token header (NOT query params for security)
 */
export const GET = createApiHandler(
  async (request: NextRequest, { requestId }) => {
    const { searchParams } = new URL(request.url)
    
    // Get token from header (not query params for security)
    const token = request.headers.get('X-GitHub-Token') || undefined
    
    const validation = validateQuery(searchParams, ingestionJobQuerySchema)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation Error', details: validation.error, requestId },
        { status: 400 }
      )
    }

    const { jobId, action, owner, repo } = validation.data!

    try {
      // List branches
      if (action === 'branches' && owner && repo) {
        const branches = await getGitHubBranches(owner, repo, token)
        return NextResponse.json({ branches, requestId })
      }

      // Validate access
      if (action === 'validate' && owner && repo) {
        const isValid = await validateGitHubAccess(owner, repo, token)
        return NextResponse.json({ valid: isValid, requestId })
      }

      // Get job status
      if (jobId) {
        const supabase = await createClient()
        const { data: job, error } = await supabase
          .from('ingestion_jobs')
          .select('*')
          .eq('id', jobId)
          .single()

        if (error || !job) {
          return NextResponse.json(
            { error: 'Job not found', code: 'NOT_FOUND', requestId },
            { status: 404 }
          )
        }

        return NextResponse.json({ job, requestId })
      }

      // List all GitHub jobs
      const supabase = await createClient()
      const { data: jobs, error } = await supabase
        .from('ingestion_jobs')
        .select('*')
        .eq('type', 'github')
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        throw error
      }

      return NextResponse.json({ jobs, requestId })
    } catch (error) {
      console.error(`[${requestId}] GitHub ingestion GET error:`, error)
      return NextResponse.json(
        { 
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          requestId,
        },
        { status: 500 }
      )
    }
  },
  {
    requireAuth: true,
    rateLimit: 'standard',
  }
)

/**
 * DELETE /api/ingestion/github - Delete indexed code from a repo
 */
export const DELETE = createApiHandler(
  async (request: NextRequest, { requestId }) => {
    const { searchParams } = new URL(request.url)
    const repoSlug = searchParams.get('repoSlug')

    if (!repoSlug) {
      return NextResponse.json(
        { error: 'Bad Request', message: 'repoSlug query parameter is required', code: 'MISSING_PARAM', requestId },
        { status: 400 }
      )
    }

    try {
      const supabase = await createClient()

      // Delete code chunks for this repo
      const { error: chunksError, count: chunksDeleted } = await supabase
        .from('code_chunks')
        .delete()
        .eq('repo_slug', repoSlug)
        .select('id', { count: 'exact', head: true })

      if (chunksError) {
        throw chunksError
      }

      // Delete related jobs
      const { error: jobsError } = await supabase
        .from('ingestion_jobs')
        .delete()
        .eq('source', repoSlug)
        .eq('type', 'github')

      if (jobsError) {
        throw jobsError
      }

      return NextResponse.json({
        success: true,
        message: `Deleted indexed code for ${repoSlug}`,
        chunksDeleted: chunksDeleted || 0,
        requestId,
      })
    } catch (error) {
      console.error(`[${requestId}] GitHub ingestion DELETE error:`, error)
      return NextResponse.json(
        { 
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
          code: 'INTERNAL_ERROR',
          requestId,
        },
        { status: 500 }
      )
    }
  },
  {
    requireAuth: true,
    rateLimit: 'standard',
  }
)

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key, X-GitHub-Token',
    },
  })
}
