import { Building2, FileText, ArrowLeft, Calculator } from 'lucide-react';
import type { ProjectInfo } from '../types/proposal';
import { AnchorPricingEngine } from '../lib/pricing-engine';
import { AnchorPDFGenerator } from '../lib/pdf-generator';
import { calculateMilestonePayments } from '../data/pricing-config';
import { EditablePriceDisplay } from './EditablePriceDisplay';

interface ProjectDetailsFormProps {
  formData: ProjectInfo;
  updateProjectData: (updates: Partial<ProjectInfo>) => void;
  onBack: () => void;
  onNext: () => void;
  isEmbedded?: boolean;
}

export function ProjectDetailsForm({
  formData,
  updateProjectData,
  onBack,
  onNext,
  isEmbedded = false,
}: ProjectDetailsFormProps) {
  const pricingEngine = new AnchorPricingEngine();
  const addOnOptions = pricingEngine.getAddOnOptions();

  const toggleAddOn = (addOnName: string) => {
    const currentAddOns = formData.selectedAddOns || [];
    const isSelected = currentAddOns.includes(addOnName);

    if (isSelected) {
      updateProjectData({
        selectedAddOns: currentAddOns.filter(name => name !== addOnName),
      });
    } else {
      updateProjectData({
        selectedAddOns: [...currentAddOns, addOnName],
      });
    }
  };

  // Price override functions
  const updateBasePriceOverride = (newPrice: number) => {
    updateProjectData({
      priceOverrides: {
        ...formData.priceOverrides,
        basePricePerSqFt: newPrice,
      },
    });
  };

  const updateAddOnPriceOverride = (addOnName: string, newPrice: number) => {
    updateProjectData({
      priceOverrides: {
        ...formData.priceOverrides,
        addOnPrices: {
          ...formData.priceOverrides?.addOnPrices,
          [addOnName]: newPrice,
        },
      },
    });
  };

  const updateMarkupOverride = (newPercentage: number) => {
    updateProjectData({
      priceOverrides: {
        ...formData.priceOverrides,
        markupPercentage: newPercentage / 100, // Convert percentage to decimal
      },
    });
  };

  const updateUtility = (
    utilityType: keyof ProjectInfo['utilities'],
    value: 'shared' | 'separate'
  ) => {
    updateProjectData({
      utilities: {
        ...formData.utilities,
        [utilityType]: value,
      },
    });
  };

  const generateSamplePDF = async () => {
    try {
      // Create sample data using Vinh Le details
      const sampleFormData = {
        client: {
          firstName: 'Vinh',
          lastName: 'Le',
          email: 'vinh.le@email.com',
          phone: '(714) 555-0123',
          address: '12962 Main Street',
          city: 'Garden Grove',
          state: 'CA',
          zipCode: '92840',
        },
        project: {
          aduType: 'detached' as const,
          stories: 1 as const,
          squareFootage: 800,
          bedrooms: 2,
          bathrooms: 2,
          appliancesIncluded: true,
          hvacType: 'central-ac' as const,
          finishLevel: 'standard' as const,
          utilities: {
            waterMeter: 'separate' as const,
            gasMeter: 'separate' as const,
            electricMeter: 'separate' as const,
          },
          sewerConnection: 'existing-lateral' as const,
          needsDesign: true,
          solarDesign: true,
          femaIncluded: false,
          selectedAddOns: ['Extra Bathroom', 'Basic Landscaping', 'Driveway'],
          priceOverrides: {
            basePricePerSqFt: 220,
            markupPercentage: 0.15,
          },
        },
        additionalNotes:
          'Sample proposal showing typical 800 sq ft detached ADU with premium features.',
        timeline: '6-8 months',
      };

      const pdfGenerator = new AnchorPDFGenerator();
      await pdfGenerator.generateProposal(sampleFormData);
      // Note: PDF generation now opens in a new window for printing
    } catch (error) {
      console.error('Sample PDF generation error:', error);
      alert('Error generating sample PDF. Please try again.');
    }
  };

  // Calculate real-time pricing for display
  const currentPricing = (() => {
    try {
      const pricingInputs = {
        squareFootage: formData.squareFootage,
        aduType: formData.aduType,
        stories: formData.stories,
        bedrooms: formData.bedrooms,
        bathrooms: formData.bathrooms,
        utilities: formData.utilities,
        needsDesign: formData.needsDesign,
        appliancesIncluded: formData.appliancesIncluded,
        hvacType: formData.hvacType,
        selectedAddOns: formData.selectedAddOns,
        sewerConnection: formData.sewerConnection,
        solarDesign: formData.solarDesign,
        femaIncluded: formData.femaIncluded,
        priceOverrides: formData.priceOverrides,
      };
      return pricingEngine.calculateProposal(pricingInputs);
    } catch {
      return null;
    }
  })();

  const milestones = currentPricing ? calculateMilestonePayments(currentPricing.grandTotal) : [];

  // Common form content
  const formContent = (
    <div className='grid lg:grid-cols-3 gap-6'>
      {/* Main Form */}
      <div className='lg:col-span-2 space-y-4'>
        {/* Step 1: ADU Configuration - Blue Theme */}
        <div className='bg-white rounded-lg shadow-sm border-l-4 border-blue-500'>
          <div className='bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-t-lg'>
            <div className='flex items-center'>
              <div className='w-7 h-7 bg-blue-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold'>
                1
              </div>
              <h2 className='text-lg font-semibold text-blue-900'>ADU Configuration</h2>
            </div>
          </div>
          <div className='p-4'>
            {/* Compact ADU Type & Size Row */}
            <div className='grid md:grid-cols-2 gap-4 mb-4'>
              {/* ADU Type */}
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>ADU Type *</label>
                <div className='space-y-3'>
                  {/* Detached ADU Option */}
                  <div
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      formData.aduType === 'detached'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                    onClick={() =>
                      updateProjectData({ aduType: 'detached', stories: formData.stories || 1 })
                    }
                  >
                    <div className='flex justify-between items-start mb-3'>
                      <div>
                        <h4 className='font-medium text-slate-800'>Detached ADU</h4>
                        <p className='text-xs text-slate-600'>Standalone unit on your property</p>
                      </div>
                      <EditablePriceDisplay
                        value={
                          formData.priceOverrides?.basePricePerSqFt ??
                          (formData.aduType === 'detached' && formData.stories === 2 ? 240 : 220)
                        }
                        onSave={updateBasePriceOverride}
                        suffix='/sq ft'
                        className='text-blue-600 font-medium text-sm'
                      />
                    </div>

                    {/* Story Selection - Only show when detached is selected */}
                    {formData.aduType === 'detached' && (
                      <div className='flex gap-2'>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            updateProjectData({ stories: 1 });
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            formData.stories === 1 || !formData.stories
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          1 Story
                        </button>
                        <button
                          onClick={e => {
                            e.stopPropagation();
                            updateProjectData({ stories: 2 });
                          }}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                            formData.stories === 2
                              ? 'bg-blue-500 text-white'
                              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          2 Story
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Attached ADU Option */}
                  <div
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      formData.aduType === 'attached'
                        ? 'border-blue-500 bg-blue-50 shadow-md'
                        : 'border-slate-200 hover:border-blue-300'
                    }`}
                    onClick={() => updateProjectData({ aduType: 'attached', stories: undefined })}
                  >
                    <div className='flex justify-between items-center'>
                      <div>
                        <h4 className='font-medium text-slate-800'>Attached ADU</h4>
                        <p className='text-xs text-slate-600'>Connected to existing home</p>
                      </div>
                      <EditablePriceDisplay
                        value={formData.priceOverrides?.basePricePerSqFt ?? 200}
                        onSave={updateBasePriceOverride}
                        suffix='/sq ft'
                        className='text-blue-600 font-medium text-sm'
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Square Footage */}
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>Size *</label>
                <div className='grid grid-cols-2 gap-2 mb-2'>
                  {[400, 600, 800, 1000].map(sqft => (
                    <button
                      key={sqft}
                      onClick={() => updateProjectData({ squareFootage: sqft })}
                      className={`p-2 rounded-lg border-2 text-center transition-all ${
                        formData.squareFootage === sqft
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className='font-semibold text-sm text-slate-800'>{sqft} sq ft</div>
                      <div className='text-xs text-slate-600'>
                        {sqft <= 500
                          ? 'Studio'
                          : sqft <= 700
                            ? 'Small'
                            : sqft <= 900
                              ? 'Medium'
                              : 'Large'}
                      </div>
                    </button>
                  ))}
                </div>
                <div className='flex items-center space-x-2 text-sm'>
                  <label className='text-slate-600'>Custom:</label>
                  <input
                    type='number'
                    className='form-input w-20 text-sm py-1'
                    value={formData.squareFootage}
                    onChange={e =>
                      updateProjectData({ squareFootage: parseInt(e.target.value) || 0 })
                    }
                    min='300'
                    max='1200'
                  />
                  <span className='text-slate-600'>sq ft</span>
                </div>
              </div>
            </div>

            {/* Bedrooms and Bathrooms - Compact Row */}
            <div className='grid md:grid-cols-2 gap-4'>
              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>Bedrooms *</label>
                <div className='grid grid-cols-3 gap-2'>
                  {[1, 2, 3].map(num => (
                    <button
                      key={num}
                      onClick={() => updateProjectData({ bedrooms: num })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.bedrooms === num
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className='font-semibold text-slate-800'>{num}</div>
                      <div className='text-xs text-slate-600'>Bedroom{num > 1 ? 's' : ''}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className='block text-sm font-medium text-slate-700 mb-2'>Bathrooms *</label>
                <div className='grid grid-cols-2 gap-2'>
                  {[1, 2].map(num => (
                    <button
                      key={num}
                      onClick={() => updateProjectData({ bathrooms: num })}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.bathrooms === num
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-slate-200 hover:border-blue-300'
                      }`}
                    >
                      <div className='font-semibold text-slate-800'>{num}</div>
                      <div className='text-xs text-slate-600'>Bathroom{num > 1 ? 's' : ''}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* HVAC System Selection - New Section */}
            <div className='mt-6 pt-6 border-t border-slate-200'>
              <label className='block text-sm font-medium text-slate-700 mb-2'>HVAC System *</label>
              <div className='grid md:grid-cols-2 gap-4'>
                <button
                  onClick={() => updateProjectData({ hvacType: 'central-ac' })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.hvacType === 'central-ac'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className='flex justify-between items-start mb-2'>
                    <h4 className='font-medium text-slate-800'>Central AC</h4>
                    <span className='text-blue-600 font-medium text-sm'>Standard</span>
                  </div>
                  <p className='text-sm text-slate-600'>
                    Ducted central air conditioning system with thermostat control
                  </p>
                </button>

                <button
                  onClick={() => updateProjectData({ hvacType: 'mini-split' })}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    formData.hvacType === 'mini-split'
                      ? 'border-blue-500 bg-blue-50 shadow-md'
                      : 'border-slate-200 hover:border-blue-300'
                  }`}
                >
                  <div className='flex justify-between items-start mb-2'>
                    <h4 className='font-medium text-slate-800'>Mini-Split</h4>
                    <span className='text-blue-600 font-medium text-sm'>Alternative</span>
                  </div>
                  <p className='text-sm text-slate-600'>
                    Ductless mini-split heat pump system - efficient heating & cooling
                  </p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step 2: Utility Connections - Green Theme */}
      <div className='bg-white rounded-lg shadow-sm border-l-4 border-green-500'>
        <div className='bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-t-lg'>
          <div className='flex items-center'>
            <div className='w-7 h-7 bg-green-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold'>
              2
            </div>
            <h2 className='text-lg font-semibold text-green-900'>Utility Connections</h2>
          </div>
        </div>
        <div className='p-4'>
          <p className='text-slate-600 mb-8'>
            Choose how utilities will be connected to your ADU. Consider your long-term needs for
            billing and usage monitoring.
          </p>

          {/* Water Meter */}
          <div className='mb-8'>
            <label className='block text-sm font-medium text-slate-700 mb-4'>
              Water Meter Connection *
              <span className='text-slate-500 font-normal ml-2'>Please select one option</span>
            </label>
            <div className='grid md:grid-cols-2 gap-4 mb-3'>
              <button
                onClick={() => updateUtility('waterMeter', 'shared')}
                className={`p-5 rounded-lg border-2 text-left transition-all ${
                  formData.utilities.waterMeter === 'shared'
                    ? 'border-anchor-500 bg-anchor-50 shadow-md'
                    : 'border-slate-200 hover:border-anchor-300'
                }`}
              >
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-semibold text-slate-800'>Shared Water Meter</h3>
                  <span className='text-green-600 font-medium'>No Cost</span>
                </div>
                <p className='text-sm text-slate-600'>
                  The ADU will share the existing water meter with the main house.
                </p>
              </button>
              <button
                onClick={() => updateUtility('waterMeter', 'separate')}
                className={`p-5 rounded-lg border-2 text-left transition-all ${
                  formData.utilities.waterMeter === 'separate'
                    ? 'border-anchor-500 bg-anchor-50 shadow-md'
                    : 'border-slate-200 hover:border-anchor-300'
                }`}
              >
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-semibold text-slate-800'>Separate Water Meter</h3>
                  <span className='text-anchor-600 font-medium'>+$1,000</span>
                </div>
                <p className='text-sm text-slate-600'>
                  Install a dedicated water meter for independent billing and usage tracking.
                </p>
              </button>
            </div>
            {formData.utilities.waterMeter === 'separate' && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                <p className='text-sm text-blue-800'>
                  💡 <strong>Separate water meter benefits:</strong> Individual billing, easier
                  rental management, and clear usage monitoring for the ADU tenant.
                </p>
              </div>
            )}
          </div>

          {/* Gas Meter */}
          <div className='mb-8'>
            <label className='block text-sm font-medium text-slate-700 mb-4'>
              Gas Meter Connection *
              <span className='text-slate-500 font-normal ml-2'>Please select one option</span>
            </label>
            <div className='grid md:grid-cols-2 gap-4 mb-3'>
              <button
                onClick={() => updateUtility('gasMeter', 'shared')}
                className={`p-5 rounded-lg border-2 text-left transition-all ${
                  formData.utilities.gasMeter === 'shared'
                    ? 'border-anchor-500 bg-anchor-50 shadow-md'
                    : 'border-slate-200 hover:border-anchor-300'
                }`}
              >
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-semibold text-slate-800'>Shared Gas Meter</h3>
                  <span className='text-green-600 font-medium'>No Cost</span>
                </div>
                <p className='text-sm text-slate-600'>
                  The ADU will connect to the existing gas line and meter.
                </p>
              </button>
              <button
                onClick={() => updateUtility('gasMeter', 'separate')}
                className={`p-5 rounded-lg border-2 text-left transition-all ${
                  formData.utilities.gasMeter === 'separate'
                    ? 'border-anchor-500 bg-anchor-50 shadow-md'
                    : 'border-slate-200 hover:border-anchor-300'
                }`}
              >
                <div className='flex justify-between items-start mb-2'>
                  <h3 className='font-semibold text-slate-800'>Separate Gas Meter</h3>
                  <span className='text-anchor-600 font-medium'>+$1,500</span>
                </div>
                <p className='text-sm text-slate-600'>
                  Install a dedicated gas meter for independent billing and usage tracking.
                </p>
              </button>
            </div>
            {formData.utilities.gasMeter === 'separate' && (
              <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                <p className='text-sm text-blue-800'>
                  💡 <strong>Separate gas meter benefits:</strong> Independent billing for heating,
                  cooking, and hot water usage. Ideal for rental properties and long-term ADU
                  occupancy.
                </p>
              </div>
            )}
          </div>

          {/* Electric Meter */}
          <div className='mb-6'>
            <label className='block text-sm font-medium text-slate-700 mb-4'>
              Electric Meter Connection *
              <span className='text-slate-500 font-normal ml-2'>Required by code</span>
            </label>
            <div className='p-5 rounded-lg border-2 border-anchor-500 bg-anchor-50'>
              <div className='flex justify-between items-start mb-2'>
                <h3 className='font-semibold text-slate-800'>Separate Electric Meter</h3>
                <span className='text-anchor-600 font-medium'>+$2,000</span>
              </div>
              <p className='text-sm text-slate-600 mb-3'>
                California building code requires ADUs to have separate electrical service for
                safety and code compliance.
              </p>
              <div className='bg-amber-50 border border-amber-200 rounded-lg p-3'>
                <p className='text-sm text-amber-800'>
                  ⚡ <strong>Why separate electrical is required:</strong> With this additional
                  cost, you will have a separate electrical meter to track electrical usage for the
                  ADU independently, providing clear billing separation, usage monitoring, and
                  meeting California safety requirements for ADU electrical systems.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Design Services & Features */}
        <div className='bg-white rounded-lg shadow-sm p-6 mb-6'>
          <div className='flex items-center mb-6'>
            <div className='w-8 h-8 bg-anchor-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold'>
              3
            </div>
            <h2 className='text-xl font-semibold text-slate-800'>Design Services & Features</h2>
          </div>

          <p className='text-slate-600 mb-8'>
            Select additional services and features for your ADU project. These professional
            services ensure compliance and quality.
          </p>

          {/* Design Services */}
          <div className='mb-8'>
            <label className='block text-sm font-medium text-slate-700 mb-4'>
              Professional Design Services
              <span className='text-slate-500 font-normal ml-2'>
                Highly recommended for permit approval
              </span>
            </label>

            <div
              className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                formData.needsDesign
                  ? 'border-anchor-500 bg-anchor-50 shadow-md'
                  : 'border-slate-200 hover:border-anchor-300'
              }`}
              onClick={() => updateProjectData({ needsDesign: !formData.needsDesign })}
            >
              <div className='flex items-start space-x-3'>
                <input
                  type='checkbox'
                  checked={formData.needsDesign}
                  onChange={e => updateProjectData({ needsDesign: e.target.checked })}
                  className='mt-1 w-4 h-4 text-anchor-600'
                />
                <div className='flex-1'>
                  <div className='flex justify-between items-start mb-2'>
                    <h3 className='font-semibold text-slate-800'>Full Design Package</h3>
                    <span className='text-anchor-600 font-medium'>+$12,500</span>
                  </div>
                  <p className='text-sm text-slate-600 mb-3'>
                    Complete architectural design, structural engineering, MEP design, and zoning
                    compliance review.
                  </p>
                  {formData.needsDesign && (
                    <div className='bg-green-50 border border-green-200 rounded-lg p-3'>
                      <p className='text-sm text-green-800'>
                        ✓ <strong>Includes:</strong> Architectural plans, structural calculations,
                        electrical/plumbing/HVAC design, zoning review, and site planning to ensure
                        smooth permit approval and construction.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Optional Features */}
          <div className='grid md:grid-cols-2 gap-6'>
            {/* Solar Design - Always Included */}
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-3'>
                Solar Preparation
              </label>
              <div className='p-4 rounded-lg border-2 border-green-500 bg-green-50 transition-all'>
                <div className='flex items-start space-x-3'>
                  <input
                    type='checkbox'
                    checked={true}
                    disabled={true}
                    className='mt-1 w-4 h-4 text-green-600 cursor-not-allowed'
                  />
                  <div className='flex-1'>
                    <div className='flex items-center justify-between'>
                      <h4 className='font-medium text-slate-800'>Solar Design Preparation</h4>
                      <span className='text-xs font-semibold text-green-600 bg-green-100 px-2 py-1 rounded-full'>
                        INCLUDED - NO COST
                      </span>
                    </div>
                    <p className='text-sm text-slate-600 mt-1'>
                      Pre-wire and structural prep for future solar installation
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* FEMA Compliance */}
            <div>
              <label className='block text-sm font-medium text-slate-700 mb-3'>
                FEMA Compliance
              </label>
              <div
                className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.femaIncluded
                    ? 'border-anchor-500 bg-anchor-50'
                    : 'border-slate-200 hover:border-anchor-300'
                }`}
                onClick={() => updateProjectData({ femaIncluded: !formData.femaIncluded })}
              >
                <div className='flex items-start space-x-3'>
                  <input
                    type='checkbox'
                    checked={formData.femaIncluded}
                    onChange={e => updateProjectData({ femaIncluded: e.target.checked })}
                    className='mt-1 w-4 h-4 text-anchor-600'
                  />
                  <div>
                    <h4 className='font-medium text-slate-800'>FEMA Flood Compliance</h4>
                    <p className='text-sm text-slate-600'>
                      Required in flood zones for elevated construction standards
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4: Optional Add-Ons */}
        <div className='bg-white rounded-lg shadow-sm p-6'>
          <div className='flex items-center mb-6'>
            <div className='w-8 h-8 bg-anchor-500 text-white rounded-full flex items-center justify-center mr-3 text-sm font-bold'>
              4
            </div>
            <h2 className='text-xl font-semibold text-slate-800'>Optional Add-Ons</h2>
          </div>

          <p className='text-slate-600 mb-8'>
            Enhance your ADU with these popular upgrades. These options can be added now or planned
            for future installation.
          </p>

          <div className='space-y-4'>
            {addOnOptions.map(addOn => (
              <div
                key={addOn.name}
                className={`p-5 rounded-lg border-2 cursor-pointer transition-all ${
                  formData.selectedAddOns.includes(addOn.name)
                    ? 'border-anchor-500 bg-anchor-50 shadow-md'
                    : 'border-slate-200 hover:border-anchor-300'
                }`}
                onClick={() => toggleAddOn(addOn.name)}
              >
                <div className='flex items-start space-x-4'>
                  <input
                    type='checkbox'
                    checked={formData.selectedAddOns.includes(addOn.name)}
                    onChange={() => toggleAddOn(addOn.name)}
                    className='mt-1 w-4 h-4 text-anchor-600'
                  />
                  <div className='flex-1'>
                    <div className='flex justify-between items-start mb-2'>
                      <h3 className='font-semibold text-slate-800'>{addOn.name}</h3>
                      <EditablePriceDisplay
                        value={formData.priceOverrides?.addOnPrices?.[addOn.name] ?? addOn.price}
                        onSave={newPrice => updateAddOnPriceOverride(addOn.name, newPrice)}
                        prefix='+$'
                        className='text-anchor-600 font-medium text-lg'
                      />
                    </div>
                    <p className='text-sm text-slate-600 mb-3'>{addOn.description}</p>

                    {/* Add specific explanatory notes for each add-on */}
                    {addOn.name === 'Extra Bathroom' &&
                      formData.selectedAddOns.includes(addOn.name) && (
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                          <p className='text-sm text-blue-800'>
                            💡 <strong>Why add an extra bathroom:</strong> Increases ADU
                            functionality and rental value. Perfect for 2+ bedroom units or
                            multi-generational living situations.
                          </p>
                        </div>
                      )}

                    {addOn.name === 'Driveway' && formData.selectedAddOns.includes(addOn.name) && (
                      <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                        <p className='text-sm text-blue-800'>
                          🚗 <strong>Dedicated driveway benefits:</strong> Provides independent
                          parking access for ADU tenants, increases property value, and creates
                          clear separation between main house and ADU.
                        </p>
                      </div>
                    )}

                    {addOn.name === 'Basic Landscaping' &&
                      formData.selectedAddOns.includes(addOn.name) && (
                        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3'>
                          <p className='text-sm text-blue-800'>
                            🌿 <strong>Professional landscaping value:</strong> Creates attractive
                            curb appeal, proper drainage, and completes the ADU project with mature,
                            cohesive outdoor spaces that blend with your property.
                          </p>
                        </div>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {formData.selectedAddOns.length === 0 && (
            <div className='text-center py-8 text-slate-500'>
              <p className='text-sm'>
                No add-ons selected. You can always add these features later during construction.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Pricing Summary Sidebar */}
      <div className='lg:col-span-1'>
        <div className='sticky top-8 space-y-6'>
          {/* Real-time Pricing Breakdown */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <div className='flex items-center mb-4'>
              <Calculator className='w-5 h-5 text-anchor-500 mr-2' />
              <h3 className='font-semibold text-slate-800'>Live Pricing</h3>
            </div>

            {currentPricing ? (
              <div className='space-y-3'>
                {/* Basic Pricing */}
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Base Construction</span>
                    <span className='font-medium'>
                      $
                      {(
                        formData.squareFootage * (formData.aduType === 'detached' ? 220 : 200)
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Design Services</span>
                    <span className='font-medium'>{formData.needsDesign ? '$12,500' : '$0'}</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Utilities</span>
                    <span className='font-medium'>
                      $
                      {(
                        (formData.utilities.waterMeter === 'separate' ? 1000 : 0) +
                        (formData.utilities.gasMeter === 'separate' ? 1500 : 0) +
                        2000
                      ).toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Add-ons</span>
                    <span className='font-medium'>
                      $
                      {formData.selectedAddOns
                        .reduce((sum, name) => {
                          const addOn = addOnOptions.find(a => a.name === name);
                          return sum + (addOn?.price || 0);
                        }, 0)
                        .toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Total & Price per sqft */}
                <div className='border-t pt-3 space-y-2'>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Subtotal</span>
                    <span className='font-medium'>
                      ${currentPricing.totalBeforeMarkup.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <div className='flex items-center space-x-2'>
                      <span className='text-slate-600'>Markup</span>
                      <EditablePriceDisplay
                        value={
                          formData.priceOverrides?.markupPercentage
                            ? formData.priceOverrides.markupPercentage * 100
                            : 15
                        }
                        onSave={updateMarkupOverride}
                        suffix='%'
                        prefix=''
                        format='number'
                        className='text-slate-600'
                      />
                    </div>
                    <span className='font-medium'>
                      ${currentPricing.markupAmount.toLocaleString()}
                    </span>
                  </div>
                  <div className='flex justify-between font-semibold text-lg'>
                    <span className='text-slate-800'>Total</span>
                    <span className='text-anchor-600'>
                      ${currentPricing.grandTotal.toLocaleString()}
                    </span>
                  </div>
                  <div className='text-center text-sm text-slate-500'>
                    ${Math.round(currentPricing.pricePerSqFt)}/sq ft
                  </div>

                  {/* Price Override Indicator */}
                  {formData.priceOverrides && Object.keys(formData.priceOverrides).length > 0 && (
                    <div className='text-center text-xs text-amber-600 bg-amber-50 rounded-md p-2 mt-3'>
                      * Custom pricing applied - hover over prices to edit
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className='text-center text-slate-500 py-4'>
                <p className='text-sm'>Complete project details for accurate pricing</p>
              </div>
            )}
          </div>

          {/* Milestone Payment Breakdown */}
          {currentPricing && milestones.length > 0 && (
            <div className='bg-white rounded-lg shadow-sm p-6'>
              <h3 className='font-semibold text-slate-800 mb-4'>Payment Milestones</h3>
              <div className='space-y-2 text-sm'>
                {milestones.map(milestone => (
                  <div key={milestone.code} className='flex justify-between items-center'>
                    <div className='flex items-center space-x-2'>
                      <span className='w-6 h-6 bg-slate-100 text-slate-600 rounded-full text-xs flex items-center justify-center font-medium'>
                        {milestone.code}
                      </span>
                      <span className='text-slate-700 truncate'>{milestone.name}</span>
                    </div>
                    <div className='text-right'>
                      <div className='font-medium'>${milestone.amount.toLocaleString()}</div>
                      <div className='text-xs text-slate-500'>{milestone.percentage}%</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className='mt-4 pt-3 border-t'>
                <div className='flex justify-between font-semibold'>
                  <span>Total Payments</span>
                  <span className='text-anchor-600'>
                    ${milestones.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                  </span>
                </div>
              </div>
              <p className='text-xs text-slate-500 mt-2'>
                *Payments rounded to nearest $50 for simplicity
              </p>
            </div>
          )}

          {/* Sample PDF Preview */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h3 className='font-semibold text-slate-800 mb-4'>PDF Preview</h3>
            <p className='text-sm text-slate-600 mb-4'>
              See what your professional proposal will look like with sample data.
            </p>
            <button
              onClick={() => generateSamplePDF()}
              className='w-full btn-secondary text-sm py-2 px-3 flex items-center justify-center space-x-2'
            >
              <FileText className='w-4 h-4' />
              <span>View Sample PDF</span>
            </button>
            <p className='text-xs text-slate-500 mt-2 text-center'>
              Preview the professional proposal format with mock client data
            </p>
          </div>

          {/* Progress Indicator */}
          <div className='bg-white rounded-lg shadow-sm p-6'>
            <h3 className='font-semibold text-slate-800 mb-4'>Progress</h3>
            <div className='space-y-3'>
              <div className='flex justify-between text-sm'>
                <span className='text-slate-600'>Configuration</span>
                <span className='text-green-600 font-medium'>✓ Complete</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-slate-600'>Utilities</span>
                <span
                  className={`font-medium ${
                    formData.utilities.waterMeter && formData.utilities.gasMeter
                      ? 'text-green-600'
                      : 'text-amber-600'
                  }`}
                >
                  {formData.utilities.waterMeter && formData.utilities.gasMeter
                    ? '✓ Complete'
                    : '⚠ Review'}
                </span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-slate-600'>Design Services</span>
                <span className='text-green-600 font-medium'>✓ Selected</span>
              </div>
              <div className='flex justify-between text-sm'>
                <span className='text-slate-600'>Add-ons</span>
                <span className='text-green-600 font-medium'>✓ Optional</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Return embedded or full layout
  if (isEmbedded) {
    return (
      <>
        <div className='flex items-center mb-6'>
          <Building2 className='w-6 h-6 text-anchor-500 mr-2' />
          <h2 className='text-xl font-semibold text-slate-800'>Project Details</h2>
        </div>
        {formContent}
      </>
    );
  }

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='container mx-auto px-4 py-6'>
        <div className='max-w-6xl mx-auto'>
          {/* Header with Back Button */}
          <div className='flex items-center justify-between mb-6'>
            <button
              onClick={onBack}
              className='flex items-center space-x-2 text-slate-600 hover:text-anchor-600 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
              <span>Back to Client Info</span>
            </button>

            {/* Progress Bar */}
            <div className='flex-1 max-w-md mx-8'>
              <div className='flex items-center justify-between text-sm text-slate-600 mb-2'>
                <span>Step 2 of 3</span>
                <span>Project Details</span>
              </div>
              <div className='w-full bg-slate-200 rounded-full h-2'>
                <div className='bg-anchor-500 h-2 rounded-full' style={{ width: '66%' }}></div>
              </div>
            </div>

            {/* Current Price per Sq Ft */}
            <div className='text-right'>
              <div className='text-sm text-slate-600'>Price per sq ft</div>
              <div className='text-xl font-bold text-anchor-600'>
                {currentPricing ? `$${Math.round(currentPricing.pricePerSqFt)}` : '$220'}/sq ft
              </div>
            </div>
          </div>

          {formContent}

          {/* Navigation */}
          <div className='flex justify-between mt-8'>
            <button onClick={onBack} className='btn-secondary'>
              Back
            </button>
            <button onClick={onNext} className='btn-primary'>
              Review & Generate Proposal
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
