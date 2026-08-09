import {
  ApprovalRequest,
  CopilotEvent,
  RagResult,
  ToolTimelineItem,
  createAdapterError,
} from '@ankit-parekh-007/ngx-copilot-sdk';

export type FailureLabScenarioId =
  | 'sse-disconnect'
  | 'retrieval-failure'
  | 'approval-rejected'
  | 'tool-disabled';

export type FailureLabTerminalClaim = 'none' | 'failed' | 'not-executed' | 'completed';

export interface FailureLabScenario {
  id: FailureLabScenarioId;
  label: string;
  description: string;
  requestContext: string[];
  events: CopilotEvent[];
  sources: RagResult[];
  timeline: ToolTimelineItem[];
  approval?: ApprovalRequest;
  retryable: boolean;
  recovered: boolean;
  terminalClaim: FailureLabTerminalClaim;
  result: string;
}

const REQUEST_CONTEXT = [
  'route=/customers/acme-42/onboarding',
  'role=operations-lead',
  'record=customer:acme-42',
  'visibleFields=status,owner,blockingTasks,nextReviewDate',
];

const GROUNDED_SOURCES: RagResult[] = [
  {
    id: 'source-policy',
    title: 'Onboarding approval policy',
    snippet: 'Workflow submission requires an explicit operator approval before execution.',
    score: 0.94,
    sourceType: 'policy',
  },
  {
    id: 'source-record',
    title: 'Acme onboarding record',
    snippet: 'Procurement approval is complete and two setup tasks remain visible to the operator.',
    score: 0.91,
    sourceType: 'record',
  },
];

const APPROVAL: ApprovalRequest = {
  id: 'approval-submit-onboarding',
  title: 'Submit onboarding workflow',
  reason: 'The workflow changes customer onboarding state and must remain operator-controlled.',
  actionSummary: 'Submit the selected customer onboarding workflow.',
  riskLevel: 'medium',
};

function tool(status: ToolTimelineItem['status'], summary: string): ToolTimelineItem {
  return {
    id: 'tool-submit-onboarding',
    toolName: 'submitOnboardingWorkflow',
    summary,
    status,
  };
}

export function buildFailureLabScenario(
  id: FailureLabScenarioId,
  recovered = false,
): FailureLabScenario {
  if (id === 'sse-disconnect' && !recovered) {
    const error = createAdapterError(
      'STREAM_DISCONNECTED',
      'The deterministic SSE fixture disconnected before the message completed.',
      true,
      { retryFrom: 'request-boundary', contextRetained: true },
    );

    return {
      id,
      label: 'SSE disconnect',
      description: 'The stream disconnects after a partial message and exposes an explicit retry state.',
      requestContext: REQUEST_CONTEXT,
      events: [
        { type: 'session-started', sessionId: 'failure-lab-session' },
        { type: 'message-start', messageId: 'assistant-failure' },
        { type: 'message-chunk', messageId: 'assistant-failure', content: 'I found the selected onboarding record, but ' },
        { type: 'error', error },
      ],
      sources: [],
      timeline: [],
      retryable: true,
      recovered: false,
      terminalClaim: 'failed',
      result: 'The stream disconnected. No completed answer, citation set, or execution result is claimed.',
    };
  }

  if (id === 'sse-disconnect' && recovered) {
    return {
      id,
      label: 'Recovered SSE stream',
      description: 'Retry uses the same safe request context and completes from a clean request boundary.',
      requestContext: REQUEST_CONTEXT,
      events: [
        { type: 'session-started', sessionId: 'failure-lab-session-retry' },
        { type: 'message-start', messageId: 'assistant-retry' },
        { type: 'message-chunk', messageId: 'assistant-retry', content: 'Retry succeeded with the same visible context. ' },
        { type: 'sources', sources: GROUNDED_SOURCES },
        { type: 'tool-timeline', items: [tool('awaiting_approval', 'Grounded proposal is waiting for explicit approval.')] },
        { type: 'approval-required', request: APPROVAL },
        { type: 'done' },
      ],
      sources: GROUNDED_SOURCES,
      timeline: [tool('awaiting_approval', 'Grounded proposal is waiting for explicit approval.')],
      approval: APPROVAL,
      retryable: false,
      recovered: true,
      terminalClaim: 'none',
      result: 'The retry recovered streaming and grounding. Execution is still not claimed because approval remains pending.',
    };
  }

  if (id === 'retrieval-failure') {
    const error = createAdapterError(
      'RETRIEVAL_FAILED',
      'The deterministic retrieval fixture could not load trusted sources.',
      true,
      { citationsSuppressed: true, toolsSuppressed: true },
    );

    return {
      id,
      label: 'Retrieval failure',
      description: 'Trusted retrieval fails, so citations and downstream tool execution are suppressed.',
      requestContext: REQUEST_CONTEXT,
      events: [
        { type: 'session-started', sessionId: 'retrieval-failure-session' },
        { type: 'message-start', messageId: 'assistant-retrieval-failure' },
        { type: 'error', error },
      ],
      sources: [],
      timeline: [],
      retryable: true,
      recovered: false,
      terminalClaim: 'failed',
      result: 'Trusted evidence is unavailable. The demo renders no citations and does not plan or execute a tool.',
    };
  }

  if (id === 'approval-rejected') {
    const rejected: ApprovalRequest = { ...APPROVAL, decision: 'rejected' };
    const skipped = tool('skipped', 'Operator rejected the proposal. Execution never started.');

    return {
      id,
      label: 'Approval rejected',
      description: 'The operator rejects a grounded action and the terminal state remains explicitly non-executed.',
      requestContext: REQUEST_CONTEXT,
      events: [
        { type: 'session-started', sessionId: 'approval-rejected-session' },
        { type: 'sources', sources: GROUNDED_SOURCES },
        { type: 'tool-timeline', items: [tool('awaiting_approval', 'Waiting for operator decision.')] },
        { type: 'approval-required', request: APPROVAL },
        { type: 'approval-resolved', requestId: APPROVAL.id, decision: 'rejected' },
        { type: 'tool-timeline', items: [skipped] },
        { type: 'done' },
      ],
      sources: GROUNDED_SOURCES,
      timeline: [skipped],
      approval: rejected,
      retryable: false,
      recovered: false,
      terminalClaim: 'not-executed',
      result: 'Approval was rejected. The tool is skipped and no successful execution is claimed.',
    };
  }

  const disabled = tool('skipped', 'Tool execution is disabled by the deterministic demo policy.');
  return {
    id,
    label: 'Tool disabled',
    description: 'A grounded tool proposal is visible, but policy disables execution explicitly rather than hiding it.',
    requestContext: REQUEST_CONTEXT,
    events: [
      { type: 'session-started', sessionId: 'tool-disabled-session' },
      { type: 'sources', sources: GROUNDED_SOURCES },
      { type: 'tool-timeline', items: [disabled] },
      { type: 'done' },
    ],
    sources: GROUNDED_SOURCES,
    timeline: [disabled],
    retryable: false,
    recovered: false,
    terminalClaim: 'not-executed',
    result: 'The tool is disabled by policy. The UI keeps that non-executed state visible and never reports success.',
  };
}

export function retryFailureLabScenario(scenario: FailureLabScenario): FailureLabScenario {
  if (scenario.id !== 'sse-disconnect' || !scenario.retryable) {
    return scenario;
  }
  return buildFailureLabScenario('sse-disconnect', true);
}
