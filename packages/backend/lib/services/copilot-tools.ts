import { tool } from 'ai'
import { z } from 'zod'
import { hybridSearch, buildContextFromSources, getSelectorsForRoute } from './rag'
import { logAuditEvent, assessActionRisk, requiresApproval, createApprovalRequest } from './audit'
import type { BrowserAction, Plan, FollowUpSuggestion } from '@/lib/types/copilot'

// Tool: Search documentation and code
export const searchKnowledgeBase = tool({
  description: 'Search the documentation and Angular codebase for relevant information about a topic or question',
  inputSchema: z.object({
    query: z.string().describe('The search query to find relevant documentation or code'),
    includeDocumentation: z.boolean().default(true).describe('Include documentation results'),
    includeCode: z.boolean().default(true).describe('Include Angular code results'),
    limit: z.number().default(5).describe('Maximum number of results per category'),
  }),
  execute: async ({ query, includeDocumentation, includeCode, limit }) => {
    const results = await hybridSearch(query, {
      documentLimit: includeDocumentation ? limit : 0,
      codeLimit: includeCode ? limit : 0,
      includeDocumentation,
      includeCode,
    })

    return {
      sources: results.sources,
      context: buildContextFromSources(results.sources),
      documentCount: results.documentResults.length,
      codeCount: results.codeResults.length,
    }
  },
})

// Tool: Get page selectors for browser automation
export const getPageSelectors = tool({
  description: 'Get available UI selectors for a specific route/page in the Angular application',
  inputSchema: z.object({
    route: z.string().describe('The route path (e.g., /products, /dashboard)'),
  }),
  execute: async ({ route }) => {
    const selectors = await getSelectorsForRoute(route)
    return {
      route,
      selectors,
      count: selectors.length,
    }
  },
})

// Tool: Create execution plan
export const createPlan = tool({
  description: 'Create a step-by-step execution plan for a workflow or task',
  inputSchema: z.object({
    goal: z.string().describe('The goal or objective to accomplish'),
    steps: z.array(z.object({
      description: z.string().describe('Description of this step'),
      actionType: z.enum(['navigate', 'click', 'fill', 'select', 'upload', 'scroll', 'wait', 'read', 'validate', 'screenshot']),
      target: z.object({
        selector: z.string().optional(),
        testId: z.string().optional(),
        role: z.string().optional(),
        text: z.string().optional(),
        url: z.string().optional(),
        value: z.string().optional(),
      }).optional(),
    })).describe('The steps to execute'),
    assumptions: z.array(z.string()).describe('Assumptions being made'),
    risks: z.array(z.string()).describe('Potential risks or blockers'),
  }),
  execute: async ({ goal, steps, assumptions, risks }) => {
    const plan: Plan = {
      id: crypto.randomUUID(),
      goal,
      steps: steps.map((step, index) => ({
        id: `step-${index + 1}`,
        description: step.description,
        actionType: step.actionType,
        target: step.target,
        status: 'pending' as const,
      })),
      assumptions,
      risks,
      status: 'pending' as const,
    }

    return {
      plan,
      requiresApproval: true,
      message: `Created plan with ${steps.length} steps. Waiting for user approval before execution.`,
    }
  },
})

// Tool: Execute browser action (for Agent mode)
export const executeBrowserAction = tool({
  description: 'Execute a browser action in the Angular application. Only use after plan approval in Agent mode.',
  inputSchema: z.object({
    conversationId: z.string().describe('The conversation ID for audit logging'),
    actionType: z.enum(['navigate', 'click', 'fill', 'select', 'scroll', 'wait', 'read', 'screenshot', 'hover']),
    description: z.string().describe('Human-readable description of what this action does'),
    target: z.object({
      selector: z.string().optional().describe('CSS selector'),
      testId: z.string().optional().describe('data-testid value'),
      role: z.string().optional().describe('ARIA role'),
      text: z.string().optional().describe('Text content to match'),
      url: z.string().optional().describe('URL to navigate to'),
    }).optional(),
    value: z.string().optional().describe('Value to fill or select'),
  }),
  execute: async ({ conversationId, actionType, description, target, value }) => {
    const action: BrowserAction = {
      id: crypto.randomUUID(),
      type: actionType,
      target,
      value,
      description,
      status: 'pending',
      riskLevel: 'low',
      requiresApproval: false,
      timestamp: new Date().toISOString(),
    }

    // Assess risk
    action.riskLevel = assessActionRisk(action)
    action.requiresApproval = requiresApproval(action)

    // Log the action attempt
    await logAuditEvent({
      conversationId,
      actionType: 'browser_action',
      actionName: actionType,
      request: description,
      target,
      requiresApproval: action.requiresApproval,
    })

    if (action.requiresApproval) {
      const approvalId = await createApprovalRequest(conversationId, action)
      return {
        action,
        status: 'pending_approval',
        approvalId,
        message: `This action requires approval due to ${action.riskLevel} risk level.`,
      }
    }

    throw new Error('Browser automation is disabled for public launch until a production executor is configured.')
  },
})

// Tool: Generate follow-up suggestions
export const generateFollowUpSuggestions = tool({
  description: 'Generate contextual follow-up suggestions based on the conversation and current context',
  inputSchema: z.object({
    currentMode: z.enum(['ask', 'plan', 'execute']),
    lastResponse: z.string().describe('Summary of the last assistant response'),
    topicCategory: z.enum(['documentation', 'code', 'workflow', 'navigation', 'general']),
    sources: z.array(z.object({
      type: z.enum(['documentation', 'code']),
      title: z.string(),
    })).optional(),
  }),
  execute: async ({ currentMode, lastResponse, topicCategory, sources }) => {
    const suggestions: FollowUpSuggestion[] = []

    // Generate suggestions based on mode and context
    if (currentMode === 'ask') {
      if (topicCategory === 'documentation') {
        suggestions.push(
          { id: '1', text: 'Show me the related Angular implementation', mode: 'ask' },
          { id: '2', text: 'Create a test plan for this feature', mode: 'plan' },
          { id: '3', text: 'Summarize the implementation risks', mode: 'debug' },
        )
      } else if (topicCategory === 'code') {
        suggestions.push(
          { id: '1', text: 'Explain how this component works', mode: 'ask' },
          { id: '2', text: 'Find the API service used here', mode: 'ask' },
          { id: '3', text: 'Highlight the likely failure points', mode: 'debug' },
        )
      }
    } else if (currentMode === 'plan') {
      suggestions.push(
        { id: '1', text: 'Add more steps to the plan', mode: 'plan' },
        { id: '2', text: 'Compare with documentation', mode: 'ask' },
        { id: '3', text: 'Review the plan for risks', mode: 'debug' },
      )
    } else if (currentMode === 'execute') {
      suggestions.push(
        { id: '1', text: 'Verify the result against documentation', mode: 'ask' },
        { id: '2', text: 'Inspect the plan for blockers', mode: 'debug' },
        { id: '3', text: 'Refine the execution plan', mode: 'plan' },
      )
    }

    // Add source-specific suggestions
    if (sources && sources.length > 0) {
      const codeSource = sources.find(s => s.type === 'code')
      if (codeSource) {
        suggestions.push({
          id: `code-${codeSource.title}`,
          text: `Inspect the ${codeSource.title} component`,
          mode: 'ask',
        })
      }
    }

    return {
      suggestions: suggestions.slice(0, 5), // Limit to 5 suggestions
    }
  },
})

// Export all tools for the agent
export const copilotTools = {
  searchKnowledgeBase,
  getPageSelectors,
  createPlan,
  executeBrowserAction,
  generateFollowUpSuggestions,
}
