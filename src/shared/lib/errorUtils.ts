import { AxiosError } from 'axios';

/**
 * API error response structure from the backend
 */
interface ApiErrorResponse {
  error?: string;
  message?: string;
  detail?: string;
  title?: string;
  errors?: Record<string, string[]>;
}

/**
 * Extracts a user-friendly error message from an API error response
 */
export function getApiErrorMessage(error: unknown, fallback = 'Something went wrong'): string {
  // Handle Axios errors
  if (error instanceof AxiosError) {
    const data = error.response?.data as ApiErrorResponse | undefined;

    if (data) {
      // Check various error message fields
      if (data.error) return data.error;
      if (data.message) return data.message;
      if (data.detail) return data.detail;
      if (data.title) return data.title;

      // Handle validation errors
      if (data.errors) {
        const firstError = Object.values(data.errors)[0];
        if (firstError && firstError.length > 0) {
          return firstError[0];
        }
      }
    }

    // Use Axios error message if no response data
    if (error.message) return error.message;
  }

  // Handle regular Error objects
  if (error instanceof Error) {
    return error.message;
  }

  // Handle objects with response property (for non-Axios cases)
  if (error && typeof error === 'object' && 'response' in error) {
    const axiosLike = error as { response?: { data?: ApiErrorResponse } };
    const data = axiosLike.response?.data;

    if (data) {
      if (data.error) return data.error;
      if (data.message) return data.message;
      if (data.detail) return data.detail;
    }
  }

  return fallback;
}

/**
 * Checks if an error is a specific API error code
 */
export function isApiError(error: unknown, code: string): boolean {
  if (error instanceof AxiosError) {
    const data = error.response?.data as { code?: string } | undefined;
    return data?.code === code;
  }
  return false;
}

/**
 * Gets the HTTP status code from an error
 */
export function getErrorStatus(error: unknown): number | undefined {
  if (error instanceof AxiosError) {
    return error.response?.status;
  }
  return undefined;
}
