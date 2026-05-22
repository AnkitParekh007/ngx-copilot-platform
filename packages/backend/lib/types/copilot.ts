/**
 * Types aligned with @ankit-parekh-007/ngx-copilot-sdk contract
 * These types ensure compatibility with HttpCopilotBackendAdapter
 */

// ============= Core Models (from ngx-copilot-sdk/models) =============

export type CopilotMode = 'ask' | 'plan' | 'execute' | 'debug';

export interface CopilotConfig {
  apiBaseUrl: string;
  defaultMode: CopilotMode;
  enableApprovals: boolean;
  enableRagSources: boolean;
  enableToolTimeline: boolean;
  statusLabel?: string;
}

export interface CopilotMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  createdAt: string;
  sources?: RagResult[];
}

export interface RagResult {
  id: string;
  title: string;
  snippet: string;
  score: number;
  sourceType?: string;
  sourceUrl?: string;
  repo?: string;
  branch?: string;
  filePath?: string;
  fileKind?: string;
  chunkId?: string;
  tags?: string[];
}

export interface ApprovalRequest {
  id: string;
  title: string;
  reason: string;
  actionSummary: string;
  riskLevel: 'low' | 'medium' | 'high';
  decision?: 'approved' | 'rejected';
}

export interface ToolTimelineItem {
  id: string;
  toolName: string;
  summary: string;
  status: 'queued' | 'running' | 'awaiting_approval' | 'succeeded' | 'failed' | 'skipped';
  startedAt?: string;
  finishedAt?: string;
}

// ============= Adapter Models (from ngx-copilot-sdk/adapters) =============

export interface CopilotContext {
  route: string;
  title?: string;
  userRole?: string;
  tenantId?: string;
  selectedRecordId?: string;
  visibleFields?: string[];
  metadata?: Record<string, unknown>;
}

export interface CopilotRequest {
  sessionId?: string;
  message: string;
  mode: CopilotMode;
  context?: CopilotContext;
}

export interface CopilotResponse {
  message: CopilotMessage;
  sources?: RagResult[];
}

export interface CopilotAdapterError {
  code: string;
  message: string;
  retryable: boolean;
}

// CopilotEvent - discriminated union for SSE streaming
export type CopilotEvent =
  | { type: 'session-started'; sessionId: string }
  | { type: 'message-start'; messageId: string }
  | { type: 'message-chunk'; messageId: string; content: string }
  | { type: 'message-complete'; message: CopilotMessage }
  | { type: 'sources'; sources: RagResult[] }
  | { type: 'tool-timeline'; items: ToolTimelineItem[] }
  | { type: 'approval-required'; request: ApprovalRequest }
  | { type: 'approval-resolved'; requestId: string; decision: 'approved' | 'rejected' }
  | { type: 'done' }
  | { type: 'error'; error: CopilotAdapterError };

export interface RagQuery {
  query: string;
  context?: CopilotContext;
  limit?: number;
}

export interface ToolExecutionRequest {
  toolName: string;
  input: Record<string, unknown>;
  requiresApproval: boolean;
  approvalRequestId?: string;
}

export type ToolExecutionEvent =
  | { type: 'started'; toolName: string; requestId: string }
  | { type: 'progress'; requestId: string; summary: string }
  | { type: 'approval-required'; request: ApprovalRequest }
  | { type: 'completed'; requestId: string; output: Record<string, unknown> }
  | { type: 'failed'; requestId: string; error: string };

// ============= Backend-specific Types (for Next.js API) =============

export interface IngestionJob {
  id: string;
  type: 'documentation' | 'bitbucket' | 'github';
  source: string;
  branch?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  totalItems: number;
  processedItems: number;
  error?: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  metadata?: {
    provider?: 'github' | 'bitbucket';
    owner?: string;
    repo?: string;
    workspace?: string;
    hasToken?: boolean;
  };
}

export interface DocumentChunk {
  id: string;
  sourceUrl: string;
  title?: string;
  content: string;
  embedding?: number[];
  chunkIndex: number;
  totalChunks: number;
  headings: string[];
  metadata: Record<string, unknown>;
  contentHash: string;
}

export interface CodeChunk {
  id: string;
  repoSlug: string;
  branch: string;
  filePath: string;
  content: string;
  embedding?: number[];
  language: string;
  componentType?: AngularComponentType;
  componentName?: string;
  selectors: SelectorInfo[];
  routes: RouteInfo[];
  dependencies: string[];
  metadata: Record<string, unknown>;
  lineStart?: number;
  lineEnd?: number;
  contentHash: string;
}

export type AngularComponentType =
  | 'component'
  | 'service'
  | 'module'
  | 'directive'
  | 'pipe'
  | 'guard'
  | 'resolver'
  | 'interceptor'
  | 'model'
  | 'interface'
  | 'store'
  | 'effect'
  | 'action'
  | 'reducer'
  | 'selector';

export interface SelectorInfo {
  selector: string;
  type: 'css' | 'testId' | 'role' | 'text';
  componentName?: string;
  description?: string;
}

export interface RouteInfo {
  path: string;
  component?: string;
  guards?: string[];
  resolvers?: string[];
  children?: RouteInfo[];
}

// Browser Automation Types

export type BrowserActionType =
  | 'navigate'
  | 'click'
  | 'fill'
  | 'select'
  | 'upload'
  | 'scroll'
  | 'wait'
  | 'read'
  | 'validate'
  | 'screenshot'
  | 'hover';

export interface ActionTarget {
  selector?: string;
  testId?: string;
  role?: string;
  text?: string;
  url?: string;
  value?: string;
}

export interface BrowserAction {
  id: string;
  type: BrowserActionType;
  target?: ActionTarget;
  value?: string;
  description: string;
  status: 'pending' | 'executing' | 'completed' | 'failed';
  result?: string;
  error?: string;
  screenshot?: string;
  riskLevel: 'low' | 'medium' | 'high';
  requiresApproval: boolean;
  timestamp: string;
}

export interface BrowserSession {
  id: string;
  conversationId: string;
  status: 'initializing' | 'ready' | 'executing' | 'paused' | 'closed' | 'error';
  currentUrl?: string;
  currentPageTitle?: string;
  lastScreenshot?: string;
  error?: string;
}

// Audit Types

export interface AuditLog {
  id: string;
  conversationId?: string;
  actionType: string;
  actionName?: string;
  request: string;
  plan?: unknown;
  target?: ActionTarget;
  result?: Record<string, unknown>;
  error?: string;
  requiresApproval: boolean;
  approvedAt?: string;
  createdAt: string;
}

// Conversation Types

export interface Conversation {
  id: string;
  title?: string;
  mode: CopilotMode;
  messages: CopilotMessage[];
  context?: CopilotContext;
  createdAt: string;
  updatedAt: string;
}
