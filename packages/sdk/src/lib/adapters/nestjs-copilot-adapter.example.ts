// Example backend proxy contract for NestJS.
export interface NestJsCopilotResponseChunk {
  type: 'token' | 'source' | 'tool' | 'done' | 'error';
  payload: unknown;
}
