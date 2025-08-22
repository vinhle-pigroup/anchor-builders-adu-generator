import React from 'react';
import { useMsal } from '@azure/msal-react';
import { LogOut } from 'lucide-react';

export const LogoutButton: React.FC = () => {
  const { instance } = useMsal();

  const handleLogout = () => {
    // Clear any app-specific data from localStorage (except MSAL cache)
    const keysToKeep = ['msal', 'anchor-pricing-config', 'anchor-download-preferences'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!keysToKeep.some(keepKey => key.includes(keepKey))) {
        // Clear non-essential data
        // localStorage.removeItem(key);
      }
    });

    // Logout redirect
    instance.logoutRedirect({
      postLogoutRedirectUri: window.location.origin,
    });
  };

  return (
    <button
      onClick={handleLogout}
      className="flex items-center gap-2 px-3 py-1.5 text-gray-700 hover:text-red-600 transition-colors"
      aria-label="Sign out"
    >
      <LogOut className="w-4 h-4" />
      Sign out
    </button>
  );
};