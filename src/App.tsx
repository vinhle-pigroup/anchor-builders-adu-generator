import React, { useState } from 'react';
import { Building2, FileText, Calculator, Users } from 'lucide-react';
import type { AnchorProposalFormData, ClientInfo, ProjectInfo } from './types/proposal';
import { ProjectDetailsForm } from './components/ProjectDetailsForm';
import { AnchorPricingEngine } from './lib/pricing-engine';

function App() {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'client' | 'project' | 'review'>(
    'welcome'
  );
  const [formData, setFormData] = useState<AnchorProposalFormData>({
    client: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
    },
    project: {
      lotSize: '',
      aduType: 'studio',
      squareFootage: 400,
      foundationType: 'slab',
      sitework: 'minimal',
      finishLevel: 'standard',
      utilities: {
        electric: true,
        plumbing: true,
        gas: false,
        cableInternet: false,
      },
      selectedAddOns: [],
      needsPermits: true,
      needsDesign: true,
      needsManagement: false,
      timeline: 'standard',
    },
    additionalNotes: '',
    timeline: '6-8 months',
  });

  const updateClientData = (updates: Partial<ClientInfo>) => {
    setFormData(prev => ({
      ...prev,
      client: { ...prev.client, ...updates },
    }));
  };

  const updateProjectData = (updates: Partial<ProjectInfo>) => {
    setFormData(prev => ({
      ...prev,
      project: { ...prev.project, ...updates },
    }));
  };

  if (currentStep === 'welcome') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-anchor-50 flex items-center justify-center'>
        <div className='text-center max-w-2xl mx-auto px-6'>
          <div className='inline-flex items-center justify-center w-24 h-24 bg-anchor-500 rounded-full mb-8'>
            <Building2 className='w-12 h-12 text-white' />
          </div>

          <h1 className='text-4xl font-bold text-slate-800 mb-4'>Anchor Builders</h1>
          <h2 className='text-2xl font-semibold text-anchor-600 mb-6'>ADU Proposal Generator</h2>
          <p className='text-lg text-slate-600 mb-8'>
            Create professional ADU proposals with accurate pricing and detailed project
            specifications.
          </p>

          <button
            onClick={() => setCurrentStep('client')}
            className='btn-primary text-lg px-8 py-3'
          >
            Start New Proposal
          </button>
        </div>
      </div>
    );
  }

  if (currentStep === 'client') {
    return (
      <div className='min-h-screen bg-slate-50'>
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-2xl mx-auto'>
            {/* Progress Bar */}
            <div className='mb-8'>
              <div className='flex items-center justify-between text-sm text-slate-600 mb-2'>
                <span>Step 1 of 3</span>
                <span>Client Information</span>
              </div>
              <div className='w-full bg-slate-200 rounded-full h-2'>
                <div className='bg-anchor-500 h-2 rounded-full' style={{ width: '33%' }}></div>
              </div>
            </div>

            <div className='bg-white rounded-lg shadow-sm p-6'>
              <div className='flex items-center mb-6'>
                <Users className='w-6 h-6 text-anchor-500 mr-2' />
                <h2 className='text-xl font-semibold text-slate-800'>Client Information</h2>
              </div>

              <div className='grid md:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>First Name *</label>
                  <input
                    type='text'
                    className='form-input'
                    value={formData.client.firstName}
                    onChange={e => updateClientData({ firstName: e.target.value })}
                    placeholder='First Name'
                  />
                </div>
                <div>
                  <label className='form-label'>Last Name *</label>
                  <input
                    type='text'
                    className='form-input'
                    value={formData.client.lastName}
                    onChange={e => updateClientData({ lastName: e.target.value })}
                    placeholder='Last Name'
                  />
                </div>
                <div>
                  <label className='form-label'>Email *</label>
                  <input
                    type='email'
                    className='form-input'
                    value={formData.client.email}
                    onChange={e => updateClientData({ email: e.target.value })}
                    placeholder='email@example.com'
                  />
                </div>
                <div>
                  <label className='form-label'>Phone *</label>
                  <input
                    type='tel'
                    className='form-input'
                    value={formData.client.phone}
                    onChange={e => updateClientData({ phone: e.target.value })}
                    placeholder='(555) 123-4567'
                  />
                </div>
                <div className='md:col-span-2'>
                  <label className='form-label'>Address *</label>
                  <input
                    type='text'
                    className='form-input'
                    value={formData.client.address}
                    onChange={e => updateClientData({ address: e.target.value })}
                    placeholder='123 Main Street'
                  />
                </div>
                <div>
                  <label className='form-label'>City *</label>
                  <input
                    type='text'
                    className='form-input'
                    value={formData.client.city}
                    onChange={e => updateClientData({ city: e.target.value })}
                    placeholder='City'
                  />
                </div>
                <div>
                  <label className='form-label'>State *</label>
                  <input
                    type='text'
                    className='form-input'
                    value={formData.client.state}
                    onChange={e => updateClientData({ state: e.target.value })}
                    placeholder='CA'
                  />
                </div>
              </div>

              <div className='flex justify-between mt-8'>
                <button onClick={() => setCurrentStep('welcome')} className='btn-secondary'>
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep('project')}
                  className='btn-primary'
                  disabled={
                    !formData.client.firstName ||
                    !formData.client.lastName ||
                    !formData.client.email
                  }
                >
                  Next: Project Details
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (currentStep === 'project') {
    return (
      <ProjectDetailsForm
        formData={formData.project}
        updateProjectData={updateProjectData}
        onBack={() => setCurrentStep('client')}
        onNext={() => setCurrentStep('review')}
      />
    );
  }

  if (currentStep === 'review') {
    return (
      <div className='min-h-screen bg-slate-50'>
        <div className='container mx-auto px-4 py-8'>
          <div className='max-w-4xl mx-auto'>
            {/* Progress Bar */}
            <div className='mb-8'>
              <div className='flex items-center justify-between text-sm text-slate-600 mb-2'>
                <span>Step 3 of 3</span>
                <span>Review & Generate</span>
              </div>
              <div className='w-full bg-slate-200 rounded-full h-2'>
                <div className='bg-anchor-500 h-2 rounded-full' style={{ width: '100%' }}></div>
              </div>
            </div>

            <div className='grid lg:grid-cols-3 gap-6'>
              {/* Review Panel */}
              <div className='lg:col-span-2 bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-6'>
                  <FileText className='w-6 h-6 text-anchor-500 mr-2' />
                  <h2 className='text-xl font-semibold text-slate-800'>Proposal Review</h2>
                </div>

                <div className='space-y-6'>
                  <div>
                    <h3 className='font-semibold text-slate-700 mb-2'>Client Information</h3>
                    <p className='text-slate-600'>
                      {formData.client.firstName} {formData.client.lastName}
                    </p>
                    <p className='text-slate-600'>{formData.client.email}</p>
                    <p className='text-slate-600'>{formData.client.phone}</p>
                    <p className='text-slate-600'>{formData.client.address}</p>
                  </div>

                  <div>
                    <h3 className='font-semibold text-slate-700 mb-2'>Project Details</h3>
                    <p className='text-slate-600'>Type: {formData.project.aduType}</p>
                    <p className='text-slate-600'>Size: {formData.project.squareFootage} sq ft</p>
                    <p className='text-slate-600'>Foundation: {formData.project.foundationType}</p>
                    <p className='text-slate-600'>Sitework: {formData.project.sitework}</p>
                  </div>
                </div>

                <div className='flex gap-4 mt-8'>
                  <button onClick={() => setCurrentStep('project')} className='btn-secondary'>
                    Edit Project
                  </button>
                  <button
                    onClick={() => alert('PDF generation coming soon!')}
                    className='btn-primary'
                  >
                    Generate PDF Proposal
                  </button>
                </div>
              </div>

              {/* Pricing Panel */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <div className='flex items-center mb-4'>
                  <Calculator className='w-5 h-5 text-anchor-500 mr-2' />
                  <h3 className='font-semibold text-slate-800'>Estimated Pricing</h3>
                </div>

                {(() => {
                  try {
                    const pricingEngine = new AnchorPricingEngine();
                    const pricingInputs = {
                      squareFootage: formData.project.squareFootage,
                      aduType: formData.project.aduType,
                      foundationType: formData.project.foundationType,
                      sitework: formData.project.sitework,
                      finishLevel: formData.project.finishLevel,
                      utilities: formData.project.utilities,
                      selectedAddOns: formData.project.selectedAddOns,
                      needsPermits: formData.project.needsPermits,
                      needsDesign: formData.project.needsDesign,
                      needsManagement: formData.project.needsManagement,
                      zipCode: formData.client.zipCode,
                      timeline: formData.project.timeline,
                    };

                    const calculation = pricingEngine.calculateProposal(pricingInputs);
                    const majorCategories = calculation.lineItems.reduce(
                      (acc, item) => {
                        if (!acc[item.category]) {
                          acc[item.category] = 0;
                        }
                        acc[item.category] += item.totalPrice;
                        return acc;
                      },
                      {} as Record<string, number>
                    );

                    return (
                      <div className='space-y-3 text-sm'>
                        {Object.entries(majorCategories)
                          .slice(0, 6)
                          .map(([category, total]) => (
                            <div key={category} className='flex justify-between'>
                              <span className='text-slate-600'>{category}</span>
                              <span className='font-medium'>${total.toLocaleString()}</span>
                            </div>
                          ))}

                        {calculation.regionalMultiplier !== 1 && (
                          <div className='flex justify-between text-blue-600'>
                            <span>Regional Adjustment</span>
                            <span>{((calculation.regionalMultiplier - 1) * 100).toFixed(0)}%</span>
                          </div>
                        )}

                        {calculation.timelineMultiplier !== 1 && (
                          <div className='flex justify-between text-purple-600'>
                            <span>Timeline Adjustment</span>
                            <span>{((calculation.timelineMultiplier - 1) * 100).toFixed(0)}%</span>
                          </div>
                        )}

                        <div className='border-t pt-3 mt-3 space-y-2'>
                          <div className='flex justify-between'>
                            <span className='text-slate-600'>Subtotal</span>
                            <span className='font-medium'>
                              ${calculation.totalBeforeTax.toLocaleString()}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-600'>
                              Tax ({(calculation.taxRate * 100).toFixed(1)}%)
                            </span>
                            <span className='font-medium'>
                              ${calculation.taxAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className='flex justify-between font-semibold text-lg'>
                            <span className='text-slate-800'>Total</span>
                            <span className='text-anchor-600'>
                              ${calculation.grandTotal.toLocaleString()}
                            </span>
                          </div>
                          <div className='text-center text-xs text-slate-500'>
                            ${calculation.pricePerSqFt.toLocaleString()}/sq ft
                          </div>
                        </div>
                      </div>
                    );
                  } catch (error) {
                    return (
                      <div className='space-y-3 text-sm'>
                        <p className='text-slate-500'>
                          Please complete project details for accurate pricing
                        </p>
                      </div>
                    );
                  }
                })()}

                <p className='text-xs text-slate-500 mt-4'>
                  *Estimate based on current specifications. Final pricing subject to site
                  evaluation.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

export default App;
