import { Configuration, LogLevel, PublicClientApplication } from '@azure/msal-browser';

/**
 * MSAL Configuration for Anchor Builders ADU Generator
 * Using localStorage for better UX in internal app (survives tab closes)
 * Simplified setup without over-engineering for internal use
 */

export const msalConfig: Configuration = {
  auth: {
    clientId: import.meta.env.VITE_MSAL_CLIENT_ID || '',
    authority: `https://login.microsoftonline.com/${import.meta.env.VITE_MSAL_TENANT_ID || ''}`,
    redirectUri: import.meta.env.VITE_MSAL_REDIRECT_URI || window.location.origin,
    postLogoutRedirectUri: import.meta.env.VITE_MSAL_POST_LOGOUT_URI || window.location.origin,
    navigateToLoginRequestUrl: false, // Prevent navigation issues
  },
  cache: {
    cacheLocation: 'localStorage', // Better for internal app - survives tab closes
    storeAuthStateInCookie: false, // We don't need IE11 support
  },
  system: {
    loggerOptions: {
      loggerCallback: (level, message, containsPii) => {
        if (containsPii) return;
        if (!import.meta.env.DEV) return; // Only log in development

        switch (level) {
          case LogLevel.Error:
            console.error(`[MSAL] ${message}`);
            break;
          case LogLevel.Warning:
            console.warn(`[MSAL] ${message}`);
            break;
          case LogLevel.Info:
            console.info(`[MSAL] ${message}`);
            break;
          case LogLevel.Verbose:
            console.debug(`[MSAL] ${message}`);
            break;
        }
      },
      logLevel: import.meta.env.DEV ? LogLevel.Info : LogLevel.Error,
      piiLoggingEnabled: false,
    },
  },
};

// Initialize MSAL instance
export const msalInstance = new PublicClientApplication(msalConfig);

// Login request configuration
export const loginRequest = {
  scopes: ['User.Read'], // Basic user profile access
  prompt: 'select_account' as const, // Always show account selection
};

// Optional: Graph API configuration if needed later
export const graphConfig = {
  graphMeEndpoint: 'https://graph.microsoft.com/v1.0/me',
};

// Helper to check if auth is enabled
export const isAuthEnabled = (): boolean => {
  return import.meta.env.VITE_REQUIRE_AUTH === 'true';
};

// Helper to get current account
export const getCurrentAccount = () => {
  const accounts = msalInstance.getAllAccounts();
  if (accounts.length > 0) {
    return accounts[0];
  }
  return null;
};

// Helper to check if user is authenticated
export const isAuthenticated = (): boolean => {
  return msalInstance.getAllAccounts().length > 0;
};

// Helper to check if user has admin role (simplified for now)
export const isAdmin = (): boolean => {
  const account = getCurrentAccount();
  if (!account) return false;
  
  // For now, check if email ends with @anchorbuilders.io or specific emails
  const adminEmails = [
    'admin@anchorbuilders.io',
    'vinh@anchorbuilders.io',
    // Add more admin emails as needed
  ];
  
  const userEmail = account.username?.toLowerCase();
  return adminEmails.some(email => userEmail === email.toLowerCase()) ||
         userEmail?.endsWith('@anchorbuilders.io') || false;
};