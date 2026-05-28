import { CopilotEvent } from './copilot-event.model';

/**
 * Subset of {@link CopilotEvent} that can only be emitted *during* an active
 * streaming response — excludes lifecycle events (`session-started`) and
 * post-stream events (`approval-resolved`).
 *
 * Use this type when building a streaming adapter and you want the TypeScript
 * compiler to enforce that your `Observable` only emits events that make sense
 * inside a stream:
 *
 * ```ts
 * function myStreamHandler(): Observable<CopilotStreamEvent> {
 *   // compiler error if you try to emit 'session-started' here
 * }
 * ```
 *
 * `CopilotService` itself always works with the full `CopilotEvent` union —
 * use `CopilotStreamEvent` only at the adapter implementation boundary.
 */
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
