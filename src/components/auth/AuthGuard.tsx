import React from 'react';
import { useMsal } from '@azure/msal-react';
import { LoginButton } from './LoginButton';
import { isAdmin as checkIsAdmin } from '../../auth/msal-config';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAdmin?: boolean;
  fallback?: React.ReactNode;
}

/**
 * Simple auth guard component
 * Protects content behind authentication
 */
export const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAdmin = false,
  fallback = null 
}) => {
  const { accounts } = useMsal();
  const isAuthenticated = accounts.length > 0;
  const isAdmin = checkIsAdmin();

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Authentication Required</h3>
        <p className="text-sm text-gray-600 mb-4">Please sign in to access this feature.</p>
        <LoginButton />
      </div>
    );
  }

  // Authenticated but needs admin
  if (requireAdmin && !isAdmin) {
    if (fallback) {
      return <>{fallback}</>;
    }
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-yellow-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Admin Access Required</h3>
        <p className="text-sm text-gray-600">You need administrator privileges to access this feature.</p>
      </div>
    );
  }

  // All checks passed
  return <>{children}</>;
};