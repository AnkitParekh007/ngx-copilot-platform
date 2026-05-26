import { generateText } from 'ai'
import { NextRequest, NextResponse } from 'next/server'
import { mapSourceToRagResult } from '@/lib/contracts'
import { copilotTools } from '@/lib/services/copilot-tools'
import { hybridSearch, buildContextFromSources } from '@/lib/services/rag'
import { logAuditEvent } from '@/lib/services/audit'
import { createApiHandler } from '@/lib/middleware/api-handler'
import { chatRequestSchema } from '@/lib/middleware/validation'
import { assertServiceConfigs } from '@/lib/config'
import type { 
  CopilotMode, 
  CopilotResponse,
  CopilotMessage,
  RagResult,
} from '@/lib/types/copilot'

const SYSTEM_PROMPTS: Record<CopilotMode, string> = {
  ask: `You are an expert Angular development assistant with deep knowledge of the application's documentation and codebase.

Your role in ASK mode:
- Answer questions using the available context from documentation and code
- Always cite your sources with specific references (URLs for docs, file paths for code)
- Provide clear, accurate answers with confidence levels when possible
- Suggest follow-up questions that would help the user learn more
- If you're unsure, say so and explain what additional context would help

When answering:
1. First search the knowledge base for relevant context
2. Synthesize information from multiple sources if needed
3. Include source references in your response
4. Generate helpful follow-up suggestions`,

  plan: `You are a workflow planning assistant for an Angular application.

Your role in PLAN mode:
- Analyze user requests and create detailed step-by-step execution plans
- Consider the current application state and available UI elements
- Identify assumptions, prerequisites, and potential risks
- Break complex workflows into atomic, verifiable steps
- Always request approval before any plan can be executed

When planning:
1. Understand the user's goal completely
2. Search for relevant documentation and code context
3. Create a clear, sequential plan with specific actions
4. List all assumptions you're making
5. Identify potential risks or blockers
6. Present the plan for user approval`,

  execute: `You are an execution planning assistant for an Angular application.

Your role in EXECUTE mode:
- Refine approved plans into safe, verifiable execution steps
- Use available knowledge and selectors to guide a production executor
- Avoid claiming that browser actions have already run
- Clearly state when a real execution runtime is required`,

  debug: `You are a debugging assistant for an Angular application.

Your role in DEBUG mode:
- Diagnose failures using available code and documentation context
- Explain likely root causes before proposing changes
- Prefer concrete, low-risk fixes over speculative advice
- Call out missing evidence when the context is incomplete`,
}

/**
 * POST /api/copilot/chat - Non-streaming JSON response
 * Compatible with HttpCopilotBackendAdapter.send()
 */
export const POST = createApiHandler(
  async (request: NextRequest, { requestId, auth }, body) => {
    assertServiceConfigs(['supabase', 'openai'])
    const { conversationId, message, mode, context } = body

    // Log the request
    await logAuditEvent({
      conversationId: conversationId,
      userId: auth.userId,
      actionType: `chat_${mode}`,
      request: message,
      requiresApproval: false,
      requestId,
    })

    // Pre-fetch context for the query
    let ragContext = ''
    let sources: RagResult[] = []
    
    if (mode === 'ask' || mode === 'plan') {
      try {
        const searchResults = await hybridSearch(message, {
          documentLimit: 5,
          codeLimit: 5,
          threshold: 0.6,
        })
        ragContext = buildContextFromSources(searchResults.sources)
        sources = searchResults.sources.map(source => mapSourceToRagResult(source, 300))
      } catch (error) {
        console.error(`[${requestId}] RAG search failed:`, error)
      }
    }

    // Build system prompt with context
    let systemPrompt = SYSTEM_PROMPTS[mode]
    
    if (ragContext) {
      systemPrompt += `\n\n## Available Context\n${ragContext}`
    }
    
    if (context?.currentUrl) {
      systemPrompt += `\n\n## Current Page\nURL: ${context.currentUrl}`
      if (context.pageTitle) systemPrompt += `\nTitle: ${context.pageTitle}`
    }

    // Generate response
    const result = await generateText({
      model: 'anthropic/claude-sonnet-4',
      system: systemPrompt,
      prompt: message,
      tools: getModeTools(mode, conversationId),
    })

    const responseMessage: CopilotMessage = {
      id: crypto.randomUUID(),
      role: 'assistant',
      content: result.text,
      createdAt: new Date().toISOString(),
      sources: sources.length > 0 ? sources : undefined,
    }

    const response: CopilotResponse = {
      message: responseMessage,
      sources: sources.length > 0 ? sources : undefined,
    }

    return NextResponse.json(response)
  },
  {
    requireAuth: true,
    rateLimit: 'heavy',
    bodySchema: chatRequestSchema,
  }
)

function getModeTools(mode: CopilotMode, _sessionId?: string) {
  const baseTools = {
    searchKnowledgeBase: copilotTools.searchKnowledgeBase,
    generateFollowUpSuggestions: copilotTools.generateFollowUpSuggestions,
  }

  switch (mode) {
    case 'ask':
      return {
        ...baseTools,
        getPageSelectors: copilotTools.getPageSelectors,
      }

    case 'plan':
      return {
        ...baseTools,
        createPlan: copilotTools.createPlan,
        getPageSelectors: copilotTools.getPageSelectors,
      }

    case 'execute':
      return {
        ...baseTools,
        createPlan: copilotTools.createPlan,
        getPageSelectors: copilotTools.getPageSelectors,
      }

    case 'debug':
    default:
      return baseTools
  }
}

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
