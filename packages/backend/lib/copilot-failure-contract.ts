export type BackendFailureKind =
  | 'stream-disconnected'
  | 'retrieval-failed'
  | 'approval-rejected'
  | 'tool-disabled';

export interface BackendFailureContract {
  code: string;
  recoverable: boolean;
  suppressSources: boolean;
  suppressTools: boolean;
  execution: 'not-started' | 'failed';
  clientMessage: string;
}

/**
 * Shared semantic contract for failure states surfaced to copilot clients.
 *
 * This deliberately does not perform retrieval or tool execution. It defines
 * what the backend is allowed to claim when a dependency or policy boundary
 * fails, so UI adapters can remain truthful and deterministic.
 */
export function getBackendFailureContract(kind: BackendFailureKind): BackendFailureContract {
  switch (kind) {
    case 'stream-disconnected':
      return {
        code: 'STREAM_DISCONNECTED',
        recoverable: true,
        suppressSources: true,
        suppressTools: true,
        execution: 'not-started',
        clientMessage: 'The response stream disconnected before completion. Retry from a clean request boundary.',
      };
    case 'retrieval-failed':
      return {
        code: 'RETRIEVAL_FAILED',
        recoverable: true,
        suppressSources: true,
        suppressTools: true,
        execution: 'not-started',
        clientMessage: 'Trusted retrieval failed. Do not render citations or plan tools from ungrounded context.',
      };
    case 'approval-rejected':
      return {
        code: 'APPROVAL_REJECTED',
        recoverable: false,
        suppressSources: false,
        suppressTools: false,
        execution: 'not-started',
        clientMessage: 'The operator rejected the action. The backend must not execute it.',
      };
    case 'tool-disabled':
      return {
        code: 'TOOL_DISABLED',
        recoverable: false,
        suppressSources: false,
        suppressTools: false,
        execution: 'not-started',
        clientMessage: 'Tool execution is disabled by policy. Report a non-executed terminal state.',
      };
  }
}
