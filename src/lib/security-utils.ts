/**
 * Security utilities for input validation and sanitization
 * Anchor Builders ADU Generator - Phase 5 Security Implementation
 */

/**
 * Sanitize HTML input to prevent XSS attacks
 * Escapes HTML special characters and limits input length
 */
export function sanitizeHtmlInput(input: string): string {
  if (typeof input !== 'string') {
    return '';
  }
  
  return input
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .trim()
    .slice(0, 500); // Prevent excessively long inputs
}

/**
 * Validate email format with comprehensive regex
 * Prevents malformed email addresses and limits length
 */
export function validateEmail(email: string): boolean {
  if (typeof email !== 'string' || email.length > 320) {
    return false;
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number format
 * Accepts various US phone number formats
 */
export function validatePhone(phone: string): boolean {
  if (typeof phone !== 'string') {
    return false;
  }
  
  const cleanPhone = phone.replace(/\D/g, '');
  return cleanPhone.length === 10 || cleanPhone.length === 11;
}

/**
 * Validate and sanitize address input
 * Prevents injection while allowing normal address characters
 */
export function sanitizeAddress(address: string): string {
  if (typeof address !== 'string') {
    return '';
  }
  
  return address
    .replace(/[<>'"&]/g, (char) => {
      const entities: Record<string, string> = {
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#x27;',
        '&': '&amp;'
      };
      return entities[char] || char;
    })
    .replace(/[^\w\s,.#-]/g, '') // Allow only alphanumeric, spaces, commas, periods, hashes, hyphens
    .trim()
    .slice(0, 200);
}

/**
 * Validate ZIP code format
 * Supports 5-digit and ZIP+4 formats
 */
export function validateZipCode(zip: string): boolean {
  if (typeof zip !== 'string') {
    return false;
  }
  
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zip);
}

/**
 * Sanitize text input for PDF template usage
 * Prevents template injection and malicious content
 */
export function sanitizeTemplateValue(value: string): string {
  if (typeof value !== 'string') {
    return '';
  }
  
  return value
    .replace(/[{}]/g, '') // Remove template syntax characters
    .replace(/[<>]/g, (char) => char === '<' ? '&lt;' : '&gt;')
    .replace(/['"]/g, (char) => char === '"' ? '&quot;' : '&#x27;')
    .trim()
    .slice(0, 1000); // Limit length for PDF templates
}

/**
 * Validate numeric input (square footage, bedrooms, etc.)
 * Ensures positive integers within reasonable ranges
 */
export function validatePositiveInteger(value: string | number, max: number = 10000): boolean {
  const num = typeof value === 'string' ? parseInt(value, 10) : value;
  return Number.isInteger(num) && num > 0 && num <= max;
}

/**
 * Sanitize textarea content (additional notes, descriptions)
 * Allows more characters than regular input but prevents script injection
 */
export function sanitizeTextarea(content: string): string {
  if (typeof content !== 'string') {
    return '';
  }
  
  return content
    .replace(/[<>]/g, (char) => char === '<' ? '&lt;' : '&gt;')
    .replace(/javascript:/gi, '') // Remove javascript: protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
    .trim()
    .slice(0, 2000); // Allow longer content for descriptions
}

/**
 * Rate limiter for API requests
 * Prevents abuse of PDF generation and other APIs
 */
export class RateLimiter {
  private attempts: Map<string, number[]> = new Map();
  
  /**
   * Check if an action is allowed based on rate limiting
   * @param identifier - Unique identifier (IP, user ID, etc.)
   * @param maxAttempts - Maximum attempts allowed in time window
   * @param timeWindow - Time window in milliseconds (default 1 minute)
   */
  isAllowed(identifier: string, maxAttempts: number = 5, timeWindow: number = 60000): boolean {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    
    // Filter to only recent attempts within time window
    const recentAttempts = userAttempts.filter(time => now - time < timeWindow);
    
    if (recentAttempts.length >= maxAttempts) {
      return false;
    }
    
    // Add current attempt
    recentAttempts.push(now);
    this.attempts.set(identifier, recentAttempts);
    
    // Clean up old entries periodically
    if (Math.random() < 0.01) { // 1% chance to clean up
      this.cleanup(timeWindow * 2);
    }
    
    return true;
  }
  
  /**
   * Clean up old rate limiting entries
   */
  private cleanup(olderThan: number): void {
    const now = Date.now();
    for (const [key, attempts] of this.attempts.entries()) {
      const recentAttempts = attempts.filter(time => now - time < olderThan);
      if (recentAttempts.length === 0) {
        this.attempts.delete(key);
      } else {
        this.attempts.set(key, recentAttempts);
      }
    }
  }
  
  /**
   * Get current attempt count for identifier
   */
  getAttemptCount(identifier: string, timeWindow: number = 60000): number {
    const now = Date.now();
    const userAttempts = this.attempts.get(identifier) || [];
    return userAttempts.filter(time => now - time < timeWindow).length;
  }
}

/**
 * Global rate limiter instance for PDF generation
 */
export const pdfRateLimiter = new RateLimiter();

/**
 * Validate file import data structure
 * Prevents malicious JSON imports
 */
export function validateImportData(data: any): boolean {
  if (!Array.isArray(data)) {
    return false;
  }
  
  // Check each item has required structure
  return data.every(item => 
    typeof item === 'object' &&
    item.id &&
    typeof item.id === 'string' &&
    item.client &&
    typeof item.client === 'object'
  );
}

/**
 * Security configuration validation
 * Ensures environment is properly configured for security
 */
export function validateSecurityConfig(): { isValid: boolean; warnings: string[] } {
  const warnings: string[] = [];
  
  // Check if running in development with potential security risks
  if (import.meta.env.DEV) {
    warnings.push('Running in development mode - ensure security features are enabled in production');
  }
  
  // Check for HTTPS in production
  if (import.meta.env.PROD && !window.location.protocol.startsWith('https:')) {
    warnings.push('Production deployment should use HTTPS');
  }
  
  // Check API configuration
  if (!import.meta.env.VITE_API_URL) {
    warnings.push('API URL not configured - PDF generation may not work');
  }
  
  return {
    isValid: warnings.length === 0,
    warnings
  };
}