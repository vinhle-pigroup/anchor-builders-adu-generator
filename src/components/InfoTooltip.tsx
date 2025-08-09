import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface InfoTooltipProps {
  description: string;
  className?: string;
}

export const InfoTooltip: React.FC<InfoTooltipProps> = ({ description, className = '' }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div className={`relative inline-block ${className}`}>
      {/* Info button */}
      <button
        type="button"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onClick={() => setIsVisible(!isVisible)} // For mobile tap
        className="w-4 h-4 text-slate-400 hover:text-blue-600 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded-full"
        aria-label="More information"
      >
        <Info className="w-4 h-4" />
      </button>

      {/* Tooltip */}
      {isVisible && (
        <div className="absolute z-50 bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-64 p-2 bg-slate-900 text-white text-xs rounded-lg shadow-lg">
          <div className="relative">
            {description}
            {/* Arrow pointing down */}
            <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-l-4 border-r-4 border-t-4 border-transparent border-t-slate-900"></div>
          </div>
        </div>
      )}
    </div>
  );
};