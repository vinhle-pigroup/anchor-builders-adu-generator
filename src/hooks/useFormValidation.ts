/**
 * Form validation hook for ADU generator
 */

import { useState, useCallback } from 'react';

interface ValidationErrors {
  [key: string]: string;
}

export function useFormValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = useCallback((field: string, value: any): string => {
    switch (field) {
      case 'firstName':
      case 'lastName':
        return !value || value.trim() === '' ? 'This field is required' : '';
      case 'email':
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return !emailRegex.test(value) ? 'Please enter a valid email address' : '';
      case 'phone':
        const phoneRegex = /^[\d\s\-\(\)]+$/;
        return !phoneRegex.test(value) ? 'Please enter a valid phone number' : '';
      default:
        return '';
    }
  }, []);

  const validateForm = useCallback((formData: any): boolean => {
    const newErrors: ValidationErrors = {};
    
    // Validate required fields
    Object.keys(formData).forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [validateField]);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  return {
    errors,
    validateField,
    validateForm,
    clearErrors
  };
}