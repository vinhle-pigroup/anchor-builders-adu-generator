import React, { useState, useMemo, useCallback, useEffect } from 'react';
import { logConfigStatus } from './lib/env-config';
import {
  FileText,
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
  X,
} from 'lucide-react';
import type { AnchorProposalFormData, ClientInfo, ProjectInfo } from './types/proposal';
import { AnchorPDFGenerator } from './lib/pdf-generator';
import { useFormValidation } from './hooks/useFormValidation';
import { useErrorHandler } from './hooks/useErrorHandler';
import { ValidatedInput } from './components/ValidatedInput';
import { FormField } from './components/FormField';
import { SuccessNotification } from './components/SuccessNotification';
import { ErrorNotification } from './components/ErrorNotification';
import { PDFProgressIndicator } from './components/PDFProgressIndicator';
import { LoadingSpinner } from './components/LoadingSpinner';

function App() {
  const [currentPage, setCurrentPage] = useState<'home' | 'proposal' | 'list' | 'admin'>('home');
  const [savedProposals, setSavedProposals] = useState<AnchorProposalFormData[]>([]);
  const [editingProposal, setEditingProposal] = useState<AnchorProposalFormData | null>(null);
  
  // Error Handling
  const { error, clearError, handleError } = useErrorHandler();
  
  // Form Validation
  const {} = useFormValidation();

  // Debug configuration on app startup
  useEffect(() => {
    console.log('🚀 APP STARTING - DEBUG MODE ACTIVE');
    console.log('🔍 Environment variables:', {
      VITE_GOOGLE_MAPS_API_KEY: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
      VITE_ENABLE_GOOGLE_MAPS: import.meta.env.VITE_ENABLE_GOOGLE_MAPS
    });
    logConfigStatus();
  }, []);
  
  // UI State
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
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

  const generatePDF = useCallback(async () => {
    try {
      setIsGeneratingPDF(true);
      console.log('🚀 Starting PDF generation process...');
      
      // Skip strict validation - allow PDF generation with minimal data
      console.log('📋 Generating PDF with current form data...');
      
      const pdfGenerator = new AnchorPDFGenerator();
      await pdfGenerator.generateProposal(formData);
      
      // Save proposal to local storage for future editing
      try {
        const proposalId = Date.now().toString();
        const proposalToSave = {
          ...formData,
          id: proposalId,
          createdAt: new Date().toISOString(),
          lastModified: new Date().toISOString()
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
      setSuccessMessage('Proposal generated successfully! Check your downloads or the new browser window.');
      console.log('✅ PDF generation completed successfully');
    } catch (err) {
      console.error('❌ PDF generation failed:', err);
      handleError(err, 'PDF Generation');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [formData, handleError]);

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

  // Global UI Components that appear over pages
  const GlobalUI = () => (
    <>
      {/* PDF Progress Indicator */}
      <PDFProgressIndicator 
        isGenerating={isGeneratingPDF}
        onComplete={() => setIsGeneratingPDF(false)}
        onError={(err) => {
          setIsGeneratingPDF(false);
          handleError(err, 'PDF Generation');
        }}
      />
      
      {/* Success Notification */}
      {successMessage && (
        <SuccessNotification
          message={successMessage}
          onDismiss={() => setSuccessMessage(null)}
        />
      )}
      
      {/* Error Notification */}
      {error && (
        <ErrorNotification
          error={error}
          onDismiss={clearError}
          onRetry={generatePDF}
        />
      )}
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
                src='/anchor-logo-official.jpg'
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
    return (
      <>
        <GlobalUI />
        <ProposalFormPage
        formData={formData}
        pricingData={pricingData}
        liveCalculation={liveCalculation}
        updateClientData={updateClientData}
        updateProjectData={updateProjectData}
        setPricingData={setPricingData}
        generatePDF={generatePDF}
        isGeneratingPDF={isGeneratingPDF}
        onBack={() => {
          setCurrentPage('home');
          setEditingProposal(null);
          // Reset form to defaults when going back
          setFormData({
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
        }}
      />
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
        }
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
                <div key={proposal.id} className='bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden'>
                  <div className='p-6'>
                    <div className='flex items-start justify-between mb-4'>
                      <div>
                        <h3 className='font-semibold text-slate-800 text-lg'>
                          {proposal.client.firstName} {proposal.client.lastName}
                        </h3>
                        <p className='text-slate-600 text-sm'>{proposal.client.address}</p>
                        <p className='text-slate-500 text-xs'>{proposal.client.city}, {proposal.client.state}</p>
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
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
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
        reader.onload = (e) => {
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
  isGeneratingPDF: boolean;
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
  isGeneratingPDF,
}: ProposalFormPageProps) {
  // Check if form is complete
  const isFormComplete =
    formData.client.firstName &&
    formData.client.lastName &&
    formData.client.email &&
    formData.client.phone &&
    formData.client.address &&
    formData.client.city &&
    formData.client.state &&
    formData.client.zipCode;

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

        {/* Compact Generate Button with Live Pricing - Top of Form */}
        <div className='mb-6'>
          <div className='bg-white rounded-xl p-4 shadow-md border border-slate-200'>
            <div className='flex items-center justify-between gap-4'>
              {/* Live Price Display */}
              <div className='flex items-center space-x-4'>
                <div className='text-right'>
                  <div className='text-sm text-slate-600'>Total Project Cost</div>
                  <div className='text-2xl font-bold text-blue-600'>
                    ${liveCalculation.finalTotal.toLocaleString()}
                  </div>
                  <div className='text-xs text-slate-500'>
                    {pricingData.sqft ? `${pricingData.sqft} sq ft • ` : ''}
                    {isFormComplete ? 'Ready to generate' : 'Complete form to generate'}
                  </div>
                </div>
              </div>
              
              {/* Compact Generate Button */}
              <button
                onClick={generatePDF}
                disabled={!isFormComplete || isGeneratingPDF}
                className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold text-sm flex items-center space-x-2 hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg whitespace-nowrap'
              >
                {isGeneratingPDF ? (
                  <LoadingSpinner size="sm" className="text-white" />
                ) : (
                  <FileText className='w-4 h-4' />
                )}
                <span>{isGeneratingPDF ? 'Generating...' : 'Generate Proposal'}</span>
              </button>
            </div>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-screen'>
          {/* Main Form - Scrollable */}
          <div className='lg:col-span-2 space-y-6 lg:max-h-screen lg:overflow-y-auto lg:pr-4'>
            {/* Client Information */}
            <FormSection
              icon={<User className='w-5 h-5' />}
              title='Client Information'
              subtitle='Contact details and property address'
            >
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  label='First Name'
                  isRequired
                  isValid={!!formData.client.firstName?.trim()}
                  isTouched={true}
                >
                  <ValidatedInput
                    value={formData.client.firstName}
                    onChange={value => updateClientData({ firstName: value as string })}
                    placeholder='John'
                    isValid={!!formData.client.firstName?.trim()}
                    fieldName='firstName'
                    autoFormat
                  />
                </FormField>
                <FormField
                  label='Last Name'
                  isRequired
                  isValid={!!formData.client.lastName?.trim()}
                  isTouched={true}
                >
                  <ValidatedInput
                    value={formData.client.lastName}
                    onChange={value => updateClientData({ lastName: value as string })}
                    placeholder='Smith'
                    isValid={!!formData.client.lastName?.trim()}
                    fieldName='lastName'
                    autoFormat
                  />
                </FormField>
              </div>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <FormField
                  label='Email'
                  isRequired
                  isValid={!!formData.client.email?.trim() && formData.client.email.includes('@')}
                  isTouched={true}
                >
                  <ValidatedInput
                    type='email'
                    value={formData.client.email}
                    onChange={value => updateClientData({ email: value as string })}
                    placeholder='john@example.com'
                    isValid={!!formData.client.email?.trim() && formData.client.email.includes('@')}
                    fieldName='email'
                    autoFormat
                  />
                </FormField>
                <FormField
                  label='Phone'
                  isRequired
                  isValid={!!formData.client.phone?.trim() && formData.client.phone.length >= 10}
                  isTouched={true}
                >
                  <ValidatedInput
                    type='tel'
                    value={formData.client.phone}
                    onChange={value => updateClientData({ phone: value as string })}
                    placeholder='(714) 555-0123'
                    isValid={!!formData.client.phone?.trim() && formData.client.phone.length >= 10}
                    fieldName='phone'
                    autoFormat
                  />
                </FormField>
              </div>
              <FormField
                label='Property Address'
                isRequired
                isValid={!!formData.client.address?.trim()}
                isTouched={true}
              >
                <ValidatedInput
                  value={formData.client.address}
                  onChange={value => updateClientData({ address: value as string })}
                  placeholder='123 Main Street'
                  isValid={!!formData.client.address?.trim()}
                  fieldName='address'
                  autoFormat
                />
              </FormField>
              <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
                <FormField
                  label='City'
                  isRequired
                  isValid={!!formData.client.city?.trim()}
                  isTouched={true}
                >
                  <ValidatedInput
                    value={formData.client.city}
                    onChange={value => updateClientData({ city: value as string })}
                    placeholder='Garden Grove'
                    isValid={!!formData.client.city?.trim()}
                    fieldName='city'
                    autoFormat
                  />
                </FormField>
                <FormField
                  label='State'
                  isRequired
                  isValid={!!formData.client.state?.trim()}
                  isTouched={true}
                >
                  <ValidatedInput
                    value={formData.client.state}
                    onChange={value => updateClientData({ state: value as string })}
                    placeholder='CA'
                    isValid={!!formData.client.state?.trim()}
                    fieldName='state'
                    autoFormat
                  />
                </FormField>
                <FormField
                  label='ZIP Code'
                  isRequired
                  isValid={!!formData.client.zipCode?.trim() && formData.client.zipCode.length >= 5}
                  isTouched={true}
                >
                  <ValidatedInput
                    value={formData.client.zipCode}
                    onChange={value => updateClientData({ zipCode: value as string })}
                    placeholder='92683'
                    isValid={!!formData.client.zipCode?.trim() && formData.client.zipCode.length >= 5}
                    fieldName='zipCode'
                    autoFormat
                  />
                </FormField>
              </div>
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

          {/* Sidebar - Fixed Position on Desktop */}
          <div className='space-y-6 lg:sticky lg:top-6 lg:h-fit lg:max-h-screen lg:overflow-y-auto'>
            {/* Live Pricing */}
            <PricingCard liveCalculation={liveCalculation} pricingData={pricingData} />

            {/* Payment Schedule */}
            <PaymentScheduleCard liveCalculation={liveCalculation} />

            {/* Actions */}
            <ActionCard />

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
        <div className='grid grid-cols-2 gap-3'>
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
            {
              type: 'junior-adu',
              price: 244,
              title: 'Junior ADU (Garage Conversion)',
              desc: 'Garage converted to living space',
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
              <div className='mb-2'>
                <h3 className='font-semibold text-sm text-slate-800'>{option.title}</h3>
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
      cost: 2000,
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
        <div className='text-sm text-slate-600 space-y-1'>
          <div>Base Construction: ${pricingData.pricePerSqFt} per sq ft</div>
          <div>Total Project: ${liveCalculation.pricePerSqFt} per sq ft</div>
        </div>
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
    { number: 2, name: 'Trenching & Underground Plumbing', percentage: 20 },
    { number: 3, name: 'Foundation', percentage: 20 },
    { number: 4, name: 'Framing', percentage: 15 },
    { number: 5, name: 'Mechanical, Electrical, Plumbing (MEP)', percentage: 15 },
    { number: 6, name: 'Drywall', percentage: 10 },
    { number: 7, name: 'Property Final', percentage: 5 },
  ];

  // Excel-style calculation: (Total - Design - Deposit) for construction amount
  const deposit = 1000; // Fixed $1,000 deposit
  const designAmount = 12500; // Design services (could be dynamic)
  const constructionAmount = liveCalculation.finalTotal - designAmount - deposit;

  // Calculate milestones using Excel ROUND(amount, -3) formula
  const calculateMilestone = (percentage: number, isLast: boolean = false) => {
    if (isLast) {
      // Final milestone: remainder to ensure exact total
      const previousSum = milestones.slice(0, -1).reduce((sum, m) => {
        const baseAmount = (constructionAmount * m.percentage) / 100;
        return sum + Math.round(baseAmount / 1000) * 1000; // ROUND(amount, -3)
      }, 0);
      return constructionAmount - previousSum;
    } else {
      // Regular milestone: ROUND(percentage * constructionAmount / 100, -3)
      const baseAmount = (constructionAmount * percentage) / 100;
      return Math.round(baseAmount / 1000) * 1000; // ROUND(amount, -3)
    }
  };

  return (
    <div className='bg-white rounded-xl p-4 shadow-md border border-slate-200'>
      <h3 className='font-semibold text-slate-800 mb-3 text-sm'>Payment Milestones</h3>
      <div className='space-y-2'>
        {milestones.map((milestone, index) => {
          const amount = calculateMilestone(milestone.percentage, index === milestones.length - 1);
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
function ActionCard() {
  return (
    <div className='bg-white rounded-xl p-4 shadow-md border border-slate-200'>
      <button className='w-full px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors'>
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
