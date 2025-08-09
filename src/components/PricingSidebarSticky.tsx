import React from 'react';
import { FileText } from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface PricingSidebarStickyProps {
  liveCalculation: any;
  onGenerate: () => void;
  isGenerating: boolean;
  isFormComplete: boolean;
}

const PricingSidebarSticky: React.FC<PricingSidebarStickyProps> = ({ 
  liveCalculation, 
  onGenerate,
  isGenerating,
  isFormComplete
}) => {
  return (
    <div className="fixed top-20 right-6 w-80 bg-white rounded-lg shadow-lg border border-slate-200 p-6">
      <h3 className="text-lg font-semibold text-slate-800 mb-4">
        Pricing Summary
      </h3>
      
      <div className="space-y-3">
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Base Construction:</span>
          <span className="font-medium">${liveCalculation?.baseConstruction?.toLocaleString() || '0'}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Utilities:</span>
          <span className="font-medium">${liveCalculation?.utilitiesTotal?.toLocaleString() || '0'}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Additional Services:</span>
          <span className="font-medium">${liveCalculation?.addonsTotal?.toLocaleString() || '0'}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Design Services:</span>
          <span className="font-medium">${liveCalculation?.servicesTotal?.toLocaleString() || '0'}</span>
        </div>
        
        <hr className="border-slate-200" />
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Subtotal:</span>
          <span className="font-medium">${liveCalculation?.subtotal?.toLocaleString() || '0'}</span>
        </div>
        
        <div className="flex justify-between text-sm">
          <span className="text-slate-600">Markup:</span>
          <span className="font-medium">${liveCalculation?.markup?.toLocaleString() || '0'}</span>
        </div>
        
        <hr className="border-slate-300" />
        
        <div className="flex justify-between text-lg font-bold">
          <span className="text-slate-800">Total:</span>
          <span className="text-blue-600">${liveCalculation?.finalTotal?.toLocaleString() || '0'}</span>
        </div>
        
        <div className="text-xs text-slate-500 text-center">
          ${liveCalculation?.pricePerSqFt || '0'}/sq ft
        </div>
      </div>
      
      <button
        onClick={onGenerate}
        disabled={!isFormComplete || isGenerating}
        className="w-full mt-6 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center space-x-2"
      >
        {isGenerating ? (
          <LoadingSpinner size="sm" className="text-white" />
        ) : (
          <FileText className="w-4 h-4" />
        )}
        <span>{isGenerating ? 'Generating...' : 'Generate ADU Proposal'}</span>
      </button>
      
      <div className="mt-4 text-xs text-center text-slate-500">
        {isFormComplete ? '✅ Ready to generate' : '⚠️ Complete form to generate'}
      </div>
    </div>
  );
};

export default PricingSidebarSticky;