import { FileText } from 'lucide-react';

interface PDFProgressIndicatorProps {
  isGenerating: boolean;
  progress?: number;
  message?: string;
}

export function PDFProgressIndicator({ isGenerating, progress = 0, message = "Generating PDF..." }: PDFProgressIndicatorProps) {
  if (!isGenerating) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-50 border border-blue-200 text-blue-800 px-6 py-4 rounded-lg shadow-lg z-50">
      <div className="flex items-center gap-3">
        <FileText className="h-5 w-5 animate-pulse" />
        <div>
          <p className="font-medium">{message}</p>
          {progress > 0 && (
            <div className="w-64 bg-blue-200 rounded-full h-2 mt-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ width: `${Math.min(progress, 100)}%` }}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}