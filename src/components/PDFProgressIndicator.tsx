import { FileText, CheckCircle, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';

interface PDFProgressStep {
  id: string;
  label: string;
  status: 'pending' | 'active' | 'completed' | 'error';
}

interface PDFProgressIndicatorProps {
  isGenerating: boolean;
  onComplete?: () => void;
  onError?: (error: any) => void;
}

export function PDFProgressIndicator({ isGenerating, onComplete, onError }: PDFProgressIndicatorProps) {
  const [steps, setSteps] = useState<PDFProgressStep[]>([
    { id: 'validate', label: 'Validating form data', status: 'pending' },
    { id: 'calculate', label: 'Calculating pricing', status: 'pending' },
    { id: 'template', label: 'Preparing template', status: 'pending' },
    { id: 'generate', label: 'Generating PDF', status: 'pending' },
  ]);

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    if (!isGenerating) {
      setSteps(steps => steps.map(step => ({ ...step, status: 'pending' })));
      setCurrentStepIndex(0);
      return;
    }

    const stepDuration = 800;
    const totalSteps = steps.length;

    const progressTimer = setInterval(() => {
      setCurrentStepIndex(prev => {
        const nextIndex = prev + 1;
        
        setSteps(currentSteps => currentSteps.map((step, index) => {
          if (index < nextIndex) {
            return { ...step, status: 'completed' };
          } else if (index === nextIndex) {
            return { ...step, status: 'active' };
          } else {
            return { ...step, status: 'pending' };
          }
        }));

        if (nextIndex >= totalSteps) {
          clearInterval(progressTimer);
          setTimeout(() => {
            onComplete?.();
          }, 500);
          return totalSteps;
        }

        return nextIndex;
      });
    }, stepDuration);

    return () => clearInterval(progressTimer);
  }, [isGenerating, onComplete, onError, steps.length]);

  if (!isGenerating) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-blue-600" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 mb-2">
            Generating Your Proposal
          </h3>
          <p className="text-sm text-slate-600">
            Please wait while we create your professional ADU proposal...
          </p>
        </div>

        <div className="space-y-3">
          {steps.map((step) => (
            <div key={step.id} className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                {step.status === 'completed' ? (
                  <CheckCircle className="w-5 h-5 text-green-600" />
                ) : step.status === 'active' ? (
                  <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                ) : (
                  <div className="w-5 h-5 rounded-full border-2 border-slate-300" />
                )}
              </div>
              
              <span className={`text-sm font-medium ${
                step.status === 'completed' 
                  ? 'text-green-700' 
                  : step.status === 'active'
                  ? 'text-blue-700'
                  : 'text-slate-500'
              }`}>
                {step.label}
              </span>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
              style={{ 
                width: `${Math.min(((currentStepIndex + 1) / steps.length) * 100, 100)}%` 
              }}
            />
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">
            Progress: {Math.min(currentStepIndex + 1, steps.length)} of {steps.length}
          </p>
        </div>
      </div>
    </div>
  );
}