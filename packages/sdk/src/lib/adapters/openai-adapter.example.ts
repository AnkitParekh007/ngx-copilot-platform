/**
 * @internal
 * Reference-only type showing how an OpenAI-backed backend might shape its request.
 * This file is NOT part of the public API and is not exported from public-api.ts.
 * Do NOT embed OpenAI API keys in Angular — proxy all LLM calls through your own backend.
 */
export interface OpenAiBackendRequest {
  prompt: string;
  context: Record<string, unknown>;
}
