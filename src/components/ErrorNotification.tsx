import React from 'react';
import { AlertCircle } from 'lucide-react';

interface ErrorNotificationProps {
  message: string;
  onClose: () => void;
}

export function ErrorNotification({ message, onClose }: ErrorNotificationProps) {
  return (
    <div className="fixed top-4 right-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
      <AlertCircle className="h-5 w-5 text-red-600" />
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 text-red-600 hover:text-red-800 font-bold text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}