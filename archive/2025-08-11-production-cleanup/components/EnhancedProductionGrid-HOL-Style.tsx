import React, { useState, useCallback } from 'react';
import {
  User,
  Home,
  Paintbrush,
  FileText,
  CheckCircle,
  FlaskConical,
  Calculator,
} from 'lucide-react';
import { FormField } from './FormField';
import { ValidatedInput } from './ValidatedInput';
import { SidebarWithPricing } from './SidebarWithPricing';
import { UtilitiesCatalog } from '../data/services-catalog';
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
  console.log('🔍 EnhancedProductionGrid rendering with:', { projectData, pricingData });
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
        // Based on any design service selection
        return pricingData.designServices || pricingData.solarReady || pricingData.femaCompliance ? 100 : 0;
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
      isComplete: !!(pricingData.designServices || pricingData.solarReady || pricingData.femaCompliance),
    },
    {
      id: 'notes',
      title: 'Additional Notes',
      isComplete: !!projectData.additionalNotes,
    },
  ];

  // Test data function
  const loadTestData = () => {
    updateProjectData({
      clientName: 'John Smith',
      clientEmail: 'john.smith@email.com',
      clientPhone: '(555) 123-4567',
      propertyAddress: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      aduType: 'detached',
      squareFootage: 800,
      bedrooms: 2,
      bathrooms: 1,
      additionalNotes: 'This is a sample ADU project for testing the form functionality.',
      hvacType: 'central-ac',
    });

    updatePricingData({
      designServices: 12500,
      solarReady: true,
      utilities: {
        water: 2500,
        gas: 1800,
        electric: 3200,
        sewer: 2200,
      },
    });
  };

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-100 to-blue-50'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='container mx-auto px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <div className='w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-lg flex items-center justify-center mr-3 shadow-sm border border-blue-200'>
                <span className='text-white font-bold text-lg'>⚓</span>
              </div>
              <div>
                <h1 className='text-lg font-bold text-slate-800'>
                  Anchor Builders
                </h1>
                <p className='text-xs text-slate-600'>ADU Proposal Generator</p>
              </div>
            </div>

            <div className='flex items-center gap-2 sm:gap-4'>
              {/* Test Data Button */}
              <button
                onClick={loadTestData}
                className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center min-h-[44px]'
              >
                <FlaskConical className='w-4 h-4 mr-1' />
                <span className='sm:hidden'>Test</span>
                <span className='hidden sm:inline'>Load Test Data</span>
              </button>
              
              {/* Dark Mode Toggle */}
              <div className='w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-blue-700 transition-colors'>
                🌙
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='container mx-auto px-4 py-6'>
        <div className='grid xl:grid-cols-4 gap-6'>
          {/* Main Form */}
          <div className='xl:col-span-3 space-y-4 sm:space-y-6'>
            {/* Client Information */}
            <div className='bg-white rounded-lg shadow-sm p-4'>
              <div className='flex items-center mb-3'>
                <div
                  className={`
                  w-5 h-5 mr-2 rounded flex items-center justify-center
                  ${
                    sections[0].isComplete
                      ? 'text-emerald-600'
                      : currentSection === 'client'
                        ? 'text-blue-600'
                        : 'text-slate-400'
                  }
                `}
                >
                  {sections[0].isComplete ? (
                    <CheckCircle className='w-5 h-5' />
                  ) : (
                    <User className='w-5 h-5' />
                  )}
                </div>
                <h2 className='text-lg font-semibold text-slate-800'>Client Information</h2>
                <div className='ml-auto flex items-center gap-2'>
                  {sections[0].isComplete ? (
                    <span className='text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200'>
                      COMPLETE
                    </span>
                  ) : (
                    <span className='text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md border border-blue-200'>
                      {calculateSectionProgress('client')}%
                    </span>
                  )}
                </div>
              </div>

              {/* Proposal Info */}
              <div className='grid grid-cols-2 gap-4 mb-4 bg-slate-50 p-3 rounded-lg'>
                <div>
                  <label className='text-xs font-medium text-slate-600 block mb-1'>Proposal #</label>
                  <div className='text-sm font-semibold text-blue-800'>AB-2025-830340</div>
                </div>
                <div>
                  <label className='text-xs font-medium text-slate-600 block mb-1'>Date</label>
                  <div className='text-sm text-slate-700'>Aug 10, 2025</div>
                </div>
              </div>

              {/* Property Address */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  Property Address
                </label>
                <div className='grid gap-3'>
                  <input
                    type='text'
                    value={projectData.propertyAddress || ''}
                    onChange={e => updateProjectData({ propertyAddress: e.target.value })}
                    className='px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full min-h-[44px]'
                    placeholder='Street Address'
                  />
                  <div className='grid grid-cols-1 sm:grid-cols-3 gap-3'>
                    <input
                      type='text'
                      value={projectData.city || ''}
                      onChange={e => updateProjectData({ city: e.target.value })}
                      className='px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]'
                      placeholder='City'
                    />
                    <input
                      type='text'
                      value={projectData.state || ''}
                      onChange={e => updateProjectData({ state: e.target.value })}
                      className='px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]'
                      placeholder='State'
                    />
                    <input
                      type='text'
                      value={projectData.zipCode || ''}
                      onChange={e => updateProjectData({ zipCode: e.target.value })}
                      className='px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]'
                      placeholder='ZIP Code'
                    />
                  </div>
                </div>
              </div>

              {/* Client Information */}
              <div className='mb-4'>
                <label className='block text-sm font-medium text-slate-700 mb-2'>
                  Primary Client
                </label>
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-3'>
                  <input
                    type='text'
                    value={projectData.clientName || ''}
                    onChange={e => updateProjectData({ clientName: e.target.value })}
                    className='px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]'
                    placeholder='Full Name'
                  />
                  <input
                    type='email'
                    value={projectData.clientEmail || ''}
                    onChange={e => updateProjectData({ clientEmail: e.target.value })}
                    className='px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm min-h-[44px]'
                    placeholder='Email'
                  />
                </div>
                <div className='mt-3'>
                  <input
                    type='tel'
                    value={projectData.clientPhone || ''}
                    onChange={e => updateProjectData({ clientPhone: e.target.value })}
                    className='px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full min-h-[44px]'
                    placeholder='Phone'
                  />
                </div>
              </div>
            </div>

            {/* ADU Configuration */}
            <div className='bg-white rounded-lg shadow-sm p-4'>
              <div className='flex items-center mb-3'>
                <div
                  className={`
                  w-5 h-5 mr-2 rounded flex items-center justify-center
                  ${
                    sections[1].isComplete
                      ? 'text-emerald-600'
                      : currentSection === 'adu'
                        ? 'text-blue-600'
                        : 'text-slate-400'
                  }
                `}
                >
                  {sections[1].isComplete ? (
                    <CheckCircle className='w-5 h-5' />
                  ) : (
                    <Home className='w-5 h-5' />
                  )}
                </div>
                <h2 className='text-lg font-semibold text-slate-800'>ADU Configuration</h2>
                <div className='ml-auto flex items-center gap-2'>
                  {sections[1].isComplete ? (
                    <span className='text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200'>
                      COMPLETE
                    </span>
                  ) : (
                    <span className='text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md border border-blue-200'>
                      {calculateSectionProgress('adu')}%
                    </span>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                {/* ADU Type */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>ADU Type</label>
                  <div className='grid grid-cols-1 gap-2'>
                    {[
                      { value: 'detached', label: 'Detached' },
                      { value: 'attached', label: 'Attached' },
                      { value: 'jadu', label: 'JADU' },
                    ].map(option => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => updateProjectData({ aduType: option.value })}
                        className={`
                          px-4 py-3 text-sm rounded-lg border transition-all min-h-[44px] text-left
                          ${
                            projectData.aduType === option.value
                              ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-500 text-blue-800 shadow-sm'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:shadow-sm'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Square Footage */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>Square Footage</label>
                  <input
                    type='number'
                    min={1}
                    value={projectData.squareFootage || ''}
                    onChange={e => updateProjectData({ squareFootage: parseInt(e.target.value) || 0 })}
                    className='px-4 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm w-full min-h-[44px] mb-2'
                    placeholder='Enter square footage'
                  />
                  <div className='grid grid-cols-2 gap-2'>
                    {[600, 800, 1000, 1200].map(sqft => (
                      <button
                        key={sqft}
                        type='button'
                        onClick={() => updateProjectData({ squareFootage: sqft })}
                        className={`
                          px-3 py-2 text-sm rounded-lg border transition-all
                          ${
                            projectData.squareFootage === sqft
                              ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-500 text-blue-800'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'
                          }
                        `}
                      >
                        {sqft} sf
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bedrooms & Bathrooms */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>Bedrooms</label>
                  <div className='grid grid-cols-3 gap-2'>
                    {[1, 2, 3].map(num => (
                      <button
                        key={num}
                        type='button'
                        onClick={() => updateProjectData({ bedrooms: num })}
                        className={`
                          py-3 text-sm font-medium rounded-lg border transition-all min-h-[44px]
                          ${
                            projectData.bedrooms === num
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-600 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:shadow-sm'
                          }
                        `}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>Bathrooms</label>
                  <div className='grid grid-cols-3 gap-2'>
                    {[1, 1.5, 2].map(num => (
                      <button
                        key={num}
                        type='button'
                        onClick={() => updateProjectData({ bathrooms: num })}
                        className={`
                          py-3 text-sm font-medium rounded-lg border transition-all min-h-[44px]
                          ${
                            projectData.bathrooms === num
                              ? 'bg-gradient-to-r from-blue-600 to-indigo-700 border-blue-600 text-white shadow-md'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400 hover:shadow-sm'
                          }
                        `}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* HVAC and Utilities */}
              <div className='grid grid-cols-1 md:grid-cols-2 gap-6 mt-6'>
                {/* HVAC */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>❄️ HVAC</label>
                  <div className='grid grid-cols-1 gap-2'>
                    {[
                      { value: 'central-ac', label: 'Central AC' },
                      { value: 'mini-split', label: 'Mini-Split' },
                    ].map(option => (
                      <button
                        key={option.value}
                        type='button'
                        onClick={() => updateProjectData({ hvacType: option.value })}
                        className={`
                          px-3 py-3 text-sm rounded-lg border transition-all text-left min-h-[44px]
                          ${
                            projectData.hvacType === option.value
                              ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-500 text-blue-800'
                              : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'
                          }
                        `}
                      >
                        {option.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                {/* Utilities */}
                <div>
                  <label className='block text-sm font-medium text-slate-700 mb-2'>⚡ Utilities</label>
                  <div className='grid grid-cols-2 gap-2'>
                    {UtilitiesCatalog.slice(0, 4).map(utility => {
                      const isSelected = pricingData.utilities?.[utility.key] > 0;
                      return (
                        <button
                          key={utility.key}
                          type='button'
                          onClick={() =>
                            updatePricingData({
                              utilities: {
                                ...pricingData.utilities,
                                [utility.key]: isSelected ? 0 : utility.separateCost,
                              },
                            })
                          }
                          className={`
                            p-2 text-xs rounded-lg border transition-all text-center min-h-[44px]
                            ${
                              isSelected
                                ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-500 text-blue-800'
                                : 'bg-white border-slate-200 text-slate-700 hover:border-blue-400'
                            }
                          `}
                        >
                          <div className='font-medium'>{utility.label}</div>
                          <div className='text-xs'>{isSelected ? 'Separate' : 'Shared'}</div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Additional Services */}
              <div className='mt-6 border-t pt-4'>
                <h4 className='text-sm font-medium text-slate-700 mb-3 flex items-center gap-1'>
                  <span>➕</span> Additional Services
                </h4>
                <div className='grid grid-cols-1 gap-2'>
                  {[
                    { key: 'extra-bathroom', label: 'Extra Bathroom', cost: 8000 },
                    { key: 'dedicated-driveway', label: 'Dedicated Driveway', cost: 5000 },
                    { key: 'basic-landscaping', label: 'Basic Landscaping', cost: 10000 },
                  ].map(service => (
                    <label
                      key={service.key}
                      className={`
                        cursor-pointer flex items-center justify-between p-3 rounded-lg border text-sm transition-all min-h-[44px]
                        ${
                          pricingData.additionalServices?.[service.key]
                            ? 'bg-emerald-50 border-emerald-300'
                            : 'bg-white border-slate-200 hover:border-emerald-300'
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
                        className='w-4 h-4 text-emerald-600 rounded'
                      />
                      <span className='font-medium flex-1 ml-3'>{service.label}</span>
                      <span className='font-bold text-emerald-600'>
                        +${service.cost.toLocaleString()}
                      </span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Design Services */}
            <div className='bg-white rounded-lg shadow-sm p-4'>
              <div className='flex items-center mb-3'>
                <div
                  className={`
                  w-5 h-5 mr-2 rounded flex items-center justify-center
                  ${
                    sections[2].isComplete
                      ? 'text-emerald-600'
                      : currentSection === 'design'
                        ? 'text-blue-600'
                        : 'text-slate-400'
                  }
                `}
                >
                  {sections[2].isComplete ? (
                    <CheckCircle className='w-5 h-5' />
                  ) : (
                    <Paintbrush className='w-5 h-5' />
                  )}
                </div>
                <h2 className='text-lg font-semibold text-slate-800'>Design Services</h2>
                <div className='ml-auto flex items-center gap-2'>
                  {sections[2].isComplete ? (
                    <span className='text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200'>
                      COMPLETE
                    </span>
                  ) : (
                    <span className='text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md border border-blue-200'>
                      {calculateSectionProgress('design')}%
                    </span>
                  )}
                </div>
              </div>

              <div className='space-y-3'>
                {/* Include Design Services */}
                <label className='cursor-pointer flex items-start gap-3 p-3 rounded-lg border border-emerald-300 bg-emerald-50 transition-all'>
                  <input
                    type='checkbox'
                    checked={pricingData.designServices === 12500}
                    onChange={e => updatePricingData({ designServices: e.target.checked ? 12500 : 0 })}
                    className='w-4 h-4 text-emerald-600 rounded mt-0.5'
                  />
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <span className='text-sm font-medium'>Include Design Services</span>
                      <span className='font-bold text-emerald-600'>+$12,500</span>
                    </div>
                    <p className='text-xs text-slate-600 mt-1'>Architectural plans, structural engineering, and permit assistance</p>
                  </div>
                </label>

                {/* Solar Ready */}
                <label className='cursor-pointer flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all'>
                  <input
                    type='checkbox'
                    checked={!!pricingData.solarReady}
                    onChange={e => updatePricingData({ solarReady: e.target.checked })}
                    className='w-4 h-4 text-slate-600 rounded'
                  />
                  <span className='text-sm font-medium text-slate-700'>Solar Ready</span>
                </label>

                {/* FEMA Compliance */}
                <label className='cursor-pointer flex items-center gap-3 p-3 rounded-lg border border-slate-200 bg-white hover:border-slate-300 transition-all'>
                  <input
                    type='checkbox'
                    checked={!!pricingData.femaCompliance}
                    onChange={e => updatePricingData({ femaCompliance: e.target.checked })}
                    className='w-4 h-4 text-slate-600 rounded'
                  />
                  <span className='text-sm font-medium text-slate-700'>FEMA Compliance</span>
                </label>
              </div>
            </div>

            {/* Additional Notes */}
            <div className='bg-white rounded-lg shadow-sm p-4'>
              <div className='flex items-center mb-3'>
                <div
                  className={`
                  w-5 h-5 mr-2 rounded flex items-center justify-center
                  ${
                    sections[3].isComplete
                      ? 'text-emerald-600'
                      : currentSection === 'notes'
                        ? 'text-blue-600'
                        : 'text-slate-400'
                  }
                `}
                >
                  {sections[3].isComplete ? (
                    <CheckCircle className='w-5 h-5' />
                  ) : (
                    <FileText className='w-5 h-5' />
                  )}
                </div>
                <h2 className='text-lg font-semibold text-slate-800'>Additional Notes</h2>
                <div className='ml-auto flex items-center gap-2'>
                  {sections[3].isComplete ? (
                    <span className='text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md border border-emerald-200'>
                      COMPLETE
                    </span>
                  ) : (
                    <span className='text-xs font-bold text-blue-700 bg-blue-100 px-2 py-1 rounded-md border border-blue-200'>
                      {calculateSectionProgress('notes')}%
                    </span>
                  )}
                </div>
              </div>

              <textarea
                value={projectData.additionalNotes || ''}
                onChange={e => updateProjectData({ additionalNotes: e.target.value })}
                placeholder='Special requirements, client preferences, site conditions...'
                className='w-full h-24 px-4 py-3 border border-slate-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Pricing Sidebar */}
          <div className='xl:col-span-1 order-first xl:order-last'>
            <div className='bg-white rounded-lg shadow-sm p-4 xl:sticky xl:top-20'>
              <div className='flex items-center mb-4'>
                <Calculator className='w-5 h-5 text-blue-600 mr-2' />
                <h3 className='font-semibold text-slate-800'>Live Pricing</h3>
              </div>
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
        </div>
      </div>
    </div>
  );
};