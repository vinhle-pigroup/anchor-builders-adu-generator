import React from 'react';

interface LoadingWindowProps {
  message?: string;
  subMessage?: string;
  progress?: number; // 0-100
  showProgress?: boolean;
}

export const LoadingWindow: React.FC<LoadingWindowProps> = ({
  message = "Processing...",
  subMessage = "Please wait",
  progress = 75,
  showProgress = true
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]">
      <div className="bg-white rounded-lg p-8 shadow-2xl max-w-md w-full mx-4">
        <div className="flex flex-col items-center">
          {/* Spinning loader */}
          <svg 
            className="animate-spin h-12 w-12 text-blue-600 mb-4" 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            />
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          
          {/* Main message */}
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            {message}
          </h2>
          
          {/* Sub message */}
          <p className="text-gray-600 text-center mb-4">
            {subMessage}
          </p>
          
          {/* Progress bar */}
          {showProgress && (
            <>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-out"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="text-sm text-gray-500 mt-2">
                {progress}% complete
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// Alternative styles without Tailwind
export const LoadingWindowCSS = `
.loading-window-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
}

.loading-window-content {
  background: white;
  border-radius: 8px;
  padding: 32px;
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
  max-width: 400px;
  width: 100%;
  margin: 0 16px;
}

.loading-window-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.loading-spinner {
  width: 48px;
  height: 48px;
  margin-bottom: 16px;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.loading-title {
  font-size: 20px;
  font-weight: bold;
  color: #111827;
  margin-bottom: 8px;
}

.loading-subtitle {
  color: #6b7280;
  text-align: center;
  margin-bottom: 16px;
}

.loading-progress-bar {
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;
}

.loading-progress-fill {
  height: 100%;
  background: #3b82f6;
  transition: width 0.3s ease-out;
}

.loading-progress-text {
  font-size: 14px;
  color: #9ca3af;
  margin-top: 8px;
  text-align: center;
}
`;

// Usage example without Tailwind
export const LoadingWindowPlain: React.FC<LoadingWindowProps> = ({
  message = "Processing...",
  subMessage = "Please wait",
  progress = 75,
  showProgress = true
}) => {
  return (
    <div className="loading-window-overlay">
      <div className="loading-window-content">
        <div className="loading-window-inner">
          <svg className="loading-spinner" viewBox="0 0 24 24">
            <circle 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
              fill="none"
              opacity="0.25"
            />
            <path 
              fill="currentColor"
              opacity="0.75"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          
          <h2 className="loading-title">{message}</h2>
          <p className="loading-subtitle">{subMessage}</p>
          
          {showProgress && (
            <>
              <div className="loading-progress-bar">
                <div 
                  className="loading-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <p className="loading-progress-text">{progress}% complete</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
};