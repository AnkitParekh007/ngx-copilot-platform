export interface ErrorBodyInput {
  error: string
  message: string
  code: string
  requestId: string
  details?: unknown
}

export function buildErrorBody(input: ErrorBodyInput) {
  return {
    error: input.error,
    message: input.message,
    code: input.code,
    requestId: input.requestId,
    ...(input.details ? { details: input.details } : {}),
  }
}
