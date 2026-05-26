import { createClient } from '@/lib/supabase/server'
import type { AuditLog, Plan, ActionTarget, BrowserAction, RiskLevel } from '@/lib/types/copilot'

export interface AuditEventInput extends Omit<AuditLog, 'id' | 'createdAt'> {
  userId?: string;
  apiKeyId?: string;
  ipAddress?: string;
  userAgent?: string;
  requestId?: string;
  durationMs?: number;
}

export async function logAuditEvent(
  event: AuditEventInput
): Promise<string> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('audit_logs')
    .insert({
      conversation_id: event.conversationId,
      user_id: event.userId,
      api_key_id: event.apiKeyId,
      action_type: event.actionType,
      action_name: event.actionName,
      request: event.request,
      plan: event.plan,
      target: event.target,
      result: event.result,
      error: event.error,
      requires_approval: event.requiresApproval,
      approved_at: event.approvedAt,
      ip_address: event.ipAddress,
      user_agent: event.userAgent,
      request_id: event.requestId,
      duration_ms: event.durationMs,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error logging audit event:', error)
    // Don't throw - audit logging should not break the request
    return 'audit-failed'
  }

  return data.id
}

export async function getAuditLogs(
  conversationId: string,
  options: {
    limit?: number
    offset?: number
    actionType?: string
  } = {}
): Promise<AuditLog[]> {
  const { limit = 50, offset = 0, actionType } = options
  const supabase = await createClient()

  let query = supabase
    .from('audit_logs')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  if (actionType) {
    query = query.eq('action_type', actionType)
  }

  const { data, error } = await query

  if (error) {
    throw new Error(`Failed to fetch audit logs: ${error.message}`)
  }

  return (data || []).map((log) => ({
    id: log.id,
    conversationId: log.conversation_id,
    actionType: log.action_type,
    actionName: log.action_name,
    request: log.request,
    plan: log.plan as Plan | undefined,
    target: log.target as ActionTarget | undefined,
    result: log.result as Record<string, unknown> | undefined,
    error: log.error,
    requiresApproval: log.requires_approval,
    approvedAt: log.approved_at || undefined,
    createdAt: log.created_at,
  }))
}

// Risk assessment for actions
export function assessActionRisk(action: BrowserAction): RiskLevel {
  const { type, target, value } = action

  // Critical risk - data modifications
  if (type === 'click' && target?.text) {
    const criticalPatterns = [
      /delete/i,
      /remove/i,
      /destroy/i,
      /publish/i,
      /approve/i,
      /submit/i,
      /confirm/i,
      /send/i,
      /transfer/i,
      /pay/i,
    ]
    if (criticalPatterns.some((p) => p.test(target.text!))) {
      return 'critical'
    }
  }

  // High risk - form submissions and uploads
  if (type === 'upload') return 'high'
  if (type === 'click' && target?.text?.toLowerCase().includes('save')) return 'high'

  // Medium risk - form filling
  if (type === 'fill' || type === 'select') return 'medium'

  // Low risk - navigation and reading
  if (type === 'navigate' || type === 'read' || type === 'scroll' || type === 'screenshot') {
    return 'low'
  }

  return 'medium'
}

// Check if action requires approval
export function requiresApproval(action: BrowserAction): boolean {
  const riskLevel = action.riskLevel || assessActionRisk(action)
  return riskLevel === 'high' || riskLevel === 'critical'
}

// Approval queue management
export async function createApprovalRequest(
  conversationId: string,
  action: BrowserAction
): Promise<string> {
  const supabase = await createClient()
  const riskLevel = assessActionRisk(action)

  const { data, error } = await supabase
    .from('action_queue')
    .insert({
      conversation_id: conversationId,
      action_type: action.type,
      action_details: action,
      risk_level: riskLevel,
      status: 'pending_approval',
    })
    .select('id')
    .single()

  if (error) {
    throw new Error(`Failed to create approval request: ${error.message}`)
  }

  return data.id
}

export async function approveAction(actionId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('action_queue')
    .update({
      status: 'approved',
      approved_at: new Date().toISOString(),
    })
    .eq('id', actionId)

  if (error) {
    throw new Error(`Failed to approve action: ${error.message}`)
  }
}

export async function rejectAction(actionId: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('action_queue')
    .update({
      status: 'rejected',
    })
    .eq('id', actionId)

  if (error) {
    throw new Error(`Failed to reject action: ${error.message}`)
  }
}

export async function getPendingApprovals(
  conversationId: string
): Promise<Array<{ id: string; actionType: string; actionDetails: BrowserAction; riskLevel: RiskLevel }>> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('action_queue')
    .select('*')
    .eq('conversation_id', conversationId)
    .eq('status', 'pending_approval')
    .order('created_at', { ascending: true })

  if (error) {
    throw new Error(`Failed to fetch pending approvals: ${error.message}`)
  }

  return (data || []).map((item) => ({
    id: item.id,
    actionType: item.action_type,
    actionDetails: item.action_details as BrowserAction,
    riskLevel: item.risk_level as RiskLevel,
  }))
}

// Security checks
export function sanitizeInput(input: string): string {
  // Remove potential XSS
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim()
}

export function validateSelector(selector: string): boolean {
  // Block potentially dangerous selectors
  const blockedPatterns = [
    /javascript:/i,
    /data:text\/html/i,
    /on\w+=/i,
  ]

  return !blockedPatterns.some((p) => p.test(selector))
}

export function validateUrl(url: string, allowedDomains?: string[]): boolean {
  try {
    const parsed = new URL(url)
    
    // Block javascript: and data: URLs
    if (parsed.protocol === 'javascript:' || parsed.protocol === 'data:') {
      return false
    }

    // Check allowed domains if specified
    if (allowedDomains && allowedDomains.length > 0) {
      return allowedDomains.some((domain) => parsed.hostname.endsWith(domain))
    }

    return true
  } catch {
    return false
  }
}
