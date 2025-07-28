/**
 * Field formatting utilities for professional presentation
 * Auto-formats user input for consistent, professional appearance in PDFs
 */

/**
 * Format names to title case
 * Example: "john doe" → "John Doe"
 */
export function formatName(name: string): string {
  if (!name) return '';
  
  return name
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
}

/**
 * Format phone numbers to standard US format
 * Example: "5551234567" → "(555) 123-4567"
 */
export function formatPhoneNumber(phone: string): string {
  if (!phone) return '';
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // Handle different input lengths
  if (digits.length === 10) {
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
  } else if (digits.length === 11 && digits.startsWith('1')) {
    // Handle +1 country code
    return `(${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7)}`;
  } else if (digits.length >= 7) {
    // Fallback for partial numbers
    const area = digits.slice(0, 3);
    const prefix = digits.slice(3, 6);
    const suffix = digits.slice(6, 10);
    return `(${area}) ${prefix}-${suffix}`;
  }
  
  // Return original if can't format
  return phone;
}

/**
 * Format email to lowercase
 * Example: "John.Doe@Example.COM" → "john.doe@example.com"
 */
export function formatEmail(email: string): string {
  if (!email) return '';
  return email.toLowerCase().trim();
}

/**
 * Format street addresses with proper capitalization
 * Example: "123 main st" → "123 Main Street"
 */
export function formatAddress(address: string): string {
  if (!address) return '';
  
  // Common abbreviations mapping
  const abbreviations: Record<string, string> = {
    'st': 'Street',
    'ave': 'Avenue',
    'blvd': 'Boulevard',
    'dr': 'Drive',
    'ln': 'Lane',
    'rd': 'Road',
    'ct': 'Court',
    'pl': 'Place',
    'way': 'Way',
    'cir': 'Circle',
    'ter': 'Terrace',
    'pkwy': 'Parkway',
    'hwy': 'Highway',
    'apt': 'Apt',
    'ste': 'Suite',
    'unit': 'Unit',
    'bldg': 'Building',
    'fl': 'Floor',
    'n': 'N',
    'e': 'E',
    's': 'S',
    'w': 'W',
    'ne': 'NE',
    'nw': 'NW',
    'se': 'SE',
    'sw': 'SW'
  };
  
  return address
    .toLowerCase()
    .split(' ')
    .map(word => {
      // Handle abbreviations
      const cleanWord = word.replace(/[.,]/g, '');
      if (abbreviations[cleanWord]) {
        return abbreviations[cleanWord];
      }
      // Title case for regular words
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ')
    .trim();
}

/**
 * Format city names to title case
 * Example: "garden grove" → "Garden Grove"
 */
export function formatCity(city: string): string {
  if (!city) return '';
  
  return city
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
    .trim();
}

/**
 * Format and validate US state
 * Accepts full names or abbreviations, returns proper abbreviation
 * Example: "california" → "CA", "ca" → "CA"
 */
export function formatState(state: string): string {
  if (!state) return '';
  
  const stateMap: Record<string, string> = {
    'alabama': 'AL', 'alaska': 'AK', 'arizona': 'AZ', 'arkansas': 'AR',
    'california': 'CA', 'colorado': 'CO', 'connecticut': 'CT', 'delaware': 'DE',
    'florida': 'FL', 'georgia': 'GA', 'hawaii': 'HI', 'idaho': 'ID',
    'illinois': 'IL', 'indiana': 'IN', 'iowa': 'IA', 'kansas': 'KS',
    'kentucky': 'KY', 'louisiana': 'LA', 'maine': 'ME', 'maryland': 'MD',
    'massachusetts': 'MA', 'michigan': 'MI', 'minnesota': 'MN', 'mississippi': 'MS',
    'missouri': 'MO', 'montana': 'MT', 'nebraska': 'NE', 'nevada': 'NV',
    'new hampshire': 'NH', 'new jersey': 'NJ', 'new mexico': 'NM', 'new york': 'NY',
    'north carolina': 'NC', 'north dakota': 'ND', 'ohio': 'OH', 'oklahoma': 'OK',
    'oregon': 'OR', 'pennsylvania': 'PA', 'rhode island': 'RI', 'south carolina': 'SC',
    'south dakota': 'SD', 'tennessee': 'TN', 'texas': 'TX', 'utah': 'UT',
    'vermont': 'VT', 'virginia': 'VA', 'washington': 'WA', 'west virginia': 'WV',
    'wisconsin': 'WI', 'wyoming': 'WY'
  };
  
  const cleanState = state.toLowerCase().trim();
  
  // If it's already a valid abbreviation
  if (Object.values(stateMap).includes(state.toUpperCase())) {
    return state.toUpperCase();
  }
  
  // If it's a full state name
  if (stateMap[cleanState]) {
    return stateMap[cleanState];
  }
  
  // Return original if not found
  return state.toUpperCase();
}

/**
 * Format ZIP code
 * Example: "92840123" → "92840", "92840-1234" → "92840-1234"
 */
export function formatZipCode(zip: string): string {
  if (!zip) return '';
  
  // Remove all non-digit/hyphen characters
  const cleaned = zip.replace(/[^\d-]/g, '');
  
  // Handle 5-digit ZIP
  if (cleaned.length === 5) {
    return cleaned;
  }
  
  // Handle 9-digit ZIP (add hyphen if missing)
  if (cleaned.length === 9 && !cleaned.includes('-')) {
    return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
  }
  
  // Handle ZIP+4 format
  if (cleaned.includes('-') && cleaned.length === 10) {
    return cleaned;
  }
  
  // Return first 5 digits if longer
  if (cleaned.length > 5) {
    return cleaned.slice(0, 5);
  }
  
  return cleaned;
}

/**
 * Auto-format form field based on field type
 */
export function autoFormatField(fieldName: string, value: string): string {
  switch (fieldName) {
    case 'firstName':
    case 'lastName':
      return formatName(value);
    case 'phone':
      return formatPhoneNumber(value);
    case 'email':
      return formatEmail(value);
    case 'address':
      return formatAddress(value);
    case 'city':
      return formatCity(value);
    case 'state':
      return formatState(value);
    case 'zipCode':
      return formatZipCode(value);
    default:
      return value;
  }
}