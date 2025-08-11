import React, { useMemo } from 'react';
import { Save, FileText } from 'lucide-react';

// Simple Button component replacement
const Button: React.FC<{
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  size?: 'sm' | 'md';
  children: React.ReactNode;
}> = ({ onClick, disabled, className, children }) => (
  <button 
    onClick={onClick} 
    disabled={disabled} 
    className={className}
  >
    {children}
  </button>
);

interface CompactPricingSidebarProps {
  liveCalculation?: any;
  onGenerate?: () => void;
  onSaveDraft?: () => void;
  isGenerating?: boolean;
  isFormComplete?: boolean;
  formData: any;
  pricingData?: any;
}

export const CompactPricingSidebar: React.FC<CompactPricingSidebarProps> = ({
  liveCalculation,
  onGenerate,
  onSaveDraft,
  isGenerating,
  isFormComplete,
  formData,
  pricingData,
}) => {
  // Generate stable proposal number and date (only recalculates when component first mounts)
  const { proposalNumber, proposalDate } = useMemo(() => {
    const now = new Date();
    return {
      proposalNumber: `AB-${now.getFullYear()}-${String(Date.now()).slice(-6)}`,
      proposalDate: now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      }),
    };
  }, []); // Empty dependency array ensures this only runs once

  return (
    <div className='w-full bg-white dark:bg-gray-800 border-l border-gray-200 dark:border-gray-700 border-b p-4'>
      {/* Header */}
      <div className='text-center mb-3'>
        <h3 className='text-base font-medium text-gray-800 dark:text-gray-200 mb-1'>
          📋 Project Summary
        </h3>
        <div className='text-xs text-gray-500 dark:text-gray-400 mb-2'>
          #{proposalNumber} • {proposalDate}
        </div>
        <div className='text-xl font-black text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 rounded px-2 py-1 border border-green-200 dark:border-green-700'>
          ${(liveCalculation?.finalTotal || 0).toLocaleString()}
        </div>
        <div className='text-xs text-gray-500 dark:text-gray-400'>Total Estimate</div>
      </div>

      {/* Project Summary - Easy to spot mistakes */}
      <div className='space-y-2 mb-3 text-xs border border-gray-200 dark:border-gray-600 rounded-lg p-2 bg-gray-50 dark:bg-gray-700'>
        <div className='font-semibold text-gray-700 dark:text-gray-300 text-center mb-2 border-b border-gray-300 dark:border-gray-600 pb-1'>
          Project Details
        </div>

        {/* Client Info */}
        <div className='grid grid-cols-2 gap-1'>
          <span className='text-gray-500 dark:text-gray-400'>Client:</span>
          <span className='font-medium text-gray-800 dark:text-gray-200 truncate text-right'>
            {formData.client?.firstName && formData.client?.lastName ? (
              `${formData.client.firstName} ${formData.client.lastName}`
            ) : (
              <span className='text-red-500 dark:text-red-400'>Missing</span>
            )}
          </span>
        </div>

        {/* Address */}
        <div className='grid grid-cols-2 gap-1'>
          <span className='text-gray-500 dark:text-gray-400'>Address:</span>
          <span className='font-medium text-gray-800 dark:text-gray-200 truncate text-right'>
            {formData.client?.address ? (
              `${formData.client.address}`
            ) : (
              <span className='text-red-500 dark:text-red-400'>Missing</span>
            )}
          </span>
        </div>

        {/* ADU Type */}
        <div className='grid grid-cols-2 gap-1'>
          <span className='text-gray-500 dark:text-gray-400'>ADU Type:</span>
          <span className='font-medium text-gray-800 dark:text-gray-200 text-right'>
            {formData.project?.aduType ? (
              formData.project.aduType
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l: string) => l.toUpperCase())
            ) : (
              <span className='text-red-500 dark:text-red-400'>Missing</span>
            )}
          </span>
        </div>

        {/* Size */}
        <div className='grid grid-cols-2 gap-1'>
          <span className='text-gray-500 dark:text-gray-400'>Size:</span>
          <span className='font-medium text-gray-800 dark:text-gray-200 text-right'>
            {formData.project?.squareFootage > 0 ? (
              `${formData.project.squareFootage} sq ft`
            ) : (
              <span className='text-red-500 dark:text-red-400'>Missing</span>
            )}
          </span>
        </div>

        {/* Bedrooms/Bathrooms */}
        <div className='grid grid-cols-2 gap-1'>
          <span className='text-gray-500 dark:text-gray-400'>Layout:</span>
          <span className='font-medium text-gray-800 dark:text-gray-200 text-right'>
            {formData.project?.bedrooms !== null && formData.project?.bathrooms !== null ? (
              `${formData.project.bedrooms}BR / ${formData.project.bathrooms}BA`
            ) : (
              <span className='text-red-500 dark:text-red-400'>Not Selected</span>
            )}
          </span>
        </div>

        {/* HVAC */}
        <div className='grid grid-cols-2 gap-1'>
          <span className='text-gray-500 dark:text-gray-400'>HVAC:</span>
          <span className='font-medium text-gray-800 dark:text-gray-200 text-right'>
            {formData.project?.hvacType ? (
              formData.project.hvacType
                .replace(/-/g, ' ')
                .replace(/\b\w/g, (l: string) => l.toUpperCase())
            ) : (
              <span className='text-red-500 dark:text-red-400'>Not Selected</span>
            )}
          </span>
        </div>

        {/* Utilities Summary */}
        <div className='grid grid-cols-2 gap-1'>
          <span className='text-gray-500 dark:text-gray-400'>Utilities:</span>
          <div className='text-right'>
            {/* Check if formData has utilities info to display actual status */}
            {formData.project?.utilities ? (
              <div className='space-y-0'>
                <div className='font-medium text-gray-800 dark:text-gray-200 text-xs'>
                  Water: {formData.project.utilities.waterMeter || 'shared'}
                </div>
                <div className='font-medium text-gray-800 dark:text-gray-200 text-xs'>
                  Gas: {formData.project.utilities.gasMeter || 'shared'}
                </div>
                <div className='font-medium text-gray-800 dark:text-gray-200 text-xs'>
                  Sewer: {formData.project.utilities.sewerMeter || 'shared'}
                </div>
                <div className='font-medium text-gray-800 dark:text-gray-200 text-xs'>
                  Electric: {formData.project.utilities.electricMeter || 'shared'}
                </div>
              </div>
            ) : Object.entries(pricingData?.utilities || {}).some(
              ([_, cost]) => (cost as number) > 0
            ) ? (
              <div className='space-y-0'>
                {Object.entries(pricingData.utilities || {})
                  .filter(([_, cost]) => (cost as number) > 0)
                  .map(([key, cost]) => (
                    <div key={key} className='font-medium text-gray-800 dark:text-gray-200 text-xs'>
                      {key}: ${(cost as number).toLocaleString()}
                    </div>
                  ))}
              </div>
            ) : (
              <span className='font-medium text-green-600 dark:text-green-400'>All Shared</span>
            )}
          </div>
        </div>

        {/* Design Services */}
        <div className='grid grid-cols-2 gap-1'>
          <span className='text-gray-500 dark:text-gray-400'>Design:</span>
          <span className='font-medium text-gray-800 dark:text-gray-200 text-right'>
            {formData.project?.needsDesign ? (
              <span className='text-green-600 dark:text-green-400'>+$12,500</span>
            ) : (
              <span className='text-gray-500 dark:text-gray-400'>Not included</span>
            )}
          </span>
        </div>

        {/* Add-ons Summary */}
        {Object.entries(pricingData?.addons || {}).some(([_, cost]) => (cost as number) > 0) && (
          <div className='space-y-1'>
            <span className='text-gray-500 dark:text-gray-400 text-xs font-medium'>Add-ons:</span>
            <div className='pl-2'>
              {Object.entries(pricingData.addons || {})
                .filter(([_, cost]) => (cost as number) > 0)
                .map(([key, cost]) => {
                  // Map addon keys to readable names
                  const addonNames: { [key: string]: string } = {
                    bathroom: 'Extra Bathroom',
                    driveway: 'Driveway',
                    landscaping: 'Landscaping',
                  };

                  // Handle custom services (they start with "custom_")
                  let displayName = addonNames[key] || key;
                  if (key.startsWith('custom_')) {
                    // For custom services, try to get the description from selectedAddOns
                    // This is a simplified approach - in a more robust system, you'd store custom service details
                    displayName = 'Custom Service';
                  }

                  return (
                    <div key={key} className='flex justify-between text-xs'>
                      <span className='text-gray-600 dark:text-gray-400'>{displayName}:</span>
                      <span className='font-medium text-green-600 dark:text-green-400'>
                        +${(cost as number).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
            </div>
          </div>
        )}
      </div>

      {/* Compact Cost Breakdown */}
      <div className='space-y-0.5 mb-3 text-xs border-t border-gray-200 dark:border-gray-600 pt-2'>
        <div className='font-semibold text-gray-700 dark:text-gray-300 mb-1'>Breakdown:</div>
        <div className='flex justify-between'>
          <span className='text-gray-500 dark:text-gray-400'>Base:</span>
          <span className='font-medium text-gray-800 dark:text-gray-200'>
            ${(liveCalculation?.baseConstruction || 0).toLocaleString()}
          </span>
        </div>
        {liveCalculation?.servicesTotal > 0 && (
          <div className='flex justify-between'>
            <span className='text-gray-500 dark:text-gray-400'>Design:</span>
            <span className='font-medium text-gray-800 dark:text-gray-200'>
              ${liveCalculation.servicesTotal.toLocaleString()}
            </span>
          </div>
        )}
        {liveCalculation?.utilitiesTotal > 0 && (
          <div className='flex justify-between'>
            <span className='text-gray-500 dark:text-gray-400'>Utilities:</span>
            <span className='font-medium text-gray-800 dark:text-gray-200'>
              ${liveCalculation.utilitiesTotal.toLocaleString()}
            </span>
          </div>
        )}
        {liveCalculation?.addonsTotal > 0 && (
          <div className='flex justify-between'>
            <span className='text-gray-500 dark:text-gray-400'>Add-ons:</span>
            <span className='font-medium text-gray-800 dark:text-gray-200'>
              ${liveCalculation.addonsTotal.toLocaleString()}
            </span>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className='space-y-2'>
        {/* Save Draft Button */}
        <Button
          onClick={onSaveDraft}
          className='w-full bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white text-xs font-medium'
          size='sm'
        >
          <Save className='w-3 h-3 mr-1' />
          Save Draft
        </Button>

        {/* Generate PDF Button */}
        <Button
          onClick={onGenerate}
          disabled={isGenerating || !isFormComplete}
          className='w-full bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white text-xs font-semibold disabled:opacity-50'
          size='sm'
        >
          {isGenerating ? (
            <>
              <svg
                className='animate-spin -ml-1 mr-1 h-3 w-3 text-white'
                fill='none'
                viewBox='0 0 24 24'
              >
                <circle
                  className='opacity-25'
                  cx='12'
                  cy='12'
                  r='10'
                  stroke='currentColor'
                  strokeWidth='4'
                ></circle>
                <path
                  className='opacity-75'
                  fill='currentColor'
                  d='M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z'
                ></path>
              </svg>
              Generating...
            </>
          ) : (
            <>
              <FileText className='w-3 h-3 mr-1' />
              Generate PDF
            </>
          )}
        </Button>

        {!isFormComplete && (
          <div className='text-xs text-gray-500 dark:text-gray-400 text-center'>
            Complete missing fields above to generate PDF
          </div>
        )}
      </div>
    </div>
  );
};
