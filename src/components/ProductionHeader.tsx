import React from 'react';

interface ProductionHeaderProps {
  selectedTemplate: 'historical' | 'modern' | 'premium' | 'classic' | 'enhanced';
  onTemplateChange: (template: 'historical' | 'modern' | 'premium' | 'classic' | 'enhanced') => void;
}

const ProductionHeader: React.FC<ProductionHeaderProps> = ({ 
  selectedTemplate, 
  onTemplateChange 
}) => {
  return (
    <div className="bg-white shadow-sm border-b border-slate-200 px-6 py-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Anchor Builders ADU Generator
          </h1>
          <p className="text-sm text-slate-600">Internal Production Tool</p>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-slate-700">Template:</label>
          <select 
            value={selectedTemplate}
            onChange={(e) => onTemplateChange(e.target.value as 'historical' | 'modern' | 'premium' | 'classic' | 'enhanced')}
            className="px-3 py-1.5 border border-slate-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="enhanced">Enhanced</option>
            <option value="modern">Modern</option>
            <option value="historical">Historical</option>
            <option value="premium">Premium</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default ProductionHeader;