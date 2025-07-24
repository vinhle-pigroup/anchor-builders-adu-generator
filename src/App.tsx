import React, { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Building2,
  FileText,
  Calculator,
  Users,
  Download,
  Plus,
  ArrowLeft,
  User,
  Home,
  Zap,
  Compass,
  Square,
  CheckCircle,
  Shield,
  Award,
  Clock,
  Eye,
  Check,
  X,
} from 'lucide-react';
import type { AnchorProposalFormData, ClientInfo, ProjectInfo } from './types/proposal';
import { AnchorPricingEngine } from './lib/pricing-engine';
import { AnchorPDFGenerator } from './lib/pdf-generator';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'proposal' | 'list' | 'admin'>('home');
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
      squareFootage: 600,
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

  // Pricing state for real-time updates
  const [pricingData, setPricingData] = useState({
    aduType: 'detached-1story',
    pricePerSqFt: 220,
    sqft: 600,
    bedrooms: 2,
    bathrooms: 2,
    utilities: {
      water: 0,
      gas: 0,
      electric: 2000,
    },
    services: {
      design: 12500,
      solar: 0,
      fema: 0,
    },
    addons: {
      bathroom: 0,
      driveway: 0,
      landscaping: 0,
    },
    manualAddons: [] as number[],
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

  const generatePDF = useCallback(() => {
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
      console.error('PDF generation failed:', error);
      alert('Error generating PDF. Please try again.');
    }
  }, [formData]);

  // Calculate live pricing
  const liveCalculation = useMemo(() => {
    // Calculate base construction cost
    const baseConstruction = pricingData.sqft * pricingData.pricePerSqFt;

    // Calculate utilities total
    const utilitiesTotal = Object.values(pricingData.utilities).reduce(
      (sum, cost) => sum + cost,
      0
    );

    // Calculate services total
    const servicesTotal = Object.values(pricingData.services).reduce((sum, cost) => sum + cost, 0);

    // Calculate standard add-ons total
    const standardAddonsTotal = Object.values(pricingData.addons).reduce(
      (sum, cost) => sum + cost,
      0
    );

    // Calculate manual add-ons total
    const manualAddonsTotal = pricingData.manualAddons.reduce((sum, cost) => sum + cost, 0);

    // Total add-ons
    const addonsTotal = standardAddonsTotal + manualAddonsTotal;

    // Calculate subtotal
    const subtotal = baseConstruction + utilitiesTotal + servicesTotal + addonsTotal;

    // Calculate markup (15%)
    const markup = Math.round(subtotal * 0.15);

    // Calculate final total
    const finalTotal = subtotal + markup;

    // Calculate price per sq ft
    const pricePerSqFt = Math.round(finalTotal / pricingData.sqft);

    return {
      baseConstruction,
      utilitiesTotal,
      servicesTotal,
      addonsTotal,
      subtotal,
      markup,
      finalTotal,
      pricePerSqFt,
    };
  }, [pricingData]);

  if (currentPage === 'home') {
    return (
      <div className='min-h-screen bg-gradient-to-br from-stone-100 to-blue-50 flex items-center justify-center'>
        <div className='text-center max-w-md mx-auto px-6'>
          {/* Large Logo Container */}
          <div className='inline-flex items-center justify-center w-52 h-52 bg-white rounded-2xl mb-8 shadow-lg'>
            <div className='flex items-center justify-center w-48 h-48'>
              <img 
                src="/anchor-logo.jpg" 
                alt="Anchor Builders Logo" 
                className="w-40 h-40 object-contain"
              />
            </div>
          </div>

          {/* Brand Text */}
          <h1 className='text-4xl font-bold text-stone-800 mb-2'>
            Anchor{' '}
            <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-anchor-600'>
              Builders
            </span>
          </h1>
          <p className='text-stone-600 mb-12'>ADU Proposal System</p>

          {/* Action Buttons */}
          <div className='space-y-4'>
            {/* Start New Proposal */}
            <button
              onClick={() => setCurrentPage('proposal')}
              className='w-full bg-gradient-to-r from-blue-500 to-anchor-500 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:from-blue-600 hover:to-anchor-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center'
            >
              <Plus className='w-5 h-5 mr-2' />
              Start New Proposal
            </button>

            {/* View Proposals */}
            <button
              onClick={() => setCurrentPage('list')}
              className='w-full bg-white text-stone-700 px-6 py-3 rounded-xl text-base font-semibold hover:bg-stone-50 transition-all shadow-lg border border-stone-200 flex items-center justify-center'
            >
              <FileText className='w-4 h-4 mr-2' />
              View Proposals
            </button>

            {/* Admin Settings */}
            <button
              onClick={() => setCurrentPage('admin')}
              className='w-full bg-slate-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-slate-700 transition-all shadow-lg flex items-center justify-center'
            >
              <Users className='w-4 h-4 mr-2' />
              Admin Settings
            </button>
          </div>

          {/* Footer Info */}
          <div className='mt-8 text-center'>
            <p className='text-stone-500 text-sm'>
              Professional ADU proposals with accurate California pricing • Licensed & Insured
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'proposal') {
    return (
      <ProposalFormPage
        formData={formData}
        pricingData={pricingData}
        liveCalculation={liveCalculation}
        updateClientData={updateClientData}
        updateProjectData={updateProjectData}
        setPricingData={setPricingData}
        generatePDF={generatePDF}
        onBack={() => setCurrentPage('home')}
      />
    );
  }

  if (currentPage === 'list') {
    return (
      <div className='min-h-screen bg-slate-50 p-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-2xl font-bold text-slate-800'>All Proposals</h1>
            <button
              onClick={() => setCurrentPage('home')}
              className='flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 bg-white border border-slate-200 rounded-lg'
            >
              <ArrowLeft className='w-4 h-4' />
              <span>Back to Home</span>
            </button>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
            <div className='w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6'>
              <FileText className='w-8 h-8 text-white' />
            </div>
            <h2 className='text-xl font-semibold text-slate-800 mb-4'>Proposals Management</h2>
            <p className='text-slate-600 mb-8'>View, edit, and manage all your ADU proposals</p>
            <button
              onClick={() => setCurrentPage('home')}
              className='px-8 py-3 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors'
            >
              Back to Home (Demo)
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (currentPage === 'admin') {
    return (
      <div className='min-h-screen bg-slate-50 p-8'>
        <div className='max-w-4xl mx-auto'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-2xl font-bold text-slate-800'>Admin Settings</h1>
            <button
              onClick={() => setCurrentPage('home')}
              className='flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 bg-white border border-slate-200 rounded-lg'
            >
              <ArrowLeft className='w-4 h-4' />
              <span>Back to Home</span>
            </button>
          </div>

          <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
            <div className='w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center mx-auto mb-6'>
              <Users className='w-8 h-8 text-white' />
            </div>
            <h2 className='text-xl font-semibold text-slate-800 mb-4'>System Configuration</h2>
            <p className='text-slate-600 mb-8'>
              Configure pricing, templates, company info, and system settings
            </p>
            <button
              onClick={() => setCurrentPage('home')}
              className='px-8 py-3 bg-amber-500 text-white rounded-lg font-medium hover:bg-amber-600 transition-colors'
            >
              Back to Home (Demo)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Proposal Form Page Component
interface ProposalFormPageProps {
  formData: AnchorProposalFormData;
  pricingData: any;
  liveCalculation: any;
  updateClientData: (updates: Partial<ClientInfo>) => void;
  updateProjectData: (updates: Partial<ProjectInfo>) => void;
  setPricingData: (data: any) => void;
  generatePDF: () => void;
  onBack: () => void;
}

function ProposalFormPage({
  formData,
  pricingData,
  liveCalculation,
  updateClientData,
  updateProjectData,
  setPricingData,
  generatePDF,
  onBack,
}: ProposalFormPageProps) {
  // Check if form is complete
  const isFormComplete =
    formData.client.firstName &&
    formData.client.lastName &&
    formData.client.email &&
    formData.client.phone &&
    formData.client.address;

  return (
    <div
      className='min-h-screen'
      style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
    >
      <div className='max-w-7xl mx-auto p-8'>
        {/* Header */}
        <div className='flex items-center justify-between mb-8 bg-white p-6 rounded-xl shadow-sm'>
          <div className='flex items-center space-x-4'>
            <div className='w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg'>
              AB
            </div>
            <div>
              <h1 className='text-xl font-bold text-slate-800'>Anchor Builders</h1>
              <p className='text-sm text-slate-600'>
                Licensed ADU Specialists • CA License #1234567
              </p>
            </div>
          </div>
          <div className='flex items-center space-x-4'>
            <div className='flex items-center space-x-2 text-xs text-slate-500'>
              <CheckCircle className='w-4 h-4' />
              <span>Complete all sections to generate proposal</span>
            </div>
            <button
              onClick={onBack}
              className='flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg'
            >
              <ArrowLeft className='w-4 h-4' />
              <span>Back to Home</span>
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
          {/* Main Form */}
          <div className='lg:col-span-2 space-y-6'>
            {/* Client Information */}
            <FormSection
              icon={<User className='w-5 h-5' />}
              title='Client Information'
              subtitle='Contact details and property address'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormInput
                  label='First Name *'
                  value={formData.client.firstName}
                  onChange={value => updateClientData({ firstName: value })}
                  placeholder='John'
                  required
                />
                <FormInput
                  label='Last Name *'
                  value={formData.client.lastName}
                  onChange={value => updateClientData({ lastName: value })}
                  placeholder='Smith'
                  required
                />
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormInput
                  label='Email *'
                  type='email'
                  value={formData.client.email}
                  onChange={value => updateClientData({ email: value })}
                  placeholder='john@example.com'
                  required
                />
                <FormInput
                  label='Phone *'
                  type='tel'
                  value={formData.client.phone}
                  onChange={value => updateClientData({ phone: value })}
                  placeholder='(714) 555-0123'
                  required
                />
              </div>
              <FormInput
                label='Property Address *'
                value={formData.client.address}
                onChange={value => updateClientData({ address: value })}
                placeholder='123 Main Street, Garden Grove, CA 92683'
                required
              />
            </FormSection>

            {/* ADU Configuration */}
            <FormSection
              icon={<Home className='w-5 h-5' />}
              title='ADU Configuration'
              subtitle='Size, type, and room configuration'
            >
              <ADUConfigurationForm
                pricingData={pricingData}
                setPricingData={setPricingData}
                updateProjectData={updateProjectData}
              />
            </FormSection>

            {/* Utility Connections */}
            <FormSection
              icon={<Zap className='w-5 h-5' />}
              title='Utility Connections'
              subtitle='Meter configurations'
            >
              <UtilityConnectionsForm pricingData={pricingData} setPricingData={setPricingData} />
            </FormSection>

            {/* Design Services */}
            <FormSection
              icon={<Compass className='w-5 h-5' />}
              title='Design Services & Features'
              subtitle='Professional services'
            >
              <DesignServicesForm pricingData={pricingData} setPricingData={setPricingData} />
            </FormSection>

            {/* Optional Add-Ons */}
            <FormSection
              icon={<Square className='w-5 h-5' />}
              title='Optional Add-Ons'
              subtitle='Standard and custom upgrades'
            >
              <AddOnsForm pricingData={pricingData} setPricingData={setPricingData} />
            </FormSection>
          </div>

          {/* Sidebar */}
          <div className='space-y-6 sticky top-6'>
            {/* Live Pricing */}
            <PricingCard liveCalculation={liveCalculation} pricingData={pricingData} />

            {/* Payment Schedule */}
            <PaymentScheduleCard liveCalculation={liveCalculation} />

            {/* Actions */}
            <ActionCard
              formData={formData}
              generatePDF={generatePDF}
              isFormComplete={isFormComplete}
            />

            {/* Trust Indicators */}
            <TrustIndicators />
          </div>
        </div>
      </div>
    </div>
  );
}

// Form Section Component
interface FormSectionProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}

function FormSection({ icon, title, subtitle, children }: FormSectionProps) {
  return (
    <div className='bg-white rounded-xl p-6 shadow-md border border-slate-200'>
      <div className='flex items-center space-x-3 mb-6 pb-3 border-b-2 border-blue-100'>
        <div className='w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white'>
          {icon}
        </div>
        <div>
          <h2 className='text-base font-semibold text-slate-800'>{title}</h2>
          <p className='text-xs text-slate-600'>{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

// Form Input Component
interface FormInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  type?: string;
  required?: boolean;
}

function FormInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  required,
}: FormInputProps) {
  return (
    <div className='flex flex-col'>
      <label className='text-xs font-medium text-slate-700 mb-2'>{label}</label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        className='px-3 py-2.5 border-2 border-slate-200 rounded-lg text-xs transition-all focus:outline-none focus:border-blue-500 focus:ring-3 focus:ring-blue-100'
      />
    </div>
  );
}

// ADU Configuration Form Component
function ADUConfigurationForm({ pricingData, setPricingData, updateProjectData }: any) {
  const handleSizeChange = (value: number) => {
    setPricingData((prev: any) => ({ ...prev, sqft: value }));
    updateProjectData({ squareFootage: value });
  };

  const handleADUTypeChange = (type: string, price: number) => {
    setPricingData((prev: any) => ({ ...prev, aduType: type, pricePerSqFt: price }));
    updateProjectData({ aduType: type === 'attached' ? 'attached' : 'detached' });
  };

  const handleRoomChange = (type: 'bedrooms' | 'bathrooms', value: number) => {
    setPricingData((prev: any) => ({ ...prev, [type]: value }));
    updateProjectData({ [type]: value });
  };

  return (
    <div className='space-y-6'>
      {/* Square Footage */}
      <div>
        <label className='text-xs font-medium text-slate-700 mb-2 block'>Square Footage *</label>
        <div className='flex items-center space-x-4 mb-4'>
          <input
            type='number'
            value={pricingData.sqft}
            onChange={e => handleSizeChange(parseInt(e.target.value) || 600)}
            min='300'
            max='1200'
            className='w-32 px-3 py-3 border-2 border-blue-500 rounded-lg text-base font-semibold text-center bg-blue-50'
          />
          <span className='text-sm text-slate-600'>sq ft (300-1200)</span>
        </div>
        <div className='grid grid-cols-5 gap-2'>
          {[400, 600, 800, 1000, 1200].map(size => (
            <button
              key={size}
              onClick={() => handleSizeChange(size)}
              className={`px-2 py-2 text-xs text-center rounded-lg border transition-all ${
                pricingData.sqft === size
                  ? 'border-blue-500 bg-blue-50 font-semibold'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              ~{size}
            </button>
          ))}
        </div>
      </div>

      {/* ADU Type */}
      <div>
        <label className='text-xs font-medium text-slate-700 mb-3 block'>ADU Type</label>
        <div className='grid grid-cols-3 gap-3'>
          {[
            {
              type: 'detached-1story',
              price: 220,
              title: 'Detached 1-Story',
              desc: 'Single level standalone unit',
            },
            {
              type: 'detached-2story',
              price: 240,
              title: 'Detached 2-Story',
              desc: 'Two level standalone unit',
            },
            {
              type: 'attached',
              price: 200,
              title: 'Attached ADU',
              desc: 'Connected to existing home',
            },
          ].map(option => (
            <button
              key={option.type}
              onClick={() => handleADUTypeChange(option.type, option.price)}
              className={`p-4 rounded-lg border-2 text-left transition-all ${
                pricingData.aduType === option.type
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-slate-200 hover:border-blue-300'
              }`}
            >
              <div className='flex justify-between items-start mb-2'>
                <h3 className='font-semibold text-sm text-slate-800'>{option.title}</h3>
                <span className='text-blue-600 font-bold text-sm'>${option.price}/sq ft</span>
              </div>
              <p className='text-xs text-slate-600'>{option.desc}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Bedrooms and Bathrooms */}
      <div className='grid grid-cols-2 gap-6'>
        <div>
          <label className='text-xs font-medium text-slate-700 mb-2 block'>Bedrooms</label>
          <div className='grid grid-cols-5 gap-2'>
            {[
              { value: 0, label: 'Studio' },
              { value: 1, label: '1' },
              { value: 2, label: '2' },
              { value: 3, label: '3' },
              { value: 4, label: '4' },
            ].map(option => (
              <button
                key={option.value}
                onClick={() => handleRoomChange('bedrooms', option.value)}
                className={`px-2 py-2 text-xs text-center rounded-lg border transition-all ${
                  pricingData.bedrooms === option.value
                    ? 'border-blue-500 bg-blue-50 font-semibold'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className='text-xs font-medium text-slate-700 mb-2 block'>Bathrooms</label>
          <div className='grid grid-cols-3 gap-2'>
            {[1, 2, 3].map(num => (
              <button
                key={num}
                onClick={() => handleRoomChange('bathrooms', num)}
                className={`px-2 py-2 text-xs text-center rounded-lg border transition-all ${
                  pricingData.bathrooms === num
                    ? 'border-blue-500 bg-blue-50 font-semibold'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                {num}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Utility Connections Form Component
function UtilityConnectionsForm({ pricingData, setPricingData }: any) {
  const handleUtilityChange = (utility: string, cost: number) => {
    setPricingData((prev: any) => ({
      ...prev,
      utilities: { ...prev.utilities, [utility]: cost },
    }));
  };

  const utilities = [
    {
      key: 'water',
      label: 'Water Meter',
      options: [
        { title: 'Shared', cost: 0 },
        { title: 'Separate', cost: 1000 },
      ],
    },
    {
      key: 'gas',
      label: 'Gas Meter',
      options: [
        { title: 'Shared', cost: 0 },
        { title: 'Separate', cost: 1500 },
      ],
    },
    {
      key: 'electric',
      label: 'Electric Meter',
      options: [
        { title: 'Shared', cost: 0 },
        { title: 'Separate', cost: 2000 },
      ],
    },
  ];

  return (
    <div className='space-y-3'>
      {utilities.map(utility => (
        <div key={utility.key} className='grid grid-cols-4 gap-3 items-center'>
          <div className='text-xs font-medium text-slate-700'>{utility.label}</div>
          <div className='col-span-3 grid grid-cols-2 gap-2'>
            {utility.options.map(option => (
              <button
                key={`${utility.key}-${option.cost}`}
                onClick={() => handleUtilityChange(utility.key, option.cost)}
                className={`p-2 rounded-lg border text-center text-xs transition-all ${
                  pricingData.utilities[utility.key] === option.cost
                    ? 'border-blue-500 bg-blue-50 font-semibold'
                    : 'border-slate-200 hover:border-blue-300'
                }`}
              >
                <span className='block font-medium text-slate-800 mb-1'>{option.title}</span>
                <span
                  className={`text-xs font-semibold ${option.cost === 0 ? 'text-green-600' : 'text-blue-600'}`}
                >
                  {option.cost === 0 ? 'No Cost' : `+$${option.cost.toLocaleString()}`}
                </span>
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Design Services Form Component
function DesignServicesForm({ pricingData, setPricingData }: any) {
  const handleServiceChange = (service: string, cost: number, checked: boolean) => {
    setPricingData((prev: any) => ({
      ...prev,
      services: { ...prev.services, [service]: checked ? cost : 0 },
    }));
  };

  const services = [
    {
      key: 'design',
      label: 'Full Design Package',
      cost: 12500,
      desc: 'Complete architectural design, structural engineering, MEP design, and zoning compliance review.',
    },
    {
      key: 'solar',
      label: 'Solar Design Preparation',
      cost: 0,
      desc: 'Pre-wire and structural prep for future solar installation.',
    },
    {
      key: 'fema',
      label: 'FEMA Flood Compliance',
      cost: 0,
      desc: 'Required in flood zones for elevated construction standards.',
    },
  ];

  return (
    <div className='space-y-3'>
      {services.map(service => (
        <div
          key={service.key}
          className={`p-3 rounded-lg border cursor-pointer transition-all ${
            pricingData.services[service.key] > 0
              ? 'border-blue-500 bg-blue-50'
              : 'border-slate-200 hover:border-blue-300'
          }`}
          onClick={() =>
            handleServiceChange(service.key, service.cost, pricingData.services[service.key] === 0)
          }
        >
          <div className='flex items-start space-x-3'>
            <input
              type='checkbox'
              checked={pricingData.services[service.key] > 0}
              onChange={() => {}}
              className='mt-0.5 w-4 h-4 text-blue-600'
            />
            <div className='flex-1'>
              <div className='flex justify-between items-center mb-1'>
                <span className='font-semibold text-xs text-slate-800'>{service.label}</span>
                <span className='font-semibold text-xs text-blue-600'>
                  {service.cost === 0 ? 'No Cost' : `+$${service.cost.toLocaleString()}`}
                </span>
              </div>
              <p className='text-xs text-slate-600 leading-tight'>{service.desc}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Add-Ons Form Component
function AddOnsForm({ pricingData, setPricingData }: any) {
  const handleAddonChange = (addon: string, cost: number, checked: boolean) => {
    setPricingData((prev: any) => ({
      ...prev,
      addons: { ...prev.addons, [addon]: checked ? cost : 0 },
    }));
  };

  const handleManualAddonChange = (index: number, value: string) => {
    const cost = parseInt(value) || 0;
    setPricingData((prev: any) => {
      const newManualAddons = [...prev.manualAddons];
      newManualAddons[index] = cost;
      return { ...prev, manualAddons: newManualAddons };
    });
  };

  const addManualAddon = () => {
    setPricingData((prev: any) => ({
      ...prev,
      manualAddons: [...prev.manualAddons, 0],
    }));
  };

  const removeManualAddon = (index: number) => {
    setPricingData((prev: any) => ({
      ...prev,
      manualAddons: prev.manualAddons.filter((_: any, i: number) => i !== index),
    }));
  };

  const standardAddons = [
    {
      key: 'bathroom',
      label: 'Extra Bathroom',
      cost: 8000,
      desc: 'Additional bathroom beyond standard configuration.',
    },
    {
      key: 'driveway',
      label: 'Dedicated Driveway',
      cost: 5000,
      desc: 'Dedicated driveway and parking space.',
    },
    {
      key: 'landscaping',
      label: 'Basic Landscaping',
      cost: 10000,
      desc: 'Basic landscaping package around the ADU.',
    },
  ];

  return (
    <div className='space-y-4'>
      {/* Standard Add-ons */}
      <div className='space-y-3'>
        {standardAddons.map(addon => (
          <div
            key={addon.key}
            className={`p-3 rounded-lg border cursor-pointer transition-all ${
              pricingData.addons[addon.key] > 0
                ? 'border-blue-500 bg-blue-50'
                : 'border-slate-200 hover:border-blue-300'
            }`}
            onClick={() =>
              handleAddonChange(addon.key, addon.cost, pricingData.addons[addon.key] === 0)
            }
          >
            <div className='flex items-start space-x-3'>
              <input
                type='checkbox'
                checked={pricingData.addons[addon.key] > 0}
                onChange={() => {}}
                className='mt-0.5 w-4 h-4 text-blue-600'
              />
              <div className='flex-1'>
                <div className='flex justify-between items-center mb-1'>
                  <span className='font-semibold text-xs text-slate-800'>{addon.label}</span>
                  <span className='font-semibold text-xs text-blue-600'>
                    +${addon.cost.toLocaleString()}
                  </span>
                </div>
                <p className='text-xs text-slate-600 leading-tight'>{addon.desc}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual Add-ons */}
      <div>
        <label className='text-xs font-medium text-slate-700 mb-2 block'>Custom Add-ons</label>
        <div className='space-y-2'>
          {pricingData.manualAddons.map((cost: number, index: number) => (
            <div key={index} className='grid grid-cols-12 gap-2 items-center'>
              <input
                type='text'
                placeholder='Description (e.g., Premium flooring)'
                className='col-span-8 px-2 py-2 border border-slate-200 rounded-lg text-xs'
              />
              <input
                type='number'
                value={cost || ''}
                onChange={e => handleManualAddonChange(index, e.target.value)}
                placeholder='0'
                className='col-span-3 px-2 py-2 border border-slate-200 rounded-lg text-xs text-right'
              />
              <button
                onClick={() => removeManualAddon(index)}
                className='col-span-1 w-7 h-7 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center text-xs transition-all'
              >
                <X className='w-3 h-3' />
              </button>
            </div>
          ))}
          <button
            onClick={addManualAddon}
            className='w-full px-4 py-2 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors text-xs flex items-center justify-center space-x-2'
          >
            <Plus className='w-3 h-3' />
            <span>Add More</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Pricing Card Component
function PricingCard({ liveCalculation, pricingData }: any) {
  return (
    <div className='bg-white rounded-xl p-6 shadow-lg border border-slate-200'>
      <div className='text-center mb-6'>
        <div className='text-xs text-slate-600 mb-2'>Estimated Total</div>
        <div className='text-2xl font-bold text-blue-600 transition-all duration-200'>
          ${liveCalculation.finalTotal.toLocaleString()}
        </div>
        <div className='text-sm text-slate-600'>${liveCalculation.pricePerSqFt} per sq ft</div>
      </div>

      <div className='space-y-2 mb-6'>
        <div className='flex justify-between items-center text-xs'>
          <span className='text-slate-600'>Base Construction</span>
          <span className='font-semibold'>
            ${liveCalculation.baseConstruction.toLocaleString()}
          </span>
        </div>
        <div className='flex justify-between items-center text-xs'>
          <span className='text-slate-600'>Design Services</span>
          <span className='font-semibold'>${liveCalculation.servicesTotal.toLocaleString()}</span>
        </div>
        <div className='flex justify-between items-center text-xs'>
          <span className='text-slate-600'>Utilities & Permits</span>
          <span className='font-semibold'>${liveCalculation.utilitiesTotal.toLocaleString()}</span>
        </div>
        <div className='flex justify-between items-center text-xs'>
          <span className='text-slate-600'>Add-ons</span>
          <span className='font-semibold'>${liveCalculation.addonsTotal.toLocaleString()}</span>
        </div>
        <div className='flex justify-between items-center text-xs'>
          <span className='text-slate-600'>Subtotal</span>
          <span className='font-semibold'>${liveCalculation.subtotal.toLocaleString()}</span>
        </div>
        <div className='flex justify-between items-center text-xs'>
          <span className='text-slate-600'>Contractor Markup (15%)</span>
          <span className='font-semibold'>${liveCalculation.markup.toLocaleString()}</span>
        </div>
        <div className='flex justify-between items-center text-sm font-semibold pt-3 mt-3 border-t-2 border-slate-200'>
          <span className='text-slate-800'>Total Investment</span>
          <span className='text-blue-600'>${liveCalculation.finalTotal.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}

// Payment Schedule Card Component
function PaymentScheduleCard({ liveCalculation }: any) {
  const milestones = [
    { number: 1, name: 'Mobilization', percentage: 20 },
    { number: 2, name: 'Foundation', percentage: 20 },
    { number: 3, name: 'Framing', percentage: 20 },
    { number: 4, name: 'MEP & Drywall', percentage: 25 },
    { number: 5, name: 'Final', percentage: 15 },
  ];

  return (
    <div className='bg-white rounded-xl p-4 shadow-md border border-slate-200'>
      <h3 className='font-semibold text-slate-800 mb-3 text-sm'>Payment Milestones</h3>
      <div className='space-y-2'>
        {milestones.map(milestone => {
          const amount = Math.round((liveCalculation.finalTotal * milestone.percentage) / 100);
          return (
            <div key={milestone.number} className='flex justify-between items-center text-xs'>
              <div className='flex items-center space-x-2'>
                <span className='w-5 h-5 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs font-semibold'>
                  {milestone.number}
                </span>
                <span className='text-slate-800'>{milestone.name}</span>
              </div>
              <span className='font-semibold text-slate-800'>
                ${amount.toLocaleString()} ({milestone.percentage}%)
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Action Card Component
function ActionCard({ formData, generatePDF, isFormComplete }: any) {
  return (
    <div className='bg-white rounded-xl p-4 shadow-md border border-slate-200'>
      <button
        onClick={generatePDF}
        disabled={!isFormComplete}
        className='w-full px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold text-xs flex items-center justify-center space-x-2 hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed mb-2'
      >
        <FileText className='w-4 h-4' />
        <span>Generate Proposal</span>
      </button>
      <button className='w-full px-4 py-2 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors'>
        <Eye className='w-4 h-4' />
        <span>Preview Sample</span>
      </button>
    </div>
  );
}

// Trust Indicators Component
function TrustIndicators() {
  const indicators = [
    { icon: <Shield className='w-3 h-3' />, text: 'Licensed & Insured' },
    { icon: <Award className='w-3 h-3' />, text: '50+ ADUs Built' },
    { icon: <Clock className='w-3 h-3' />, text: '4-6 Month Timeline' },
  ];

  return (
    <div className='bg-white rounded-xl p-4 shadow-md border border-slate-200'>
      <div className='space-y-2'>
        {indicators.map((indicator, index) => (
          <div key={index} className='flex items-center space-x-2'>
            <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white'>
              {indicator.icon}
            </div>
            <span className='text-xs font-medium text-slate-800'>{indicator.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
