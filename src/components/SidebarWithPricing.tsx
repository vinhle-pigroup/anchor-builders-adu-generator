import React from 'react';
// import { DesktopCardSelector } from './DesktopCardSelector';  // Unused import
import { CompactPricingSidebar } from './CompactPricingSidebar';
// FormSection interface
interface FormSection {
  id: string;
  title: string;
  isComplete: boolean;
}

interface SidebarWithPricingProps {
  sections: FormSection[];
  currentSection: string;
  onSectionSelect: (sectionId: string) => void;
  onExpandAll: () => void;
  allExpanded: boolean;
  liveCalculation?: any;
  onGenerate?: () => void;
  onSaveDraft?: () => void;
  isGenerating?: boolean;
  isFormComplete?: boolean;
  formData: any;
  pricingData?: any;
}

export const SidebarWithPricing: React.FC<SidebarWithPricingProps> = ({
  sections,
  currentSection,
  onSectionSelect,
  // onExpandAll,    // Unused parameter
  // allExpanded,    // Unused parameter
  liveCalculation,
  onGenerate,
  onSaveDraft,
  isGenerating,
  isFormComplete,
  formData,
  pricingData,
}) => {
  console.log('🔍 SidebarWithPricing rendering with:', { sections, formData, pricingData });
  
  // Transform formData to match expected structure
  const transformedFormData = {
    project: {
      bedrooms: formData?.bedrooms || 0,
      bathrooms: formData?.bathrooms || 0,
      aduType: formData?.aduType || '',
      squareFootage: formData?.squareFootage || 0,
      hvacType: formData?.hvacType || '',
      utilities: formData?.utilities || {
        waterMeter: 'separate',
        gasMeter: 'separate',
        sewerMeter: 'separate',
        electricMeter: 'separate',
        electricalPanel: 0,
      },
    },
    client: {
      firstName: formData?.clientName?.split(' ')[0] || '',
      lastName: formData?.clientName?.split(' ').slice(1).join(' ') || '',
      email: formData?.clientEmail || '',
      phone: formData?.clientPhone || '',
      address: formData?.propertyAddress || '',
    }
  };
  
  return (
    <div className='flex flex-col h-screen'>
      {/* Form Sections Navigation */}
      <div className='bg-white border-b border-gray-200 p-4'>
        <h3 className='text-sm font-semibold text-gray-700 mb-3'>Form Sections</h3>
        <div className='space-y-2'>
          {sections.map((section, index) => (
            <button
              key={section.id}
              onClick={() => onSectionSelect(section.id)}
              className={`
                w-full flex items-center justify-between p-2 rounded-lg transition-all
                ${
                  currentSection === section.id
                    ? 'bg-blue-100 border border-blue-400'
                    : section.isComplete
                    ? 'bg-green-50 border border-green-300 hover:bg-green-100'
                    : 'bg-gray-50 border border-gray-200 hover:bg-gray-100'
                }
              `}
            >
              <div className='flex items-center gap-2'>
                <div
                  className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold
                    ${
                      section.isComplete
                        ? 'bg-green-500 text-white'
                        : currentSection === section.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-gray-300 text-gray-600'
                    }
                  `}
                >
                  {section.isComplete ? '✓' : index + 1}
                </div>
                <span className='text-sm font-medium'>{section.title}</span>
              </div>
              {section.isComplete && (
                <span className='text-xs text-green-600 font-semibold'>✓</span>
              )}
            </button>
          ))}
        </div>
      </div>
      
      {/* Pricing Summary */}
      <div className='flex-1 overflow-y-auto'>
        <CompactPricingSidebar
          liveCalculation={liveCalculation}
          onGenerate={onGenerate}
          onSaveDraft={onSaveDraft}
          isGenerating={isGenerating}
          isFormComplete={isFormComplete}
          formData={transformedFormData}
          pricingData={pricingData}
        />
      </div>
    </div>
  );
};
