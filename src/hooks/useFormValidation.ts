import { useState, useCallback } from 'react';
import type { AnchorProposalFormData } from '../types/proposal';

export interface ValidationError {
  fieldName: string;
  message: string;
  type: 'required' | 'format' | 'range';
}

export interface ValidationState {
  errors: ValidationError[];
  touchedFields: Set<string>;
  isValid: boolean;
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d\s\-\(\)\+\.]{10,}$/;
const ZIP_CODE_REGEX = /^\d{5}(-\d{4})?$/;

export function useFormValidation() {
  const [validationState, setValidationState] = useState<ValidationState>({
    errors: [],
    touchedFields: new Set(),
    isValid: false,
  });

  const validateFormField = useCallback((fieldName: string, value: any): ValidationError[] => {
    const errors: ValidationError[] = [];

    // Client Information Validation
    if (fieldName === 'client.firstName' && (!value || value.trim() === '')) {
      errors.push({ fieldName, message: 'First name is required', type: 'required' });
    }

    if (fieldName === 'client.lastName' && (!value || value.trim() === '')) {
      errors.push({ fieldName, message: 'Last name is required', type: 'required' });
    }

    if (fieldName === 'client.email') {
      if (!value || value.trim() === '') {
        errors.push({ fieldName, message: 'Email is required', type: 'required' });
      } else if (!EMAIL_REGEX.test(value)) {
        errors.push({ fieldName, message: 'Please enter a valid email address', type: 'format' });
      }
    }

    if (fieldName === 'client.phone') {
      if (!value || value.trim() === '') {
        errors.push({ fieldName, message: 'Phone number is required', type: 'required' });
      } else if (!PHONE_REGEX.test(value)) {
        errors.push({ fieldName, message: 'Please enter a valid phone number', type: 'format' });
      }
    }

    if (fieldName === 'client.address' && (!value || value.trim() === '')) {
      errors.push({ fieldName, message: 'Address is required', type: 'required' });
    }

    if (fieldName === 'client.city' && (!value || value.trim() === '')) {
      errors.push({ fieldName, message: 'City is required', type: 'required' });
    }

    if (fieldName === 'client.state' && (!value || value.trim() === '')) {
      errors.push({ fieldName, message: 'State is required', type: 'required' });
    }

    if (fieldName === 'client.zipCode') {
      if (!value || value.trim() === '') {
        errors.push({ fieldName, message: 'ZIP code is required', type: 'required' });
      } else if (!ZIP_CODE_REGEX.test(value)) {
        errors.push({
          fieldName,
          message: 'Please enter a valid ZIP code (12345 or 12345-6789)',
          type: 'format',
        });
      }
    }

    // Project Information Validation
    if (fieldName === 'project.squareFootage') {
      if (!value || value <= 0) {
        errors.push({
          fieldName,
          message: 'Square footage is required and must be greater than 0',
          type: 'required',
        });
      } else if (value < 200) {
        errors.push({ fieldName, message: 'Minimum ADU size is 200 sq ft', type: 'range' });
      } else if (value > 2000) {
        errors.push({ fieldName, message: 'Maximum ADU size is 2000 sq ft', type: 'range' });
      }
    }

    if (fieldName === 'project.bedrooms') {
      if (!value || value <= 0) {
        errors.push({ fieldName, message: 'Number of bedrooms is required', type: 'required' });
      } else if (value > 5) {
        errors.push({ fieldName, message: 'Maximum 5 bedrooms allowed', type: 'range' });
      }
    }

    if (fieldName === 'project.bathrooms') {
      if (!value || value <= 0) {
        errors.push({ fieldName, message: 'Number of bathrooms is required', type: 'required' });
      } else if (value > 4) {
        errors.push({ fieldName, message: 'Maximum 4 bathrooms allowed', type: 'range' });
      }
    }

    return errors;
  }, []);

  const validateForm = useCallback(
    (formData: AnchorProposalFormData): ValidationState => {
      const allErrors: ValidationError[] = [];

      // Required client fields
      const requiredFields = [
        'client.firstName',
        'client.lastName',
        'client.email',
        'client.phone',
        'client.address',
        'client.city',
        'client.state',
        'client.zipCode',
        'project.squareFootage',
        'project.bedrooms',
        'project.bathrooms',
      ];

      requiredFields.forEach(fieldName => {
        const value = getNestedValue(formData, fieldName);
        const fieldErrors = validateFormField(fieldName, value);
        allErrors.push(...fieldErrors);
      });

      const newState: ValidationState = {
        errors: allErrors,
        touchedFields: new Set(requiredFields),
        isValid: allErrors.length === 0,
      };

      setValidationState(newState);
      return newState;
    },
    [validateFormField]
  );

  const validateSingleField = useCallback(
    (fieldName: string, value: any) => {
      const fieldErrors = validateFormField(fieldName, value);

      setValidationState(prev => {
        const newErrors = prev.errors.filter(error => error.fieldName !== fieldName);
        newErrors.push(...fieldErrors);

        const newTouchedFields = new Set(prev.touchedFields);
        newTouchedFields.add(fieldName);

        return {
          errors: newErrors,
          touchedFields: newTouchedFields,
          isValid: newErrors.length === 0,
        };
      });

      return fieldErrors;
    },
    [validateFormField]
  );

  const markFieldTouched = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      touchedFields: new Set([...prev.touchedFields, fieldName]),
    }));
  }, []);

  const clearFieldError = useCallback((fieldName: string) => {
    setValidationState(prev => ({
      ...prev,
      errors: prev.errors.filter(error => error.fieldName !== fieldName),
    }));
  }, []);

  const getFieldError = useCallback(
    (fieldName: string): ValidationError | undefined => {
      return validationState.errors.find(error => error.fieldName === fieldName);
    },
    [validationState.errors]
  );

  const isFieldTouched = useCallback(
    (fieldName: string): boolean => {
      return validationState.touchedFields.has(fieldName);
    },
    [validationState.touchedFields]
  );

  const getRequiredFields = (): string[] => {
    return [
      'client.firstName',
      'client.lastName',
      'client.email',
      'client.phone',
      'client.address',
      'client.city',
      'client.state',
      'client.zipCode',
      'project.squareFootage',
      'project.bedrooms',
      'project.bathrooms',
    ];
  };

  return {
    validationState,
    validateForm,
    validateSingleField,
    markFieldTouched,
    clearFieldError,
    getFieldError,
    isFieldTouched,
    getRequiredFields,
  };
}

// Helper function to get nested object values
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((current, nestedProperty) => current?.[nestedProperty], obj);
}
