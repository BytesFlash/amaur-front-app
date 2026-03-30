import { AxiosError } from 'axios'

type ApiErrorPayload = {
  error?: {
    message?: string
    code?: string
  }
  message?: string
}

export function extractApiErrorMessage(err: unknown, fallback: string): string {
  if (err instanceof AxiosError) {
    const payload = err.response?.data as ApiErrorPayload | undefined
    if (payload?.error?.message) return payload.error.message
    if (payload?.message) return payload.message
  }
  if (err instanceof Error && err.message) {
    return err.message
  }
  return fallback
}
