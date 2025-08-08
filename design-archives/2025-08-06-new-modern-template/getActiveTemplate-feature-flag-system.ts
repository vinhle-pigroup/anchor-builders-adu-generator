/**
 * Template Switcher Utility - Feature Flag System
 * Safely switches between MODERN-ENHANCED.html and NEW-MODERN.html
 * Based on VITE_TEMPLATE_VARIANT environment variable
 */

export const getActiveTemplate = (): string => {
  const variant = import.meta.env.VITE_TEMPLATE_VARIANT ?? 'LEGACY';
  
  // Return template filename based on feature flag
  return variant === 'NEW-MODERN' 
    ? 'NEW-MODERN.html' 
    : 'MODERN-ENHANCED.html';
};

/**
 * Get template display name for debugging/logging
 */
export const getTemplateDisplayName = (): string => {
  const variant = import.meta.env.VITE_TEMPLATE_VARIANT ?? 'LEGACY';
  
  return variant === 'NEW-MODERN' 
    ? 'New Modern Template' 
    : 'Legacy Modern Enhanced Template';
};

/**
 * Check if using new template variant
 */
export const isNewTemplate = (): boolean => {
  const variant = import.meta.env.VITE_TEMPLATE_VARIANT ?? 'LEGACY';
  return variant === 'NEW-MODERN';
};

/**
 * Get rollback instructions for current environment
 */
export const getRollbackInstructions = (): string => {
  return `
🔙 Rollback Instructions:
1. Set environment variable: VITE_TEMPLATE_VARIANT=LEGACY
2. Restart the application
3. Confirm PDFs render with legacy template

Current template: ${getTemplateDisplayName()}
`;
};