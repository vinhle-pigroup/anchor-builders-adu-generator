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
        const total = 2;
        
        if (projectData.aduType) completed += 1;
        if (projectData.propertyAddress) completed += 1;
        
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
      title: 'PROPERTY CONFIGURATION',
      isComplete: !!(projectData.aduType && projectData.propertyAddress),
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
      aduType: 'adu',
      additionalNotes: 'This is a sample ADU project for testing the form functionality.',
    });

    updatePricingData({
      designServices: 12500,
      solarReady: true,
      femaCompliance: true,
    });
  };

  // Mobile accordion toggle
  const toggleCard = (cardId: string) => {
    if (isMobile) {
      setExpandedCard(expandedCard === cardId ? null : cardId);
    }
  };

  return (
    <div className='min-h-screen bg-stone-50'>
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

      <div className='px-4 py-4 h-[calc(100vh-73px)]'>
        <div className='grid xl:grid-cols-[1fr,320px] gap-4 h-full'>
          {/* Main Form */}
          <div className='space-y-3 lg:grid lg:grid-cols-2 lg:gap-3 lg:space-y-0 overflow-y-auto pr-1'>
            {sections.map((section, index) => (
              <div key={section.id} className="bg-white rounded-xl border border-gray-200 shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300 relative">
                {/* Card Header with Stone Background */}
                <div 
                  className="mb-3 -mx-4 -mt-4 px-4 py-2 border-b border-stone-200 shadow-sm cursor-pointer"
                  onClick={() => toggleCard(section.id)}
                  style={{ backgroundColor: '#e7e5e4' }}
                >
                  <div className='flex items-center justify-between'>
                    <h3 className='text-xs font-bold text-gray-800 uppercase tracking-wide'>
                      {index + 1}. {section.title}
                    </h3>
                    <div className='flex items-center gap-2'>
                      {section.isComplete ? (
                        <span className='text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded border border-emerald-200'>
                          COMPLETE
                        </span>
                      ) : (
                        <span className='text-[10px] font-bold text-stone-600 bg-stone-100 px-1.5 py-0.5 rounded border border-stone-300'>
                          {calculateSectionProgress(section.id)}%
                        </span>
                      )}
                      {isMobile && (
                        <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${
                          expandedCard === section.id ? 'rotate-180' : ''
                        }`} />
                      )}
                    </div>
                  </div>
                </div>

                {/* Card Content */}
                <div className={`
                  ${isMobile ? (expandedCard === section.id ? 'block' : 'hidden') : 'block'}
                  px-4 pb-4 space-y-2
                `}>
                  {section.id === 'client' && (
                    <div className='space-y-3'>
                      {/* Proposal Info */}
                      <div className='grid grid-cols-2 gap-4 bg-stone-50 p-2 rounded-lg'>
                        <div>
                          <label className='text-[11px] font-medium text-gray-600 block mb-1'>Proposal #</label>
                          <div className='text-[11px] font-semibold text-blue-800'>AB-2025-{Math.floor(Math.random() * 900000) + 100000}</div>
                        </div>
                        <div>
                          <label className='text-[11px] font-medium text-gray-600 block mb-1'>Date</label>
                          <div className='text-[11px] text-gray-700'>{new Date().toLocaleDateString()}</div>
                        </div>
                      </div>

                      {/* Primary Client */}
                      <div>
                        <div className='text-[11px] font-medium text-gray-700 mb-1'>Primary Client</div>
                        <div className='grid grid-cols-2 gap-2'>
                          <input
                            type='text'
                            value={projectData.clientName?.split(' ')[0] || ''}
                            onChange={e => {
                              const lastName = projectData.clientName?.split(' ').slice(1).join(' ') || '';
                              updateProjectData({ clientName: `${e.target.value} ${lastName}`.trim() });
                            }}
                            className='px-2 py-1 border border-stone-300 rounded text-[11px] h-7 focus:ring-1 focus:ring-stone-400 focus:border-transparent'
                            placeholder='First Name'
                          />
                          <input
                            type='text'
                            value={projectData.clientName?.split(' ').slice(1).join(' ') || ''}
                            onChange={e => {
                              const firstName = projectData.clientName?.split(' ')[0] || '';
                              updateProjectData({ clientName: `${firstName} ${e.target.value}`.trim() });
                            }}
                            className='px-2 py-1 border border-stone-300 rounded text-[11px] h-7 focus:ring-1 focus:ring-stone-400 focus:border-transparent'
                            placeholder='Last Name'
                          />
                        </div>
                        <div className='grid grid-cols-2 gap-2 mt-1'>
                          <input
                            type='email'
                            value={projectData.clientEmail || ''}
                            onChange={e => updateProjectData({ clientEmail: e.target.value })}
                            className='px-2 py-1 border border-stone-300 rounded text-[11px] h-7 focus:ring-1 focus:ring-stone-400 focus:border-transparent'
                            placeholder='Email'
                          />
                          <input
                            type='tel'
                            value={projectData.clientPhone || ''}
                            onChange={e => updateProjectData({ clientPhone: e.target.value })}
                            className='px-2 py-1 border border-stone-300 rounded text-[11px] h-7 focus:ring-1 focus:ring-stone-400 focus:border-transparent'
                            placeholder='Phone'
                          />
                        </div>
                      </div>

                      {/* Secondary Client */}
                      <div>
                        <div className='text-[11px] font-medium text-gray-700 mb-1'>Secondary Client (Optional)</div>
                        <div className='grid grid-cols-2 gap-2'>
                          <input
                            type='text'
                            className='px-2 py-1 border border-stone-300 rounded text-[11px] h-7 focus:ring-1 focus:ring-stone-400 focus:border-transparent'
                            placeholder='First Name'
                          />
                          <input
                            type='text'
                            className='px-2 py-1 border border-stone-300 rounded text-[11px] h-7 focus:ring-1 focus:ring-stone-400 focus:border-transparent'
                            placeholder='Last Name'
                          />
                        </div>
                        <div className='grid grid-cols-2 gap-2 mt-1'>
                          <input
                            type='email'
                            className='px-2 py-1 border border-stone-300 rounded text-[11px] h-7 focus:ring-1 focus:ring-stone-400 focus:border-transparent'
                            placeholder='Email'
                          />
                          <input
                            type='tel'
                            className='px-2 py-1 border border-stone-300 rounded text-[11px] h-7 focus:ring-1 focus:ring-stone-400 focus:border-transparent'
                            placeholder='Phone'
                          />
                        </div>
                      </div>

                      {/* Friends & Family Checkbox */}
                      <label className='flex items-center gap-2 cursor-pointer py-1'>
                        <input type='checkbox' className='w-3 h-3' />
                        <span className='text-[11px] text-gray-700'>Friends & Family Discount (10% off)</span>
                      </label>
                    </div>
                  )}

                  {section.id === 'property' && (
                    <div className='space-y-2'>
                      {/* Property Type Grid */}
                      <div>
                        <div className='text-[11px] font-medium text-gray-700 mb-1'>Property Type</div>
                        <div className='grid grid-cols-2 gap-2'>
                          {[
                            { value: 'adu', label: 'ADU' },
                            { value: 'duplex', label: 'Duplex' },
                            { value: 'triplex', label: 'Triplex' },
                            { value: 'custom', label: 'Custom' },
                          ].map(option => (
                            <label
                              key={option.value}
                              className={`
                                relative flex items-center justify-center
                                p-2 rounded-lg border-2 cursor-pointer
                                transition-all duration-200
                                text-[11px] font-medium
                                h-9
                                ${projectData.aduType === option.value
                                  ? 'bg-stone-100 border-stone-500 text-stone-700'
                                  : 'bg-white border-gray-300 text-gray-600 hover:border-stone-400'
                                }
                              `}
                            >
                              <input
                                type='radio'
                                name='aduType'
                                value={option.value}
                                checked={projectData.aduType === option.value}
                                onChange={e => updateProjectData({ aduType: e.target.value })}
                                className='sr-only'
                              />
                              <span>{option.label}</span>
                              {projectData.aduType === option.value && (
                                <div className='absolute top-1 right-1 w-2 h-2 bg-stone-500 rounded-full' />
                              )}
                            </label>
                          ))}
                        </div>
                      </div>

                      {/* Property Address */}
                      <div>
                        <div className='text-[11px] font-medium text-gray-700 mb-1'>Property Address</div>
                        <input
                          type='text'
                          value={projectData.propertyAddress || ''}
                          onChange={e => updateProjectData({ propertyAddress: e.target.value })}
                          className='w-full px-2 py-1 border border-stone-300 rounded text-[11px] h-7 focus:ring-1 focus:ring-stone-400 focus:border-transparent'
                          placeholder='Property Address'
                        />
                      </div>

                      {/* Additional Options */}
                      <div>
                        <div className='text-[11px] font-medium text-gray-700 mb-1'>Additional Options</div>
                        <div className='space-y-1'>
                          <label className='flex items-center gap-2 cursor-pointer py-0.5'>
                            <input type='checkbox' className='w-3 h-3' />
                            <span className='text-[11px] text-gray-700'>Bundle Options</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'services' && (
                    <div className='space-y-2'>
                      {/* Design Services Category */}
                      <div className='border border-gray-200 rounded-lg overflow-hidden'>
                        <button className='w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-left transition-colors duration-200'>
                          <span className='text-[11px] font-medium text-gray-700'>Design Services</span>
                          <svg className='w-3 h-3 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                          </svg>
                        </button>
                        <div className='px-3 py-2 space-y-1 bg-white'>
                          <label className='flex items-center gap-2 py-0.5 cursor-pointer'>
                            <input 
                              type='checkbox' 
                              checked={pricingData.designServices === 12500}
                              onChange={e => updatePricingData({ designServices: e.target.checked ? 12500 : 0 })}
                              className='w-3 h-3' 
                            />
                            <span className='text-[10px] text-gray-600 flex-1'>Architectural Plans</span>
                            <span className='text-[10px] text-stone-600 font-medium'>$12,500</span>
                          </label>
                        </div>
                      </div>

                      {/* Permits Category */}
                      <div className='border border-gray-200 rounded-lg overflow-hidden'>
                        <button className='w-full px-3 py-2 bg-stone-50 hover:bg-stone-100 flex items-center justify-between text-left transition-colors duration-200'>
                          <span className='text-[11px] font-medium text-gray-700'>Permits & Compliance</span>
                          <svg className='w-3 h-3 text-gray-400' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                            <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 9l-7 7-7-7' />
                          </svg>
                        </button>
                        <div className='px-3 py-2 space-y-1 bg-white max-h-20 overflow-y-auto'>
                          <label className='flex items-center gap-2 py-0.5 cursor-pointer'>
                            <input 
                              type='checkbox' 
                              checked={!!pricingData.solarReady}
                              onChange={e => updatePricingData({ solarReady: e.target.checked })}
                              className='w-3 h-3' 
                            />
                            <span className='text-[10px] text-gray-600 flex-1'>Solar Ready</span>
                          </label>
                          <label className='flex items-center gap-2 py-0.5 cursor-pointer'>
                            <input 
                              type='checkbox' 
                              checked={!!pricingData.femaCompliance}
                              onChange={e => updatePricingData({ femaCompliance: e.target.checked })}
                              className='w-3 h-3' 
                            />
                            <span className='text-[10px] text-gray-600 flex-1'>FEMA Compliance</span>
                          </label>
                        </div>
                      </div>

                      {/* Add Custom Service */}
                      <button className='w-full py-1.5 px-3 text-[11px] font-medium bg-stone-100 hover:bg-stone-200 text-gray-700 border border-stone-200 rounded-lg transition-all'>
                        + Add Custom Service
                      </button>
                    </div>
                  )}

                  {section.id === 'notes' && (
                    <div>
                      <div className='text-[11px] font-medium text-gray-700 mb-1'>Additional Notes</div>
                      <textarea
                        value={projectData.additionalNotes || ''}
                        onChange={e => updateProjectData({ additionalNotes: e.target.value })}
                        placeholder='Additional requirements, special requests, or site-specific notes...'
                        className='w-full px-2 py-1 text-[11px] border border-stone-300 rounded-lg resize-none min-h-[60px] max-h-[100px] focus:ring-1 focus:ring-stone-400 focus:border-transparent placeholder-gray-400'
                        rows={3}
                        onInput={(e) => {
                          const target = e.target as HTMLTextAreaElement;
                          target.style.height = 'auto';
                          target.style.height = Math.min(target.scrollHeight, 100) + 'px';
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Floating Sidebar */}
          <div className='xl:block hidden h-full'>
            <div className='w-80 bg-white border-l border-gray-200 flex flex-col h-full shadow-2xl drop-shadow-2xl relative overflow-visible'>
              <div className='p-3 flex-1 overflow-y-auto'>
                <div className='bg-stone-200 p-3 shadow-2xl border border-stone-300 rounded-xl hover:shadow-[0_20px_50px_rgba(168,162,158,0.5)] hover:scale-105 hover:-translate-y-1 hover:z-50 transition-all duration-300 relative mx-2'>
                  {/* Header */}
                  <div className='-mx-3 -mt-3 mb-2 px-3 py-1.5 bg-stone-100 border-b border-stone-300 shadow-sm rounded-t-xl'>
                    <h3 className='text-xs font-bold text-gray-800 text-center tracking-wide uppercase'>Project Summary</h3>
                  </div>

                  {/* Summary Items */}
                  <div className='space-y-1.5 text-xs'>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Client:</span>
                      <span className='text-gray-800 font-medium'>{projectData.clientName || 'Missing'}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Address:</span>
                      <span className='text-gray-800 font-medium'>{projectData.propertyAddress || 'Missing'}</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-gray-600'>Type:</span>
                      <span className='text-gray-800 font-medium'>{projectData.aduType || 'Not Selected'}</span>
                    </div>

                    {/* Divider */}
                    <div className='border-t border-stone-200 my-2'></div>
                    
                    {/* Total */}
                    <div className='flex justify-between text-xs font-bold'>
                      <span>Total:</span>
                      <span className='bg-stone-600 text-stone-100 px-2 py-0.5 rounded text-xs'>
                        ${(
                          (pricingData.designServices || 0) +
                          Object.values(pricingData.utilities || {}).reduce((a, b) => a + b, 0) +
                          Object.values(pricingData.additionalServices || {}).reduce((a, b) => a + b, 0)
                        ).toLocaleString()}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className='mt-3 space-y-1'>
                    <button className='w-full py-2 px-3 rounded text-xs font-bold bg-stone-600 hover:bg-stone-700 text-white border-2 border-stone-600 shadow-lg hover:shadow-xl transition-all'>
                      Generate Proposal
                    </button>
                    <button className='w-full py-1.5 px-3 rounded text-xs font-medium bg-stone-50 hover:bg-stone-100 text-gray-700 border-2 border-stone-200 transition-all'>
                      Save Draft
                    </button>
                  </div>

                  {/* Progress Section */}
                  <div className='mt-3 pt-3 border-t border-stone-200'>
                    <h4 className='text-[10px] font-bold text-gray-800 text-center tracking-wide uppercase mb-2'>Progress</h4>
                    <div className='flex justify-center gap-2'>
                      {[1,2,3,4].map(num => (
                        <button key={num} className='w-7 h-7 rounded-lg text-[10px] font-bold border-2 bg-stone-500 text-white transition-all hover:bg-stone-600'>
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};