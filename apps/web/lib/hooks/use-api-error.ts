'use client';

import { ApiError } from '@/lib/api/client';

export function getErrorMessage(error: unknown, fallback = 'Unexpected error') {
  if (error instanceof ApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}
