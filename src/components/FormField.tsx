import React from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import type { ValidationError } from '../hooks/useFormValidation';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  error?: ValidationError;
  isRequired?: boolean;
  isTouched?: boolean;
  isValid?: boolean;
  description?: string;
  className?: string;
}

export function FormField({
  label,
  children,
  error,
  isRequired = false,
  isTouched = false,
  isValid = false,
  description,
  className = '',
}: FormFieldProps) {
  const hasError = error && isTouched;
  const showValid = isTouched && isValid && !error;

  // Generate unique IDs for accessibility
  const fieldId = `field-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const errorId = `${fieldId}-error`;
  const descriptionId = `${fieldId}-description`;

  return (
    <div className={`space-y-1 ${className}`} role='group' aria-labelledby={fieldId}>
      {/* Label with required indicator */}
      <label id={fieldId} htmlFor={fieldId} className='block text-sm font-medium text-slate-700'>
        {label}
        {isRequired && (
          <span className='text-red-500 ml-1' aria-label='required field' role='presentation'>
            *
          </span>
        )}
      </label>

      {/* Description */}
      {description && (
        <p id={descriptionId} className='text-xs text-slate-500 mb-2' role='note'>
          {description}
        </p>
      )}

      {/* Input wrapper with validation styling */}
      <div className='relative'>
        {React.cloneElement(children as React.ReactElement, {
          id: fieldId,
          'aria-describedby':
            [description ? descriptionId : '', hasError ? errorId : ''].filter(Boolean).join(' ') ||
            undefined,
          'aria-invalid': hasError,
          'aria-required': isRequired,
        })}

        {/* Validation icon */}
        {(hasError || showValid) && (
          <div
            className='absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none'
            aria-hidden='true'
          >
            {hasError ? (
              <AlertCircle className='w-5 h-5 text-red-500' aria-label='Error' />
            ) : showValid ? (
              <CheckCircle className='w-5 h-5 text-green-500' aria-label='Valid' />
            ) : null}
          </div>
        )}
      </div>

      {/* Error message */}
      {hasError && (
        <div
          id={errorId}
          className='flex items-center space-x-1 text-sm text-red-600'
          role='alert'
          aria-live='polite'
        >
          <AlertCircle className='w-4 h-4 flex-shrink-0' aria-hidden='true' />
          <span>{error.message}</span>
        </div>
      )}

      {/* Success message for complex validations */}
      {showValid && isRequired && (
        <div
          className='flex items-center space-x-1 text-sm text-green-600'
          role='status'
          aria-live='polite'
        >
          <CheckCircle className='w-4 h-4 flex-shrink-0' aria-hidden='true' />
          <span>Valid</span>
        </div>
      )}
    </div>
  );
}
