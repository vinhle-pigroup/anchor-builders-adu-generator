import React, { useState, useCallback } from 'react';
import {
  User,
  Home,
  Paintbrush,
  FileText,
  CheckCircle,
  ArrowRight,
  FlaskConical,
} from 'lucide-react';
import { FormField } from './FormField';
import { ValidatedInput } from './ValidatedInput';
import { HeaderProgressBar } from './HeaderProgressBar';
import { SidebarWithPricing } from './SidebarWithPricing';
import { AdditionalServicesCatalog, UtilitiesCatalog } from '../data/services-catalog';
import { ProjectData, PricingData } from '../types/proposal';

interface FormSection {
  id: string;
  title: string;
  isComplete: boolean;
}

interface EnhancedProductionGridProps {
  projectData: ProjectData;
  pricingData: PricingData;
  onProjectDataUpdate: (data: Partial<ProjectData>) => void;
  onPricingDataUpdate: (data: Partial<PricingData>) => void;
}

export const EnhancedProductionGrid: React.FC<EnhancedProductionGridProps> = ({
  projectData,
  pricingData,
  onProjectDataUpdate,
  onPricingDataUpdate,
}) => {
  const [currentSection, setCurrentSection] = useState('client');

  const updateProjectData = useCallback(
    (updates: Partial<ProjectData>) => {
      onProjectDataUpdate(updates);
    },
    [onProjectDataUpdate]
  );

  const updatePricingData = useCallback(
    (updates: Partial<PricingData>) => {
      onPricingDataUpdate(updates);
    },
    [onPricingDataUpdate]
  );

  // Calculate completion percentage for each section
  const calculateSectionProgress = (sectionId: string) => {
    switch (sectionId) {
      case 'client': {
        let completed = 0;
        const total = 7; // Proposal#, Date, FirstName, LastName, Email, Phone, Address
        
        // These are always complete (static data)
        completed += 2; // Proposal# and Date
        
        // Check required fields
        if (projectData.clientName) completed += 2; // First & Last name
        if (projectData.clientEmail) completed += 1;
        if (projectData.clientPhone) completed += 1;
        if (projectData.propertyAddress) completed += 1;
        
        return Math.round((completed / total) * 100);
      }
      case 'adu': {
        let completed = 0;
        const total = 4; // ADU Type, Square Footage, Bedrooms, Bathrooms
        
        if (projectData.aduType) completed += 1;
        if (projectData.squareFootage) completed += 1;
        if (projectData.bedrooms !== undefined) completed += 1;
        if (projectData.bathrooms !== undefined) completed += 1;
        
        return Math.round((completed / total) * 100);
      }
      case 'design': {
        // Just based on design services selection
        return pricingData.designServices ? 100 : 0;
      }
      case 'notes': {
        return projectData.additionalNotes ? 100 : 0;
      }
      default:
        return 0;
    }
  };

  // Define form sections with completion logic
  const sections: FormSection[] = [
    {
      id: 'client',
      title: 'Client Information',
      isComplete: !!(projectData.clientName && projectData.clientEmail && projectData.propertyAddress),
    },
    {
      id: 'adu',
      title: 'ADU Configuration',
      isComplete: !!(projectData.aduType && projectData.squareFootage),
    },
    {
      id: 'design',
      title: 'Design Services',
      isComplete: !!pricingData.designServices,
    },
    {
      id: 'notes',
      title: 'Additional Notes',
      isComplete: !!projectData.additionalNotes,
    },
  ];

  const shouldShowArrow = (sectionId: string) => {
    const section = sections.find(s => s.id === sectionId);
    if (!section) return false;

    if (section.isComplete) return false; // Don't show arrow if complete

    // Show arrow if this is the next incomplete section
    const allPrevious = sections.slice(
      0,
      sections.findIndex(s => s.id === sectionId)
    );
    return allPrevious.every(s => s.isComplete);
  };

  // Test data function
  const loadTestData = () => {
    updateProjectData({
      clientName: 'John Smith',
      clientEmail: 'john.smith@email.com',
      clientPhone: '(555) 123-4567',
      propertyAddress: '123 Main St, Orange, CA 92868',
      aduType: 'detached',
      squareFootage: 800,
      bedrooms: 2,
      bathrooms: 1,
      additionalNotes: 'Client wants modern design with energy-efficient features.',
      hvacType: 'mini-split',
    });

    updatePricingData({
      designServices: 12500,
      utilities: {
        water: 2500,
        gas: 1800,
        electric: 3200,
        sewer: 2200,
      },
    });
  };

  return (
    <div className='flex flex-col h-screen bg-gradient-to-br from-stone-100 to-blue-50'>
      {/* Header Progress Bar */}
      <HeaderProgressBar
        sections={sections}
        currentSection={currentSection}
        onSectionSelect={setCurrentSection}
      />
      
      {/* Main Layout: Content + Sidebar */}
      <div className='flex flex-1 overflow-hidden'>
        {/* Main Content Area */}
        <div className='flex-1 overflow-y-auto p-6'>
          {/* Test Data Button */}
          <div className='mb-4'>
            <button
              onClick={loadTestData}
              className='flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-purple-100 hover:bg-purple-200 border border-purple-300 rounded-md transition-colors'
            >
              <FlaskConical className='w-4 h-4' />
              Load Test Data
            </button>
          </div>

          {/* 4-Card Grid Layout (2x2) */}
          <div className='grid grid-cols-2 gap-6 max-w-6xl'>
            {/* Card 1: CLIENT INFORMATION */}
            <div
              className={`
              relative bg-white rounded-2xl p-4 shadow-lg border-2
              ${currentSection === 'client' ? 'border-blue-400 shadow-xl' : 'border-gray-200'}
              transition-all duration-300 hover:shadow-lg
            `}
            >
              {/* Card Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${
                      sections[0].isComplete
                        ? 'bg-green-500 text-white'
                        : currentSection === 'client'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }
                  `}
                  >
                    {sections[0].isComplete ? (
                      <CheckCircle className='w-5 h-5' />
                    ) : (
                      <User className='w-5 h-5' />
                    )}
                  </div>
                  <h3 className='text-lg font-semibold text-gray-800'>CLIENT INFORMATION</h3>
                </div>
                <div className='flex items-center gap-2'>
                  {sections[0].isComplete ? (
                    <span className='text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded'>
                      COMPLETE
                    </span>
                  ) : (
                    <span className='text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded'>
                      {calculateSectionProgress('client')}%
                    </span>
                  )}
                  {shouldShowArrow('client') && (
                    <div className='text-blue-500 animate-pulse'>
                      <ArrowRight className='w-6 h-6' />
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className='space-y-3'>
                {/* Proposal # and Date Row */}
                <div className='grid grid-cols-2 gap-4'>
                  <div>
                    <label className='text-xs font-medium text-blue-600 block mb-1'>Proposal #</label>
                    <div className='text-sm font-semibold text-blue-700'>AB-2025-830340</div>
                  </div>
                  <div>
                    <label className='text-xs font-medium text-blue-600 block mb-1'>Date</label>
                    <div className='text-sm text-gray-700'>Aug 10, 2025</div>
                  </div>
                </div>

                {/* Form Fields */}
                <FormField label='Client Name' isRequired>
                  <ValidatedInput
                    type='text'
                    value={projectData.clientName || ''}
                    onChange={value => updateProjectData({ clientName: value })}
                    placeholder='Enter client full name'
                    fieldName='clientName'
                  />
                </FormField>

                <div className='grid grid-cols-2 gap-3'>
                  <FormField label='Email' isRequired>
                    <ValidatedInput
                      type='email'
                      value={projectData.clientEmail || ''}
                      onChange={value => updateProjectData({ clientEmail: value })}
                      placeholder='client@email.com'
                      fieldName='clientEmail'
                    />
                  </FormField>

                  <FormField label='Phone'>
                    <ValidatedInput
                      type='tel'
                      value={projectData.clientPhone || ''}
                      onChange={value => updateProjectData({ clientPhone: value })}
                      placeholder='(555) 123-4567'
                      fieldName='clientPhone'
                    />
                  </FormField>
                </div>

                <FormField label='Property Address' isRequired>
                  <ValidatedInput
                    type='text'
                    value={projectData.propertyAddress || ''}
                    onChange={value => updateProjectData({ propertyAddress: value })}
                    placeholder='Street address, city, state, zip'
                    fieldName='propertyAddress'
                  />
                </FormField>
              </div>
            </div>

            {/* Card 2: ADU CONFIGURATION */}
            <div
              className={`
              relative bg-white rounded-2xl p-4 shadow-lg border-2
              ${currentSection === 'adu' ? 'border-blue-400 shadow-xl' : 'border-gray-200'}
              transition-all duration-300 hover:shadow-lg
            `}
            >
              {/* Card Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${
                      sections[1].isComplete
                        ? 'bg-green-500 text-white'
                        : currentSection === 'adu'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }
                  `}
                  >
                    {sections[1].isComplete ? (
                      <CheckCircle className='w-5 h-5' />
                    ) : (
                      <Home className='w-5 h-5' />
                    )}
                  </div>
                  <h3 className='text-lg font-semibold text-gray-800'>ADU CONFIGURATION</h3>
                </div>
                <div className='flex items-center gap-2'>
                  {sections[1].isComplete ? (
                    <span className='text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded'>
                      COMPLETE
                    </span>
                  ) : (
                    <span className='text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded'>
                      {calculateSectionProgress('adu')}%
                    </span>
                  )}
                  {shouldShowArrow('adu') && (
                    <div className='text-blue-500 animate-pulse'>
                      <ArrowRight className='w-6 h-6' />
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className='space-y-3'>
                {/* ADU Type Selection */}
                <FormField label='ADU Type' isRequired>
                  <div className='grid grid-cols-3 gap-2'>
                    {[
                      { value: 'detached', label: 'Detached' },
                      { value: 'attached', label: 'Attached' },
                      { value: 'garage-conversion', label: 'Garage' },
                    ].map(option => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => updateProjectData({ aduType: option.value })}
                        className={`
                          p-2 text-xs font-medium rounded border transition-all
                          ${
                            projectData.aduType === option.value
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                          }
                        `}
                      >
                        {option.label}
                        {option.value === 'detached' && (
                          <div className='text-[10px] bg-orange-100 text-orange-700 px-1 rounded mt-1'>
                            Popular
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                </FormField>

                {/* Square Footage */}
                <FormField label='Square Footage' isRequired>
                  <div className='grid grid-cols-5 gap-1'>
                    {/* Manual Input First */}
                    <ValidatedInput
                      type='number'
                      min={1}
                      value={projectData.squareFootage || ''}
                      onChange={value => updateProjectData({ squareFootage: parseInt(value) || 0 })}
                      placeholder='Sq ft'
                      fieldName='squareFootage'
                      className='text-center text-xs font-medium p-2'
                    />

                    {/* Quick Select Buttons */}
                    {[600, 800, 1000, 1200].map(sqft => (
                      <button
                        key={sqft}
                        type='button'
                        onClick={() => updateProjectData({ squareFootage: sqft })}
                        className={`
                          p-2 text-xs font-medium rounded border transition-all
                          ${
                            projectData.squareFootage === sqft
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                          }
                        `}
                      >
                        {sqft}
                      </button>
                    ))}
                  </div>
                </FormField>

                {/* Bedrooms & Bathrooms */}
                <div className='grid grid-cols-2 gap-3'>
                  <FormField label='Bedrooms'>
                    <div className='grid grid-cols-3 gap-1'>
                      {[1, 2, 3].map(num => (
                        <button
                          key={num}
                          type='button'
                          onClick={() => updateProjectData({ bedrooms: num })}
                          className={`
                            py-1.5 text-xs font-medium rounded border transition-all
                            ${
                              projectData.bedrooms === num
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                            }
                          `}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </FormField>

                  <FormField label='Bathrooms'>
                    <div className='grid grid-cols-3 gap-1'>
                      {[1, 1.5, 2].map(num => (
                        <button
                          key={num}
                          type='button'
                          onClick={() => updateProjectData({ bathrooms: num })}
                          className={`
                            py-1.5 text-xs font-medium rounded border transition-all
                            ${
                              projectData.bathrooms === num
                                ? 'bg-blue-600 border-blue-600 text-white'
                                : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                            }
                          `}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </FormField>
                </div>

                {/* Utilities Section */}
                <div className='border-t pt-3'>
                  <h4 className='text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1'>
                    <span>⚡</span> Utilities
                  </h4>
                  <div className='grid grid-cols-4 gap-2'>
                    {UtilitiesCatalog.map(utility => {
                      const options = [
                        { title: 'Shared', cost: 0 },
                        { title: 'Separate', cost: utility.separateCost },
                      ];

                      return (
                        <div key={utility.key} className='bg-blue-50/20 p-2 rounded'>
                          <div className='flex items-center gap-1 mb-1'>
                            <span className='text-xs font-medium text-slate-700'>
                              {utility.label}
                            </span>
                          </div>
                          <div className='grid grid-cols-1 gap-1'>
                            {options.map(option => {
                              const isSelected = pricingData.utilities?.[utility.key] === option.cost;
                              return (
                                <label
                                  key={option.title}
                                  className={`
                                    cursor-pointer flex items-center justify-between p-1.5 rounded text-xs border transition-all
                                    ${
                                      isSelected
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                                    }
                                  `}
                                >
                                  <input
                                    type='radio'
                                    name={`utility-${utility.key}`}
                                    checked={isSelected}
                                    onChange={() =>
                                      updatePricingData({
                                        utilities: {
                                          ...pricingData.utilities,
                                          [utility.key]: option.cost,
                                        },
                                      })
                                    }
                                    className='sr-only'
                                  />
                                  <span className='font-medium'>{option.title}</span>
                                  {option.cost > 0 && (
                                    <span className='text-green-600 font-bold'>
                                      +${option.cost.toLocaleString()}
                                    </span>
                                  )}
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: DESIGN SERVICES */}
            <div
              className={`
              relative bg-white rounded-2xl p-4 shadow-lg border-2
              ${currentSection === 'design' ? 'border-blue-400 shadow-xl' : 'border-gray-200'}
              transition-all duration-300 hover:shadow-lg
            `}
            >
              {/* Card Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${
                      sections[2].isComplete
                        ? 'bg-green-500 text-white'
                        : currentSection === 'design'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }
                  `}
                  >
                    {sections[2].isComplete ? (
                      <CheckCircle className='w-5 h-5' />
                    ) : (
                      <Paintbrush className='w-5 h-5' />
                    )}
                  </div>
                  <h3 className='text-lg font-semibold text-gray-800'>DESIGN SERVICES</h3>
                </div>
                <div className='flex items-center gap-2'>
                  {sections[2].isComplete ? (
                    <span className='text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded'>
                      COMPLETE
                    </span>
                  ) : (
                    <span className='text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded'>
                      {calculateSectionProgress('design')}%
                    </span>
                  )}
                  {shouldShowArrow('design') && (
                    <div className='text-blue-500 animate-pulse'>
                      <ArrowRight className='w-6 h-6' />
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className='space-y-3'>
                <div className='grid grid-cols-1 gap-2'>
                  {[
                    {
                      value: 12500,
                      label: 'Standard Design Package',
                      description: 'Architectural plans & permits',
                    },
                    {
                      value: 18500,
                      label: 'Premium Design Package',
                      description: 'Full design + 3D renderings',
                    },
                    { value: 0, label: 'Client Provides Plans', description: 'Using existing plans' },
                  ].map(option => (
                    <label
                      key={option.value}
                      className={`
                        cursor-pointer flex items-start gap-3 p-3 rounded border transition-all
                        ${
                          pricingData.designServices === option.value
                            ? 'bg-blue-600 border-blue-600 text-white'
                            : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                        }
                      `}
                    >
                      <input
                        type='radio'
                        name='designServices'
                        checked={pricingData.designServices === option.value}
                        onChange={() => updatePricingData({ designServices: option.value })}
                        className='sr-only'
                      />
                      <div className='flex-1'>
                        <div className='flex items-center justify-between'>
                          <span className='text-sm font-medium'>{option.label}</span>
                          {option.value > 0 && (
                            <span className='font-bold'>${option.value.toLocaleString()}</span>
                          )}
                        </div>
                        <p className='text-xs opacity-75 mt-1'>{option.description}</p>
                      </div>
                    </label>
                  ))}
                </div>

                {/* HVAC System */}
                <div className='border-t pt-3'>
                  <h4 className='text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1'>
                    <span>❄️</span> HVAC System
                  </h4>
                  <div className='grid grid-cols-2 gap-2'>
                    {[
                      {
                        value: 'central-ac',
                        label: 'Central AC',
                        description: 'Traditional ducted system',
                      },
                      {
                        value: 'mini-split',
                        label: 'Mini-Split',
                        description: 'Ductless heat pump system',
                      },
                    ].map(option => (
                      <label
                        key={option.value}
                        className={`
                          cursor-pointer flex flex-col gap-1 p-2 rounded border text-xs transition-all
                          ${
                            projectData.hvacType === option.value
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                          }
                        `}
                      >
                        <input
                          type='radio'
                          name='hvacType'
                          checked={projectData.hvacType === option.value}
                          onChange={() => updateProjectData({ hvacType: option.value })}
                          className='sr-only'
                        />
                        <span className='font-medium'>{option.label}</span>
                        <span className='opacity-75'>{option.description}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Card 4: ADDITIONAL NOTES */}
            <div
              className={`
              relative bg-white rounded-2xl p-4 shadow-lg border-2
              ${currentSection === 'notes' ? 'border-blue-400 shadow-xl' : 'border-gray-200'}
              transition-all duration-300 hover:shadow-lg
            `}
            >
              {/* Card Header */}
              <div className='flex items-center justify-between mb-4'>
                <div className='flex items-center gap-3'>
                  <div
                    className={`
                    w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                    ${
                      sections[3].isComplete
                        ? 'bg-green-500 text-white'
                        : currentSection === 'notes'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-200 text-gray-600'
                    }
                  `}
                  >
                    {sections[3].isComplete ? (
                      <CheckCircle className='w-5 h-5' />
                    ) : (
                      <FileText className='w-5 h-5' />
                    )}
                  </div>
                  <h3 className='text-lg font-semibold text-gray-800'>ADDITIONAL NOTES</h3>
                </div>
                <div className='flex items-center gap-2'>
                  {sections[3].isComplete ? (
                    <span className='text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded'>
                      COMPLETE
                    </span>
                  ) : (
                    <span className='text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded'>
                      {calculateSectionProgress('notes')}%
                    </span>
                  )}
                  {shouldShowArrow('notes') && (
                    <div className='text-blue-500 animate-pulse'>
                      <ArrowRight className='w-6 h-6' />
                    </div>
                  )}
                </div>
              </div>

              {/* Card Content */}
              <div className='space-y-3'>
                <FormField label='Project Notes'>
                  <textarea
                    value={projectData.additionalNotes || ''}
                    onChange={e => updateProjectData({ additionalNotes: e.target.value })}
                    placeholder='Special requirements, client preferences, site conditions...'
                    className='w-full h-32 px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                  />
                </FormField>

                {/* Additional Services */}
                <div className='border-t pt-3'>
                  <h4 className='text-xs font-semibold text-blue-700 mb-2 flex items-center gap-1'>
                    <span>➕</span> Additional Services
                  </h4>
                  <div className='space-y-2'>
                    {AdditionalServicesCatalog.slice(0, 4).map(service => (
                      <label
                        key={service.key}
                        className={`
                          cursor-pointer flex items-center justify-between p-2 rounded border text-xs transition-all
                          ${
                            pricingData.additionalServices?.[service.key]
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-blue-300'
                          }
                        `}
                      >
                        <input
                          type='checkbox'
                          checked={!!pricingData.additionalServices?.[service.key]}
                          onChange={e =>
                            updatePricingData({
                              additionalServices: {
                                ...pricingData.additionalServices,
                                [service.key]: e.target.checked ? service.cost : 0,
                              },
                            })
                          }
                          className='sr-only'
                        />
                        <span className='font-medium'>{service.label}</span>
                        <span className='font-bold'>+${service.cost.toLocaleString()}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar with Pricing */}
        <SidebarWithPricing
          sections={sections}
          currentSection={currentSection}
          onSectionSelect={setCurrentSection}
          onExpandAll={() => {}}
          allExpanded={false}
          formData={projectData}
          pricingData={pricingData}
          isFormComplete={sections.every(s => s.isComplete)}
        />
      </div>
    </div>
  );
};