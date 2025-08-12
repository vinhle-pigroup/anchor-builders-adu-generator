/**
 * Error handling hook for ADU generator
 */

import { useState, useCallback } from 'react';

interface ErrorState {
  message: string;
  type: 'error' | 'warning' | 'info';
  timestamp: number;
}

export function useErrorHandler() {
  const [error, setError] = useState<ErrorState | null>(null);

  const handleError = useCallback((message: string, type: 'error' | 'warning' | 'info' = 'error') => {
    setError({
      message,
      type,
      timestamp: Date.now()
    });

    // Log error to console for debugging
    console.error(`[${type.toUpperCase()}]`, message);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleSuccess = useCallback((message: string) => {
    handleError(message, 'info');
  }, [handleError]);

  return {
    error,
    handleError,
    handleSuccess,
    clearError
  };
}