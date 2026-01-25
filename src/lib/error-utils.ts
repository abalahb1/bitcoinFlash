/**
 * Extract error message from API response
 * Handles both old format (string) and new standardized format (object with message)
 */
export function getErrorMessage(error: unknown, fallback = 'An error occurred'): string {
  if (!error) return fallback
  
  // String error (old format)
  if (typeof error === 'string') return error
  
  // Object with message property (new standardized format)
  if (typeof error === 'object' && error !== null) {
    const errorObj = error as Record<string, unknown>
    
    // New format: { error: { message: string, code: string } }
    if (typeof errorObj.message === 'string') return errorObj.message
    
    // Could also be nested: response.error.message
    if (typeof errorObj.error === 'object' && errorObj.error !== null) {
      const nestedError = errorObj.error as Record<string, unknown>
      if (typeof nestedError.message === 'string') return nestedError.message
    }
  }
  
  return fallback
}

/**
 * Extract error message from fetch response data
 * Use after: const data = await res.json()
 */
export function extractApiError(data: Record<string, unknown>, fallback = 'An error occurred'): string {
  // Direct error string (old format)
  if (typeof data.error === 'string') return data.error
  
  // New format: { error: { message: string } }
  if (typeof data.error === 'object' && data.error !== null) {
    const errorObj = data.error as Record<string, unknown>
    if (typeof errorObj.message === 'string') return errorObj.message
  }
  
  // Could also have message at top level
  if (typeof data.message === 'string') return data.message
  
  return fallback
}
