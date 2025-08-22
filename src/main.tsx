import React from 'react';
import ReactDOM from 'react-dom/client';
import { MsalProvider } from '@azure/msal-react';
import { msalInstance, isAuthEnabled } from './auth/msal-config';
import App from './App.tsx';
import './index.css';

// Initialize MSAL instance
const initializeMsal = async () => {
  if (isAuthEnabled()) {
    await msalInstance.initialize();
    
    // Handle redirect response if coming back from auth
    try {
      await msalInstance.handleRedirectPromise();
    } catch (error) {
      console.error('Error handling redirect:', error);
    }
  }
};

// Initialize and render
initializeMsal().then(() => {
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      {isAuthEnabled() ? (
        <MsalProvider instance={msalInstance}>
          <App />
        </MsalProvider>
      ) : (
        <App />
      )}
    </React.StrictMode>,
  );
});
