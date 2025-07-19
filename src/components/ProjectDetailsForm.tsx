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
  const addOnsByCategory = pricingEngine.getAddOnsByCategory();
  const finishOptions = pricingEngine.getFinishLevelOptions();
  const foundationOptions = pricingEngine.getFoundationOptions();
  const siteworkOptions = pricingEngine.getSiteworkOptions();

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

  const updateUtility = (utilityType: keyof ProjectInfo['utilities'], value: boolean) => {
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
              {/* Basic Project Info */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-6'>
                  <Building2 className='w-6 h-6 text-anchor-500 mr-2' />
                  <h2 className='text-xl font-semibold text-slate-800'>Basic Specifications</h2>
                </div>

                <div className='grid md:grid-cols-2 gap-6'>
                  <div>
                    <label className='form-label'>ADU Type *</label>
                    <select
                      className='form-input'
                      value={formData.aduType}
                      onChange={e => updateProjectData({ aduType: e.target.value as any })}
                    >
                      <option value='studio'>Studio (400-600 sq ft)</option>
                      <option value='one-bedroom'>One Bedroom (600-800 sq ft)</option>
                      <option value='two-bedroom'>Two Bedroom (800-1200 sq ft)</option>
                      <option value='custom'>Custom Design</option>
                    </select>
                  </div>

                  <div>
                    <label className='form-label'>Square Footage *</label>
                    <input
                      type='number'
                      className='form-input'
                      value={formData.squareFootage}
                      onChange={e =>
                        updateProjectData({ squareFootage: parseInt(e.target.value) || 0 })
                      }
                      min='300'
                      max='1200'
                    />
                  </div>

                  <div>
                    <label className='form-label'>Foundation Type</label>
                    <select
                      className='form-input'
                      value={formData.foundationType}
                      onChange={e => updateProjectData({ foundationType: e.target.value as any })}
                    >
                      {foundationOptions.map(option => (
                        <option key={option.type} value={option.type}>
                          {option.description}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className='form-label'>Sitework Requirements</label>
                    <select
                      className='form-input'
                      value={formData.sitework}
                      onChange={e => updateProjectData({ sitework: e.target.value as any })}
                    >
                      {siteworkOptions.map(option => (
                        <option key={option.level} value={option.level}>
                          {option.description}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Finish Level */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-6'>
                  <Palette className='w-6 h-6 text-anchor-500 mr-2' />
                  <h2 className='text-xl font-semibold text-slate-800'>Finish Level</h2>
                </div>

                <div className='grid md:grid-cols-2 gap-4'>
                  {finishOptions.map(finish => (
                    <div
                      key={finish.level}
                      onClick={() => updateProjectData({ finishLevel: finish.level as any })}
                      className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                        formData.finishLevel === finish.level
                          ? 'border-anchor-500 bg-anchor-50'
                          : 'border-slate-200 hover:border-anchor-300'
                      }`}
                    >
                      <h3 className='font-semibold text-slate-800 capitalize mb-1'>
                        {finish.level}
                      </h3>
                      <p className='text-sm text-slate-600 mb-2'>{finish.description}</p>
                      <p className='text-lg font-bold text-anchor-600'>
                        +${finish.pricePerSqFt}/sq ft
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Utilities */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-6'>
                  <Wrench className='w-6 h-6 text-anchor-500 mr-2' />
                  <h2 className='text-xl font-semibold text-slate-800'>Utilities & Services</h2>
                </div>

                <div className='grid md:grid-cols-2 gap-4'>
                  <div className='space-y-3'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.utilities.electric}
                        onChange={e => updateUtility('electric', e.target.checked)}
                        className='mr-2 w-4 h-4 text-anchor-600'
                        disabled
                      />
                      <span className='text-sm'>Electrical Service (Required)</span>
                    </label>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.utilities.plumbing}
                        onChange={e => updateUtility('plumbing', e.target.checked)}
                        className='mr-2 w-4 h-4 text-anchor-600'
                        disabled
                      />
                      <span className='text-sm'>Plumbing (Required)</span>
                    </label>
                  </div>

                  <div className='space-y-3'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.utilities.gas}
                        onChange={e => updateUtility('gas', e.target.checked)}
                        className='mr-2 w-4 h-4 text-anchor-600'
                      />
                      <span className='text-sm'>Natural Gas Line</span>
                    </label>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.utilities.cableInternet}
                        onChange={e => updateUtility('cableInternet', e.target.checked)}
                        className='mr-2 w-4 h-4 text-anchor-600'
                      />
                      <span className='text-sm'>Cable/Internet Service</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Professional Services */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-6'>
                  <Clock className='w-6 h-6 text-anchor-500 mr-2' />
                  <h2 className='text-xl font-semibold text-slate-800'>
                    Professional Services & Timeline
                  </h2>
                </div>

                <div className='grid md:grid-cols-2 gap-6'>
                  <div className='space-y-3'>
                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.needsPermits}
                        onChange={e => updateProjectData({ needsPermits: e.target.checked })}
                        className='mr-2 w-4 h-4 text-anchor-600'
                      />
                      <span className='text-sm'>Building Permits & Plan Review</span>
                    </label>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.needsDesign}
                        onChange={e => updateProjectData({ needsDesign: e.target.checked })}
                        className='mr-2 w-4 h-4 text-anchor-600'
                      />
                      <span className='text-sm'>Architectural Design</span>
                    </label>

                    <label className='flex items-center'>
                      <input
                        type='checkbox'
                        checked={formData.needsManagement}
                        onChange={e => updateProjectData({ needsManagement: e.target.checked })}
                        className='mr-2 w-4 h-4 text-anchor-600'
                      />
                      <span className='text-sm'>Project Management</span>
                    </label>
                  </div>

                  <div>
                    <label className='form-label'>Project Timeline</label>
                    <select
                      className='form-input'
                      value={formData.timeline}
                      onChange={e => updateProjectData({ timeline: e.target.value as any })}
                    >
                      <option value='rush'>Rush (4-5 months) - 25% surcharge</option>
                      <option value='standard'>Standard (6-8 months)</option>
                      <option value='flexible'>Flexible (10+ months) - 5% discount</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Add-Ons */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-6'>
                  <Plus className='w-6 h-6 text-anchor-500 mr-2' />
                  <h2 className='text-xl font-semibold text-slate-800'>Optional Add-Ons</h2>
                </div>

                {Object.entries(addOnsByCategory).map(([category, addOns]) => (
                  <div key={category} className='mb-6'>
                    <h3 className='font-medium text-slate-700 mb-3 capitalize'>
                      {category.replace('-', ' ')} Options
                    </h3>
                    <div className='grid md:grid-cols-2 gap-3'>
                      {addOns.map(addOn => (
                        <label
                          key={addOn.name}
                          className={`flex items-start p-3 rounded-lg border cursor-pointer transition-all ${
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
                ))}
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
