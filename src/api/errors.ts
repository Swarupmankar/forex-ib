import { isAxiosError } from 'axios';
import type { AppError } from './api.types';

/**
 * Normalizes errors into a clean, predictable AppError format.
 * Hides Axios internal implementation details from components.
 */
export function normalizeApiError(error: unknown): AppError {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const responseData = error.response?.data;

    let message = 'An unexpected error occurred. Please try again.';

    if (responseData && typeof responseData === 'object') {
      if ('message' in responseData && typeof responseData.message === 'string') {
        message = responseData.message;
      } else if ('error' in responseData && typeof responseData.error === 'string') {
        message = responseData.error;
      }
    } else if (error.message) {
      if (error.code === 'ECONNABORTED') {
        message = 'Request timed out. Please check your connection and try again.';
      } else if (error.message.includes('Network Error')) {
        message = 'Network error. Please verify your internet connection or server availability.';
      } else {
        message = error.message;
      }
    }

    const fieldErrors =
      responseData && typeof responseData === 'object' && 'fieldErrors' in responseData
        ? (responseData.fieldErrors as Record<string, string[]>)
        : undefined;

    const code =
      responseData && typeof responseData === 'object' && 'code' in responseData
        ? String(responseData.code)
        : error.code;

    return {
      message,
      status,
      code,
      fieldErrors,
    };
  }

  if (error instanceof Error) {
    return {
      message: error.message,
    };
  }

  return {
    message: 'An unknown error occurred.',
  };
}
