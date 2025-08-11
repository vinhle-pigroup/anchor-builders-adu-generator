/**
 * Security utilities for PDF template generation
 */

// Rate limiting for PDF generation
class RateLimiter {
  private requests: number[] = [];
  private readonly maxRequests = 10;
  private readonly timeWindow = 60000; // 1 minute

  canMakeRequest(): boolean {
    const now = Date.now();
    this.requests = this.requests.filter(time => now - time < this.timeWindow);
    
    if (this.requests.length >= this.maxRequests) {
      return false;
    }
    
    this.requests.push(now);
    return true;
  }
}

export const pdfRateLimiter = new RateLimiter();

// Sanitize template values to prevent XSS
export function sanitizeTemplateValue(value: any): string {
  if (typeof value !== 'string') {
    value = String(value);
  }
  
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// Validation functions
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\d\s\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 10;
}

export function validateZipCode(zipCode: string): boolean {
  const zipRegex = /^\d{5}(-\d{4})?$/;
  return zipRegex.test(zipCode);
}

export function validatePositiveInteger(value: any): boolean {
  const num = Number(value);
  return Number.isInteger(num) && num > 0;
}

// Address sanitization function
export function sanitizeAddress(address: string): string {
  if (!address || typeof address !== 'string') {
    return '';
  }
  
  return address
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/[^\w\s\-\.\,\#]/g, '') // Allow only alphanumeric, spaces, hyphens, periods, commas, hash
    .substring(0, 200); // Limit length
}

// HTML input sanitization function
export function sanitizeHtmlInput(input: string): string {
  if (!input || typeof input !== 'string') {
    return '';
  }
  
  return input
    .trim()
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .substring(0, 1000); // Limit length
}