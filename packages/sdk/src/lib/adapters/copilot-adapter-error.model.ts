export interface CopilotAdapterError {
  code: string;
  message: string;
  recoverable: boolean;
  details?: Record<string, unknown>;
}

export function createAdapterError(
  code: string,
  message: string,
  recoverable = false,
  details?: Record<string, unknown>,
): CopilotAdapterError {
  return { code, message, recoverable, details };
}
