import { CheckCircle, X } from 'lucide-react';
import { useEffect, useState } from 'react';

interface SuccessNotificationProps {
  message: string;
  onDismiss?: () => void;
  autoHide?: boolean;
  duration?: number;
}

export function SuccessNotification({ 
  message, 
  onDismiss, 
  autoHide = true, 
  duration = 5000 
}: SuccessNotificationProps) {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (autoHide) {
      const timer = setTimeout(() => {
        setIsVisible(false);
        onDismiss?.();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [autoHide, duration, onDismiss]);

  if (!isVisible) return null;

  return (
    <div className="fixed top-4 right-4 max-w-md p-4 bg-green-50 border border-green-200 rounded-lg shadow-lg z-50 transform transition-all duration-300 ease-out translate-x-0">
      <div className="flex items-start space-x-3">
        <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
        
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-green-800">
            Success!
          </p>
          <p className="text-sm text-green-700 mt-1">
            {message}
          </p>
        </div>
        
        {onDismiss && (
          <button
            onClick={() => {
              setIsVisible(false);
              onDismiss();
            }}
            className="flex-shrink-0 p-1 hover:bg-green-100 rounded transition-colors"
          >
            <X className="w-4 h-4 text-green-600" />
          </button>
        )}
      </div>
    </div>
  );
}