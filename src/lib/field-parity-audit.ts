/**
 * Development-only field parity audit
 * Ensures no form fields go missing during layout changes
 */

// Helper to flatten nested object keys into dot notation
export const flattenObjectKeys = (obj: any, prefix = ''): string[] => {
  let keys: string[] = [];
  
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      
      if (typeof obj[key] === 'object' && obj[key] !== null && !Array.isArray(obj[key])) {
        // Recursively flatten nested objects
        keys = keys.concat(flattenObjectKeys(obj[key], fullKey));
      } else {
        // Add the key
        keys.push(fullKey);
      }
    }
  }
  
  return keys;
};

// Field parity audit function
export const auditFormFields = (
  formData: any, 
  renderedFields: string[], 
  componentName: string = 'Unknown'
) => {
  if (process.env.NODE_ENV !== 'development') {
    return; // Only run in development
  }

  const expectedFields = flattenObjectKeys(formData);
  const missing = expectedFields.filter(field => !renderedFields.includes(field));
  
  if (missing.length > 0) {
    console.group(`🚨 FIELD PARITY AUDIT - ${componentName}`);
    console.warn('Missing fields from rendered form:', missing);
    console.log('Expected fields:', expectedFields);
    console.log('Rendered fields:', renderedFields);
    console.groupEnd();
  } else {
    console.log(`✅ Field parity check passed for ${componentName}`);
  }
  
  return {
    passed: missing.length === 0,
    missing,
    expectedFields,
    renderedFields
  };
};

// Helper to track rendered fields in components
export const createFieldTracker = () => {
  const renderedFields: string[] = [];
  
  const trackField = (fieldPath: string) => {
    if (!renderedFields.includes(fieldPath)) {
      renderedFields.push(fieldPath);
    }
  };
  
  const getTrackedFields = () => renderedFields;
  
  return { trackField, getTrackedFields };
};