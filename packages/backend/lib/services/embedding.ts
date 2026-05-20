import { generateText } from 'ai'

const EMBEDDING_MODEL = 'openai/text-embedding-3-small'

export async function generateEmbedding(text: string): Promise<number[]> {
  // Use AI Gateway for embeddings
  const response = await fetch('https://ai-gateway.vercel.sh/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'text-embedding-3-small',
      input: text.slice(0, 8000), // Limit input size
    }),
  })

  if (!response.ok) {
    throw new Error(`Embedding request failed: ${response.statusText}`)
  }

  const data = await response.json()
  return data.data[0].embedding
}

export async function generateEmbeddings(texts: string[]): Promise<number[][]> {
  // Process in batches to avoid rate limits
  const batchSize = 20
  const embeddings: number[][] = []

  for (let i = 0; i < texts.length; i += batchSize) {
    const batch = texts.slice(i, i + batchSize)
    const response = await fetch('https://ai-gateway.vercel.sh/v1/embeddings', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'text-embedding-3-small',
        input: batch.map(t => t.slice(0, 8000)),
      }),
    })

    if (!response.ok) {
      throw new Error(`Embedding request failed: ${response.statusText}`)
    }

    const data = await response.json()
    embeddings.push(...data.data.map((d: { embedding: number[] }) => d.embedding))
  }

  return embeddings
}

// Chunking utilities for semantic search
export function chunkText(
  text: string,
  options: {
    maxChunkSize?: number
    overlap?: number
    separator?: string
  } = {}
): string[] {
  const { maxChunkSize = 1000, overlap = 200, separator = '\n\n' } = options

  // Split by paragraphs first
  const paragraphs = text.split(separator).filter(p => p.trim())
  const chunks: string[] = []
  let currentChunk = ''

  for (const paragraph of paragraphs) {
    if (currentChunk.length + paragraph.length > maxChunkSize) {
      if (currentChunk) {
        chunks.push(currentChunk.trim())
        // Keep overlap from the end of the current chunk
        const words = currentChunk.split(' ')
        const overlapWords = words.slice(-Math.floor(overlap / 5))
        currentChunk = overlapWords.join(' ') + ' ' + paragraph
      } else {
        // Paragraph is too long, split by sentences
        const sentences = paragraph.match(/[^.!?]+[.!?]+/g) || [paragraph]
        for (const sentence of sentences) {
          if (currentChunk.length + sentence.length > maxChunkSize) {
            if (currentChunk) chunks.push(currentChunk.trim())
            currentChunk = sentence
          } else {
            currentChunk += ' ' + sentence
          }
        }
      }
    } else {
      currentChunk += (currentChunk ? separator : '') + paragraph
    }
  }

  if (currentChunk.trim()) {
    chunks.push(currentChunk.trim())
  }

  return chunks
}

// Create content hash for deduplication
export function createContentHash(content: string): string {
  // Simple hash function for deduplication
  let hash = 0
  for (let i = 0; i < content.length; i++) {
    const char = content.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16)
}
