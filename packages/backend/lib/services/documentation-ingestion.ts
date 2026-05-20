import { parse } from 'node-html-parser'
import { createClient } from '@/lib/supabase/server'
import { generateEmbeddings, chunkText, createContentHash } from './embedding'
import type { DocumentChunk, IngestionJob } from '@/lib/types/copilot'

interface CrawlOptions {
  maxPages?: number
  maxDepth?: number
  includePatterns?: string[]
  excludePatterns?: string[]
  respectRobotsTxt?: boolean
}

interface ParsedPage {
  url: string
  title: string
  content: string
  headings: string[]
  links: string[]
  metadata: Record<string, string>
}

export async function crawlDocumentation(
  startUrl: string,
  jobId: string,
  options: CrawlOptions = {}
): Promise<void> {
  const {
    maxPages = 100,
    maxDepth = 3,
    includePatterns = [],
    excludePatterns = ['/api/', '/admin/', '/login', '/logout'],
  } = options

  const supabase = await createClient()
  const visited = new Set<string>()
  const queue: Array<{ url: string; depth: number }> = [{ url: startUrl, depth: 0 }]
  const baseUrl = new URL(startUrl)
  let processedCount = 0

  // Update job status
  await supabase
    .from('ingestion_jobs')
    .update({ status: 'running', started_at: new Date().toISOString() })
    .eq('id', jobId)

  while (queue.length > 0 && processedCount < maxPages) {
    const { url, depth } = queue.shift()!

    if (visited.has(url) || depth > maxDepth) continue
    visited.add(url)

    // Check patterns
    const shouldExclude = excludePatterns.some((p) => url.includes(p))
    const shouldInclude =
      includePatterns.length === 0 || includePatterns.some((p) => url.includes(p))

    if (shouldExclude || !shouldInclude) continue

    try {
      const page = await fetchAndParsePage(url)
      if (!page || !page.content.trim()) continue

      // Store page chunks
      await storeDocumentChunks(page, supabase)
      processedCount++

      // Update progress
      await supabase
        .from('ingestion_jobs')
        .update({
          processed_items: processedCount,
          total_items: Math.max(processedCount, queue.length + processedCount),
          progress: Math.floor((processedCount / maxPages) * 100),
        })
        .eq('id', jobId)

      // Add discovered links to queue
      for (const link of page.links) {
        try {
          const linkUrl = new URL(link, url)
          // Only follow same-domain links
          if (linkUrl.hostname === baseUrl.hostname && !visited.has(linkUrl.href)) {
            queue.push({ url: linkUrl.href, depth: depth + 1 })
          }
        } catch {
          // Invalid URL, skip
        }
      }
    } catch (error) {
      console.error(`Error crawling ${url}:`, error)
    }
  }

  // Mark job as completed
  await supabase
    .from('ingestion_jobs')
    .update({
      status: 'completed',
      completed_at: new Date().toISOString(),
      processed_items: processedCount,
      progress: 100,
    })
    .eq('id', jobId)
}

async function fetchAndParsePage(url: string): Promise<ParsedPage | null> {
  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'CopilotBot/1.0 (Documentation Crawler)',
        Accept: 'text/html',
      },
    })

    if (!response.ok) return null

    const html = await response.text()
    const root = parse(html)

    // Remove script, style, nav, footer, header elements
    const elementsToRemove = root.querySelectorAll(
      'script, style, nav, footer, header, aside, .sidebar, .navigation, .menu, .ads, .cookie-banner'
    )
    elementsToRemove.forEach((el) => el.remove())

    // Extract title
    const titleEl = root.querySelector('title')
    const h1El = root.querySelector('h1')
    const title = titleEl?.text?.trim() || h1El?.text?.trim() || url

    // Extract main content
    const mainContent =
      root.querySelector('main') ||
      root.querySelector('article') ||
      root.querySelector('.content') ||
      root.querySelector('.main') ||
      root.querySelector('#content') ||
      root.querySelector('body')

    const content = mainContent?.text?.trim() || ''

    // Extract headings
    const headings = root
      .querySelectorAll('h1, h2, h3, h4')
      .map((h) => h.text?.trim())
      .filter(Boolean)

    // Extract links
    const links = root
      .querySelectorAll('a[href]')
      .map((a) => a.getAttribute('href'))
      .filter((href): href is string => !!href && !href.startsWith('#'))

    // Extract metadata
    const metadata: Record<string, string> = {}
    const metaTags = root.querySelectorAll('meta[name], meta[property]')
    metaTags.forEach((meta) => {
      const name = meta.getAttribute('name') || meta.getAttribute('property')
      const content = meta.getAttribute('content')
      if (name && content) {
        metadata[name] = content
      }
    })

    return {
      url,
      title,
      content: cleanText(content),
      headings,
      links,
      metadata,
    }
  } catch (error) {
    console.error(`Error fetching page ${url}:`, error)
    return null
  }
}

function cleanText(text: string): string {
  return text
    .replace(/\s+/g, ' ')
    .replace(/\n\s*\n/g, '\n\n')
    .trim()
}

async function storeDocumentChunks(
  page: ParsedPage,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<void> {
  // Chunk the content
  const chunks = chunkText(page.content, {
    maxChunkSize: 1500,
    overlap: 200,
  })

  if (chunks.length === 0) return

  // Generate embeddings for all chunks
  const textsToEmbed = chunks.map((chunk, i) => {
    // Include title and headings in embedding for better context
    const relevantHeadings = page.headings.slice(0, 3).join(' | ')
    return `${page.title} | ${relevantHeadings}\n\n${chunk}`
  })

  const embeddings = await generateEmbeddings(textsToEmbed)

  // Prepare chunks for insertion
  const documentChunks = chunks.map((chunk, index) => ({
    source_url: page.url,
    title: page.title,
    content: chunk,
    embedding: embeddings[index],
    chunk_index: index,
    total_chunks: chunks.length,
    headings: page.headings,
    metadata: page.metadata,
    content_hash: createContentHash(chunk),
  }))

  // Upsert chunks (update if exists based on source_url + chunk_index)
  for (const chunk of documentChunks) {
    const { error } = await supabase
      .from('documents')
      .upsert(chunk, { onConflict: 'source_url,chunk_index' })

    if (error) {
      console.error('Error storing document chunk:', error)
    }
  }
}

// Re-ingest a single URL
export async function reingestUrl(url: string): Promise<void> {
  const supabase = await createClient()
  const page = await fetchAndParsePage(url)

  if (page) {
    // Delete existing chunks for this URL
    await supabase.from('documents').delete().eq('source_url', url)

    // Store new chunks
    await storeDocumentChunks(page, supabase)
  }
}

// Delete all documents for a domain
export async function deleteDocumentsForDomain(domain: string): Promise<number> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('documents')
    .delete()
    .like('source_url', `%${domain}%`)
    .select('id')

  if (error) {
    throw new Error(`Failed to delete documents: ${error.message}`)
  }

  return data?.length || 0
}

// Get ingestion job status
export async function getIngestionJobStatus(jobId: string): Promise<IngestionJob | null> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ingestion_jobs')
    .select('*')
    .eq('id', jobId)
    .single()

  if (error || !data) return null

  return {
    id: data.id,
    type: data.type,
    source: data.source,
    branch: data.branch,
    status: data.status,
    progress: data.progress,
    totalItems: data.total_items,
    processedItems: data.processed_items,
    error: data.error,
    createdAt: new Date(data.created_at),
    startedAt: data.started_at ? new Date(data.started_at) : undefined,
    completedAt: data.completed_at ? new Date(data.completed_at) : undefined,
  }
}

// Create a new ingestion job
export async function createIngestionJob(
  type: 'documentation' | 'bitbucket',
  source: string,
  branch?: string
): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('ingestion_jobs')
    .insert({
      type,
      source,
      branch,
      status: 'pending',
    })
    .select('id')
    .single()

  if (error || !data) {
    throw new Error(`Failed to create ingestion job: ${error?.message}`)
  }

  return data.id
}
