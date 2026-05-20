import { createClient } from '@/lib/supabase/server'
import { generateEmbedding } from './embedding'

// Extended source interface for internal use
export interface ExtendedSource {
  id: string
  type: 'documentation' | 'code'
  title: string
  url?: string
  filePath?: string
  lineStart?: number
  lineEnd?: number
  content: string
  similarity: number
  // Additional fields for RagResult compatibility
  componentType?: string
  repoSlug?: string
  branch?: string
  tags?: string[]
}

export interface SearchResult {
  sources: ExtendedSource[]
  documentResults: DocumentSearchResult[]
  codeResults: CodeSearchResult[]
}

export interface DocumentSearchResult {
  id: string
  sourceUrl: string
  title: string
  content: string
  headings: string[]
  metadata: Record<string, unknown>
  similarity: number
}

export interface CodeSearchResult {
  id: string
  repoSlug: string
  branch: string
  filePath: string
  content: string
  componentType: string | null
  componentName: string | null
  selectors: Array<{ selector: string; type: string }>
  routes: Array<{ path: string; component?: string }>
  metadata: Record<string, unknown>
  lineStart: number | null
  lineEnd: number | null
  similarity: number
}

export async function searchDocumentation(
  query: string,
  options: {
    threshold?: number
    limit?: number
  } = {}
): Promise<DocumentSearchResult[]> {
  const { threshold = 0.7, limit = 10 } = options

  const supabase = await createClient()
  const embedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc('match_documents', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  })

  if (error) {
    console.error('Error searching documents:', error)
    throw new Error(`Failed to search documentation: ${error.message}`)
  }

  return (data || []).map((doc: Record<string, unknown>) => ({
    id: doc.id as string,
    sourceUrl: doc.source_url as string,
    title: doc.title as string,
    content: doc.content as string,
    headings: (doc.headings as string[]) || [],
    metadata: (doc.metadata as Record<string, unknown>) || {},
    similarity: doc.similarity as number,
  }))
}

export async function searchCodeChunks(
  query: string,
  options: {
    threshold?: number
    limit?: number
    repoSlug?: string
    branch?: string
    componentType?: string
  } = {}
): Promise<CodeSearchResult[]> {
  const { threshold = 0.7, limit = 10 } = options

  const supabase = await createClient()
  const embedding = await generateEmbedding(query)

  const { data, error } = await supabase.rpc('match_code_chunks', {
    query_embedding: embedding,
    match_threshold: threshold,
    match_count: limit,
  })

  if (error) {
    console.error('Error searching code chunks:', error)
    throw new Error(`Failed to search code: ${error.message}`)
  }

  return (data || []).map((chunk: Record<string, unknown>) => ({
    id: chunk.id as string,
    repoSlug: chunk.repo_slug as string,
    branch: chunk.branch as string,
    filePath: chunk.file_path as string,
    content: chunk.content as string,
    componentType: chunk.component_type as string | null,
    componentName: chunk.component_name as string | null,
    selectors: (chunk.selectors as Array<{ selector: string; type: string }>) || [],
    routes: (chunk.routes as Array<{ path: string; component?: string }>) || [],
    metadata: (chunk.metadata as Record<string, unknown>) || {},
    lineStart: chunk.line_start as number | null,
    lineEnd: chunk.line_end as number | null,
    similarity: chunk.similarity as number,
  }))
}

export async function hybridSearch(
  query: string,
  options: {
    threshold?: number
    documentLimit?: number
    codeLimit?: number
    includeDocumentation?: boolean
    includeCode?: boolean
  } = {}
): Promise<SearchResult> {
  const {
    threshold = 0.65,
    documentLimit = 5,
    codeLimit = 5,
    includeDocumentation = true,
    includeCode = true,
  } = options

  const [documentResults, codeResults] = await Promise.all([
    includeDocumentation
      ? searchDocumentation(query, { threshold, limit: documentLimit })
      : Promise.resolve([]),
    includeCode
      ? searchCodeChunks(query, { threshold, limit: codeLimit })
      : Promise.resolve([]),
  ])

  // Convert to unified Source format
  const sources: ExtendedSource[] = [
    ...documentResults.map((doc) => ({
      id: doc.id,
      type: 'documentation' as const,
      title: doc.title || 'Documentation',
      url: doc.sourceUrl,
      content: doc.content,
      similarity: doc.similarity,
      tags: (doc.metadata?.tags as string[]) || [],
    })),
    ...codeResults.map((code) => ({
      id: code.id,
      type: 'code' as const,
      title: code.componentName || code.filePath.split('/').pop() || 'Code',
      filePath: code.filePath,
      lineStart: code.lineStart || undefined,
      lineEnd: code.lineEnd || undefined,
      content: code.content,
      similarity: code.similarity,
      componentType: code.componentType || undefined,
      repoSlug: code.repoSlug,
      branch: code.branch,
      tags: (code.metadata?.tags as string[]) || [],
    })),
  ]

  // Sort by similarity
  sources.sort((a, b) => b.similarity - a.similarity)

  return {
    sources,
    documentResults,
    codeResults,
  }
}

// Build context string for LLM from search results
export function buildContextFromSources(sources: ExtendedSource[], maxLength: number = 8000): string {
  let context = ''
  let currentLength = 0

  for (const source of sources) {
    const sourceHeader =
      source.type === 'documentation'
        ? `\n\n--- Documentation: ${source.title} (${source.url}) ---\n`
        : `\n\n--- Code: ${source.filePath}${source.lineStart ? `:${source.lineStart}-${source.lineEnd}` : ''} ---\n`

    const entry = sourceHeader + source.content

    if (currentLength + entry.length > maxLength) {
      // Truncate if needed
      const remaining = maxLength - currentLength
      if (remaining > 200) {
        context += entry.slice(0, remaining) + '...'
      }
      break
    }

    context += entry
    currentLength += entry.length
  }

  return context
}

// Get selectors for a specific component or route
export async function getSelectorsForRoute(route: string): Promise<Array<{ selector: string; type: string; description?: string }>> {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('code_chunks')
    .select('selectors, component_name')
    .contains('routes', [{ path: route }])

  if (error) {
    console.error('Error fetching selectors:', error)
    return []
  }

  const allSelectors: Array<{ selector: string; type: string; description?: string }> = []
  
  for (const chunk of data || []) {
    const selectors = chunk.selectors as Array<{ selector: string; type: string; description?: string }> || []
    allSelectors.push(...selectors)
  }

  return allSelectors
}
