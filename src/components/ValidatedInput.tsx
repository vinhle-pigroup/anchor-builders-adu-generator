import React from 'react';
import type { ValidationError } from '../hooks/useFormValidation';

interface ValidatedInputProps {
  type?: 'text' | 'email' | 'tel' | 'number';
  value: string | number;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  placeholder?: string;
  error?: ValidationError;
  isTouched?: boolean;
  isValid?: boolean;
  className?: string;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
}

export function ValidatedInput({
  type = 'text',
  value,
  onChange,
  onBlur,
  placeholder,
  error,
  isTouched = false,
  isValid = false,
  className = '',
  disabled = false,
  min,
  max,
  step
}: ValidatedInputProps) {
  const hasError = error && isTouched;
  const showValid = isTouched && isValid && !error;

  // Dynamic styling based on validation state
  let inputStyles = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200';
  
  if (hasError) {
    inputStyles += ' border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50';
  } else if (showValid) {
    inputStyles += ' border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50';
  } else {
    inputStyles += ' border-slate-300 focus:border-blue-500 focus:ring-blue-200';
  }

  if (disabled) {
    inputStyles += ' bg-slate-100 text-slate-500 cursor-not-allowed';
  }

  // Add space for validation icon
  if (hasError || showValid) {
    inputStyles += ' pr-10';
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = type === 'number' ? parseFloat(e.target.value) || 0 : e.target.value;
    onChange(newValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Improve keyboard navigation
    if (e.key === 'Enter') {
      e.preventDefault();
      // Move to next focusable element
      const form = e.currentTarget.form;
      if (form) {
        const elements = form.querySelectorAll('input, button, select, textarea');
        const currentIndex = Array.from(elements).indexOf(e.currentTarget);
        const nextElement = elements[currentIndex + 1] as HTMLElement;
        if (nextElement) {
          nextElement.focus();
        }
      }
    }
  };

  return (
    <input
      type={type}
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      onKeyDown={handleKeyDown}
      placeholder={placeholder}
      className={`${inputStyles} ${className}`}
      disabled={disabled}
      min={min}
      max={max}
      step={step}
      aria-invalid={hasError}
      aria-describedby={hasError ? `${placeholder}-error` : undefined}
      autoComplete={
        type === 'email' ? 'email' :
        type === 'tel' ? 'tel' :
        type === 'text' && placeholder?.toLowerCase().includes('name') ? 'name' :
        type === 'text' && placeholder?.toLowerCase().includes('address') ? 'address' :
        undefined
      }
    />
  );
}