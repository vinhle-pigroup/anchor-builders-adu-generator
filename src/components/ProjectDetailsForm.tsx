import React from 'react';
import { Building2, Palette, Wrench, Plus, Clock } from 'lucide-react';
import type { ProjectInfo } from '../types/proposal';
import { AnchorPricingEngine } from '../lib/pricing-engine';

interface ProjectDetailsFormProps {
  formData: ProjectInfo;
  updateProjectData: (updates: Partial<ProjectInfo>) => void;
  onBack: () => void;
  onNext: () => void;
}

export function ProjectDetailsForm({
  formData,
  updateProjectData,
  onBack,
  onNext,
}: ProjectDetailsFormProps) {
  const pricingEngine = new AnchorPricingEngine();
  const aduTypeOptions = pricingEngine.getAduTypeOptions();
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

  const updateUtility = (utilityType: keyof ProjectInfo['utilities'], value: 'shared' | 'separate') => {
    updateProjectData({
      utilities: {
        ...formData.utilities,
        [utilityType]: value,
      },
    });
  };

  return (
    <div className='min-h-screen bg-slate-50'>
      <div className='container mx-auto px-4 py-8'>
        <div className='max-w-4xl mx-auto'>
          {/* Progress Bar */}
          <div className='mb-8'>
            <div className='flex items-center justify-between text-sm text-slate-600 mb-2'>
              <span>Step 2 of 3</span>
              <span>Project Details</span>
            </div>
            <div className='w-full bg-slate-200 rounded-full h-2'>
              <div className='bg-anchor-500 h-2 rounded-full' style={{ width: '66%' }}></div>
            </div>
          </div>

          <div className='grid lg:grid-cols-3 gap-6'>
            {/* Main Form */}
            <div className='lg:col-span-2 space-y-6'>
              {/* Basic Project Info - Matching Excel */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-6'>
                  <Building2 className='w-6 h-6 text-anchor-500 mr-2' />
                  <h2 className='text-xl font-semibold text-slate-800'>ADU Details</h2>
                </div>

                <div className='grid md:grid-cols-2 gap-6'>
                  <div>
                    <label className='form-label'>ADU Type *</label>
                    <select
                      className='form-input'
                      value={formData.aduType}
                      onChange={e => updateProjectData({ aduType: e.target.value as any })}
                    >
                      {aduTypeOptions.map(option => (
                        <option key={option.type} value={option.type}>
                          {option.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='form-label'>Living Area (sq ft) *</label>
                    <input
                      type='number'
                      className='form-input'
                      value={formData.squareFootage}
                      onChange={e =>
                        updateProjectData({ squareFootage: parseInt(e.target.value) || 0 })
                      }
                      min='300'
                      max='1200'
                      placeholder='800'
                    />
                  </div>

                  <div>
                    <label className='form-label'>Bedrooms</label>
                    <select
                      className='form-input'
                      value={formData.bedrooms}
                      onChange={e => updateProjectData({ bedrooms: parseInt(e.target.value) })}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                      <option value={3}>3</option>
                    </select>
                  </div>

                  <div>
                    <label className='form-label'>Bathrooms</label>
                    <select
                      className='form-input'
                      value={formData.bathrooms}
                      onChange={e => updateProjectData({ bathrooms: parseInt(e.target.value) })}
                    >
                      <option value={1}>1</option>
                      <option value={2}>2</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Features - Matching Excel */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-6'>
                  <Palette className='w-6 h-6 text-anchor-500 mr-2' />
                  <h2 className='text-xl font-semibold text-slate-800'>Features & Appliances</h2>
                </div>

                <div className='grid md:grid-cols-2 gap-6'>
                  <div>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.appliancesIncluded}
                        onChange={e => updateProjectData({ appliancesIncluded: e.target.checked })}
                        className='mr-2 w-4 h-4 text-anchor-600'
                      />
                      <span className='text-sm'>Appliances Included</span>
                    </label>
                  </div>

                  <div>
                    <label className='form-label'>HVAC System</label>
                    <select
                      className='form-input'
                      value={formData.hvacType}
                      onChange={e => updateProjectData({ hvacType: e.target.value as any })}
                    >
                      <option value='central-ac'>Central AC</option>
                    </select>
                  </div>

                  <div>
                    <label className='form-label'>Finish Level</label>
                    <select
                      className='form-input'
                      value={formData.finishLevel}
                      disabled
                    >
                      <option value='standard'>Standard</option>
                    </select>
                    <p className='text-xs text-slate-500 mt-1'>Standard finish included in base price</p>
                  </div>

                  <div>
                    <label className='form-label'>Sewer Connection</label>
                    <select
                      className='form-input'
                      value={formData.sewerConnection}
                      disabled
                    >
                      <option value='existing-lateral'>Existing Lateral</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Utilities - Matching Excel Shared/Separate */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-6'>
                  <Wrench className='w-6 h-6 text-anchor-500 mr-2' />
                  <h2 className='text-xl font-semibold text-slate-800'>Utility Connections</h2>
                </div>

                <div className='grid md:grid-cols-3 gap-6'>
                  <div>
                    <label className='form-label'>Water Meter</label>
                    <select
                      className='form-input'
                      value={formData.utilities.waterMeter}
                      onChange={e => updateUtility('waterMeter', e.target.value as any)}
                    >
                      <option value='shared'>Shared</option>
                      <option value='separate'>Separate</option>
                    </select>
                    <p className='text-xs text-slate-500 mt-1'>
                      {formData.utilities.waterMeter === 'separate' ? '+$1,000' : 'No cost'}
                    </p>
                  </div>

                  <div>
                    <label className='form-label'>Gas Meter</label>
                    <select
                      className='form-input'
                      value={formData.utilities.gasMeter}
                      onChange={e => updateUtility('gasMeter', e.target.value as any)}
                    >
                      <option value='shared'>Shared</option>
                      <option value='separate'>Separate</option>
                    </select>
                    <p className='text-xs text-slate-500 mt-1'>
                      {formData.utilities.gasMeter === 'separate' ? '+$1,500' : 'No cost'}
                    </p>
                  </div>

                  <div>
                    <label className='form-label'>Electric Meter</label>
                    <select
                      className='form-input'
                      value={formData.utilities.electricMeter}
                      disabled
                    >
                      <option value='separate'>Separate</option>
                    </select>
                    <p className='text-xs text-slate-500 mt-1'>+$2,000 (Required)</p>
                  </div>
                </div>
              </div>

              {/* Design Services & Optional Features */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-6'>
                  <Clock className='w-6 h-6 text-anchor-500 mr-2' />
                  <h2 className='text-xl font-semibold text-slate-800'>Design Services & Options</h2>
                </div>

                <div className='grid md:grid-cols-2 gap-6'>
                  <div className='space-y-4'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.needsDesign}
                        onChange={e => updateProjectData({ needsDesign: e.target.checked })}
                        className='mr-2 w-4 h-4 text-anchor-600'
                      />
                      <span className='text-sm'>Planning/Design Scope: Full Design</span>
                    </label>
                    <p className='text-xs text-slate-500 ml-6'>
                      ADU Plan Design, Structural Engineering, MEP Design, Zoning & Site Planning (+$8,500)
                    </p>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.solarDesign}
                        onChange={e => updateProjectData({ solarDesign: e.target.checked })}
                        className='mr-2 w-4 h-4 text-anchor-600'
                      />
                      <span className='text-sm'>Solar Design Included</span>
                    </label>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.femaIncluded}
                        onChange={e => updateProjectData({ femaIncluded: e.target.checked })}
                        className='mr-2 w-4 h-4 text-anchor-600'
                      />
                      <span className='text-sm'>FEMA Included</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Add-Ons - Simplified Options */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-6'>
                  <Plus className='w-6 h-6 text-anchor-500 mr-2' />
                  <h2 className='text-xl font-semibold text-slate-800'>Optional Add-Ons</h2>
                </div>

                <div className='grid md:grid-cols-1 gap-3'>
                  {addOnOptions.map(addOn => (
                    <label
                      key={addOn.name}
                      className={`flex items-start p-4 rounded-lg border cursor-pointer transition-all ${
                        formData.selectedAddOns.includes(addOn.name)
                          ? 'border-anchor-500 bg-anchor-50'
                          : 'border-slate-200 hover:border-anchor-300'
                      }`}
                    >
                      <input
                        type='checkbox'
                        checked={formData.selectedAddOns.includes(addOn.name)}
                        onChange={() => toggleAddOn(addOn.name)}
                        className='mr-3 mt-1 w-4 h-4 text-anchor-600'
                      />
                      <div className='flex-1'>
                        <div className='font-medium text-slate-800'>{addOn.name}</div>
                        <div className='text-sm text-slate-600'>{addOn.description}</div>
                        <div className='text-sm font-semibold text-anchor-600'>
                          +${addOn.price.toLocaleString()}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Pricing Summary Sidebar */}
            <div className='lg:col-span-1'>
              <div className='sticky top-8'>
                <div className='bg-white rounded-lg shadow-sm p-6'>
                  <h3 className='font-semibold text-slate-800 mb-4'>Quick Estimate</h3>
                  <div className='space-y-2 text-sm'>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Base Construction</span>
                      <span className='font-medium'>~$120,000</span>
                    </div>
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Selected Add-ons</span>
                      <span className='font-medium'>{formData.selectedAddOns.length} items</span>
                    </div>
                    <div className='border-t pt-2 mt-2'>
                      <div className='flex justify-between font-semibold'>
                        <span className='text-slate-800'>Estimated Total</span>
                        <span className='text-anchor-600'>View in Review</span>
                      </div>
                    </div>
                  </div>
                  <p className='text-xs text-slate-500 mt-4'>
                    *Detailed pricing calculated in next step
                  </p>
                </div>
              </div>
            </div>
          </div>

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
