import { streamText } from 'ai'
import { copilotTools } from '@/lib/services/copilot-tools'
import { hybridSearch, buildContextFromSources } from '@/lib/services/rag'
import type { 
  CopilotMode, 
  CopilotEvent,
  CopilotMessage,
  RagResult,
  ToolTimelineItem,
} from '@/lib/types/copilot'

const SYSTEM_PROMPTS: Record<CopilotMode, string> = {
  ask: `You are an expert Angular development assistant. Answer questions using available context from documentation and code. Always cite sources.`,
  plan: `You are a workflow planning assistant. Create detailed step-by-step execution plans with assumptions and risks. Request approval before execution.`,
  execute: `You are an autonomous browser agent. Execute approved plans safely. Always ask approval for destructive actions.`,
  debug: `You are a debugging assistant. Help diagnose issues and suggest fixes with explanations.`,
}

/**
 * GET /api/copilot/chat/stream - SSE streaming endpoint
 * Compatible with HttpCopilotBackendAdapter.sendStream()
 */
export async function GET(req: Request) {
  const url = new URL(req.url)
  const message = url.searchParams.get('message') || ''
  const mode = (url.searchParams.get('mode') || 'ask') as CopilotMode
  const sessionId = url.searchParams.get('sessionId') || undefined

  const encoder = new TextEncoder()
  
  const stream = new ReadableStream({
    async start(controller) {
      const sendEvent = (event: CopilotEvent) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))
      }

      try {
        // Send session started
        const newSessionId = sessionId || crypto.randomUUID()
        sendEvent({ type: 'session-started', sessionId: newSessionId })

        // Pre-fetch context
        let ragContext = ''
        let sources: RagResult[] = []
        
        if (mode === 'ask' || mode === 'plan' || mode === 'debug') {
          try {
            const searchResults = await hybridSearch(message, {
              documentLimit: 5,
              codeLimit: 5,
              threshold: 0.6,
            })
            ragContext = buildContextFromSources(searchResults.sources)
            sources = searchResults.sources.map(s => ({
              id: s.id,
              title: s.title || 'Untitled',
              snippet: s.content.substring(0, 300),
              score: s.similarity,
              sourceType: s.type,
              sourceUrl: s.url,
              filePath: s.filePath,
              fileKind: s.componentType,
              repo: s.repoSlug,
              branch: s.branch,
              chunkId: s.id,
            }))
          } catch (error) {
            console.error('RAG search failed:', error)
          }
        }

        // Build system prompt
        let systemPrompt = SYSTEM_PROMPTS[mode]
        if (ragContext) {
          systemPrompt += `\n\n## Available Context\n${ragContext}`
        }

        const messageId = crypto.randomUUID()
        sendEvent({ type: 'message-start', messageId })

        // Tool timeline items for tracking
        const toolTimeline: ToolTimelineItem[] = []

        // Stream the response
        const result = streamText({
          model: 'anthropic/claude-sonnet-4',
          system: systemPrompt,
          prompt: message,
          tools: {
            searchKnowledgeBase: copilotTools.searchKnowledgeBase,
            generateFollowUpSuggestions: copilotTools.generateFollowUpSuggestions,
            getPageSelectors: copilotTools.getPageSelectors,
          },
          maxSteps: 5,
          onStepFinish: async ({ stepType, toolCalls, toolResults }) => {
            if (stepType === 'tool-call' && toolCalls) {
              for (const toolCall of toolCalls) {
                const timelineItem: ToolTimelineItem = {
                  id: toolCall.toolCallId,
                  toolName: toolCall.toolName,
                  summary: `Executing ${toolCall.toolName}`,
                  status: 'running',
                  startedAt: new Date().toISOString(),
                }
                toolTimeline.push(timelineItem)
                sendEvent({ type: 'tool-timeline', items: [...toolTimeline] })
              }
            }
            if (stepType === 'tool-result' && toolResults) {
              for (const result of toolResults) {
                const item = toolTimeline.find(t => t.id === result.toolCallId)
                if (item) {
                  item.status = 'succeeded'
                  item.finishedAt = new Date().toISOString()
                  sendEvent({ type: 'tool-timeline', items: [...toolTimeline] })
                }
              }
            }
          },
        })

        let fullContent = ''
        for await (const chunk of result.textStream) {
          fullContent += chunk
          sendEvent({ type: 'message-chunk', messageId, content: chunk })
        }

        // Send complete message
        const completeMessage: CopilotMessage = {
          id: messageId,
          role: 'assistant',
          content: fullContent,
          createdAt: new Date().toISOString(),
          sources: sources.length > 0 ? sources : undefined,
        }
        sendEvent({ type: 'message-complete', message: completeMessage })

        // Send sources if any
        if (sources.length > 0) {
          sendEvent({ type: 'sources', sources })
        }

        // Send done
        sendEvent({ type: 'done' })
        controller.close()
      } catch (error) {
        console.error('Stream error:', error)
        sendEvent({
          type: 'error',
          error: {
            code: 'STREAM_ERROR',
            message: error instanceof Error ? error.message : 'Stream failed',
            retryable: true,
          },
        })
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  })
}
