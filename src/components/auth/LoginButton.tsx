import React from 'react';
import { useMsal } from '@azure/msal-react';
import { loginRequest } from '../../auth/msal-config';
import { LogIn } from 'lucide-react';

export const LoginButton: React.FC = () => {
  const { instance } = useMsal();

  const handleLogin = async () => {
    try {
      // Try popup first for better UX
      await instance.loginPopup(loginRequest);
    } catch (popupError) {
      console.warn('Popup blocked, falling back to redirect', popupError);
      // Fallback to redirect if popup is blocked
      await instance.loginRedirect(loginRequest);
    }
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
      aria-label="Sign in with Microsoft"
    >
      <LogIn className="w-4 h-4" />
      Sign in with Microsoft
    </button>
  );
};