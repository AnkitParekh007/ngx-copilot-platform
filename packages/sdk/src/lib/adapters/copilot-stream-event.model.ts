import { CopilotEvent } from './copilot-event.model';

/** Streaming subset of {@link CopilotEvent} emitted during an active response. */
export type CopilotStreamEvent = Extract<
  CopilotEvent,
  | { type: 'message-start' }
  | { type: 'message-chunk' }
  | { type: 'message-complete' }
  | { type: 'sources' }
  | { type: 'tool-timeline' }
  | { type: 'approval-required' }
  | { type: 'done' }
  | { type: 'error' }
>;
