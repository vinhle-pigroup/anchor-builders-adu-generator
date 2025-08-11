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
import { DesktopCardSelector } from './DesktopCardSelector';
import { SidebarWithPricing } from './SidebarWithPricing';
import { HeaderProgressBar } from './HeaderProgressBar';
import { AdditionalServicesCatalog, UtilitiesCatalog } from '../data/services-catalog';

// Type definitions
interface ProjectData {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  propertyAddress?: string;
  aduType?: string;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  hvacType?: string;
  additionalNotes?: string;
}

interface PricingData {
  designServices?: number;
  utilities?: Record<string, number>;
  additionalServices?: Record<string, number>;
}

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
  const [allExpanded, setAllExpanded] = useState(false);

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

              {/* All Form Fields in Compact Layout */}
              <div className='grid grid-cols-4 gap-2 text-xs'>
                {/* First Name */}
                <FormField label='First Name' isRequired>
                  <ValidatedInput
                    type='text'
                    value={projectData.clientName?.split(' ')[0] || ''}
                    onChange={value => {
                      const lastName = projectData.clientName?.split(' ').slice(1).join(' ') || '';
                      updateProjectData({ clientName: `${value} ${lastName}`.trim() });
                    }}
                    placeholder='John'
                    fieldName='firstName'
                    className='text-xs py-1 px-2'
                  />
                </FormField>

                {/* Last Name */}
                <FormField label='Last Name' isRequired>
                  <ValidatedInput
                    type='text'
                    value={projectData.clientName?.split(' ').slice(1).join(' ') || ''}
                    onChange={value => {
                      const firstName = projectData.clientName?.split(' ')[0] || '';
                      updateProjectData({ clientName: `${firstName} ${value}`.trim() });
                    }}
                    placeholder='Smith'
                    fieldName='lastName'
                    className='text-xs py-1 px-2'
                  />
                </FormField>

                {/* Email */}
                <FormField label='Email' isRequired>
                  <ValidatedInput
                    type='email'
                    value={projectData.clientEmail || ''}
                    onChange={value => updateProjectData({ clientEmail: value as string })}
                    placeholder='john.smith@email.com'
                    fieldName='clientEmail'
                    className='text-xs py-1 px-2'
                  />
                </FormField>

                {/* Phone */}
                <FormField label='Phone' isRequired>
                  <ValidatedInput
                    type='tel'
                    value={projectData.clientPhone || ''}
                    onChange={value => updateProjectData({ clientPhone: value as string })}
                    placeholder='(555) 123-4567'
                    fieldName='clientPhone'
                    className='text-xs py-1 px-2'
                  />
                </FormField>
              </div>

              {/* Address Row */}
              <FormField label='Address' isRequired>
                <ValidatedInput
                  type='text'
                  value={projectData.propertyAddress || ''}
                  onChange={value => updateProjectData({ propertyAddress: value as string })}
                  placeholder='123 Main Street'
                  fieldName='propertyAddress'
                  className='text-sm py-1.5 px-3'
                />
              </FormField>

              {/* City, State, ZIP Row */}
              <div className='grid grid-cols-3 gap-2'>
                <FormField label='City' isRequired>
                  <ValidatedInput
                    type='text'
                    value=''
                    onChange={value => {}}
                    placeholder='Los Angeles'
                    fieldName='city'
                    className='text-xs py-1 px-2'
                  />
                </FormField>

                <FormField label='State' isRequired>
                  <ValidatedInput
                    type='text'
                    value=''
                    onChange={value => {}}
                    placeholder='CA'
                    fieldName='state'
                    className='text-xs py-1 px-2'
                  />
                </FormField>

                <FormField label='ZIP Code' isRequired>
                  <ValidatedInput
                    type='text'
                    value=''
                    onChange={value => {}}
                    placeholder='90210'
                    fieldName='zipCode'
                    className='text-xs py-1 px-2'
                  />
                </FormField>
              </div>
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
            <div className='space-y-4'>
              {/* ADU Type Section */}
              <div>
                <label className='text-xs font-medium text-gray-700 block mb-2'>ADU Type *</label>
                <div className='flex gap-2'>
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
                        px-4 py-2 text-sm rounded border transition-all
                        ${
                          projectData.aduType === option.value
                            ? 'bg-blue-100 border-blue-400 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                        }
                      `}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                <button className='text-xs text-blue-600 mt-1'>▶ More types</button>
              </div>

              {/* Square Footage Section */}
              <div>
                <label className='text-xs font-medium text-gray-700 block mb-2'>Square Footage *</label>
                <div className='flex gap-2'>
                  {[400, 800, 1000, 1200].map(sqft => (
                    <button
                      key={sqft}
                      type='button'
                      onClick={() => updateProjectData({ squareFootage: sqft })}
                      className={`
                        px-3 py-2 text-sm rounded border transition-all
                        ${
                          projectData.squareFootage === sqft
                            ? 'bg-blue-100 border-blue-400 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                        }
                      `}
                    >
                      {sqft}
                    </button>
                  ))}
                </div>
                <div className='text-xs text-gray-500 mt-1'>800 sq ft</div>
              </div>

              {/* Bedrooms and Bathrooms Row */}
              <div className='grid grid-cols-2 gap-6'>
                <div>
                  <label className='text-xs font-medium text-gray-700 block mb-2'>Bedrooms *</label>
                  <div className='flex gap-2'>
                    {['Studio', '1', '2', '3', '4'].map(num => (
                      <button
                        key={num}
                        type='button'
                        onClick={() => updateProjectData({ 
                          bedrooms: num === 'Studio' ? 0 : parseInt(num)
                        })}
                        className={`
                          px-3 py-2 text-sm rounded border transition-all
                          ${
                            (num === 'Studio' && projectData.bedrooms === 0) ||
                            (num !== 'Studio' && projectData.bedrooms === parseInt(num))
                              ? 'bg-blue-100 border-blue-400 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                          }
                        `}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className='text-xs font-medium text-gray-700 block mb-2'>Bathrooms *</label>
                  <div className='flex gap-2'>
                    {[0, 1, 2, 3].map(num => (
                      <button
                        key={num}
                        type='button'
                        onClick={() => updateProjectData({ bathrooms: num })}
                        className={`
                          px-3 py-2 text-sm rounded border transition-all
                          ${
                            projectData.bathrooms === num
                              ? 'bg-blue-100 border-blue-400 text-blue-700'
                              : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                          }
                        `}
                      >
                        {num}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* HVAC Section */}
              <div>
                <label className='text-xs font-medium text-blue-600 block mb-2'>❄️ HVAC</label>
                <div className='grid grid-cols-2 gap-3'>
                  <button
                    type='button'
                    onClick={() => updateProjectData({ hvacType: 'central-ac' })}
                    className={`
                      p-3 text-sm rounded border transition-all text-center
                      ${
                        projectData.hvacType === 'central-ac'
                          ? 'bg-blue-100 border-blue-400 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                      }
                    `}
                  >
                    <div className='font-medium'>Central AC</div>
                    <div className='text-xs text-gray-500'>Selected</div>
                  </button>
                  <button
                    type='button'
                    onClick={() => updateProjectData({ hvacType: 'mini-split' })}
                    className={`
                      p-3 text-sm rounded border transition-all text-center
                      ${
                        projectData.hvacType === 'mini-split'
                          ? 'bg-blue-100 border-blue-400 text-blue-700'
                          : 'bg-white border-gray-300 text-gray-700 hover:border-blue-300'
                      }
                    `}
                  >
                    <div className='font-medium'>Mini-Split</div>
                    <div className='text-xs text-gray-500'>Available</div>
                  </button>
                </div>
              </div>

              {/* Utilities Section */}
              <div>
                <label className='text-xs font-medium text-blue-600 block mb-2'>⚡ Utilities</label>
                <div className='grid grid-cols-2 gap-3'>
                  {[
                    { key: 'water', label: 'Water', status: 'Shared' },
                    { key: 'sewer', label: 'Sewer', status: 'Separate' },
                    { key: 'gas', label: 'Gas', status: 'Separate' },
                    { key: 'electric', label: 'Electric', status: 'Separate' },
                  ].map(utility => (
                    <button
                      key={utility.key}
                      type='button'
                      className={`
                        p-2 text-sm rounded border transition-all text-center
                        ${
                          utility.status === 'Separate'
                            ? 'bg-blue-100 border-blue-400 text-blue-700'
                            : 'bg-white border-gray-300 text-gray-700'
                        }
                      `}
                    >
                      <div className='font-medium'>{utility.label}</div>
                      <div className='text-xs'>{utility.status}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Additional Services */}
              <div>
                <label className='text-xs font-medium text-blue-600 block mb-2'>✚ Additional Services</label>
                <div className='space-y-2'>
                  {[
                    { key: 'bathroom', label: 'Extra Bathroom', cost: 8000, selected: true },
                    { key: 'driveway', label: 'Dedicated Driveway', cost: 5000, selected: false },
                    { key: 'landscaping', label: 'Basic Landscaping', cost: 10000, selected: true },
                  ].map(service => (
                    <div
                      key={service.key}
                      className={`
                        flex items-center justify-between p-2 rounded border
                        ${
                          service.selected
                            ? 'bg-green-50 border-green-300'
                            : 'bg-white border-gray-300'
                        }
                      `}
                    >
                      <div className='flex items-center gap-2'>
                        <input
                          type='checkbox'
                          checked={service.selected}
                          onChange={() => {}}
                          className='w-4 h-4 text-blue-600 rounded'
                        />
                        <span className='text-sm'>{service.label}</span>
                      </div>
                      <span className='text-sm font-medium text-green-600'>
                        +${service.cost.toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
                <button className='text-xs text-blue-600 mt-2'>+ Add More</button>
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
            <div className='space-y-4'>
              {/* Professional Design Services */}
              <div>
                <label className='text-xs font-medium text-gray-700 block mb-2'>
                  Professional Design Services ℹ️
                </label>
                
                <div className='space-y-2'>
                  {/* Include Design Services */}
                  <div className='bg-green-50 border border-green-300 rounded p-3'>
                    <div className='flex items-center gap-2'>
                      <input
                        type='checkbox'
                        checked={pricingData.designServices === 12500}
                        onChange={() => updatePricingData({ 
                          designServices: pricingData.designServices === 12500 ? 0 : 12500 
                        })}
                        className='w-4 h-4 text-blue-600 rounded'
                      />
                      <span className='text-sm font-medium'>Include Design Services</span>
                      <span className='text-sm font-bold text-green-600'>+$12,500</span>
                    </div>
                    <div className='text-xs text-gray-600 mt-1 ml-6'>
                      Architectural plans, structural engineering, and permit assistance
                    </div>
                  </div>

                  {/* Solar Ready */}
                  <div className='flex items-center gap-2 p-2'>
                    <input
                      type='checkbox'
                      className='w-4 h-4 text-blue-600 rounded'
                    />
                    <span className='text-sm'>Solar Ready</span>
                  </div>

                  {/* FEMA Compliance */}
                  <div className='flex items-center gap-2 p-2'>
                    <input
                      type='checkbox'
                      className='w-4 h-4 text-blue-600 rounded'
                    />
                    <span className='text-sm'>FEMA Compliance</span>
                  </div>
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
            <div className='space-y-4'>
              {/* Additional Notes Section */}
              <div>
                <label className='text-xs font-medium text-gray-700 block mb-2'>
                  Additional Notes (Optional)
                </label>
                <textarea
                  value={projectData.additionalNotes || ''}
                  onChange={e => updateProjectData({ additionalNotes: e.target.value })}
                  placeholder='This is a sample ADU project for testing the form functionality.'
                  className='w-full h-20 px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right Sidebar */}
      <div className='w-80 h-screen'>
        <SidebarWithPricing
          sections={sections}
          currentSection={currentSection}
          onSectionSelect={setCurrentSection}
          onExpandAll={() => setAllExpanded(!allExpanded)}
          allExpanded={allExpanded}
          liveCalculation={{
            finalTotal: (
              (pricingData.designServices || 0) +
              Object.values(pricingData.utilities || {}).reduce((sum: number, cost: number) => sum + cost, 0) +
              Object.values(pricingData.additionalServices || {}).reduce(
                (sum: number, cost: number) => sum + cost,
                0
              )
            ),
            baseConstruction: 160000, // Base construction cost
            servicesTotal: pricingData.designServices || 0,
            utilitiesTotal: Object.values(pricingData.utilities || {}).reduce((sum: number, cost: number) => sum + cost, 0),
            addonsTotal: Object.values(pricingData.additionalServices || {}).reduce((sum: number, cost: number) => sum + cost, 0)
          }}
          onGenerate={() => console.log('Generate PDF clicked')}
          onSaveDraft={() => console.log('Save Draft clicked')}
          isGenerating={false}
          isFormComplete={sections.slice(0, 2).every(s => s.isComplete)}
          formData={{
            client: {
              firstName: projectData.clientName?.split(' ')[0] || '',
              lastName: projectData.clientName?.split(' ').slice(1).join(' ') || '',
              address: projectData.propertyAddress || ''
            },
            project: {
              aduType: projectData.aduType || '',
              squareFootage: projectData.squareFootage || 0,
              bedrooms: projectData.bedrooms || null,
              bathrooms: projectData.bathrooms || null,
              hvacType: projectData.hvacType || '',
              needsDesign: !!pricingData.designServices
            }
          }}
          pricingData={pricingData}
        />
        </div>
      </div>
    </div>
  );
};
