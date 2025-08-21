/**
 * Field formatters and validators for form inputs
 */

/**
 * Format phone number as (XXX) XXX-XXXX
 */
export function formatPhoneNumber(value: string): string {
  // Remove all non-digits
  const numbers = value.replace(/\D/g, '');
  
  // Limit to 10 digits
  const trimmed = numbers.substring(0, 10);
  
  // Format based on length
  if (trimmed.length === 0) return '';
  if (trimmed.length <= 3) return `(${trimmed}`;
  if (trimmed.length <= 6) return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3)}`;
  return `(${trimmed.slice(0, 3)}) ${trimmed.slice(3, 6)}-${trimmed.slice(6)}`;
}

/**
 * Format name with proper capitalization
 */
export function formatName(value: string): string {
  if (!value) return '';
  
  // Split by spaces and hyphens, capitalize each part
  return value
    .split(/(\s+|-+)/)
    .map((part, index) => {
      // Keep spaces and hyphens as-is
      if (index % 2 === 1) return part;
      
      // Capitalize first letter of each word
      if (part.length === 0) return '';
      
      // Handle special cases like "McDonald", "O'Brien"
      if (part.toLowerCase().startsWith('mc') && part.length > 2) {
        return 'Mc' + part.charAt(2).toUpperCase() + part.slice(3).toLowerCase();
      }
      if (part.includes("'") && part.length > 2) {
        const parts = part.split("'");
        return parts.map(p => p.charAt(0).toUpperCase() + p.slice(1).toLowerCase()).join("'");
      }
      
      return part.charAt(0).toUpperCase() + part.slice(1).toLowerCase();
    })
    .join('');
}

/**
 * Format address with proper capitalization
 */
export function formatAddress(value: string): string {
  if (!value) return '';
  
  // Common address abbreviations that should be uppercase
  const abbreviations = ['NE', 'NW', 'SE', 'SW', 'N', 'S', 'E', 'W', 'APT', 'STE', 'PO'];
  
  return value
    .split(' ')
    .map(word => {
      const upperWord = word.toUpperCase();
      
      // Keep abbreviations uppercase
      if (abbreviations.includes(upperWord)) {
        return upperWord;
      }
      
      // Keep numbers as-is
      if (/^\d+/.test(word)) {
        return word;
      }
      
      // Handle ordinals (1st, 2nd, 3rd, etc.)
      if (/^\d+(st|nd|rd|th)$/i.test(word)) {
        return word.toLowerCase();
      }
      
      // Capitalize first letter of regular words
      if (word.length === 0) return '';
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Format city name
 */
export function formatCity(value: string): string {
  if (!value) return '';
  
  // Handle multi-word cities like "Los Angeles", "San Francisco"
  return value
    .split(' ')
    .map(word => {
      if (word.length === 0) return '';
      
      // Keep certain words lowercase
      const lowercase = ['of', 'the'];
      if (lowercase.includes(word.toLowerCase()) && value.indexOf(word) > 0) {
        return word.toLowerCase();
      }
      
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    })
    .join(' ');
}

/**
 * Format state code to uppercase
 */
export function formatState(value: string): string {
  if (!value) return '';
  
  // Limit to 2 characters for state code
  const trimmed = value.substring(0, 2);
  return trimmed.toUpperCase();
}

/**
 * Format ZIP code
 */
export function formatZipCode(value: string): string {
  // Remove all non-digits
  const numbers = value.replace(/\D/g, '');
  
  // Limit to 9 digits (5 + 4 for ZIP+4)
  const trimmed = numbers.substring(0, 9);
  
  // Format as XXXXX or XXXXX-XXXX
  if (trimmed.length <= 5) return trimmed;
  return `${trimmed.slice(0, 5)}-${trimmed.slice(5)}`;
}

/**
 * Format email to lowercase
 */
export function formatEmail(value: string): string {
  return value.toLowerCase().trim();
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (must be 10 digits)
 */
export function isValidPhone(phone: string): boolean {
  const numbers = phone.replace(/\D/g, '');
  return numbers.length === 10;
}

/**
 * Validate ZIP code (5 or 9 digits)
 */
export function isValidZip(zip: string): boolean {
  const numbers = zip.replace(/\D/g, '');
  return numbers.length === 5 || numbers.length === 9;
}