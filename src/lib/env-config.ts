/**
 * Environment configuration for Anchor Builders ADU Generator
 */

export const appConfig = {
  isDevelopment: import.meta.env.DEV,
  isProduction: import.meta.env.PROD,
  googleMaps: {
    apiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || null,
    enabled: false, // Disabled for now
  },
  features: {
    googleMaps: false,
    pdfGeneration: true,
    analytics: false,
    errorReporting: false,
  },
};

export function logConfigStatus() {
  if (appConfig.isDevelopment) {
    console.log('🔧 Anchor Builders ADU Generator - Config Status');
    console.log('Environment:', appConfig.isProduction ? 'production' : 'development');
    console.log('Features:', appConfig.features);
  }
}

export function validateEnvironment() {
  return { isValid: true, errors: [] };
}