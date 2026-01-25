import { NextResponse } from 'next/server'
import { ZodError, ZodIssue } from 'zod'

// ============================================
// API RESPONSE TYPES
// ============================================

export interface ApiSuccessResponse<T> {
  success: true
  data: T
}

export interface ApiErrorResponse {
  success: false
  error: {
    code: string
    message: string
    details?: Record<string, unknown>
  }
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse

// ============================================
// ERROR CODES
// ============================================

export const ApiErrorCodes = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  CONFLICT: 'CONFLICT',
  RATE_LIMITED: 'RATE_LIMITED',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
} as const

// ============================================
// SUCCESS RESPONSE HELPERS
// ============================================

export function apiSuccess<T>(data: T, status = 200): NextResponse<ApiSuccessResponse<T>> {
  return NextResponse.json({ success: true, data }, { status })
}

export function apiCreated<T>(data: T): NextResponse<ApiSuccessResponse<T>> {
  return apiSuccess(data, 201)
}

export function apiNoContent(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

// ============================================
// ERROR RESPONSE HELPERS
// ============================================

export function apiError(
  code: keyof typeof ApiErrorCodes,
  message: string,
  status: number,
  details?: Record<string, unknown>
): NextResponse<ApiErrorResponse> {
  return NextResponse.json(
    {
      success: false,
      error: {
        code: ApiErrorCodes[code],
        message,
        ...(details && { details }),
      },
    },
    { status }
  )
}

export function apiUnauthorized(message = 'Not authenticated'): NextResponse<ApiErrorResponse> {
  return apiError('UNAUTHORIZED', message, 401)
}

export function apiForbidden(message = 'Access denied'): NextResponse<ApiErrorResponse> {
  return apiError('FORBIDDEN', message, 403)
}

export function apiNotFound(message = 'Resource not found'): NextResponse<ApiErrorResponse> {
  return apiError('NOT_FOUND', message, 404)
}

export function apiValidationError(
  message: string,
  issues?: ZodIssue[]
): NextResponse<ApiErrorResponse> {
  return apiError('VALIDATION_ERROR', message, 400, issues ? { issues } : undefined)
}

export function apiConflict(message: string): NextResponse<ApiErrorResponse> {
  return apiError('CONFLICT', message, 409)
}

export function apiRateLimited(message = 'Too many requests'): NextResponse<ApiErrorResponse> {
  return apiError('RATE_LIMITED', message, 429)
}

export function apiInternalError(message = 'Internal server error'): NextResponse<ApiErrorResponse> {
  return apiError('INTERNAL_ERROR', message, 500)
}

export function apiInsufficientFunds(
  message: string,
  details?: { current: number; required: number; shortage: number }
): NextResponse<ApiErrorResponse> {
  return apiError('INSUFFICIENT_FUNDS', message, 400, details)
}

// ============================================
// ZOD ERROR HANDLER
// ============================================

export function handleZodError(error: ZodError): NextResponse<ApiErrorResponse> {
  const firstIssue = error.issues[0]
  const message = firstIssue?.message || 'Validation failed'
  return apiValidationError(message, error.issues)
}

// ============================================
// GENERIC ERROR HANDLER
// ============================================

export function handleApiError(error: unknown): NextResponse<ApiErrorResponse> {
  console.error('[API Error]', error)

  if (error instanceof ZodError) {
    return handleZodError(error)
  }

  if (error instanceof Error) {
    // In production, don't expose internal error messages
    const message =
      process.env.NODE_ENV === 'development'
        ? error.message
        : 'An unexpected error occurred'
    return apiInternalError(message)
  }

  return apiInternalError()
}
