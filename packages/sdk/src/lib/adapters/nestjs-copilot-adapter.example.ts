/**
 * @internal
 * Reference-only type showing a NestJS backend SSE chunk shape.
 * This file is NOT part of the public API and is not exported from public-api.ts.
 * Map this shape to {@link CopilotEvent} in your backend adapter if using NestJS.
 */
export interface NestJsCopilotResponseChunk {
  type: 'token' | 'source' | 'tool' | 'done' | 'error';
  payload: unknown;
}
