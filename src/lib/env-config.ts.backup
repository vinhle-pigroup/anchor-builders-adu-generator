/**
 * Environment configuration and validation for Anchor Builders ADU Generator
 */

interface AppConfig {
  // Company Information
  companyName: string;
  companyWebsite: string;
  supportEmail: string;
  supportPhone: string;
  
  // Google Maps Configuration
  googleMaps: {
    apiKey: string  < /dev/null |  null;
    defaultZoom: number;
    imageSize: string;
    headerSize: string;
    enabled: boolean;
  };
  
  // API Configuration
  apiUrl: string | null;
  apiKey: string | null;
  
  // Feature Flags
  features: {
    analytics: boolean;
    errorReporting: boolean;
    pdfGeneration: boolean;
    googleMaps: boolean;
  };
  
  // Environment
  isDevelopment: boolean;
  isProduction: boolean;
}

/**
 * Get environment variable with optional default value
 */
function getEnvVar(key: string, defaultValue?: string): string | null {
  const value = import.meta.env[key];
  return value \!== undefined ? value : (defaultValue || null);
}

/**
 * Get boolean environment variable
 */
function getBooleanEnv(key: string, defaultValue: boolean = false): boolean {
  const value = getEnvVar(key);
  if (\!value) return defaultValue;
  return value.toLowerCase() === 'true' || value === '1';
}

/**
 * Get number environment variable
 */
function getNumberEnv(key: string, defaultValue: number): number {
  const value = getEnvVar(key);
  if (\!value) return defaultValue;
  const parsed = parseInt(value, 10);
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Application configuration object
 */
export const appConfig: AppConfig = {
  // Company Information
  companyName: getEnvVar('VITE_COMPANY_NAME') || 'Anchor Builders',
  companyWebsite: getEnvVar('VITE_COMPANY_WEBSITE') || 'https://www.anchorbuilders.io',
  supportEmail: getEnvVar('VITE_SUPPORT_EMAIL') || 'support@anchorbuilders.io',
  supportPhone: getEnvVar('VITE_SUPPORT_PHONE') || '(555) 123-4567',
  
  // Google Maps Configuration
  googleMaps: {
    apiKey: getEnvVar('VITE_GOOGLE_MAPS_API_KEY'),
    defaultZoom: getNumberEnv('VITE_GOOGLE_MAPS_DEFAULT_ZOOM', 19),
    imageSize: getEnvVar('VITE_GOOGLE_MAPS_IMAGE_SIZE') || '800x600',
    headerSize: getEnvVar('VITE_GOOGLE_MAPS_HEADER_SIZE') || '120x80',
    enabled: getBooleanEnv('VITE_ENABLE_GOOGLE_MAPS', true),
  },
  
  // API Configuration
  apiUrl: getEnvVar('VITE_API_URL'),
  apiKey: getEnvVar('VITE_API_KEY'),
  
  // Feature Flags
  features: {
    analytics: getBooleanEnv('VITE_ENABLE_ANALYTICS', false),
    errorReporting: getBooleanEnv('VITE_ENABLE_ERROR_REPORTING', false),
    pdfGeneration: getBooleanEnv('VITE_ENABLE_PDF_GENERATION', true),
    googleMaps: getBooleanEnv('VITE_ENABLE_GOOGLE_MAPS', true),
  },
  
  // Environment
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
};

/**
 * Validate required environment variables
 */
export function validateEnvironment(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  // Check Google Maps configuration if enabled
  if (appConfig.features.googleMaps && appConfig.googleMaps.enabled) {
    if (\!appConfig.googleMaps.apiKey) {
      errors.push('VITE_GOOGLE_MAPS_API_KEY is required when Google Maps is enabled');
    }
  }
  
  // Check API configuration if PDF generation is enabled
  if (appConfig.features.pdfGeneration) {
    if (\!appConfig.apiUrl) {
      console.warn('VITE_API_URL not set - PDF generation may not work');
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Log configuration status (development only)
 */
export function logConfigStatus(): void {
  if (\!appConfig.isDevelopment) return;
  
  console.group('🔧 App Configuration');
  console.log('Environment:', appConfig.isProduction ? 'production' : 'development');
  console.log('Google Maps:', appConfig.googleMaps.enabled ? '✅ enabled' : '❌ disabled');
  console.log('PDF Generation:', appConfig.features.pdfGeneration ? '✅ enabled' : '❌ disabled');
  console.log('API URL:', appConfig.apiUrl || 'not configured');
  
  const validation = validateEnvironment();
  if (\!validation.isValid) {
    console.warn('Configuration errors:', validation.errors);
  }
  
  console.groupEnd();
}

/**
 * Export specific config sections for convenience
 */
export const googleMapsConfig = appConfig.googleMaps;
export const companyConfig = {
  name: appConfig.companyName,
  website: appConfig.companyWebsite,
  email: appConfig.supportEmail,
  phone: appConfig.supportPhone,
};
