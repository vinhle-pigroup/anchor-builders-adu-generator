import { AlertTriangle, X, RefreshCw, Wifi, FileX, AlertCircle } from 'lucide-react';
import { ErrorState } from '../hooks/useErrorHandler';

interface ErrorNotificationProps {
  error: ErrorState;
  onDismiss: () => void;
  onRetry?: () => void;
}

const getErrorIcon = (type: ErrorState['type']) => {
  switch (type) {
    case 'network':
      return <Wifi className='w-5 h-5' />;
    case 'pdf':
      return <FileX className='w-5 h-5' />;
    case 'validation':
      return <AlertCircle className='w-5 h-5' />;
    case 'storage':
      return <AlertTriangle className='w-5 h-5' />;
    default:
      return <AlertTriangle className='w-5 h-5' />;
  }
};

const getErrorColor = (type: ErrorState['type']) => {
  switch (type) {
    case 'network':
      return 'bg-orange-50 border-orange-200 text-orange-800';
    case 'pdf':
      return 'bg-red-50 border-red-200 text-red-800';
    case 'validation':
      return 'bg-yellow-50 border-yellow-200 text-yellow-800';
    case 'storage':
      return 'bg-purple-50 border-purple-200 text-purple-800';
    default:
      return 'bg-red-50 border-red-200 text-red-800';
  }
};

export function ErrorNotification({ error, onDismiss, onRetry }: ErrorNotificationProps) {
  const colorClasses = getErrorColor(error.type);
  const icon = getErrorIcon(error.type);

  return (
    <div
      className={`fixed top-4 right-4 max-w-md p-4 border rounded-lg shadow-lg z-50 ${colorClasses}`}
    >
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0'>{icon}</div>

        <div className='flex-1 min-w-0'>
          <p className='text-sm font-medium'>
            Error: {error.type.charAt(0).toUpperCase() + error.type.slice(1)}
          </p>
          <p className='text-sm opacity-90 mt-1'>{error.message}</p>

          {error.retryable && onRetry && (
            <button
              onClick={onRetry}
              className='mt-2 inline-flex items-center space-x-1 text-xs font-medium hover:underline'
            >
              <RefreshCw className='w-3 h-3' />
              <span>Try Again</span>
            </button>
          )}
        </div>

        <button
          onClick={onDismiss}
          className='flex-shrink-0 p-1 hover:bg-black/10 rounded transition-colors'
        >
          <X className='w-4 h-4' />
        </button>
      </div>
    </div>
  );
}
