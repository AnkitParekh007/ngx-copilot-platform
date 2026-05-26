import type { CopilotEvent, RagResult } from './types/copilot'
import type { ExtendedSource } from './services/rag'

export function mapSourceToRagResult(source: ExtendedSource, snippetLength = 500): RagResult {
  return {
    id: source.id,
    title: source.title || 'Untitled',
    snippet: source.content.substring(0, snippetLength),
    score: source.similarity,
    sourceType: source.type,
    sourceUrl: source.url,
    filePath: source.filePath,
    fileKind: source.componentType,
    repo: source.repoSlug,
    branch: source.branch,
    chunkId: source.id,
    tags: source.tags || [],
  }
}

export function serializeSseEvent(event: CopilotEvent): string {
  return `data: ${JSON.stringify(event)}\n\n`
}
