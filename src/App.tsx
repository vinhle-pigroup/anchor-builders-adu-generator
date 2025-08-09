import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { logConfigStatus } from './lib/env-config';
import { AnchorPricingEngine } from './lib/pricing-engine';
import {
  FileText,
  Users,
  Download,
  Plus,
  ArrowLeft,
  Eye,
  X,
  Settings,
} from 'lucide-react';
import type { AnchorProposalFormData, ClientInfo, ProjectInfo } from './types/proposal';
import { AnchorPDFGenerator } from './lib/pdf-generator';
import { useFormValidation } from './hooks/useFormValidation';
import { useErrorHandler } from './hooks/useErrorHandler';
import { SuccessNotification } from './components/SuccessNotification';
import { ErrorNotification } from './components/ErrorNotification';
import { PDFProgressIndicator } from './components/PDFProgressIndicator';
import { AdminTextEditor } from './components/AdminTextEditor';
import ProductionHeader from './components/ProductionHeader';
import ProductionGrid from './components/ProductionGrid';
import PricingSidebarSticky from './components/PricingSidebarSticky';
import MobileAccordion from './components/MobileAccordion';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'proposal' | 'list' | 'admin'>('home');
  const [savedProposals, setSavedProposals] = useState<AnchorProposalFormData[]>([]);
  const [editingProposal, setEditingProposal] = useState<AnchorProposalFormData | null>(null);
  const [adminSection, setAdminSection] = useState<'data' | 'templates'>('data');

  // Error Handling
  const { error, clearError, handleError } = useErrorHandler();

  // Form Validation
  const {} = useFormValidation();

  // Debug configuration on app startup
  useEffect(() => {
    console.log('🚀 APP STARTING - DEBUG MODE ACTIVE');
    console.log('🔍 Environment variables:', {
      VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      VITE_ENABLE_GOOGLE_MAPS: import.meta.env.VITE_ENABLE_GOOGLE_MAPS,
    });
    logConfigStatus();
  }, []);

  // UI State
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<
    'historical' | 'modern' | 'premium' | 'classic' | 'enhanced'
  >('historical');
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
        electricalPanel: '200',
      },
      sewerConnection: 'existing-lateral',
      needsDesign: true,
      solarDesign: false,
      femaIncluded: false,
      selectedAddOns: [],
    },
    additionalNotes: '',
    timeline: '6-8 months',
    proposalDate: new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }), // Auto-populated with today's date
  });

  // Load saved proposals on app start
  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('anchorProposals') || '[]');
    setSavedProposals(saved);
  }, []);

  // Load editing proposal data
  useEffect(() => {
    if (editingProposal) {
      setFormData(editingProposal);
      // Set current page to proposal form for editing
      setCurrentPage('proposal');
    }
  }, [editingProposal]);


  // Pricing state for real-time updates
  const [pricingData, setPricingData] = useState({
    aduType: 'detached-1story',
    pricePerSqFt: 220,
    sqft: 600,
    bedrooms: 2,
    bathrooms: 2,
    hvacType: 'central-ac',
    utilities: {
      water: null,
      gas: null,
      electric: null,
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


  // Template switching function
  const switchToTemplate = async (
    templateName: 'historical' | 'modern' | 'premium' | 'classic' | 'enhanced'
  ) => {
    try {
      // Just update the selected template state - the PDF generator will use this
      console.log(`🎨 [TEMPLATE SWITCH] User clicked: ${templateName}`);
      console.log(`🎨 [TEMPLATE SWITCH] Previous template: ${selectedTemplate}`);
      setSelectedTemplate(templateName);
      console.log(`🎨 [TEMPLATE SWITCH] Template state updated to: ${templateName}`);

      // Show visual feedback to user
      setSuccessMessage(`Switched to ${templateName} template design`);
      setTimeout(() => setSuccessMessage(null), 2000);
    } catch (error) {
      console.error('❌ Template switching failed:', error);
    }
  };

  // Calculate live pricing using the same engine as PDF
  const liveCalculation = useMemo(() => {
    try {
      const pricingEngine = new AnchorPricingEngine();
      
      // DEBUG: Log the form data being used for pricing
      console.log('🔍 [LIVE CALCULATION] formData.project.selectedAddOns:', formData.project.selectedAddOns);
      console.log('🔍 [LIVE CALCULATION] formData.project.utilities:', formData.project.utilities);
      
      // FIXED: Use actual formData values instead of hardcoded ones
      const pricingInputs = {
        squareFootage: formData.project.squareFootage,
        aduType: formData.project.aduType,
        bedrooms: formData.project.bedrooms,
        bathrooms: formData.project.bathrooms,
        utilities: formData.project.utilities, // Use actual utility selections
        needsDesign: formData.project.needsDesign,
        appliancesIncluded: formData.project.appliancesIncluded,
        hvacType: formData.project.hvacType,
        selectedAddOns: formData.project.selectedAddOns, // Use actual selected add-ons
        sewerConnection: formData.project.sewerConnection,
        solarDesign: formData.project.solarDesign,
        femaIncluded: formData.project.femaIncluded,
        // CRITICAL: Force 0% markup to prevent unwanted contractor markup
        priceOverrides: {
          markupPercentage: 0.0
        }
      };
      
      console.log('🔍 [LIVE CALCULATION] Sending to pricing engine:', pricingInputs);

      const calculation = pricingEngine.calculateProposal(pricingInputs);
      
      // DEBUG: Log what the pricing engine returned
      console.log('📊 [LIVE CALCULATION] Pricing engine result:', calculation);
      console.log('📊 [LIVE CALCULATION] Line items:', calculation.lineItems);
      console.log('📊 [LIVE CALCULATION] All categories:', calculation.lineItems.map(item => item.category));
      
      // FIXED: Use correct case-sensitive category names
      const addOnItems = calculation.lineItems.filter(item => item.category === 'Add-Ons'); // Capital 'O'
      const utilityItems = calculation.lineItems.filter(item => item.category === 'Utility Connections');
      console.log('📊 [LIVE CALCULATION] Add-ons found:', addOnItems);
      console.log('📊 [LIVE CALCULATION] Utilities found:', utilityItems);
      
      const result = {
        baseConstruction: calculation.lineItems.find(item => item.category === 'Base Construction')?.totalPrice || 0,
        utilitiesTotal: calculation.lineItems.filter(item => item.category === 'Utility Connections').reduce((sum, item) => sum + item.totalPrice, 0),
        servicesTotal: calculation.lineItems.find(item => item.category === 'Design Services')?.totalPrice || 0,
        addonsTotal: addOnItems.reduce((sum, item) => sum + item.totalPrice, 0), // Use the correct filter
        subtotal: calculation.subtotal,
        markup: calculation.markupAmount,
        finalTotal: calculation.grandTotal,
        pricePerSqFt: Math.round(calculation.pricePerSqFt),
      };
      
      console.log('📊 [LIVE CALCULATION] Final result:', result);
      return result;
    } catch (error) {
      console.error('Pricing calculation error:', error);
      // Fallback to simple calculation using formData
      const basePrice = formData.project.aduType === 'detached' ? 220 : 200; // Fallback pricing
      const baseConstruction = formData.project.squareFootage * basePrice;
      const finalTotal = baseConstruction + 12500; // Base + design
      return {
        baseConstruction,
        utilitiesTotal: 0,
        servicesTotal: 12500,
        addonsTotal: 0,
        subtotal: finalTotal,
        markup: 0,
        finalTotal,
        pricePerSqFt: Math.round(finalTotal / formData.project.squareFootage),
      };
    }
  }, [formData]);

  const generatePDF = useCallback(async () => {
    try {
      setIsGeneratingPDF(true);
      console.log('🚀 Starting PDF generation process...');
      console.log(`🎨 [PDF GENERATION] Using template: ${selectedTemplate}`);

      // Skip strict validation - allow PDF generation with minimal data
      console.log('📋 Generating PDF with current form data...');

      const pdfGenerator = new AnchorPDFGenerator();
      // Pass liveCalculation as single source of truth for all pricing data
      await pdfGenerator.generateProposal(formData, selectedTemplate, liveCalculation);

      // Save proposal to local storage for future editing
      try {
        const proposalId = Date.now().toString();
        const proposalToSave = {
          ...formData,
          id: proposalId,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString(),
        };

        const saved = JSON.parse(localStorage.getItem('anchorProposals') || '[]');
        saved.push(proposalToSave);
        localStorage.setItem('anchorProposals', JSON.stringify(saved));
        setSavedProposals(saved);

        console.log('✅ Proposal saved to local storage successfully');
      } catch (storageError) {
        console.warn('⚠️ Failed to save to local storage:', storageError);
        // Don't fail the PDF generation if storage fails
      }

      // Show success message
      setSuccessMessage(
        'Proposal generated successfully! Check your downloads or the new browser window.'
      );
      console.log('✅ PDF generation completed successfully');
    } catch (err) {
      console.error('❌ PDF generation failed:', err);
      handleError(err, 'PDF Generation');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [formData, handleError, selectedTemplate, liveCalculation]);

  // Global UI Components that appear over pages
  const GlobalUI = () => (
    <>
      {/* PDF Progress Indicator */}
      <PDFProgressIndicator
        isGenerating={isGeneratingPDF}
        onComplete={() => setIsGeneratingPDF(false)}
        onError={err => {
          setIsGeneratingPDF(false);
          handleError(err, 'PDF Generation');
        }}
      />

      {/* Success Notification */}
      {successMessage && (
        <SuccessNotification message={successMessage} onDismiss={() => setSuccessMessage(null)} />
      )}

      {/* Error Notification */}
      {error && <ErrorNotification error={error} onDismiss={clearError} onRetry={generatePDF} />}
    </>
  );

  if (currentPage === 'home') {
    return (
      <>
        <GlobalUI />
        <div className='min-h-screen bg-gradient-to-br from-stone-100 to-blue-50 flex items-center justify-center'>
          <div className='text-center max-w-md mx-auto px-6'>
            {/* Large Logo Container */}
            <div className='inline-flex items-center justify-center w-52 h-52 bg-white rounded-2xl mb-8 shadow-lg'>
              <div className='flex items-center justify-center w-48 h-48'>
                <img
                  src='/anchor-builders-logo.png'
                  alt='Anchor Builders Logo'
                  className='w-40 h-40 object-contain'
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

              {/* View and Edit Proposals */}
              <button
                onClick={() => setCurrentPage('list')}
                className='w-full bg-white text-stone-700 px-6 py-3 rounded-xl text-base font-semibold hover:bg-stone-50 transition-all shadow-lg border border-stone-200 flex items-center justify-center'
              >
                <FileText className='w-4 h-4 mr-2' />
                View & Edit Proposals
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
      </>
    );
  }

  if (currentPage === 'proposal') {
    // Check if form is complete
    const isFormComplete =
      formData.client.firstName &&
      formData.client.lastName &&
      formData.client.email &&
      formData.client.phone &&
      formData.client.address &&
      formData.client.city &&
      formData.client.state &&
      formData.client.zipCode &&
      pricingData.utilities.water !== null &&
      pricingData.utilities.gas !== null &&
      pricingData.utilities.electric !== null;

    return (
      <>
        <GlobalUI />
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          <ProductionHeader 
            selectedTemplate={selectedTemplate}
            onTemplateChange={switchToTemplate}
          />
          
          {/* Desktop: 3-column layout */}
          <div className="hidden lg:block">
            <ProductionGrid 
              formData={formData}
              updateClientData={updateClientData}
              updateProjectData={updateProjectData}
              pricingData={pricingData}
              setPricingData={setPricingData}
            />
            <PricingSidebarSticky 
              liveCalculation={liveCalculation}
              onGenerate={generatePDF}
              isGenerating={Boolean(isGeneratingPDF)}
              isFormComplete={Boolean(isFormComplete)}
            />
          </div>
          
          {/* Mobile: Accordion layout */}
          <div className="lg:hidden">
            <MobileAccordion 
              formData={formData}
              liveCalculation={liveCalculation}
              updateClientData={updateClientData}
              updateProjectData={updateProjectData}
              pricingData={pricingData}
              setPricingData={setPricingData}
              onGenerate={generatePDF}
              isGenerating={Boolean(isGeneratingPDF)}
              isFormComplete={Boolean(isFormComplete)}
            />
          </div>
        </div>
      </>
    );
  }

  if (currentPage === 'list') {
    const handleEditProposal = (proposal: any) => {
      setEditingProposal(proposal);
    };

    const handleDeleteProposal = (proposalId: string) => {
      if (confirm('Are you sure you want to delete this proposal?')) {
        const updated = savedProposals.filter((p: any) => p.id !== proposalId);
        setSavedProposals(updated);
        localStorage.setItem('anchorProposals', JSON.stringify(updated));
      }
    };

    const handleDuplicateProposal = (proposal: any) => {
      const duplicated = {
        ...proposal,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        lastModified: new Date().toISOString(),
        client: {
          ...proposal.client,
          firstName: proposal.client.firstName + ' (Copy)',
        },
      };
      const updated = [...savedProposals, duplicated];
      setSavedProposals(updated);
      localStorage.setItem('anchorProposals', JSON.stringify(updated));
    };

    return (
      <div className='min-h-screen bg-slate-50 p-8'>
        <div className='max-w-6xl mx-auto'>
          <div className='flex items-center justify-between mb-6'>
            <h1 className='text-2xl font-bold text-slate-800'>Saved Proposals</h1>
            <div className='flex items-center space-x-4'>
              <button
                onClick={() => setCurrentPage('proposal')}
                className='flex items-center space-x-2 text-white bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg'
              >
                <Plus className='w-4 h-4' />
                <span>New Proposal</span>
              </button>
              <button
                onClick={() => setCurrentPage('home')}
                className='flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 bg-white border border-slate-200 rounded-lg'
              >
                <ArrowLeft className='w-4 h-4' />
                <span>Back to Home</span>
              </button>
            </div>
          </div>

          {savedProposals.length === 0 ? (
            <div className='bg-white rounded-lg shadow-sm p-12 text-center'>
              <div className='w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-6'>
                <FileText className='w-8 h-8 text-white' />
              </div>
              <h2 className='text-xl font-semibold text-slate-800 mb-4'>No Proposals Yet</h2>
              <p className='text-slate-600 mb-8'>Create your first ADU proposal to get started</p>
              <button
                onClick={() => setCurrentPage('proposal')}
                className='px-8 py-3 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center space-x-2 mx-auto'
              >
                <Plus className='w-4 h-4' />
                <span>Create First Proposal</span>
              </button>
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {savedProposals.map((proposal: any) => (
                <div
                  key={proposal.id}
                  className='bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden'
                >
                  <div className='p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div>
                        <h3 className='font-semibold text-slate-800 text-lg'>
                          {proposal.client.firstName} {proposal.client.lastName}
                        </h3>
                        <p className='text-slate-600 text-sm'>{proposal.client.address}</p>
                        <p className='text-slate-500 text-xs'>
                          {proposal.client.city}, {proposal.client.state}
                        </p>
                      </div>
                      <div className='text-right'>
                        <div className='text-lg font-bold text-blue-600'>
                          {proposal.project.squareFootage} sq ft
                        </div>
                        <div className='text-xs text-slate-500'>
                          {proposal.project.bedrooms}BR / {proposal.project.bathrooms}BA
                        </div>
                      </div>
                    </div>

                    <div className='text-xs text-slate-500 mb-4'>
                      Created: {new Date(proposal.createdAt).toLocaleDateString()}
                    </div>

                    <div className='flex space-x-2'>
                      <button
                        onClick={() => handleEditProposal(proposal)}
                        className='flex-1 px-3 py-2 bg-blue-500 text-white rounded text-sm font-medium hover:bg-blue-600 transition-colors flex items-center justify-center space-x-1'
                      >
                        <Eye className='w-3 h-3' />
                        <span>Edit</span>
                      </button>
                      <button
                        onClick={() => handleDuplicateProposal(proposal)}
                        className='px-3 py-2 bg-slate-500 text-white rounded text-sm font-medium hover:bg-slate-600 transition-colors'
                        title='Duplicate'
                      >
                        <Plus className='w-3 h-3' />
                      </button>
                      <button
                        onClick={() => handleDeleteProposal(proposal.id)}
                        className='px-3 py-2 bg-red-500 text-white rounded text-sm font-medium hover:bg-red-600 transition-colors'
                        title='Delete'
                      >
                        <X className='w-3 h-3' />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  if (currentPage === 'admin') {
    const clearAllProposals = () => {
      if (confirm('Are you sure you want to delete ALL proposals? This cannot be undone.')) {
        localStorage.removeItem('anchorProposals');
        setSavedProposals([]);
        alert('All proposals have been deleted.');
      }
    };

    const exportProposals = () => {
      const dataStr = JSON.stringify(savedProposals, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);

      const exportFileDefaultName = `anchor-proposals-${new Date().toISOString().split('T')[0]}.json`;

      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    };

    const importProposals = (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = e => {
          try {
            const imported = JSON.parse(e.target?.result as string);
            if (Array.isArray(imported)) {
              const updated = [...savedProposals, ...imported];
              setSavedProposals(updated);
              localStorage.setItem('anchorProposals', JSON.stringify(updated));
              alert(`Imported ${imported.length} proposals successfully.`);
            } else {
              alert('Invalid file format. Please select a valid proposals JSON file.');
            }
          } catch (error) {
            alert('Error reading file. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };

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

          {/* Admin Section Tabs */}
          <div className='mb-6'>
            <div className='flex space-x-1 bg-slate-100 rounded-lg p-1'>
              <button
                onClick={() => setAdminSection('data')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  adminSection === 'data'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <FileText className='w-4 h-4' />
                <span>Data Management</span>
              </button>
              <button
                onClick={() => setAdminSection('templates')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  adminSection === 'templates'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Settings className='w-4 h-4' />
                <span>Template Text</span>
              </button>
            </div>
          </div>

          {adminSection === 'data' && (
            <div className='space-y-6'>
              {/* Data Management */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-xl font-semibold text-slate-800 mb-4 flex items-center'>
                  <FileText className='w-5 h-5 mr-2' />
                  Data Management
                </h2>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                  <div className='text-center p-4 border border-slate-200 rounded-lg'>
                    <div className='text-2xl font-bold text-blue-600 mb-2'>
                      {savedProposals.length}
                    </div>
                    <div className='text-sm text-slate-600'>Saved Proposals</div>
                  </div>
                  <button
                    onClick={exportProposals}
                    disabled={savedProposals.length === 0}
                    className='p-4 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2'
                  >
                    <Download className='w-4 h-4' />
                    <span>Export Data</span>
                  </button>
                  <label className='p-4 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-colors cursor-pointer flex items-center justify-center space-x-2'>
                    <input
                      type='file'
                      accept='.json'
                      onChange={importProposals}
                      className='hidden'
                    />
                    <Plus className='w-4 h-4' />
                    <span>Import Data</span>
                  </label>
                </div>
              </div>

              {/* Danger Zone */}
              <div className='bg-white rounded-lg shadow-sm p-6 border-l-4 border-red-500'>
                <h2 className='text-xl font-semibold text-red-600 mb-4'>Danger Zone</h2>
                <p className='text-slate-600 mb-4'>
                  Permanently delete all saved proposals. This action cannot be undone.
                </p>
                <button
                  onClick={clearAllProposals}
                  disabled={savedProposals.length === 0}
                  className='px-6 py-3 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2'
                >
                  <X className='w-4 h-4' />
                  <span>Clear All Proposals</span>
                </button>
              </div>

              {/* System Info */}
              <div className='bg-white rounded-lg shadow-sm p-6'>
                <h2 className='text-xl font-semibold text-slate-800 mb-4'>System Information</h2>
                <div className='space-y-2 text-sm'>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Version:</span>
                    <span className='font-medium'>1.0.0</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Storage:</span>
                    <span className='font-medium'>Local Browser Storage</span>
                  </div>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Last Updated:</span>
                    <span className='font-medium'>{new Date().toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {adminSection === 'templates' && (
            <AdminTextEditor
              onSave={() => {
                setSuccessMessage(
                  'Template text updated successfully! Changes will appear in all new PDFs.'
                );
                setTimeout(() => setSuccessMessage(null), 3000);
              }}
            />
          )}
        </div>
      </div>
    );
  }

  return null;
}

// Proposal Form Page Component - REMOVED (replaced with new layout components)

// Additional form components removed - now handled by new layout components

export default App;
