import React from 'react';
import { useMsal } from '@azure/msal-react';
import { User, Shield } from 'lucide-react';
import { isAdmin } from '../../auth/msal-config';
import { LogoutButton } from './LogoutButton';

export const UserProfile: React.FC = () => {
  const { accounts } = useMsal();
  
  if (accounts.length === 0) {
    return null;
  }

  const account = accounts[0];
  const userIsAdmin = isAdmin();
  
  // Extract display name or email
  const displayName = account.name || account.username?.split('@')[0] || 'User';
  const email = account.username || '';

  return (
    <div className="flex items-center gap-4 p-2 bg-white rounded-lg shadow-sm border border-gray-200">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-full">
          <User className="w-5 h-5 text-blue-600" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-900">{displayName}</span>
            {userIsAdmin && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-medium text-blue-600 bg-blue-100 rounded-full">
                <Shield className="w-3 h-3" />
                Admin
              </span>
            )}
          </div>
          <span className="text-xs text-gray-500">{email}</span>
        </div>
      </div>
      <LogoutButton />
    </div>
  );
};