import React from 'react';
import type { ValidationError } from '../hooks/useFormValidation';

interface SelectOption {
  value: string;
  label: string;
}

interface ValidatedSelectProps {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  options: SelectOption[];
  placeholder?: string;
  error?: ValidationError;
  isTouched?: boolean;
  isValid?: boolean;
  className?: string;
  disabled?: boolean;
}

export function ValidatedSelect({
  value,
  onChange,
  onBlur,
  options,
  placeholder = 'Choose an option',
  error,
  isTouched = false,
  isValid = false,
  className = '',
  disabled = false
}: ValidatedSelectProps) {
  const hasError = error && isTouched;
  const showValid = isTouched && isValid && !error;

  // Dynamic styling based on validation state
  let selectStyles = 'w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors duration-200 bg-white';
  
  if (hasError) {
    selectStyles += ' border-red-300 focus:border-red-500 focus:ring-red-200';
  } else if (showValid) {
    selectStyles += ' border-green-300 focus:border-green-500 focus:ring-green-200';
  } else {
    selectStyles += ' border-slate-300 focus:border-blue-500 focus:ring-blue-200';
  }

  if (disabled) {
    selectStyles += ' bg-slate-100 text-slate-500 cursor-not-allowed';
  }

  // Add space for validation icon
  if (hasError || showValid) {
    selectStyles += ' pr-10';
  }

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onChange(e.target.value);
  };

  return (
    <select
      value={value}
      onChange={handleChange}
      onBlur={onBlur}
      className={`${selectStyles} ${className}`}
      disabled={disabled}
      aria-invalid={hasError}
      aria-describedby={hasError ? `${placeholder}-error` : undefined}
    >
      <option value="" disabled>
        {placeholder}
      </option>
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
}