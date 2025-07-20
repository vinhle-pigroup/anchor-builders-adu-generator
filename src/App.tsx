import React, { useState } from 'react';
import { Building2, FileText, Calculator, Users, Download } from 'lucide-react';
import type { AnchorProposalFormData, ClientInfo, ProjectInfo } from './types/proposal';
import { ProjectDetailsForm } from './components/ProjectDetailsForm';
import { AnchorPricingEngine } from './lib/pricing-engine';
import { AnchorPDFGenerator } from './lib/pdf-generator';

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
      aduType: 'detached',
      squareFootage: 800,
      bedrooms: 2,
      bathrooms: 2,
      appliancesIncluded: true,
      hvacType: 'central-ac',
      finishLevel: 'standard',
      utilities: {
        waterMeter: 'shared',
        gasMeter: 'shared',
        electricMeter: 'separate',
      },
      sewerConnection: 'existing-lateral',
      needsDesign: true,
      solarDesign: false,
      femaIncluded: false,
      selectedAddOns: [],
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

  const generatePDF = () => {
    try {
      const pdfGenerator = new AnchorPDFGenerator();
      const pdfBlob = pdfGenerator.generateProposal(formData);
      
      // Create download link
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Anchor-Builders-ADU-Proposal-${formData.client.lastName}-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('PDF generation error:', error);
      alert('Error generating PDF. Please try again.');
    }
  };

  if (currentStep === 'welcome') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-slate-50 to-anchor-50'>
        {/* Header with Logo */}
        <div className='bg-white shadow-sm border-b'>
          <div className='container mx-auto px-6 py-4'>
            <div className='flex items-center justify-between'>
              <div className='flex items-center space-x-4'>
                {/* Anchor Builders Logo */}
                <div className='flex items-center space-x-3'>
                  <img 
                    src="/anchor-builders-logo.svg" 
                    alt="Anchor Builders Logo" 
                    className="h-16 w-auto"
                  />
                </div>
              </div>
              <div className='text-sm text-slate-500'>
                www.anchorbuilders.io
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className='flex items-center justify-center min-h-[calc(100vh-100px)]'>
          <div className='text-center max-w-4xl mx-auto px-6'>
            <div className='mb-12'>
              <h2 className='text-4xl font-bold text-slate-800 mb-4'>ADU Proposal Generator</h2>
              <p className='text-xl text-slate-600 max-w-2xl mx-auto'>
                Create professional ADU proposals with accurate pricing, detailed specifications, 
                and customizable options for your clients.
              </p>
            </div>

            {/* Action Cards */}
            <div className='grid md:grid-cols-3 gap-6 max-w-5xl mx-auto'>
              {/* Start New Proposal */}
              <div className='bg-white rounded-xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-shadow cursor-pointer group'
                   onClick={() => setCurrentStep('client')}>
                <div className='w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform'>
                  <FileText className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-xl font-semibold text-slate-800 mb-3'>Start New Proposal</h3>
                <p className='text-slate-600 mb-6'>
                  Create a new ADU proposal from scratch with our guided form and pricing calculator.
                </p>
                <button className='btn-primary w-full'>
                  Begin New Proposal
                </button>
              </div>

              {/* Edit Existing */}
              <div className='bg-white rounded-xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-shadow cursor-pointer group opacity-75'
                   onClick={() => alert('Edit Existing - Coming Soon!')}>
                <div className='w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform'>
                  <FileText className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-xl font-semibold text-slate-800 mb-3'>Edit Existing</h3>
                <p className='text-slate-600 mb-6'>
                  Load and modify previously saved proposals or update client information.
                </p>
                <button className='btn-secondary w-full'>
                  Load Proposal
                </button>
              </div>

              {/* Admin Settings */}
              <div className='bg-white rounded-xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-shadow cursor-pointer group opacity-75'
                   onClick={() => alert('Admin Settings - Coming Soon!')}>
                <div className='w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center mx-auto mb-6 group-hover:scale-105 transition-transform'>
                  <Users className='w-8 h-8 text-white' />
                </div>
                <h3 className='text-xl font-semibold text-slate-800 mb-3'>Admin Settings</h3>
                <p className='text-slate-600 mb-6'>
                  Manage pricing, templates, and system settings for your organization.
                </p>
                <button className='btn-secondary w-full'>
                  Access Settings
                </button>
              </div>
            </div>

            {/* Footer Info */}
            <div className='mt-12 text-center'>
              <p className='text-slate-500 text-sm'>
                Professional ADU proposals with accurate California pricing • Licensed & Insured
              </p>
            </div>
          </div>
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
                <div>
                  <label className='form-label'>ZIP Code *</label>
                  <input
                    type='text'
                    className='form-input'
                    value={formData.client.zipCode}
                    onChange={e => updateClientData({ zipCode: e.target.value })}
                    placeholder='92683'
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
                    !formData.client.email ||
                    !formData.client.zipCode
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
                    <p className='text-slate-600'>Type: {formData.project.aduType === 'detached' ? 'Detached (1 Story)' : 'Attached ADU'}</p>
                    <p className='text-slate-600'>Size: {formData.project.squareFootage} sq ft</p>
                    <p className='text-slate-600'>Bedrooms: {formData.project.bedrooms}</p>
                    <p className='text-slate-600'>Bathrooms: {formData.project.bathrooms}</p>
                    <p className='text-slate-600'>Design Services: {formData.project.needsDesign ? 'Included' : 'Not Included'}</p>
                  </div>
                </div>

                <div className='flex gap-4 mt-8'>
                  <button onClick={() => setCurrentStep('project')} className='btn-secondary'>
                    Edit Project
                  </button>
                  <button
                    onClick={generatePDF}
                    className='btn-primary flex items-center gap-2'
                    disabled={!formData.client.firstName || !formData.client.lastName}
                  >
                    <Download className='w-4 h-4' />
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
                      bedrooms: formData.project.bedrooms,
                      bathrooms: formData.project.bathrooms,
                      utilities: formData.project.utilities,
                      needsDesign: formData.project.needsDesign,
                      appliancesIncluded: formData.project.appliancesIncluded,
                      hvacType: formData.project.hvacType,
                      selectedAddOns: formData.project.selectedAddOns,
                      sewerConnection: formData.project.sewerConnection,
                      solarDesign: formData.project.solarDesign,
                      femaIncluded: formData.project.femaIncluded,
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
                        {Object.entries(majorCategories).map(([category, total]) => (
                          <div key={category} className='flex justify-between'>
                            <span className='text-slate-600'>{category}</span>
                            <span className='font-medium'>${total.toLocaleString()}</span>
                          </div>
                        ))}

                        <div className='border-t pt-3 mt-3 space-y-2'>
                          <div className='flex justify-between'>
                            <span className='text-slate-600'>Subtotal</span>
                            <span className='font-medium'>
                              ${calculation.totalBeforeMarkup.toLocaleString()}
                            </span>
                          </div>
                          <div className='flex justify-between'>
                            <span className='text-slate-600'>
                              Markup ({(calculation.markupPercentage * 100).toFixed(0)}%)
                            </span>
                            <span className='font-medium'>
                              ${calculation.markupAmount.toLocaleString()}
                            </span>
                          </div>
                          <div className='flex justify-between font-semibold text-lg'>
                            <span className='text-slate-800'>Total</span>
                            <span className='text-anchor-600'>
                              ${calculation.grandTotal.toLocaleString()}
                            </span>
                          </div>
                          <div className='text-center text-xs text-slate-500'>
                            ${Math.round(calculation.pricePerSqFt)}/sq ft
                          </div>
                        </div>
                      </div>
                    );
                  } catch (error) {
                    console.error('Pricing calculation error:', error);
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
