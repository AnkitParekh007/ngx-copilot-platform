import { NextRequest, NextResponse } from 'next/server'
import { hybridSearch } from '@/lib/services/rag'
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
      repoSlug: filters?.repoSlug,
      branch: filters?.branch,
    })

    const results: RagResult[] = searchResults.sources.map(s => ({
      id: s.id,
      title: s.title || 'Untitled',
      snippet: s.content.substring(0, 500),
      score: s.similarity,
      sourceType: s.type,
      sourceUrl: s.url,
      filePath: s.filePath,
      fileKind: s.componentType,
      repo: s.repoSlug,
      branch: s.branch,
      chunkId: s.id,
      tags: s.tags || [],
    }))

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
