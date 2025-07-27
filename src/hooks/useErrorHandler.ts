import { useState, useCallback } from 'react';

export interface ErrorState {
  hasError: boolean;
  message: string;
  type: 'network' | 'validation' | 'pdf' | 'storage' | 'unknown';
  retryable: boolean;
}

export interface ErrorHandler {
  error: ErrorState | null;
  clearError: () => void;
  handleError: (error: unknown, context?: string) => void;
  withErrorHandling: <T extends any[], R>(
    fn: (...args: T) => Promise<R>
  ) => (...args: T) => Promise<R | undefined>;
}

const getErrorType = (error: unknown): ErrorState['type'] => {
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return 'network';
  }
  
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('pdf') || message.includes('template')) {
      return 'pdf';
    }
    if (message.includes('validation') || message.includes('required')) {
      return 'validation';
    }
    if (message.includes('storage') || message.includes('localStorage')) {
      return 'storage';
    }
  }
  
  return 'unknown';
};

const getErrorMessage = (error: unknown, type: ErrorState['type']): string => {
  switch (type) {
    case 'network':
      return 'Network connection failed. Please check your internet connection and try again.';
    case 'pdf':
      return 'Failed to generate PDF. Please check your form data and try again.';
    case 'validation':
      return 'Please check that all required fields are filled correctly.';
    case 'storage':
      return 'Failed to save data locally. Your browser storage might be full.';
    default:
      if (error instanceof Error) {
        return error.message;
      }
      return 'An unexpected error occurred. Please try again.';
  }
};

const isRetryable = (type: ErrorState['type']): boolean => {
  return ['network', 'pdf', 'storage'].includes(type);
};

export function useErrorHandler(): ErrorHandler {
  const [error, setError] = useState<ErrorState | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleError = useCallback((error: unknown, context?: string) => {
    console.error(`Error in ${context || 'unknown context'}:`, error);
    
    const type = getErrorType(error);
    const message = getErrorMessage(error, type);
    const retryable = isRetryable(type);

    setError({
      hasError: true,
      message,
      type,
      retryable,
    });
  }, []);

  const withErrorHandling = useCallback(
    <T extends any[], R>(fn: (...args: T) => Promise<R>) =>
      async (...args: T): Promise<R | undefined> => {
        try {
          clearError();
          return await fn(...args);
        } catch (error) {
          handleError(error, fn.name);
          return undefined;
        }
      },
    [clearError, handleError]
  );

  return {
    error,
    clearError,
    handleError,
    withErrorHandling,
  };
}