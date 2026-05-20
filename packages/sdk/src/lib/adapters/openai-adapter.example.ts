// Example only. Keep provider API keys on the backend, not in Angular.
export interface OpenAiBackendRequest {
  prompt: string;
  context: Record<string, unknown>;
}
