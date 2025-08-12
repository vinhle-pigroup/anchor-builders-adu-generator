import React from 'react';
import { CheckCircle } from 'lucide-react';

interface SuccessNotificationProps {
  message: string;
  onClose: () => void;
}

export function SuccessNotification({ message, onClose }: SuccessNotificationProps) {
  return (
    <div className="fixed top-4 right-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50">
      <CheckCircle className="h-5 w-5 text-green-600" />
      <span>{message}</span>
      <button 
        onClick={onClose}
        className="ml-2 text-green-600 hover:text-green-800 font-bold text-lg leading-none"
      >
        ×
      </button>
    </div>
  );
}