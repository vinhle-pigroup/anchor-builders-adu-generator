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

  // Define form sections
  const sections: FormSection[] = [
    {
      id: 'client',
      title: 'Client Information',
      isComplete: !!(projectData.clientName && projectData.clientEmail),
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
    });
  };

  return (
    <div className='flex flex-col h-screen bg-gradient-to-br from-stone-100 to-blue-50'>
      {/* Simple Header */}
      <div className='bg-white border-b p-4'>
        <h1 className='text-2xl font-bold'>Anchor Builders ADU Generator - Restored Design</h1>
        <div className='flex gap-4 mt-2'>
          {sections.map(section => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={`px-4 py-2 rounded ${
                currentSection === section.id ? 'bg-blue-600 text-white' : 'bg-gray-200'
              }`}
            >
              {section.title} {section.isComplete && '✓'}
            </button>
          ))}
        </div>
      </div>
      
      {/* Main Content */}
      <div className='flex flex-1 overflow-hidden'>
        <div className='flex-1 p-6 overflow-y-auto'>
          {/* Test Data Button */}
          <button
            onClick={loadTestData}
            className='mb-4 px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700'
          >
            Load Test Data
          </button>

          {/* 4-Card Grid */}
          <div className='grid grid-cols-2 gap-6'>
            {/* Card 1: Client Info */}
            <div className='bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200'>
              <h2 className='text-xl font-bold mb-4'>CLIENT INFORMATION</h2>
              <div className='space-y-4'>
                <FormField label='Client Name' isRequired>
                  <ValidatedInput
                    type='text'
                    value={projectData.clientName || ''}
                    onChange={value => updateProjectData({ clientName: value })}
                    placeholder='Enter name'
                    fieldName='clientName'
                  />
                </FormField>
                <FormField label='Email' isRequired>
                  <ValidatedInput
                    type='email'
                    value={projectData.clientEmail || ''}
                    onChange={value => updateProjectData({ clientEmail: value })}
                    placeholder='email@example.com'
                    fieldName='clientEmail'
                  />
                </FormField>
              </div>
            </div>

            {/* Card 2: ADU Config */}
            <div className='bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200'>
              <h2 className='text-xl font-bold mb-4'>ADU CONFIGURATION</h2>
              <div className='space-y-4'>
                <div>
                  <label className='block text-sm font-medium mb-2'>ADU Type</label>
                  <div className='grid grid-cols-3 gap-2'>
                    {['detached', 'attached', 'garage'].map(type => (
                      <button
                        key={type}
                        onClick={() => updateProjectData({ aduType: type })}
                        className={`p-2 rounded border ${
                          projectData.aduType === type
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>
                <FormField label='Square Footage'>
                  <input
                    type='number'
                    value={projectData.squareFootage || ''}
                    onChange={e => updateProjectData({ squareFootage: parseInt(e.target.value) || 0 })}
                    className='w-full p-2 border rounded'
                  />
                </FormField>
              </div>
            </div>

            {/* Card 3: Design Services */}
            <div className='bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200'>
              <h2 className='text-xl font-bold mb-4'>DESIGN SERVICES</h2>
              <div className='space-y-2'>
                {[
                  { value: 12500, label: 'Standard Package' },
                  { value: 18500, label: 'Premium Package' },
                  { value: 0, label: 'Client Provides' },
                ].map(option => (
                  <button
                    key={option.value}
                    onClick={() => updatePricingData({ designServices: option.value })}
                    className={`w-full p-3 rounded border text-left ${
                      pricingData.designServices === option.value
                        ? 'bg-blue-600 text-white'
                        : 'bg-white border-gray-300'
                    }`}
                  >
                    {option.label} {option.value > 0 && `- $${option.value.toLocaleString()}`}
                  </button>
                ))}
              </div>
            </div>

            {/* Card 4: Notes */}
            <div className='bg-white rounded-2xl p-6 shadow-lg border-2 border-gray-200'>
              <h2 className='text-xl font-bold mb-4'>ADDITIONAL NOTES</h2>
              <textarea
                value={projectData.additionalNotes || ''}
                onChange={e => updateProjectData({ additionalNotes: e.target.value })}
                placeholder='Enter any additional notes...'
                className='w-full h-32 p-2 border rounded'
              />
            </div>
          </div>
        </div>

        {/* Simple Sidebar */}
        <div className='w-80 bg-white border-l p-6'>
          <h3 className='text-xl font-bold mb-4'>Project Summary</h3>
          <div className='bg-green-50 p-4 rounded mb-4'>
            <div className='text-3xl font-bold text-green-700'>
              $160,000
            </div>
            <div className='text-sm text-green-600'>Base Price</div>
          </div>
          {pricingData.designServices && pricingData.designServices > 0 && (
            <div className='mb-2'>
              + Design: ${pricingData.designServices.toLocaleString()}
            </div>
          )}
          <div className='text-xl font-bold mt-4'>
            Total: ${(160000 + (pricingData.designServices || 0)).toLocaleString()}
          </div>
          <button className='w-full mt-6 py-3 bg-blue-600 text-white rounded font-bold hover:bg-blue-700'>
            Generate PDF
          </button>
        </div>
      </div>
    </div>
  );
};