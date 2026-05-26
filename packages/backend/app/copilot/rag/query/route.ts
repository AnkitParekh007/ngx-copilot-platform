import { NextRequest, NextResponse } from 'next/server'
import { hybridSearch } from '@/lib/services/rag'
import { mapSourceToRagResult } from '@/lib/contracts'
import { createApiHandler } from '@/lib/middleware/api-handler'
import { ragQuerySchema } from '@/lib/middleware/validation'
import { assertServiceConfigs } from '@/lib/config'
import type { RagResult } from '@/lib/types/copilot'

/**
 * POST /api/copilot/rag/query - RAG search endpoint
 * Compatible with HttpCopilotBackendAdapter.queryRag()
 */
export const POST = createApiHandler(
  async (request: NextRequest, { requestId }, body) => {
    assertServiceConfigs(['supabase', 'openai'])
    const { query, filters, limit, threshold } = body

    const searchResults = await hybridSearch(query, {
      documentLimit: Math.ceil(limit / 2),
      codeLimit: Math.ceil(limit / 2),
      threshold,
    })

    const results: RagResult[] = searchResults.sources.map(source => mapSourceToRagResult(source))

    // Filter by source types if specified
    let filteredResults = results
    if (filters?.sources && filters.sources.length > 0) {
      filteredResults = results.filter(r => 
        filters.sources!.includes(r.sourceType as 'documentation' | 'code')
      )
    }

    // Filter by component type if specified
    if (filters?.componentType) {
      filteredResults = filteredResults.filter(r => 
        r.fileKind === filters.componentType
      )
    }

    if (filters?.repoSlug) {
      filteredResults = filteredResults.filter(r => r.repo === filters.repoSlug)
    }

    if (filters?.branch) {
      filteredResults = filteredResults.filter(r => r.branch === filters.branch)
    }

    return NextResponse.json(filteredResults.slice(0, limit))
  },
  {
    requireAuth: true,
    rateLimit: 'heavy',
    bodySchema: ragQuerySchema,
  }
)

// Handle OPTIONS for CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-API-Key',
    },
  })
}
