import React, { useState, useCallback } from 'react';
import {
  User,
  Home,
  Paintbrush,
  FileText,
  CheckCircle,
  FlaskConical,
  Calculator,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [expandedCard, setExpandedCard] = useState<string | null>('client');

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
        const total = 5;
        
        if (projectData.clientName) completed += 1;
        if (projectData.clientEmail) completed += 1;
        if (projectData.clientPhone) completed += 1;
        if (projectData.propertyAddress) completed += 1;
        if (projectData.city && projectData.state && projectData.zipCode) completed += 1;
        
        return Math.round((completed / total) * 100);
      }
      case 'property': {
        let completed = 0;
        const total = 4;
        
        if (projectData.aduType) completed += 1;
        if (projectData.squareFootage) completed += 1;
        if (projectData.bedrooms) completed += 1;
        if (projectData.bathrooms) completed += 1;
        
        return Math.round((completed / total) * 100);
      }
      case 'services': {
        return pricingData.designServices || pricingData.solarReady || pricingData.femaCompliance ? 100 : 0;
      }
      case 'notes': {
        return projectData.additionalNotes ? 100 : 0;
      }
      default:
        return 0;
    }
  };

  // Define form sections
  const sections: FormSection[] = [
    {
      id: 'client',
      title: 'CLIENT INFORMATION',
      isComplete: !!(projectData.clientName && projectData.clientEmail && projectData.propertyAddress),
    },
    {
      id: 'property',
      title: 'ADU CONFIGURATION',
      isComplete: !!(projectData.aduType && projectData.squareFootage),
    },
    {
      id: 'services',
      title: 'PROFESSIONAL SERVICES',
      isComplete: !!(pricingData.designServices || pricingData.solarReady || pricingData.femaCompliance),
    },
    {
      id: 'notes',
      title: 'PROJECT NOTES',
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

  // Mobile accordion toggle
  const toggleCard = (cardId: string) => {
    if (isMobile) {
      setExpandedCard(expandedCard === cardId ? null : cardId);
    }
  };

  return (
    <div className='min-h-screen bg-gray-100'>
      {/* Header */}
      <div className='bg-white shadow-sm border-b'>
        <div className='px-4 py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <button className='mr-4 p-2 text-slate-600 hover:text-slate-800 transition-colors lg:hidden'>
                <ArrowLeft className='w-5 h-5' />
              </button>
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
              <div className='text-right hidden sm:block'>
                <p className='text-xs text-slate-600'>Total</p>
                <p className='text-xl font-bold text-blue-600'>
                  ${(
                    (pricingData.designServices || 0) +
                    Object.values(pricingData.utilities || {}).reduce((a, b) => a + b, 0) +
                    Object.values(pricingData.additionalServices || {}).reduce((a, b) => a + b, 0)
                  ).toLocaleString()}
                </p>
              </div>
              
              <button
                onClick={loadTestData}
                className='bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:from-blue-600 hover:to-indigo-700 transition-all flex items-center min-h-[44px]'
              >
                <FlaskConical className='w-4 h-4 mr-1' />
                <span className='sm:hidden'>Test</span>
                <span className='hidden sm:inline'>Load Test Data</span>
              </button>
              
              <button className='bg-emerald-500 text-white px-3 py-2 sm:px-4 sm:py-2 rounded-lg text-xs sm:text-sm font-medium hover:bg-emerald-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-h-[44px]'>
                <FileText className='w-4 h-4 mr-1' />
                <span className='sm:hidden'>PDF</span>
                <span className='hidden sm:inline'>Generate</span>
              </button>

              <div className='w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-blue-700 transition-colors'>
                JS
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className='px-6 py-6'>
        <div className='grid xl:grid-cols-[1fr,384px] gap-6'>
          {/* Main Form */}
          <div className='space-y-4 lg:grid lg:grid-cols-2 lg:gap-4 lg:space-y-0'>
            {sections.map((section, index) => (
              <div key={section.id} className='bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 min-h-[200px] flex flex-col'>
                {/* Card Header with Navy Background */}
                <div 
                  className='flex items-center justify-between p-4 bg-slate-700 text-white rounded-t-lg cursor-pointer'
                  onClick={() => toggleCard(section.id)}
                >
                  <div className='flex items-center gap-3'>
                    <div className={`
                      w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                      ${section.isComplete 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-blue-600 text-white border-2 border-white'
                      }
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <h2 className='text-sm font-bold uppercase tracking-wide'>
                        {section.title}
                      </h2>
                      <div className='flex items-center gap-2 mt-1'>
                        {section.isComplete ? (
                          <span className='text-xs font-bold text-emerald-300'>Complete</span>
                        ) : (
                          <span className='text-xs text-slate-300'>{calculateSectionProgress(section.id)}%</span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {isMobile && (
                    <ChevronDown className={`w-5 h-5 text-white transition-transform ${
                      expandedCard === section.id ? 'rotate-180' : ''
                    }`} />
                  )}
                </div>

                {/* Card Content */}
                <div className={`
                  ${isMobile ? (expandedCard === section.id ? 'block' : 'hidden') : 'block'}
                  p-4 flex-1
                `}>
                  {section.id === 'client' && (
                    <div className='space-y-4'>
                      {/* Property Address */}
                      <div className='mb-4 bg-slate-50 p-3 rounded-lg'>
                        <label className='block text-xs font-medium text-slate-600 mb-1'>Proposal #</label>
                        <div className='text-sm font-semibold text-blue-800'>AB-2025-{Math.floor(Math.random() * 900000) + 100000}</div>
                        <label className='block text-xs font-medium text-slate-600 mb-1 mt-2'>Date</label>
                        <div className='text-sm text-slate-700'>{new Date().toLocaleDateString()}</div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-slate-700 mb-2'>Property Address</label>
                        <input
                          type='text'
                          value={projectData.propertyAddress || ''}
                          onChange={e => updateProjectData({ propertyAddress: e.target.value })}
                          className='w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                          placeholder='Street Address'
                        />
                        <div className='grid grid-cols-3 gap-2 mt-2'>
                          <input
                            type='text'
                            value={projectData.city || ''}
                            onChange={e => updateProjectData({ city: e.target.value })}
                            className='px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='City'
                          />
                          <input
                            type='text'
                            value={projectData.state || ''}
                            onChange={e => updateProjectData({ state: e.target.value })}
                            className='px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='State'
                          />
                          <input
                            type='text'
                            value={projectData.zipCode || ''}
                            onChange={e => updateProjectData({ zipCode: e.target.value })}
                            className='px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='ZIP'
                          />
                        </div>
                      </div>

                      <div>
                        <label className='block text-sm font-medium text-slate-700 mb-2'>Primary Client</label>
                        <div className='grid grid-cols-1 gap-2'>
                          <input
                            type='text'
                            value={projectData.clientName || ''}
                            onChange={e => updateProjectData({ clientName: e.target.value })}
                            className='px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='Full Name'
                          />
                          <div className='grid grid-cols-2 gap-2'>
                            <input
                              type='email'
                              value={projectData.clientEmail || ''}
                              onChange={e => updateProjectData({ clientEmail: e.target.value })}
                              className='px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='Email'
                            />
                            <input
                              type='tel'
                              value={projectData.clientPhone || ''}
                              onChange={e => updateProjectData({ clientPhone: e.target.value })}
                              className='px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                              placeholder='Phone'
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'property' && (
                    <div className='space-y-4'>
                      <div>
                        <label className='block text-sm font-medium text-slate-700 mb-2'>ADU Type Selection</label>
                        <div className='grid grid-cols-3 gap-2'>
                          {[
                            { value: 'detached', label: 'Detached', price: '$180k' },
                            { value: 'attached', label: 'Attached', price: '$160k' },
                            { value: 'jadu', label: 'JADU', price: '$120k' },
                          ].map(option => (
                            <button
                              key={option.value}
                              type='button'
                              onClick={() => updateProjectData({ aduType: option.value })}
                              className={`
                                p-3 rounded border text-center transition-all
                                ${projectData.aduType === option.value
                                  ? 'bg-blue-600 border-blue-600 text-white'
                                  : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'
                                }
                              `}
                            >
                              <div className='text-sm font-semibold'>{option.label}</div>
                              <div className='text-xs opacity-75'>{option.price}</div>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className='grid grid-cols-2 gap-4'>
                        <div>
                          <label className='block text-sm font-medium text-slate-700 mb-2'>Square Footage</label>
                          <input
                            type='number'
                            value={projectData.squareFootage || ''}
                            onChange={e => updateProjectData({ squareFootage: parseInt(e.target.value) || 0 })}
                            className='w-full px-3 py-2 border border-slate-300 rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                            placeholder='Enter sq ft'
                          />
                          <div className='grid grid-cols-2 gap-1 mt-2'>
                            {[600, 800, 1000, 1200].map(sqft => (
                              <button
                                key={sqft}
                                type='button'
                                onClick={() => updateProjectData({ squareFootage: sqft })}
                                className={`
                                  px-2 py-1 text-sm rounded border transition-all
                                  ${projectData.squareFootage === sqft
                                    ? 'bg-blue-100 border-blue-400 text-blue-700'
                                    : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'
                                  }
                                `}
                              >
                                {sqft}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className='block text-sm font-medium text-slate-700 mb-2'>Layout</label>
                          <div className='grid grid-cols-2 gap-2'>
                            <div>
                              <label className='block text-xs text-slate-600 mb-1'>Bedrooms</label>
                              <div className='grid grid-cols-3 gap-1'>
                                {[1, 2, 3].map(num => (
                                  <button
                                    key={num}
                                    type='button'
                                    onClick={() => updateProjectData({ bedrooms: num })}
                                    className={`
                                      py-1 text-sm rounded border transition-all
                                      ${projectData.bedrooms === num
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'
                                      }
                                    `}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div>
                              <label className='block text-xs text-slate-600 mb-1'>Bathrooms</label>
                              <div className='grid grid-cols-3 gap-1'>
                                {[1, 1.5, 2].map(num => (
                                  <button
                                    key={num}
                                    type='button'
                                    onClick={() => updateProjectData({ bathrooms: num })}
                                    className={`
                                      py-1 text-sm rounded border transition-all
                                      ${projectData.bathrooms === num
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-white border-slate-300 text-slate-700 hover:border-blue-400'
                                      }
                                    `}
                                  >
                                    {num}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'services' && (
                    <div className='space-y-3'>
                      <div>
                        <label className='cursor-pointer flex items-start gap-3 p-3 rounded border border-emerald-300 bg-emerald-50 transition-all'>
                          <input
                            type='checkbox'
                            checked={pricingData.designServices === 12500}
                            onChange={e => updatePricingData({ designServices: e.target.checked ? 12500 : 0 })}
                            className='w-4 h-4 text-emerald-600 rounded mt-0.5'
                          />
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <span className='text-sm font-medium'>Include Design Services</span>
                              <span className='font-bold text-emerald-600'>$12,500</span>
                            </div>
                            <p className='text-xs text-slate-600 mt-1'>Architectural plans, structural engineering, and permit assistance</p>
                          </div>
                        </label>
                      </div>

                      <div className='space-y-2'>
                        <label className='cursor-pointer flex items-center gap-3 p-2 rounded border border-slate-200 bg-white hover:border-slate-300 transition-all'>
                          <input
                            type='checkbox'
                            checked={!!pricingData.solarReady}
                            onChange={e => updatePricingData({ solarReady: e.target.checked })}
                            className='w-4 h-4 text-slate-600 rounded'
                          />
                          <span className='text-sm font-medium text-slate-700'>Solar Ready</span>
                        </label>

                        <label className='cursor-pointer flex items-center gap-3 p-2 rounded border border-slate-200 bg-white hover:border-slate-300 transition-all'>
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
                  )}

                  {section.id === 'notes' && (
                    <div>
                      <label className='block text-sm font-medium text-slate-700 mb-2'>Additional Notes</label>
                      <textarea
                        value={projectData.additionalNotes || ''}
                        onChange={e => updateProjectData({ additionalNotes: e.target.value })}
                        placeholder='Any special requirements, preferences, or project details...'
                        className='w-full h-24 px-3 py-2 border border-slate-300 rounded text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Sidebar */}
          <div className='xl:block hidden'>
            <div className='bg-white rounded-lg shadow-sm p-4 sticky top-6'>
              <div className='flex items-center mb-4'>
                <Calculator className='w-5 h-5 text-blue-600 mr-2' />
                <h3 className='font-semibold text-slate-800'>Project Summary</h3>
              </div>
              
              <div className='space-y-3 text-sm'>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Client:</span>
                  <span className='font-medium'>{projectData.clientName || 'Missing'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Address:</span>
                  <span className='font-medium'>{projectData.propertyAddress || 'Missing'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Property Type:</span>
                  <span className='font-medium'>{projectData.aduType || 'Not Selected'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Size:</span>
                  <span className='font-medium'>{projectData.squareFootage ? `${projectData.squareFootage} sq ft` : 'Missing'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Layout:</span>
                  <span className='font-medium'>{projectData.bedrooms && projectData.bathrooms ? `${projectData.bedrooms}BR / ${projectData.bathrooms}BA` : 'Not Selected'}</span>
                </div>
              </div>

              <div className='border-t mt-4 pt-4'>
                <h4 className='font-semibold text-slate-800 mb-2'>Breakdown</h4>
                <div className='space-y-2 text-sm'>
                  {pricingData.designServices && (
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Design:</span>
                      <span className='font-medium'>+${pricingData.designServices.toLocaleString()}</span>
                    </div>
                  )}
                  {Object.entries(pricingData.additionalServices || {}).map(([key, value]) => 
                    value > 0 && (
                      <div key={key} className='flex justify-between'>
                        <span className='text-slate-600 capitalize'>{key.replace('-', ' ')}:</span>
                        <span className='font-medium'>+${value.toLocaleString()}</span>
                      </div>
                    )
                  )}
                </div>
              </div>

              <div className='border-t mt-4 pt-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-lg font-bold text-slate-800'>Total:</span>
                  <span className='text-xl font-bold text-blue-600'>
                    ${(
                      (pricingData.designServices || 0) +
                      Object.values(pricingData.utilities || {}).reduce((a, b) => a + b, 0) +
                      Object.values(pricingData.additionalServices || {}).reduce((a, b) => a + b, 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>

              <button className='w-full bg-emerald-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-emerald-600 transition-colors mt-4'>
                Generate Proposal
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};