import { createClient } from '@/lib/supabase/server'
import type { BrowserAction } from '@/lib/types/copilot'

export interface BrowserActionRequest {
  type: BrowserAction['type']
  selector?: string
  value?: string
  url?: string
  timeout?: number
  description: string
}

export interface BrowserActionResult {
  success: boolean
  result?: string
  error?: string
  screenshot?: string
  pageState?: {
    url: string
    title: string
    readyState: string
  }
}

export interface PageElement {
  selector: string
  type: string
  text?: string
  value?: string
  attributes: Record<string, string>
  isVisible: boolean
  isEnabled: boolean
  boundingBox?: { x: number; y: number; width: number; height: number }
}

const BROWSER_AUTOMATION_DISABLED_MESSAGE =
  'Browser automation is disabled for public launch until a production executor is configured.'

export class BrowserAgentService {
  readonly sessionId: string
  readonly conversationId?: string

  constructor(sessionId: string, conversationId?: string) {
    this.sessionId = sessionId
    this.conversationId = conversationId
  }

  classifyRisk(action: BrowserActionRequest): 'low' | 'medium' | 'high' {
    if (action.type === 'upload') return 'high'
    if (action.type === 'click' || action.type === 'fill' || action.type === 'select') return 'medium'
    return 'low'
  }

  requiresApproval(action: BrowserActionRequest): boolean {
    return this.classifyRisk(action) === 'high'
  }

  generateSafeSelector(element: PageElement): string[] {
    const selectors: string[] = []
    const testId = element.attributes['data-testid']
    const ariaLabel = element.attributes['aria-label']
    const id = element.attributes.id
    const name = element.attributes.name

    if (testId) selectors.push(`[data-testid="${testId}"]`)
    if (ariaLabel) selectors.push(`[aria-label="${ariaLabel}"]`)
    if (id && !id.match(/^ng-|^\d|^cdk-/)) selectors.push(`#${id}`)
    if (name) selectors.push(`[name="${name}"]`)
    if (!selectors.length && element.selector) selectors.push(element.selector)

    return selectors
  }

  async createActionRecord(action: BrowserActionRequest): Promise<BrowserAction> {
    const supabase = await createClient()

    const actionRecord: BrowserAction = {
      id: crypto.randomUUID(),
      type: action.type,
      target: {
        selector: action.selector,
        url: action.url,
        value: action.value,
      },
      value: action.value,
      description: action.description,
      status: 'pending',
      riskLevel: this.classifyRisk(action),
      requiresApproval: this.requiresApproval(action),
      timestamp: new Date().toISOString(),
    }

    await supabase.from('audit_logs').insert({
      conversation_id: this.conversationId,
      action_type: 'browser_action_disabled',
      action_name: action.type,
      request: action.description,
      target: actionRecord.target,
      requires_approval: actionRecord.requiresApproval,
      error: BROWSER_AUTOMATION_DISABLED_MESSAGE,
    })

    return actionRecord
  }

  async executeAction(_action: BrowserActionRequest): Promise<BrowserActionResult> {
    throw new Error(BROWSER_AUTOMATION_DISABLED_MESSAGE)
  }

  async executeActionSequence(
    _actions: BrowserActionRequest[],
    _onProgress: (index: number, action: BrowserAction) => void
  ): Promise<{ completed: BrowserAction[]; failed?: BrowserAction }> {
    throw new Error(BROWSER_AUTOMATION_DISABLED_MESSAGE)
  }

  async inspectPage(): Promise<{
    url: string
    title: string
    elements: PageElement[]
    forms: { id: string; action: string; fields: PageElement[] }[]
    navigation: { links: PageElement[]; buttons: PageElement[] }
  }> {
    throw new Error(BROWSER_AUTOMATION_DISABLED_MESSAGE)
  }

  async waitForCondition(
    _condition: 'navigation' | 'selector' | 'text' | 'network_idle',
    _value?: string,
    _timeout: number = 30000
  ): Promise<boolean> {
    throw new Error(BROWSER_AUTOMATION_DISABLED_MESSAGE)
  }

  async takeScreenshot(): Promise<string> {
    throw new Error(BROWSER_AUTOMATION_DISABLED_MESSAGE)
  }

  async readPageContent(_selector?: string): Promise<string> {
    throw new Error(BROWSER_AUTOMATION_DISABLED_MESSAGE)
  }
}

export async function createBrowserAgent(conversationId?: string): Promise<BrowserAgentService> {
  const sessionId = crypto.randomUUID()
  const supabase = await createClient()

  await supabase.from('browser_sessions').insert({
    id: sessionId,
    conversation_id: conversationId,
    status: 'paused',
    error: BROWSER_AUTOMATION_DISABLED_MESSAGE,
  })

  return new BrowserAgentService(sessionId, conversationId)
}
