import React, { useState, useMemo, useEffect } from 'react';
import { logConfigStatus } from './lib/env-config';
import { AnchorPricingEditorV2 } from './components/AnchorPricingEditorV2';
// Removed unused import: useAnchorPricing
// import { useAnchorPricing } from './hooks/useAnchorPricing';
import { usePricingEditorSync } from './hooks/usePricingEditorSync';
import { isAuthEnabled, isAdmin } from './auth/msal-config';
import { AuthGuard } from './components/auth/AuthGuard';
import { UserProfile } from './components/auth/UserProfile';
import { LoginButton } from './components/auth/LoginButton';
import { useMsal } from '@azure/msal-react';
import {
  FileText,
  Users,
  Download,
  Plus,
  ArrowLeft,
  // User,
  // Home,
  // Zap,
  // Compass,
  // Square,
  // CheckCircle,
  // Shield,
  // Award,
  // Clock,
  Eye,
  X,
  Settings,
  Bug,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Minimize2,
  ExternalLink,
  ChevronDown,
  Info,
  RefreshCw,
} from 'lucide-react';
import type { AnchorProposalFormData, ClientInfo, ProjectInfo } from './types/proposal';
// import { AnchorPDFGenerator } from './lib/pdf-generator'; // Moved to components
import { useFormValidation } from './hooks/useFormValidation';
import { useErrorHandler } from './hooks/useErrorHandler';
// import { ValidatedInput } from './components/ValidatedInput';
// import { FormField } from './components/FormField';
import { SuccessNotification } from './components/SuccessNotification';
import { ErrorNotification } from './components/ErrorNotification';
import { PDFProgressIndicator } from './components/PDFProgressIndicator';
// import { LoadingSpinner } from './components/LoadingSpinner';
import { EnhancedProductionGrid } from './components/EnhancedProductionGrid';
import { DebugProfiler } from './components/DebugProfiler';

// Proposal management utility functions
function generateNewProposalNumber(): string {
  const saved = JSON.parse(localStorage.getItem('anchorProposals') || '[]');
  const existingNumbers = saved
    .map((p: any) => parseInt(p.id?.replace('AB-', '') || '0'))
    .filter(Boolean);
  const nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1001;
  return `AB-${nextNumber}`;
}

function saveDraft(proposalData: AnchorProposalFormData): void {
  const saved = JSON.parse(localStorage.getItem('anchorProposals') || '[]');
  const updatedProposal = {
    ...proposalData,
    lastModified: new Date().toISOString(),
  };

  const existingIndex = saved.findIndex((p: AnchorProposalFormData) => p.id === proposalData.id);

  if (existingIndex >= 0) {
    saved[existingIndex] = updatedProposal;
  } else {
    saved.push(updatedProposal);
  }

  localStorage.setItem('anchorProposals', JSON.stringify(saved));
  console.log(`📋 Draft saved: ${proposalData.id}`);
}

// function getAllProposals(): AnchorProposalFormData[] {
//   return JSON.parse(localStorage.getItem('anchorProposals') || '[]');
// }

// Full-Page Debug Mapping Tool Component
function FullPageDebugTool({ onBack }: { onBack: () => void }) {
  const [showNumbers, setShowNumbers] = useState(true); // Default to showing numbers
  const [__highlightMode, __setHighlightMode] = useState(false); // Pure color highlighting mode
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.7); // Start at better zoom for full page
  // Remove unused pricing variable
  // const { pricing: anchorPricing } = useAnchorPricing();
  
  // Sync pricing editor with calculation engine
  usePricingEditorSync();
  
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({
    'Customer Info': true,
    'Project Details': true,
    Features: true,
    Utilities: true,
    'Add-Ons': true,
    Other: true,
    Calculated: true,
    'Utilities Display': true,
    Payments: true,
  });

  const formFields = useMemo(
    () => [
      // Customer Information
      {
        id: '1',
        name: 'First Name',
        variable: 'CLIENT_FIRST_NAME',
        category: 'Customer Info',
        formField: 'client.firstName',
      },
      {
        id: '2',
        name: 'Last Name',
        variable: 'CLIENT_NAME',
        category: 'Customer Info',
        formField: 'client.lastName',
      },
      {
        id: '3',
        name: 'Email',
        variable: 'CLIENT_EMAIL',
        category: 'Customer Info',
        formField: 'client.email',
      },
      {
        id: '4',
        name: 'Phone',
        variable: 'CLIENT_PHONE',
        category: 'Customer Info',
        formField: 'client.phone',
      },
      {
        id: '5',
        name: 'Address',
        variable: 'CLIENT_ADDRESS',
        category: 'Customer Info',
        formField: 'client.address',
      },
      {
        id: '6',
        name: 'City',
        variable: 'N/A',
        category: 'Customer Info',
        formField: 'client.city',
      },
      {
        id: '7',
        name: 'State',
        variable: 'N/A',
        category: 'Customer Info',
        formField: 'client.state',
      },
      {
        id: '8',
        name: 'Zip Code',
        variable: 'N/A',
        category: 'Customer Info',
        formField: 'client.zipCode',
      },

      // Project Details
      {
        id: '9',
        name: 'ADU Type',
        variable: 'ADU_TYPE',
        category: 'Project Details',
        formField: 'project.aduType',
      },
      {
        id: '10',
        name: 'Stories (Detached)',
        variable: 'N/A',
        category: 'Project Details',
        formField: 'project.stories',
      },
      {
        id: '11',
        name: 'Square Footage',
        variable: 'SQUARE_FOOTAGE',
        category: 'Project Details',
        formField: 'project.squareFootage',
      },
      {
        id: '12',
        name: 'Bedrooms',
        variable: 'BEDROOMS',
        category: 'Project Details',
        formField: 'project.bedrooms',
      },
      {
        id: '13',
        name: 'Bathrooms',
        variable: 'BATHROOMS',
        category: 'Project Details',
        formField: 'project.bathrooms',
      },

      // Features & Services
      {
        id: '14',
        name: 'Appliances Included',
        variable: 'N/A',
        category: 'Features',
        formField: 'project.appliancesIncluded',
      },
      {
        id: '15',
        name: 'HVAC Type',
        variable: 'N/A',
        category: 'Features',
        formField: 'project.hvacType',
      },
      {
        id: '16',
        name: 'Needs Design Services',
        variable: 'DESIGN_AMOUNT',
        category: 'Features',
        formField: 'project.needsDesign',
      },
      {
        id: '17',
        name: 'Solar Design',
        variable: 'N/A',
        category: 'Features',
        formField: 'project.solarDesign',
      },
      {
        id: '18',
        name: 'FEMA Included',
        variable: 'N/A',
        category: 'Features',
        formField: 'project.femaIncluded',
      },

      // Utility Connections
      {
        id: '19',
        name: 'Water Meter',
        variable: 'N/A',
        category: 'Utilities',
        formField: 'project.utilities.waterMeter',
      },
      {
        id: '20',
        name: 'Gas Meter',
        variable: 'N/A',
        category: 'Utilities',
        formField: 'project.utilities.gasMeter',
      },
      {
        id: '21',
        name: 'Electric Meter',
        variable: 'N/A',
        category: 'Utilities',
        formField: 'project.utilities.electricMeter',
      },
      {
        id: '21a',
        name: 'Electrical Panel',
        variable: 'ELECTRICAL_PANEL',
        category: 'Utilities',
        formField: 'project.utilities.electricalPanel',
      },
      {
        id: '22',
        name: 'Sewer Connection',
        variable: 'N/A',
        category: 'Utilities',
        formField: 'project.sewerConnection',
      },

      // Add-Ons (Selected dynamically)
      {
        id: '23',
        name: 'Extra Bathroom Add-on',
        variable: 'N/A',
        category: 'Add-Ons',
        formField: 'project.selectedAddOns[Extra Bathroom]',
      },
      {
        id: '24',
        name: 'Driveway Add-on',
        variable: 'N/A',
        category: 'Add-Ons',
        formField: 'project.selectedAddOns[Driveway]',
      },
      {
        id: '25',
        name: 'Landscaping Add-on',
        variable: 'N/A',
        category: 'Add-Ons',
        formField: 'project.selectedAddOns[Basic Landscaping]',
      },

      // Other Form Fields
      {
        id: '26',
        name: 'Additional Notes',
        variable: 'N/A',
        category: 'Other',
        formField: 'additionalNotes',
      },
      {
        id: '27',
        name: 'Timeline',
        variable: 'TIMELINE',
        category: 'Other',
        formField: 'timeline',
      },
      {
        id: '28',
        name: 'Proposal Date',
        variable: 'PROPOSAL_DATE',
        category: 'Other',
        formField: 'proposalDate',
      },
      {
        id: '29',
        name: 'Proposal Number',
        variable: 'PROPOSAL_NUMBER',
        category: 'Other',
        formField: 'proposalNumber',
      },

      // Calculated Values (shown in PDF)
      {
        id: '30',
        name: 'Grand Total',
        variable: 'GRAND_TOTAL',
        category: 'Calculated',
        formField: 'calculated.grandTotal',
      },
      {
        id: '31',
        name: 'Cost Per Sq Ft',
        variable: 'COST_PER_SQFT',
        category: 'Calculated',
        formField: 'calculated.pricePerSqFt',
      },
      {
        id: '32',
        name: 'Design Amount',
        variable: 'DESIGN_AMOUNT',
        category: 'Calculated',
        formField: 'calculated.designAmount',
      },
      {
        id: '33',
        name: 'Additional Services Total',
        variable: 'ADDITIONAL_SERVICES_TOTAL',
        category: 'Calculated',
        formField: 'calculated.addOnTotal',
      },
      {
        id: '34',
        name: 'Phase 1 Total',
        variable: 'PHASE_1_TOTAL',
        category: 'Calculated',
        formField: 'calculated.phase1Total',
      },
      {
        id: '35',
        name: 'Phase 3 Total',
        variable: 'PHASE_3_TOTAL',
        category: 'Calculated',
        formField: 'calculated.phase3Total',
      },

      // Utilities Display (hardcoded in template but should be dynamic)
      {
        id: '36',
        name: 'Water Connection Type',
        variable: 'WATER_CONNECTION',
        category: 'Utilities Display',
        formField: 'utilities.waterDisplay',
      },
      {
        id: '37',
        name: 'Gas Connection Type',
        variable: 'GAS_CONNECTION',
        category: 'Utilities Display',
        formField: 'utilities.gasDisplay',
      },
      {
        id: '38',
        name: 'Electric Connection Type',
        variable: 'ELECTRIC_CONNECTION',
        category: 'Utilities Display',
        formField: 'utilities.electricDisplay',
      },
      {
        id: '39',
        name: 'Sewer Connection Type',
        variable: 'SEWER_CONNECTION',
        category: 'Utilities Display',
        formField: 'utilities.sewerDisplay',
      },

      // Payment Milestones
      {
        id: '40',
        name: 'Milestone 1',
        variable: 'MILESTONE_1',
        category: 'Payments',
        formField: 'calculated.milestone1',
      },
      {
        id: '41',
        name: 'Milestone 2',
        variable: 'MILESTONE_2',
        category: 'Payments',
        formField: 'calculated.milestone2',
      },
      {
        id: '42',
        name: 'Milestone 3',
        variable: 'MILESTONE_3',
        category: 'Payments',
        formField: 'calculated.milestone3',
      },
      {
        id: '43',
        name: 'Milestone 4',
        variable: 'MILESTONE_4',
        category: 'Payments',
        formField: 'calculated.milestone4',
      },
      {
        id: '44',
        name: 'Milestone 5',
        variable: 'MILESTONE_5',
        category: 'Payments',
        formField: 'calculated.milestone5',
      },
      {
        id: '45',
        name: 'Milestone 6',
        variable: 'MILESTONE_6',
        category: 'Payments',
        formField: 'calculated.milestone6',
      },
      {
        id: '46',
        name: 'Milestone 7',
        variable: 'MILESTONE_7',
        category: 'Payments',
        formField: 'calculated.milestone7',
      },

      // NEW: Missing Template Sections (from screenshot analysis)
      {
        id: '47',
        name: 'Proposal Valid Until',
        variable: 'PROPOSAL_VALID_UNTIL',
        category: 'Other',
        formField: 'validUntil',
      },
      {
        id: '48',
        name: 'Project Overview Text',
        variable: 'PROJECT_OVERVIEW_TEXT',
        category: 'Project Details',
        formField: 'project.overviewText',
      },
      {
        id: '49',
        name: 'Water Connection Detail',
        variable: 'WATER_CONNECTION_DETAIL',
        category: 'Utilities Display',
        formField: 'utilities.waterDetail',
      },
      {
        id: '50',
        name: 'Gas Connection Detail',
        variable: 'GAS_CONNECTION_DETAIL',
        category: 'Utilities Display',
        formField: 'utilities.gasDetail',
      },
      {
        id: '51',
        name: 'Electric Connection Detail',
        variable: 'ELECTRIC_CONNECTION_DETAIL',
        category: 'Utilities Display',
        formField: 'utilities.electricDetail',
      },
      {
        id: '52',
        name: 'Sewer Connection Detail',
        variable: 'SEWER_CONNECTION_DETAIL',
        category: 'Utilities Display',
        formField: 'utilities.sewerDetail',
      },
      {
        id: '53',
        name: 'Extra Bathroom Service',
        variable: 'EXTRA_BATHROOM_SERVICE',
        category: 'Add-Ons',
        formField: 'services.extraBathroom',
      },
      {
        id: '54',
        name: 'Dedicated Driveway Service',
        variable: 'DEDICATED_DRIVEWAY_SERVICE',
        category: 'Add-Ons',
        formField: 'services.dedicatedDriveway',
      },
    ],
    []
  );

  const categories = [
    'Customer Info',
    'Project Details',
    'Features',
    'Utilities',
    'Add-Ons',
    'Other',
    'Calculated',
    'Utilities Display',
    'Payments',
  ];

  // Color scheme for each category
  const categoryColors = {
    'Customer Info': {
      bg: 'bg-blue-500',
      light: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    'Project Details': {
      bg: 'bg-green-500',
      light: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    Features: {
      bg: 'bg-purple-500',
      light: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    Utilities: {
      bg: 'bg-yellow-500',
      light: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
    'Add-Ons': {
      bg: 'bg-pink-500',
      light: 'bg-pink-100',
      text: 'text-pink-700',
      border: 'border-pink-200',
    },
    Other: {
      bg: 'bg-indigo-500',
      light: 'bg-indigo-100',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
    Calculated: {
      bg: 'bg-red-500',
      light: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    'Utilities Display': {
      bg: 'bg-orange-500',
      light: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
    Payments: {
      bg: 'bg-teal-500',
      light: 'bg-teal-100',
      text: 'text-teal-700',
      border: 'border-teal-200',
    },
  };

  const toggleNumbers = () => {
    setShowNumbers(!showNumbers);
    // Turn off highlight mode when showing numbers
    if (!showNumbers) {
      __setHighlightMode(false);
    }
  };

  const toggleSection = (category: string) => {
    setVisibleSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const showAllSections = () => {
    setVisibleSections(
      Object.keys(visibleSections).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
  };

  const hideAllSections = () => {
    setVisibleSections(
      Object.keys(visibleSections).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    );
  };

  const toggleHighlight = () => {
    __setHighlightMode(!__highlightMode);
    // Turn off numbers when showing highlights
    if (!__highlightMode) {
      setShowNumbers(false);
    }
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.3));
  };

  const refreshPreview = () => {
    const iframe = document.getElementById('fullPageDebugFrame') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
      setShowNumbers(false);
      setTimeout(() => setShowNumbers(true), 1000);
    }
  };

  // Pricing updates from the new system are handled by the component itself

  // Listen for pricing updates
  useEffect(() => {
    const handlePricingUpdate = () => {
      // Force re-render when pricing updates
      console.log('Pricing updated via anchor:pricing-updated event');
    };
    
    window.addEventListener('anchor:pricing-updated', handlePricingUpdate);
    return () => window.removeEventListener('anchor:pricing-updated', handlePricingUpdate);
  }, []);

  // Template injection effect
  useEffect(() => {
    if (!iframeLoaded) return;

    const timeout = setTimeout(() => {
      const iframe = document.getElementById('fullPageDebugFrame') as HTMLIFrameElement;
      if (!iframe?.contentWindow || !iframe?.contentDocument) return;

      const doc = iframe.contentDocument;

      if (showNumbers || __highlightMode) {
        console.log(
          `🔍 [FULL-PAGE] Injecting debug ${showNumbers ? 'numbers' : 'highlights'} into template...`
        );

        let style = doc.getElementById('debug-mapping-style');
        if (!style) {
          style = doc.createElement('style');
          style.id = 'debug-mapping-style';
          doc.head.appendChild(style);
        }

        // Different styles for numbers vs highlights
        if (showNumbers) {
          style.innerHTML = `
            .debug-number {
              position: relative !important;
              color: white !important;
              font-weight: bold !important;
              padding: 3px 8px !important;
              border-radius: 12px !important;
              font-size: 12px !important;
              font-family: 'Arial', sans-serif !important;
              display: inline-block !important;
              min-width: 22px !important;
              text-align: center !important;
              border: 2px solid !important;
              animation: pulse 2s infinite !important;
              box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
              margin-right: 3px !important;
              z-index: 1000 !important;
              line-height: 1.2 !important;
            }
            @keyframes pulse {
              0%, 100% { opacity: 1; }
              50% { opacity: 0.85; }
            }
            .debug-customer { background: #3b82f6 !important; border-color: #2563eb !important; }
            .debug-project { background: #10b981 !important; border-color: #059669 !important; }
            .debug-features { background: #8b5cf6 !important; border-color: #7c3aed !important; }
            .debug-utilities { background: #f59e0b !important; border-color: #d97706 !important; }
            .debug-add-ons { background: #ec4899 !important; border-color: #db2777 !important; }
            .debug-other { background: #6366f1 !important; border-color: #4f46e5 !important; }
            .debug-calculated { background: #ef4444 !important; border-color: #dc2626 !important; }
            .debug-utilities-display { background: #f97316 !important; border-color: #ea580c !important; }
            .debug-payments { background: #14b8a6 !important; border-color: #0d9488 !important; }
          `;
        } else if (__highlightMode) {
          style.innerHTML = `
            .debug-highlight {
              background: rgba(59, 130, 246, 0.3) !important;
              padding: 2px 4px !important;
              border-radius: 4px !important;
              border: 1px solid !important;
            }
            .debug-customer { background: rgba(59, 130, 246, 0.3) !important; border-color: rgba(37, 99, 235, 0.5) !important; }
            .debug-project { background: rgba(16, 185, 129, 0.3) !important; border-color: rgba(5, 150, 105, 0.5) !important; }
            .debug-features { background: rgba(139, 92, 246, 0.3) !important; border-color: rgba(124, 58, 237, 0.5) !important; }
            .debug-utilities { background: rgba(245, 158, 11, 0.3) !important; border-color: rgba(217, 119, 6, 0.5) !important; }
            .debug-add-ons { background: rgba(236, 72, 153, 0.3) !important; border-color: rgba(219, 39, 119, 0.5) !important; }
            .debug-other { background: rgba(99, 102, 241, 0.3) !important; border-color: rgba(79, 70, 229, 0.5) !important; }
            .debug-calculated { background: rgba(239, 68, 68, 0.3) !important; border-color: rgba(220, 38, 38, 0.5) !important; }
            .debug-utilities-display { background: rgba(249, 115, 22, 0.3) !important; border-color: rgba(234, 88, 12, 0.5) !important; }
            .debug-payments { background: rgba(20, 184, 166, 0.3) !important; border-color: rgba(13, 148, 136, 0.5) !important; }
          `;
        }

        let html = doc.body.innerHTML;

        // First restore any previously modified template variables
        html = html.replace(/<span class="debug-(number|highlight)[^"]*">(\d+)?<\/span>/g, '');

        formFields.forEach(field => {
          if (field.variable !== 'N/A' && visibleSections[field.category]) {
            const pattern = new RegExp(`\\{\\{${field.variable}\\}\\}`, 'g');
            const cssClass = field.category.toLowerCase().replace(/\s+/g, '-');

            if (showNumbers) {
              html = html.replace(
                pattern,
                `<span class="debug-number debug-${cssClass}">${field.id}</span>{{${field.variable}}}`
              );
            } else if (__highlightMode) {
              html = html.replace(
                pattern,
                `<span class="debug-highlight debug-${cssClass}">{{${field.variable}}}</span>`
              );
            }
          }
        });

        doc.body.innerHTML = html;
        console.log(
          `✅ [FULL-PAGE] Debug ${showNumbers ? 'numbers' : 'highlights'} injected successfully`
        );
      } else {
        // Remove debug elements when hiding both numbers and highlights
        const existingNumbers = doc.querySelectorAll('.debug-number');
        const existingHighlights = doc.querySelectorAll('.debug-highlight');
        existingNumbers.forEach(el => el.remove());
        existingHighlights.forEach(el => el.remove());

        const style = doc.getElementById('debug-mapping-style');
        if (style) {
          style.remove();
        }
        console.log('🔍 [FULL-PAGE] Removed debug elements from template');
      }
    }, 500);

    return () => clearTimeout(timeout);
  }, [showNumbers, iframeLoaded, visibleSections, formFields, __highlightMode]);

  return (
    <div className='min-h-screen bg-slate-50'>
      {/* Pricing Editor is now controlled by state */}
      {/* Header */}
      <div className='bg-white border-b border-slate-200 px-6 py-4'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-4'>
            <button
              onClick={onBack}
              className='flex items-center space-x-2 px-3 py-2 text-slate-600 hover:text-slate-800 transition-colors'
            >
              <ArrowLeft className='w-4 h-4' />
              <span>Back to Admin</span>
            </button>
            <div className='h-6 w-px bg-slate-300'></div>
            <div className='flex items-center space-x-3'>
              <Bug className='w-6 h-6 text-red-600' />
              <h1 className='text-xl font-semibold text-slate-800'>Data Mapping Debug Tool</h1>
              {showNumbers && (
                <span className='text-red-600 font-medium text-sm'>Numbers Active</span>
              )}
              {__highlightMode && (
                <span className='text-yellow-600 font-medium text-sm'>Highlights Active</span>
              )}
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <button
              onClick={toggleNumbers}
              className={`flex items-center space-x-2 px-4 py-2 rounded border transition-colors ${
                showNumbers
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <Eye className='w-4 h-4' />
              <span>{showNumbers ? 'Hide Numbers' : 'Show Numbers'}</span>
            </button>

            <button
              onClick={toggleHighlight}
              className={`flex items-center space-x-2 px-4 py-2 rounded border transition-colors ${
                __highlightMode
                  ? 'bg-yellow-50 border-yellow-200 text-yellow-700'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <span className='w-4 h-4 rounded bg-gradient-to-r from-blue-500 to-teal-500'></span>
              <span>{__highlightMode ? 'Hide Highlights' : 'Show Highlights'}</span>
            </button>

            <button
              onClick={zoomOut}
              className='flex items-center justify-center w-10 h-10 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            >
              <ZoomOut className='w-4 h-4' />
            </button>

            <span className='text-sm text-slate-600 min-w-[4rem] text-center'>
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={zoomIn}
              className='flex items-center justify-center w-10 h-10 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            >
              <ZoomIn className='w-4 h-4' />
            </button>

            <button
              onClick={refreshPreview}
              className='flex items-center justify-center w-10 h-10 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            >
              <RefreshCw className='w-4 h-4' />
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className='flex h-[calc(100vh-80px)]'>
        {/* Left Sidebar - Form Fields */}
        <div className='w-80 bg-white border-r border-slate-200 overflow-y-auto'>
          <div className='p-4 border-b border-slate-200'>
            <div className='flex items-center justify-between mb-3'>
              <h2 className='font-semibold text-slate-800'>Form Inputs</h2>
              <div className='flex items-center space-x-1'>
                <button
                  onClick={showAllSections}
                  className='px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200'
                >
                  All
                </button>
                <button
                  onClick={hideAllSections}
                  className='px-2 py-1 text-xs bg-slate-100 text-slate-700 rounded hover:bg-slate-200'
                >
                  None
                </button>
              </div>
            </div>

            {categories.map(category => {
              const categoryColor = categoryColors[category as keyof typeof categoryColors];
              const fieldsInCategory = formFields.filter(f => f.category === category);
              const isVisible = visibleSections[category];

              return (
                <div key={category} className='mb-2'>
                  <button
                    onClick={() => toggleSection(category)}
                    className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
                      isVisible
                        ? `${categoryColor.light} ${categoryColor.border} ${categoryColor.text}`
                        : 'bg-slate-50 border-slate-200 text-slate-600'
                    }`}
                  >
                    <div className='flex items-center space-x-2'>
                      <div className={`w-3 h-3 rounded-full ${categoryColor.bg}`}></div>
                      <span className='font-medium text-sm'>{category}</span>
                      <span className='text-xs text-slate-500'>({fieldsInCategory.length})</span>
                    </div>
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${isVisible ? 'rotate-180' : ''}`}
                    />
                  </button>

                  {isVisible && (
                    <div className='mt-1 space-y-1'>
                      {fieldsInCategory.map(field => (
                        <div
                          key={field.id}
                          className='flex items-center space-x-2 px-2 py-1 bg-slate-50 rounded'
                        >
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${categoryColor.bg}`}
                          >
                            {field.id}
                          </div>
                          <div className='flex-1 min-w-0'>
                            <div className='text-sm font-medium text-slate-800'>{field.name}</div>
                            <div className='text-xs text-slate-500 truncate'>{field.formField}</div>
                            {field.variable !== 'N/A' ? (
                              <div className='text-xs text-slate-600 font-mono'>{`{{${field.variable}}}`}</div>
                            ) : (
                              <div className='text-xs text-slate-400 italic'>
                                Not mapped to template
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side - Template Preview */}
        <div className='flex-1 bg-slate-100 overflow-auto'>
          <div className='p-6 flex items-start justify-center min-h-full'>
            <div
              className='bg-white shadow-xl rounded-lg overflow-hidden'
              style={{
                transform: `scale(${zoomLevel})`,
                transformOrigin: 'center top',
              }}
            >
              <iframe
                id='fullPageDebugFrame'
                src='/ENHANCED-DESIGN.html'
                className='border-none'
                style={{
                  width: '850px',
                  height: '1100px',
                  minWidth: '850px',
                }}
                onLoad={() => setIframeLoaded(true)}
                title='Enhanced Template - Full Page Preview'
              />
            </div>
          </div>
        </div>
      </div>

      {/* Instructions */}
      <div className='bg-blue-50 border-t border-blue-200 px-6 py-3'>
        <div className='flex items-start space-x-3'>
          <Info className='w-5 h-5 text-blue-600 mt-0.5' />
          <div className='text-sm text-blue-700'>
            <strong>How to use:</strong> Click "Show Numbers" to see color-coded dots on template
            variables. Toggle sections on/off to view specific categories. Use zoom controls for
            detailed inspection. Numbers correspond to form fields listed on the left side.
          </div>
        </div>
      </div>
    </div>
  );
}

// Debug Mapping Tool Component
function DebugMappingTool() {
  const [showNumbers, setShowNumbers] = useState(false);
  const [_highlightMode, _setHighlightMode] = useState(false);
  const [iframeLoaded, setIframeLoaded] = useState(false);
  const [zoomLevel, setZoomLevel] = useState(0.5);
  const [fullScreen, setFullScreen] = useState(false);
  const [visibleSections, setVisibleSections] = useState<Record<string, boolean>>({
    'Customer Info': true,
    'Project Details': true,
    Features: true,
    Utilities: true,
    'Add-Ons': true,
    Other: true,
    Calculated: true,
    'Utilities Display': true,
    Payments: true,
  });

  const formFields = useMemo(
    () => [
      // Customer Information
      {
        id: '1',
        name: 'First Name',
        variable: 'CLIENT_FIRST_NAME',
        category: 'Customer Info',
        formField: 'client.firstName',
      },
      {
        id: '2',
        name: 'Last Name',
        variable: 'CLIENT_NAME',
        category: 'Customer Info',
        formField: 'client.lastName',
      },
      {
        id: '3',
        name: 'Email',
        variable: 'CLIENT_EMAIL',
        category: 'Customer Info',
        formField: 'client.email',
      },
      {
        id: '4',
        name: 'Phone',
        variable: 'CLIENT_PHONE',
        category: 'Customer Info',
        formField: 'client.phone',
      },
      {
        id: '5',
        name: 'Address',
        variable: 'CLIENT_ADDRESS',
        category: 'Customer Info',
        formField: 'client.address',
      },
      {
        id: '6',
        name: 'City',
        variable: 'N/A',
        category: 'Customer Info',
        formField: 'client.city',
      },
      {
        id: '7',
        name: 'State',
        variable: 'N/A',
        category: 'Customer Info',
        formField: 'client.state',
      },
      {
        id: '8',
        name: 'Zip Code',
        variable: 'N/A',
        category: 'Customer Info',
        formField: 'client.zipCode',
      },

      // Project Details
      {
        id: '9',
        name: 'ADU Type',
        variable: 'ADU_TYPE',
        category: 'Project Details',
        formField: 'project.aduType',
      },
      {
        id: '10',
        name: 'Stories (Detached)',
        variable: 'N/A',
        category: 'Project Details',
        formField: 'project.stories',
      },
      {
        id: '11',
        name: 'Square Footage',
        variable: 'SQUARE_FOOTAGE',
        category: 'Project Details',
        formField: 'project.squareFootage',
      },
      {
        id: '12',
        name: 'Bedrooms',
        variable: 'BEDROOMS',
        category: 'Project Details',
        formField: 'project.bedrooms',
      },
      {
        id: '13',
        name: 'Bathrooms',
        variable: 'BATHROOMS',
        category: 'Project Details',
        formField: 'project.bathrooms',
      },

      // Features & Services
      {
        id: '14',
        name: 'Appliances Included',
        variable: 'N/A',
        category: 'Features',
        formField: 'project.appliancesIncluded',
      },
      {
        id: '15',
        name: 'HVAC Type',
        variable: 'N/A',
        category: 'Features',
        formField: 'project.hvacType',
      },
      {
        id: '16',
        name: 'Needs Design Services',
        variable: 'DESIGN_AMOUNT',
        category: 'Features',
        formField: 'project.needsDesign',
      },
      {
        id: '17',
        name: 'Solar Design',
        variable: 'N/A',
        category: 'Features',
        formField: 'project.solarDesign',
      },
      {
        id: '18',
        name: 'FEMA Included',
        variable: 'N/A',
        category: 'Features',
        formField: 'project.femaIncluded',
      },

      // Utility Connections
      {
        id: '19',
        name: 'Water Meter',
        variable: 'N/A',
        category: 'Utilities',
        formField: 'project.utilities.waterMeter',
      },
      {
        id: '20',
        name: 'Gas Meter',
        variable: 'N/A',
        category: 'Utilities',
        formField: 'project.utilities.gasMeter',
      },
      {
        id: '21',
        name: 'Electric Meter',
        variable: 'N/A',
        category: 'Utilities',
        formField: 'project.utilities.electricMeter',
      },
      {
        id: '21a',
        name: 'Electrical Panel',
        variable: 'ELECTRICAL_PANEL',
        category: 'Utilities',
        formField: 'project.utilities.electricalPanel',
      },
      {
        id: '22',
        name: 'Sewer Connection',
        variable: 'N/A',
        category: 'Utilities',
        formField: 'project.sewerConnection',
      },

      // Add-Ons (Selected dynamically)
      {
        id: '23',
        name: 'Extra Bathroom Add-on',
        variable: 'N/A',
        category: 'Add-Ons',
        formField: 'project.selectedAddOns[Extra Bathroom]',
      },
      {
        id: '24',
        name: 'Driveway Add-on',
        variable: 'N/A',
        category: 'Add-Ons',
        formField: 'project.selectedAddOns[Driveway]',
      },
      {
        id: '25',
        name: 'Landscaping Add-on',
        variable: 'N/A',
        category: 'Add-Ons',
        formField: 'project.selectedAddOns[Basic Landscaping]',
      },

      // Other Form Fields
      {
        id: '26',
        name: 'Additional Notes',
        variable: 'N/A',
        category: 'Other',
        formField: 'additionalNotes',
      },
      {
        id: '27',
        name: 'Timeline',
        variable: 'TIMELINE',
        category: 'Other',
        formField: 'timeline',
      },
      {
        id: '28',
        name: 'Proposal Date',
        variable: 'PROPOSAL_DATE',
        category: 'Other',
        formField: 'proposalDate',
      },
      {
        id: '29',
        name: 'Proposal Number',
        variable: 'PROPOSAL_NUMBER',
        category: 'Other',
        formField: 'proposalNumber',
      },

      // Calculated Values (shown in PDF)
      {
        id: '30',
        name: 'Grand Total',
        variable: 'GRAND_TOTAL',
        category: 'Calculated',
        formField: 'calculated.grandTotal',
      },
      {
        id: '31',
        name: 'Cost Per Sq Ft',
        variable: 'COST_PER_SQFT',
        category: 'Calculated',
        formField: 'calculated.pricePerSqFt',
      },
      {
        id: '32',
        name: 'Design Amount',
        variable: 'DESIGN_AMOUNT',
        category: 'Calculated',
        formField: 'calculated.designAmount',
      },
      {
        id: '33',
        name: 'Additional Services Total',
        variable: 'ADDITIONAL_SERVICES_TOTAL',
        category: 'Calculated',
        formField: 'calculated.addOnTotal',
      },
      {
        id: '34',
        name: 'Phase 1 Total',
        variable: 'PHASE_1_TOTAL',
        category: 'Calculated',
        formField: 'calculated.phase1Total',
      },
      {
        id: '35',
        name: 'Phase 3 Total',
        variable: 'PHASE_3_TOTAL',
        category: 'Calculated',
        formField: 'calculated.phase3Total',
      },

      // Utilities Display (hardcoded in template but should be dynamic)
      {
        id: '36',
        name: 'Water Connection Type',
        variable: 'WATER_CONNECTION',
        category: 'Utilities Display',
        formField: 'utilities.waterDisplay',
      },
      {
        id: '37',
        name: 'Gas Connection Type',
        variable: 'GAS_CONNECTION',
        category: 'Utilities Display',
        formField: 'utilities.gasDisplay',
      },
      {
        id: '38',
        name: 'Electric Connection Type',
        variable: 'ELECTRIC_CONNECTION',
        category: 'Utilities Display',
        formField: 'utilities.electricDisplay',
      },
      {
        id: '39',
        name: 'Sewer Connection Type',
        variable: 'SEWER_CONNECTION',
        category: 'Utilities Display',
        formField: 'utilities.sewerDisplay',
      },

      // Payment Milestones
      {
        id: '40',
        name: 'Milestone 1',
        variable: 'MILESTONE_1',
        category: 'Payments',
        formField: 'calculated.milestone1',
      },
      {
        id: '41',
        name: 'Milestone 2',
        variable: 'MILESTONE_2',
        category: 'Payments',
        formField: 'calculated.milestone2',
      },
      {
        id: '42',
        name: 'Milestone 3',
        variable: 'MILESTONE_3',
        category: 'Payments',
        formField: 'calculated.milestone3',
      },
      {
        id: '43',
        name: 'Milestone 4',
        variable: 'MILESTONE_4',
        category: 'Payments',
        formField: 'calculated.milestone4',
      },
      {
        id: '44',
        name: 'Milestone 5',
        variable: 'MILESTONE_5',
        category: 'Payments',
        formField: 'calculated.milestone5',
      },
      {
        id: '45',
        name: 'Milestone 6',
        variable: 'MILESTONE_6',
        category: 'Payments',
        formField: 'calculated.milestone6',
      },
      {
        id: '46',
        name: 'Milestone 7',
        variable: 'MILESTONE_7',
        category: 'Payments',
        formField: 'calculated.milestone7',
      },

      // NEW: Missing Template Sections (from screenshot analysis)
      {
        id: '47',
        name: 'Proposal Valid Until',
        variable: 'PROPOSAL_VALID_UNTIL',
        category: 'Other',
        formField: 'validUntil',
      },
      {
        id: '48',
        name: 'Project Overview Text',
        variable: 'PROJECT_OVERVIEW_TEXT',
        category: 'Project Details',
        formField: 'project.overviewText',
      },
      {
        id: '49',
        name: 'Water Connection Detail',
        variable: 'WATER_CONNECTION_DETAIL',
        category: 'Utilities Display',
        formField: 'utilities.waterDetail',
      },
      {
        id: '50',
        name: 'Gas Connection Detail',
        variable: 'GAS_CONNECTION_DETAIL',
        category: 'Utilities Display',
        formField: 'utilities.gasDetail',
      },
      {
        id: '51',
        name: 'Electric Connection Detail',
        variable: 'ELECTRIC_CONNECTION_DETAIL',
        category: 'Utilities Display',
        formField: 'utilities.electricDetail',
      },
      {
        id: '52',
        name: 'Sewer Connection Detail',
        variable: 'SEWER_CONNECTION_DETAIL',
        category: 'Utilities Display',
        formField: 'utilities.sewerDetail',
      },
      {
        id: '53',
        name: 'Extra Bathroom Service',
        variable: 'EXTRA_BATHROOM_SERVICE',
        category: 'Add-Ons',
        formField: 'services.extraBathroom',
      },
      {
        id: '54',
        name: 'Dedicated Driveway Service',
        variable: 'DEDICATED_DRIVEWAY_SERVICE',
        category: 'Add-Ons',
        formField: 'services.dedicatedDriveway',
      },
    ],
    []
  );

  const categories = [
    'Customer Info',
    'Project Details',
    'Features',
    'Utilities',
    'Add-Ons',
    'Other',
    'Calculated',
    'Utilities Display',
    'Payments',
  ];

  // Color scheme for each category
  const categoryColors = {
    'Customer Info': {
      bg: 'bg-blue-500',
      light: 'bg-blue-100',
      text: 'text-blue-700',
      border: 'border-blue-200',
    },
    'Project Details': {
      bg: 'bg-green-500',
      light: 'bg-green-100',
      text: 'text-green-700',
      border: 'border-green-200',
    },
    Features: {
      bg: 'bg-purple-500',
      light: 'bg-purple-100',
      text: 'text-purple-700',
      border: 'border-purple-200',
    },
    Utilities: {
      bg: 'bg-yellow-500',
      light: 'bg-yellow-100',
      text: 'text-yellow-700',
      border: 'border-yellow-200',
    },
    'Add-Ons': {
      bg: 'bg-pink-500',
      light: 'bg-pink-100',
      text: 'text-pink-700',
      border: 'border-pink-200',
    },
    Other: {
      bg: 'bg-indigo-500',
      light: 'bg-indigo-100',
      text: 'text-indigo-700',
      border: 'border-indigo-200',
    },
    Calculated: {
      bg: 'bg-red-500',
      light: 'bg-red-100',
      text: 'text-red-700',
      border: 'border-red-200',
    },
    'Utilities Display': {
      bg: 'bg-orange-500',
      light: 'bg-orange-100',
      text: 'text-orange-700',
      border: 'border-orange-200',
    },
    Payments: {
      bg: 'bg-teal-500',
      light: 'bg-teal-100',
      text: 'text-teal-700',
      border: 'border-teal-200',
    },
  };

  const toggleNumbers = () => {
    setShowNumbers(!showNumbers);
  };

  const toggleSection = (category: string) => {
    setVisibleSections(prev => ({
      ...prev,
      [category]: !prev[category],
    }));
  };

  const showAllSections = () => {
    setVisibleSections(prev =>
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: true }), {})
    );
  };

  const hideAllSections = () => {
    setVisibleSections(prev =>
      Object.keys(prev).reduce((acc, key) => ({ ...acc, [key]: false }), {})
    );
  };

  const refreshPreview = () => {
    const iframe = document.getElementById('debugFrame') as HTMLIFrameElement;
    if (iframe) {
      iframe.src = iframe.src;
      setShowNumbers(false);
    }
  };

  const zoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const zoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.2));
  };

  const resetZoom = () => {
    setZoomLevel(0.5);
  };

  const toggleFullScreen = () => {
    setFullScreen(!fullScreen);
  };

  useEffect(() => {
    if (!iframeLoaded) return;

    const iframe = document.getElementById('debugFrame') as HTMLIFrameElement;
    if (!iframe?.contentDocument) return;

    const doc = iframe.contentDocument;

    if (showNumbers) {
      let style = doc.getElementById('debug-mapping-style');
      if (!style) {
        style = doc.createElement('style');
        style.id = 'debug-mapping-style';
        style.innerHTML = `
          .debug-number {
            position: relative !important;
            color: white !important;
            font-weight: bold !important;
            padding: 2px 6px !important;
            border-radius: 12px !important;
            font-size: 11px !important;
            font-family: 'Arial', sans-serif !important;
            display: inline-block !important;
            min-width: 20px !important;
            text-align: center !important;
            border: 2px solid !important;
            animation: pulse 2s infinite !important;
            box-shadow: 0 2px 8px rgba(0,0,0,0.4) !important;
            margin-right: 2px !important;
            z-index: 1000 !important;
            line-height: 1.2 !important;
          }
          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.8; }
          }
          .debug-customer { background: #3b82f6 !important; border-color: #2563eb !important; }
          .debug-project { background: #10b981 !important; border-color: #059669 !important; }
          .debug-features { background: #8b5cf6 !important; border-color: #7c3aed !important; }
          .debug-utilities { background: #f59e0b !important; border-color: #d97706 !important; }
          .debug-addons { background: #ec4899 !important; border-color: #db2777 !important; }
          .debug-other { background: #6366f1 !important; border-color: #4f46e5 !important; }
          .debug-calculated { background: #ef4444 !important; border-color: #dc2626 !important; }
          .debug-utilities-display { background: #f97316 !important; border-color: #ea580c !important; }
          .debug-payments { background: #14b8a6 !important; border-color: #0d9488 !important; }
        `;
        doc.head.appendChild(style);
      }

      let html = doc.body.innerHTML;

      // First restore any previously modified template variables
      html = html.replace(/<span class="debug-number[^"]*">\d+<\/span>/g, '');

      formFields.forEach(field => {
        if (field.variable !== 'N/A' && visibleSections[field.category]) {
          const pattern = new RegExp(`\\{\\{${field.variable}\\}\\}`, 'g');
          const cssClass = field.category
            .toLowerCase()
            .replace(/\s+/g, '-')
            .replace('utilities-display', 'utilities-display');
          html = html.replace(
            pattern,
            `<span class="debug-number debug-${cssClass}">${field.id}</span>{{${field.variable}}}`
          );
        }
      });

      doc.body.innerHTML = html;
    } else {
      iframe.src = iframe.src;
    }
  }, [showNumbers, iframeLoaded, visibleSections, formFields]);

  if (fullScreen) {
    return (
      <div className='fixed inset-0 z-50 bg-white'>
        {/* Full Screen Header */}
        <div className='bg-slate-100 border-b border-slate-200 px-6 py-3 flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <Bug className='w-5 h-5 text-red-600' />
            <h2 className='text-lg font-semibold text-slate-800'>Template Preview - Full Screen</h2>
            {showNumbers && (
              <span className='text-red-600 font-medium text-sm'>Numbers Active</span>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <button
              onClick={toggleNumbers}
              className={`flex items-center space-x-2 px-3 py-2 rounded border transition-colors text-sm ${
                showNumbers
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-white border-slate-200 text-slate-700'
              }`}
            >
              <Eye className='w-4 h-4' />
              <span>{showNumbers ? 'Hide Numbers' : 'Show Numbers'}</span>
            </button>

            <button
              onClick={zoomOut}
              className='flex items-center justify-center w-8 h-8 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            >
              <ZoomOut className='w-4 h-4' />
            </button>

            <span className='text-xs text-slate-600 min-w-[4rem] text-center'>
              {Math.round(zoomLevel * 100)}%
            </span>

            <button
              onClick={zoomIn}
              className='flex items-center justify-center w-8 h-8 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            >
              <ZoomIn className='w-4 h-4' />
            </button>

            <button
              onClick={resetZoom}
              className='flex items-center justify-center w-8 h-8 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
            >
              <RotateCcw className='w-4 h-4' />
            </button>

            <button
              onClick={refreshPreview}
              className='flex items-center space-x-1 px-3 py-2 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm'
            >
              <X className='w-4 h-4' />
              <span>Refresh</span>
            </button>

            <button
              onClick={toggleFullScreen}
              className='flex items-center space-x-2 px-3 py-2 rounded border border-slate-200 bg-slate-600 text-white hover:bg-slate-700 text-sm'
            >
              <Minimize2 className='w-4 h-4' />
              <span>Exit Full Screen</span>
            </button>
          </div>
        </div>

        {/* Full Screen Template Preview */}
        <div
          className='h-full overflow-auto bg-slate-50 p-4'
          style={{ height: 'calc(100vh - 60px)' }}
        >
          <div
            className='bg-white rounded-lg shadow-sm overflow-hidden mx-auto'
            style={{
              width: `${100 / zoomLevel}%`,
              transform: `scale(${zoomLevel})`,
              transformOrigin: 'top center',
            }}
          >
            <iframe
              id='debugFrame'
              src='/ENHANCED-DESIGN.html'
              className='border-none'
              style={{
                width: '850px', // 8.5 inches at 100 DPI
                height: '1100px', // 11 inches at 100 DPI
                minWidth: '850px',
              }}
              onLoad={() => setIframeLoaded(true)}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-screen flex flex-col'>
      <div className='bg-white rounded-lg shadow-sm p-6 flex-1 flex flex-col'>
        <div className='flex items-center justify-between mb-6'>
          <div className='flex items-center space-x-3'>
            <Bug className='w-6 h-6 text-red-600' />
            <div>
              <h2 className='text-xl font-semibold text-slate-800'>Data Mapping Debug Tool</h2>
              <p className='text-sm text-slate-600'>
                Visual mapping between form inputs and PDF template
              </p>
            </div>
          </div>

          <div className='flex items-center space-x-2'>
            <button
              onClick={toggleNumbers}
              className={`flex items-center space-x-2 px-3 py-2 rounded border transition-colors text-sm ${
                showNumbers
                  ? 'bg-red-50 border-red-200 text-red-700'
                  : 'bg-slate-50 border-slate-200 text-slate-700'
              }`}
            >
              <Eye className='w-4 h-4' />
              <span>{showNumbers ? 'Hide Numbers' : 'Show Numbers'}</span>
            </button>

            <div className='flex items-center space-x-1'>
              <button
                onClick={showAllSections}
                className='px-2 py-2 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs'
              >
                All
              </button>
              <button
                onClick={hideAllSections}
                className='px-2 py-2 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-xs'
              >
                None
              </button>
            </div>

            <button
              onClick={toggleFullScreen}
              className='flex items-center space-x-2 px-3 py-2 rounded border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-100 text-sm'
            >
              <Maximize2 className='w-4 h-4' />
              <span>Full Screen</span>
            </button>

            <button
              onClick={refreshPreview}
              className='flex items-center space-x-2 px-3 py-2 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 text-sm'
            >
              <X className='w-4 h-4' />
              <span>Refresh</span>
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 min-h-0'>
          <div className='space-y-4 flex flex-col'>
            <h3 className='text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2'>
              Form Inputs
            </h3>

            <div className='space-y-2 flex-1 overflow-y-auto pr-2'>
              {categories.map(category => {
                const colors = categoryColors[category as keyof typeof categoryColors];
                const fieldsInCategory = formFields.filter(field => field.category === category);
                const isVisible = visibleSections[category];

                return (
                  <div key={category} className='space-y-1'>
                    <div
                      className={`flex items-center justify-between p-1 rounded cursor-pointer transition-colors ${
                        isVisible ? colors.light : 'bg-slate-100'
                      } ${colors.border} border`}
                      onClick={() => toggleSection(category)}
                    >
                      <div className='flex items-center space-x-2'>
                        <div className={`w-4 h-4 rounded-full ${colors.bg}`}></div>
                        <h4
                          className={`text-sm font-semibold uppercase ${isVisible ? colors.text : 'text-slate-500'}`}
                        >
                          {category}
                        </h4>
                        <span className='text-xs text-slate-500'>({fieldsInCategory.length})</span>
                      </div>
                      <div className='text-xs text-slate-400'>{isVisible ? '👁️' : '👁️‍🗨️'}</div>
                    </div>

                    {isVisible &&
                      fieldsInCategory.map(field => (
                        <div
                          key={field.id}
                          className={`flex items-center space-x-3 p-2 rounded border transition-opacity ${
                            field.variable !== 'N/A' && visibleSections[field.category]
                              ? colors.light
                              : 'bg-slate-50'
                          } ${colors.border}`}
                        >
                          <div
                            className={`w-6 h-6 text-white rounded-full flex items-center justify-center text-xs font-bold ${
                              field.variable !== 'N/A' ? colors.bg : 'bg-gray-400'
                            }`}
                          >
                            {field.id}
                          </div>
                          <div className='flex-1'>
                            <div className='text-sm font-medium text-slate-800'>{field.name}</div>
                            <div className='text-xs text-slate-600 mb-1'>{field.formField}</div>
                            {field.variable !== 'N/A' ? (
                              <div className={`text-xs font-mono font-semibold ${colors.text}`}>
                                {`{{${field.variable}}}`}
                              </div>
                            ) : (
                              <div className='text-xs text-gray-500 italic'>
                                Not mapped to template
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                  </div>
                );
              })}
            </div>
          </div>

          <div className='space-y-4 flex flex-col'>
            <div className='flex items-center justify-between'>
              <h3 className='text-lg font-semibold text-slate-800 border-b border-slate-200 pb-2 flex-1'>
                Template Preview
              </h3>
              <div className='flex items-center space-x-2 ml-4'>
                <button
                  onClick={() => setZoomLevel(prev => Math.max(prev - 0.1, 0.2))}
                  className='flex items-center justify-center w-7 h-7 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                >
                  <ZoomOut className='w-3 h-3' />
                </button>

                <span className='text-xs text-slate-600 min-w-[3rem] text-center'>
                  {Math.round(zoomLevel * 100)}%
                </span>

                <button
                  onClick={() => setZoomLevel(prev => Math.min(prev + 0.1, 1.5))}
                  className='flex items-center justify-center w-7 h-7 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                >
                  <ZoomIn className='w-3 h-3' />
                </button>

                <button
                  onClick={() => setZoomLevel(0.5)}
                  className='flex items-center justify-center w-7 h-7 rounded border border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                >
                  <RotateCcw className='w-3 h-3' />
                </button>
              </div>
            </div>

            <div className='border border-slate-200 rounded-lg overflow-hidden flex-1 flex flex-col'>
              <div className='bg-slate-100 px-4 py-2 text-sm text-slate-600 flex items-center justify-between'>
                <span>PDF Template</span>
                {showNumbers && <span className='text-red-600 font-medium'>Numbers Active</span>}
              </div>
              <div className='flex-1 overflow-auto bg-slate-50 flex items-start justify-center p-4'>
                <div
                  className='bg-white shadow-lg'
                  style={{
                    transform: `scale(${zoomLevel})`,
                    transformOrigin: 'center top',
                  }}
                >
                  <iframe
                    id='debugFrame'
                    src='/ENHANCED-DESIGN.html'
                    className='border-none'
                    style={{
                      width: '850px', // 8.5 inches at 100 DPI
                      height: '1100px', // 11 inches at 100 DPI
                      minWidth: '850px',
                    }}
                    onLoad={() => setIframeLoaded(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='bg-blue-50 border border-blue-200 rounded-lg p-3 mt-4'>
          <div className='flex items-start space-x-2'>
            <div className='w-4 h-4 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5'>
              i
            </div>
            <div className='text-sm text-blue-800'>
              <p className='font-medium mb-1'>How to use:</p>
              <div className='text-xs space-y-1 text-blue-700 grid grid-cols-1 md:grid-cols-2 gap-x-4'>
                <div>
                  • <strong>Red numbers:</strong> Form fields that appear in PDF
                </div>
                <div>
                  • <strong>Gray numbers:</strong> Stored but not displayed
                </div>
                <div>• Click "Show Numbers" to highlight variables</div>
                <div>• Use zoom controls on template preview</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [currentPage, setCurrentPage] = useState<
    'home' | 'proposal' | 'list' | 'admin' | 'debug-fullscreen'
  >('home');
  const [savedProposals, setSavedProposals] = useState<AnchorProposalFormData[]>([]);
  const [editingProposal, setEditingProposal] = useState<AnchorProposalFormData | null>(null);
  const [adminSection, setAdminSection] = useState<'data' | 'templates' | 'debug'>('data');
  const [showPricingEditor, setShowPricingEditor] = useState(false);

  // Authentication state (only used if auth is enabled)
  const authEnabled = isAuthEnabled();
  // Only call useMsal if we're inside MsalProvider (auth is enabled)
  const msalHook = authEnabled ? useMsal : () => ({ accounts: [] });
  const { accounts } = msalHook();
  const isAuthenticated = authEnabled && accounts.length > 0;
  const userIsAdmin = authEnabled && isAdmin();

  // Error Handling
  const { error, clearError } = useErrorHandler();

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
  const [isGeneratingPDF] = useState(false); // PDF generation moved to components
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [selectedTemplate] = useState<
    'historical' | 'modern' | 'premium' | 'classic' | 'enhanced'
  >('historical'); // Removed unused setSelectedTemplate
  const [formData, setFormData] = useState<AnchorProposalFormData>({
    id: generateNewProposalNumber(),
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
      aduType: '' as any,
      squareFootage: 0,
      bedrooms: null as any,
      bathrooms: null as any,
      appliancesIncluded: false,
      hvacType: '' as any,
      finishLevel: '' as any,
      utilities: {
        waterMeter: '' as any,
        gasMeter: '' as any,
        sewerMeter: '' as any,
        electricMeter: '' as any,
        electricalPanel: 0,
      },
      sewerConnection: '' as any,
      needsDesign: false,
      solarDesign: false,
      femaIncluded: false,
      selectedAddOns: [],
    },
    additionalNotes: '',
    hvacCustomPrice: 0,
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

  // Auto-save draft when form data changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (formData.id && (formData.client.firstName || formData.client.lastName)) {
        saveDraft(formData);
      }
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [formData]);

  // Proposal navigation functions (removed unused _loadPreviousProposals)

  // Removed unused _createNewProposal function

  // Test data generation function
  // Removed unused _generateTestData function

  // Pricing state for real-time updates
  const [pricingData, setPricingData] = useState({
    aduType: '' as any,
    pricePerSqFt: 220,
    sqft: 0,
    bedrooms: null as any,  // Start with no selection
    bathrooms: null as any, // Start with no selection
    hvacType: '' as any,
    utilities: {
      waterMeter: '' as any,  // No default selection
      gasMeter: '' as any,
      sewerMeter: '' as any,
      electricMeter: '' as any,
      electricalPanel: 0, // Default 200-amp panel has 0 cost
    },
    services: {
      design: 0,  // No pre-selected services
      solar: 0,
      fema: 0,
    },
    addons: {
      bathroom: 0,
      driveway: 0,
      landscaping: 0,
    },
    designServices: 0,
    friendsAndFamilyDiscount: false,
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

  // Removed unused _updateFormData function

  // Template switching function
  // Removed unused _switchToTemplate function

  // PDF generation functionality moved to components

  // Calculate live pricing
  // Removed unused _liveCalculation function

  // Global UI Components that appear over pages
  const GlobalUI = () => (
    <>
      {/* PDF Progress Indicator */}
      <PDFProgressIndicator
        isGenerating={isGeneratingPDF}
        message="Generating PDF..."
      />

      {/* Success Notification */}
      {successMessage && (
        <SuccessNotification message={successMessage} onClose={() => setSuccessMessage(null)} />
      )}

      {/* Error Notification */}
      {error && <ErrorNotification message={error.message || 'An error occurred'} onClose={clearError} />}
    </>
  );

  if (currentPage === 'home') {
    return (
      <>
        <GlobalUI />
        <div className='min-h-screen bg-gradient-to-br from-stone-100 to-blue-50 flex items-center justify-center relative'>
          {/* User Profile in top-right corner if authenticated */}
          {authEnabled && isAuthenticated && (
            <div className='absolute top-4 right-4'>
              <UserProfile />
            </div>
          )}
          
          <div className='text-center max-w-md mx-auto px-6'>
            {/* Large Logo Container */}
            <div className='inline-flex items-center justify-center w-52 h-52 bg-white rounded-2xl mb-8 shadow-lg'>
              <div className='flex items-center justify-center w-48 h-48'>
                <img
                  src='/anchor-logo-main.png'
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

              {/* Admin Settings - Conditionally rendered based on auth */}
              {!authEnabled ? (
                // No auth required - show admin button directly
                <button
                  onClick={() => setCurrentPage('admin')}
                  className='w-full bg-slate-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-slate-700 transition-all shadow-lg flex items-center justify-center'
                >
                  <Users className='w-4 h-4 mr-2' />
                  Admin Settings
                </button>
              ) : userIsAdmin ? (
                // Auth enabled and user is admin - show admin button
                <button
                  onClick={() => setCurrentPage('admin')}
                  className='w-full bg-slate-600 text-white px-6 py-3 rounded-xl text-base font-semibold hover:bg-slate-700 transition-all shadow-lg flex items-center justify-center'
                >
                  <Users className='w-4 h-4 mr-2' />
                  Admin Settings
                </button>
              ) : !isAuthenticated ? (
                // Auth enabled but not logged in - show login button
                <div className='w-full'>
                  <LoginButton />
                </div>
              ) : (
                // Auth enabled, logged in, but not admin - show disabled message
                <div className='w-full bg-gray-100 text-gray-500 px-6 py-3 rounded-xl text-base font-medium border border-gray-200'>
                  <Users className='w-4 h-4 mr-2 inline' />
                  Admin Access Required
                </div>
              )}
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
        <DebugProfiler id="EnhancedProductionGrid">
          <EnhancedProductionGrid
          projectData={{
            clientName: `${formData.client.firstName} ${formData.client.lastName}`.trim(),
            clientEmail: formData.client.email,
            clientPhone: formData.client.phone,
            // Secondary client fields (HOL design)
            secondaryClientFirstName: formData.secondaryClientFirstName || '',
            secondaryClientLastName: formData.secondaryClientLastName || '',
            secondaryClientEmail: formData.secondaryClientEmail || '',
            secondaryClientPhone: formData.secondaryClientPhone || '',
            // Property address fields
            propertyAddress: formData.client.address,
            city: formData.client.city,
            state: formData.client.state,
            zipCode: formData.client.zipCode,
            aduType: formData.project.aduType,
            squareFootage: pricingData.sqft,
            bedrooms: pricingData.bedrooms,
            bathrooms: pricingData.bathrooms,
            hvacType: formData.project.hvacType,
            hvacCustomPrice: formData.hvacCustomPrice,
            additionalNotes: formData.project.additionalNotes,
            // Add utilities with correct property names
            utilities: {
              waterMeter: pricingData.utilities?.waterMeter || '',
              gasMeter: pricingData.utilities?.gasMeter || '',
              sewerMeter: pricingData.utilities?.sewerMeter || '',
              electricMeter: pricingData.utilities?.electricMeter || '',
            },
            // Add proposal metadata fields
            proposalNumber: formData.proposalNumber,
            proposalDate: formData.proposalDate,
            proposalValidityDays: formData.proposalValidityDays,
            depositAmount: formData.depositAmount,
          }}
          pricingData={{
            designServices: pricingData.designServices || 0,
            utilities: Object.entries(pricingData.utilities || {}).reduce((acc, [key, value]) => {
              acc[key] = typeof value === 'number' ? value : 0;
              return acc;
            }, {} as Record<string, number>),
            // HOL design features - mapped from correct properties
            extraBathroom: pricingData.addons?.bathroom || 0,
            dedicatedDriveway: pricingData.addons?.driveway || 0,
            basicLandscaping: pricingData.addons?.landscaping || 0,
            friendsAndFamilyDiscount: pricingData.friendsAndFamilyDiscount || false,
            solarReady: pricingData.services?.solar > 0 || false,
            femaCompliance: pricingData.services?.fema > 0 || false,
          }}
          onProjectDataUpdate={updates => {
            if (updates.clientName !== undefined) {
              const [firstName = '', ...lastNameParts] = updates.clientName.split(' ');
              const lastName = lastNameParts.join(' ');
              updateClientData({ firstName, lastName });
            }
            if (updates.clientEmail !== undefined) updateClientData({ email: updates.clientEmail });
            if (updates.clientPhone !== undefined) updateClientData({ phone: updates.clientPhone });
            
            // Handle secondary client fields (HOL design)
            if (updates.secondaryClientFirstName !== undefined) {
              setFormData(prev => ({
                ...prev,
                secondaryClientFirstName: updates.secondaryClientFirstName
              }));
            }
            if (updates.secondaryClientLastName !== undefined) {
              setFormData(prev => ({
                ...prev,
                secondaryClientLastName: updates.secondaryClientLastName
              }));
            }
            if (updates.secondaryClientEmail !== undefined) {
              setFormData(prev => ({
                ...prev,
                secondaryClientEmail: updates.secondaryClientEmail
              }));
            }
            if (updates.secondaryClientPhone !== undefined) {
              setFormData(prev => ({
                ...prev,
                secondaryClientPhone: updates.secondaryClientPhone
              }));
            }
            
            // Handle property address fields
            if (updates.propertyAddress !== undefined) {
              updateClientData({ address: updates.propertyAddress });
            }
            if (updates.city !== undefined) {
              updateClientData({ city: updates.city });
            }
            if (updates.state !== undefined) {
              updateClientData({ state: updates.state });
            }
            if (updates.zipCode !== undefined) {
              updateClientData({ zipCode: updates.zipCode });
            }
            
            if (updates.aduType !== undefined) {
              // Map ADU types from pricing system to project system
              const aduTypeMapping: Record<string, 'studio' | 'one-bedroom' | 'two-bedroom' | 'custom'> = {
                'detached': 'custom',
                'attached': 'custom',
                'studio': 'studio',
                'one-bedroom': 'one-bedroom',  
                'two-bedroom': 'two-bedroom'
              };
              const mappedType = aduTypeMapping[updates.aduType] || 'custom';
              updateProjectData({ aduType: mappedType });
            }
            if (updates.squareFootage !== undefined)
              setPricingData(prev => ({ ...prev, sqft: updates.squareFootage || prev.sqft }));
            if (updates.bedrooms !== undefined) {
              console.log('🏠 Updating bedrooms in pricingData:', updates.bedrooms);
              setPricingData(prev => ({ ...prev, bedrooms: updates.bedrooms ?? prev.bedrooms }));
            }
            if (updates.bathrooms !== undefined) {
              console.log('🚿 Updating bathrooms in pricingData:', updates.bathrooms);
              setPricingData(prev => ({ ...prev, bathrooms: updates.bathrooms ?? prev.bathrooms }));
            }
            
            // Handle proposal metadata fields
            if (updates.proposalNumber !== undefined) {
              setFormData(prev => ({ ...prev, proposalNumber: updates.proposalNumber }));
            }
            if (updates.proposalDate !== undefined) {
              setFormData(prev => ({ ...prev, proposalDate: updates.proposalDate }));
            }
            if (updates.proposalValidityDays !== undefined) {
              setFormData(prev => ({ ...prev, proposalValidityDays: updates.proposalValidityDays }));
            }
            if (updates.depositAmount !== undefined) {
              setFormData(prev => ({ ...prev, depositAmount: updates.depositAmount }));
            }
            // Handle HVAC type and custom price
            if (updates.hvacType !== undefined) {
              setFormData(prev => ({ 
                ...prev, 
                project: { ...prev.project, hvacType: updates.hvacType }
              }));
            }
            if (updates.hvacCustomPrice !== undefined) {
              setFormData(prev => ({ ...prev, hvacCustomPrice: updates.hvacCustomPrice }));
            }
            
            // Note: hvacType and additionalNotes are stored in pricingData, not projectData
            
            // Handle utilities updates
            if (updates.utilities !== undefined) {
              console.log('🔌 Utilities update received:', updates.utilities);
              setPricingData(prev => ({ 
                ...prev, 
                utilities: { 
                  ...prev.utilities, 
                  ...updates.utilities 
                } 
              }));
            }
            
            // Handle missing field handlers for Clear Data functionality
            if (updates.additionalNotes !== undefined) {
              setFormData(prev => ({ ...prev, additionalNotes: updates.additionalNotes }));
            }
            if (updates.appliancesIncluded !== undefined) {
              updateProjectData({ appliancesIncluded: updates.appliancesIncluded });
            }
            if (updates.finishLevel !== undefined) {
              updateProjectData({ finishLevel: updates.finishLevel });
            }
            if (updates.needsDesign !== undefined) {
              updateProjectData({ needsDesign: updates.needsDesign });
            }
            if (updates.solarDesign !== undefined) {
              updateProjectData({ solarDesign: updates.solarDesign });
            }
            if (updates.femaIncluded !== undefined) {
              updateProjectData({ femaIncluded: updates.femaIncluded });
            }
            if (updates.selectedAddOns !== undefined) {
              updateProjectData({ selectedAddOns: updates.selectedAddOns });
            }
            if (updates.timeline !== undefined) {
              setFormData(prev => ({ ...prev, timeline: updates.timeline }));
            }
            if (updates.sewerConnection !== undefined) {
              updateProjectData({ sewerConnection: updates.sewerConnection });
            }
          }}
          onOpenPricingEditor={() => setShowPricingEditor(true)}
          onPricingDataUpdate={(updates: any) => {
            console.log('💰 onPricingDataUpdate called with:', updates);
            console.log('💰 Current pricingData before update:', pricingData);
            setPricingData(prev => {
              const newState = { ...prev };
              
              // Handle addon fields - map to nested structure
              if (updates.extraBathroom !== undefined) {
                newState.addons = { ...newState.addons, bathroom: updates.extraBathroom };
                console.log('💰 Mapping extraBathroom to addons.bathroom:', updates.extraBathroom);
              }
              if (updates.dedicatedDriveway !== undefined) {
                newState.addons = { ...newState.addons, driveway: updates.dedicatedDriveway };
                console.log('💰 Mapping dedicatedDriveway to addons.driveway:', updates.dedicatedDriveway);
              }
              if (updates.basicLandscaping !== undefined) {
                newState.addons = { ...newState.addons, landscaping: updates.basicLandscaping };
                console.log('💰 Mapping basicLandscaping to addons.landscaping:', updates.basicLandscaping);
              }
              
              // Handle service fields - map to nested structure
              if (updates.solarReady !== undefined) {
                newState.services = { ...newState.services, solar: updates.solarReady ? 1500 : 0 };
                console.log('💰 Mapping solarReady to services.solar:', updates.solarReady);
              }
              if (updates.femaCompliance !== undefined) {
                newState.services = { ...newState.services, fema: updates.femaCompliance ? 2000 : 0 };
                console.log('💰 Mapping femaCompliance to services.fema:', updates.femaCompliance);
              }
              
              // Handle direct field updates
              if (updates.designServices !== undefined) {
                newState.designServices = updates.designServices;
                console.log('💰 Setting designServices:', updates.designServices);
              }
              if (updates.friendsAndFamilyDiscount !== undefined) {
                newState.friendsAndFamilyDiscount = updates.friendsAndFamilyDiscount;
                console.log('💰 Setting friendsAndFamilyDiscount:', updates.friendsAndFamilyDiscount);
              }
              
              console.log('💰 New pricingData state will be:', newState);
              return newState;
            });
          }}
          onNavigateToAdmin={() => {
            setCurrentPage('admin');
            setAdminSection('templates'); // Go directly to pricing admin
          }}
          setPricingData={setPricingData}
          />
        </DebugProfiler>
        {/* Render the Anchor Pricing Editor V2 controlled by state */}
        {showPricingEditor && (
          authEnabled ? (
            <AuthGuard requireAdmin={true}>
              <AnchorPricingEditorV2 
                isOpen={showPricingEditor}
                onClose={() => setShowPricingEditor(false)}
              />
            </AuthGuard>
          ) : (
            <AnchorPricingEditorV2 
              isOpen={showPricingEditor}
              onClose={() => setShowPricingEditor(false)}
            />
          )
        )}
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
                      Created: {proposal.proposalDate || 'Unknown'}
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

    // Only protect with AuthGuard if auth is enabled
    const adminContent = (
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
                <span>Pricing Configuration</span>
              </button>
              <button
                onClick={() => setAdminSection('debug')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  adminSection === 'debug'
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-800'
                }`}
              >
                <Bug className='w-4 h-4' />
                <span>Data Mapping</span>
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
            <div className="max-w-4xl mx-auto p-8">
              <h2 className="text-2xl font-bold mb-4">Template Configuration</h2>
              <p className="text-gray-600">Template configuration is coming soon.</p>
            </div>
          )}

          {adminSection === 'debug' && (
            <div className='space-y-6'>
              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-4'>
                <div className='flex items-center space-x-3'>
                  <ExternalLink className='w-5 h-5 text-yellow-600' />
                  <div>
                    <h3 className='font-medium text-yellow-800'>Full-Page Debug Tool</h3>
                    <p className='text-sm text-yellow-700 mt-1'>
                      Open the debug mapping tool in full-page mode for better visibility and easier
                      template analysis.
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setCurrentPage('debug-fullscreen')}
                  className='mt-3 flex items-center space-x-2 px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-sm font-medium'
                >
                  <ExternalLink className='w-4 h-4' />
                  <span>Open Full-Page Debug Tool</span>
                </button>
              </div>
              <DebugMappingTool />
            </div>
          )}
        </div>
      </div>
    );

    // Wrap with AuthGuard if auth is enabled
    if (authEnabled) {
      return <AuthGuard requireAdmin={true}>{adminContent}</AuthGuard>;
    }
    
    return adminContent;
  }

  if (currentPage === 'debug-fullscreen') {
    return <FullPageDebugTool onBack={() => setCurrentPage('admin')} />;
  }

  return null;
}

// Proposal Form Page Component
// // interface ProposalFormPageProps {
//   formData: AnchorProposalFormData;
//   pricingData: any;
//   liveCalculation: any;
//   updateClientData: (updates: Partial<ClientInfo>) => void;
//   updateProjectData: (updates: Partial<ProjectInfo>) => void;
//   updateFormData: (updates: Partial<AnchorProposalFormData>) => void;
//   setPricingData: (data: any) => void;
//   generatePDF: () => void;
//   generateTestData: () => void;
//   onBack: () => void;
//   isGeneratingPDF: boolean;
//   selectedTemplate: 'historical' | 'modern' | 'premium' | 'classic' | 'enhanced';
//   switchToTemplate: (
//     templateName: 'historical' | 'modern' | 'premium' | 'classic' | 'enhanced'
//   ) => void;
//   createNewProposal: () => void;
//   loadPreviousProposals: () => void;
// }

// // function _ProposalFormPage({
//   formData,
//   pricingData,
//   liveCalculation,
//   updateClientData,
//   updateProjectData,
//   updateFormData,
//   setPricingData,
//   generatePDF,
//   generateTestData,
//   onBack,
//   isGeneratingPDF,
//   selectedTemplate,
//   switchToTemplate,
//   createNewProposal,
//   loadPreviousProposals,
// // }: ProposalFormPageProps) {
//   // Check if form is complete
//   const isFormComplete =
//     formData.client.firstName &&
//     formData.client.lastName &&
//     formData.client.email &&
//     formData.client.phone &&
//     formData.client.address &&
//     formData.client.city &&
//     formData.client.state &&
//     formData.client.zipCode &&
//     pricingData.utilities.water !== null &&
//     pricingData.utilities.gas !== null &&
//     pricingData.utilities.electric !== null &&
//     pricingData.utilities.electricalPanel !== null;
// 
//   return (
//     <div
//       className='min-h-screen'
//       style={{ background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)' }}
//     >
//       <div className='max-w-7xl mx-auto p-8'>
//         {/* Header */}
//         <div className='flex items-center justify-between mb-8 bg-white p-6 rounded-xl shadow-sm'>
//           <div className='flex items-center space-x-4'>
//             <div className='w-12 h-12 bg-white rounded-lg flex items-center justify-center shadow-sm border border-slate-200'>
//               <img
//                 src='/anchor-builders-logo.png'
//                 alt='Anchor Builders Logo'
//                 className='w-10 h-10 object-contain'
//               />
//             </div>
//             <div>
//               <h1 className='text-xl font-bold text-slate-800'>Anchor Builders</h1>
//               <p className='text-sm text-slate-600'>
//                 Licensed ADU Specialists • CA License #1234567
//               </p>
//             </div>
//           </div>
//           <div className='flex items-center space-x-4'>
//             <div className='flex items-center space-x-2 text-xs text-slate-500'>
//               <CheckCircle className='w-4 h-4' />
//               <span>Complete all sections to generate proposal</span>
//             </div>
//             <button
//               onClick={onBack}
//               className='flex items-center space-x-2 text-slate-600 hover:text-blue-600 transition-colors px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg'
//             >
//               <ArrowLeft className='w-4 h-4' />
//               <span>Back to Home</span>
//             </button>
//           </div>
//         </div>
// 
//         {/* Compact Generate Button with Live Pricing - Top of Form */}
//         <div className='mb-6'>
//           <div className='bg-white rounded-xl p-4 shadow-md border border-slate-200'>
//             <div className='flex items-center justify-between gap-4'>
//               {/* Live Price Display */}
//               <div className='flex items-center space-x-4'>
//                 <div className='text-right'>
//                   <div className='text-sm text-slate-600'>Total Project Cost</div>
//                   <div className='text-2xl font-bold text-blue-600'>
//                     ${liveCalculation.finalTotal.toLocaleString()}
//                   </div>
//                   <div className='text-xs text-slate-500'>
//                     {pricingData.sqft ? `${pricingData.sqft} sq ft • ` : ''}
//                     {isFormComplete ? 'Ready to generate' : 'Complete form to generate'}
//                   </div>
//                 </div>
//               </div>
// 
//               {/* Template Selection & Generate Buttons */}
//               <div className='flex items-center space-x-3'>
//                 {/* Test Data Button */}
//                 <button
//                   onClick={generateTestData}
//                   className='px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold text-sm flex items-center space-x-2 hover:from-green-600 hover:to-green-700 transition-all shadow-lg whitespace-nowrap'
//                   title='Fill form with randomized test data for quick testing'
//                 >
//                   <Plus className='w-4 h-4' />
//                   <span>Test Data</span>
//                 </button>
// 
//                 {/* Template Selection Buttons */}
//                 <div className='flex items-center space-x-1 bg-slate-100 rounded-lg p-1'>
//                   <button
//                     onClick={() => switchToTemplate('historical')}
//                     className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
//                       selectedTemplate === 'historical'
//                         ? 'bg-blue-500 text-white shadow-sm'
//                         : 'text-slate-600 hover:bg-white hover:text-blue-600'
//                     }`}
//                     title='Historical Design - Proven $713K+ template'
//                   >
//                     Classic
//                   </button>
//                   <button
//                     onClick={() => switchToTemplate('modern')}
//                     className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
//                       selectedTemplate === 'modern'
//                         ? 'bg-blue-500 text-white shadow-sm'
//                         : 'text-slate-600 hover:bg-white hover:text-blue-600'
//                     }`}
//                     title='Modern Enhanced - Complete pricing breakdown with all improvements'
//                   >
//                     Modern
//                   </button>
//                   <button
//                     onClick={() => switchToTemplate('premium')}
//                     className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
//                       selectedTemplate === 'premium'
//                         ? 'bg-blue-500 text-white shadow-sm'
//                         : 'text-slate-600 hover:bg-white hover:text-blue-600'
//                     }`}
//                     title='Premium Luxury - Elegant design with gold accents and premium styling'
//                   >
//                     Premium
//                   </button>
//                   <button
//                     onClick={() => switchToTemplate('enhanced')}
//                     className={`px-3 py-2 rounded-md text-xs font-medium transition-all ${
//                       selectedTemplate === 'enhanced'
//                         ? 'bg-blue-500 text-white shadow-sm'
//                         : 'text-slate-600 hover:bg-white hover:text-blue-600'
//                     }`}
//                     title='Enhanced Modern - Complete pricing breakdown with all latest improvements'
//                   >
//                     Enhanced
//                   </button>
//                 </div>
// 
//                 {/* Generate Button */}
//                 <button
//                   onClick={generatePDF}
//                   disabled={!isFormComplete || isGeneratingPDF}
//                   className='px-6 py-3 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-lg font-semibold text-sm flex items-center space-x-2 hover:from-blue-600 hover:to-blue-800 transition-all disabled:opacity-60 disabled:cursor-not-allowed shadow-lg whitespace-nowrap'
//                 >
//                   {isGeneratingPDF ? (
//                     <LoadingSpinner size='sm' className='text-white' />
//                   ) : (
//                     <FileText className='w-4 h-4' />
//                   )}
//                   <span>{isGeneratingPDF ? 'Generating...' : 'Generate Proposal'}</span>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </div>
// 
//         <div className='grid grid-cols-1 lg:grid-cols-3 gap-6 min-h-screen'>
//           {/* Main Form - Scrollable */}
//           <div className='lg:col-span-2 space-y-6 lg:max-h-screen lg:overflow-y-auto lg:pr-4'>
//             {/* Proposal Information */}
//             <FormSection
//               icon={<FileText className='w-5 h-5' />}
//               title='Proposal Information'
//               subtitle='Proposal number and navigation'
//             >
//               <div className='grid grid-cols-1 md:grid-cols-3 gap-4 items-end'>
//                 <FormField
//                   label='Proposal Number'
//                   isRequired={false}
//                   isValid={true}
//                   isTouched={true}
//                 >
//                   <ValidatedInput
//                     value={formData.id || ''}
//                     onChange={() => {}} // Read-only
//                     placeholder='AB-1001'
//                     isValid={true}
//                     fieldName='proposalNumber'
//                     disabled
//                     className='bg-gray-50 font-mono font-semibold'
//                   />
//                 </FormField>
// 
//                 <button
//                   onClick={createNewProposal}
//                   className='px-4 py-2 bg-green-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 hover:bg-green-600 transition-all h-10'
//                 >
//                   <Plus className='w-4 h-4' />
//                   <span>New Proposal</span>
//                 </button>
// 
//                 <button
//                   onClick={loadPreviousProposals}
//                   className='px-4 py-2 bg-blue-500 text-white rounded-lg font-semibold text-sm flex items-center justify-center space-x-2 hover:bg-blue-600 transition-all h-10'
//                 >
//                   <ArrowLeft className='w-4 h-4' />
//                   <span>Load Previous</span>
//                 </button>
//               </div>
//             </FormSection>
// 
//             {/* Client Information */}
//             <FormSection
//               icon={<User className='w-5 h-5' />}
//               title='Client Information'
//               subtitle='Contact details and property address'
//             >
//               <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//                 <FormField
//                   label='First Name'
//                   isRequired
//                   isValid={!!formData.client.firstName?.trim()}
//                   isTouched={true}
//                 >
//                   <ValidatedInput
//                     value={formData.client.firstName}
//                     onChange={value => updateClientData({ firstName: value as string })}
//                     placeholder='John'
//                     isValid={!!formData.client.firstName?.trim()}
//                     fieldName='firstName'
//                     autoFormat
//                   />
//                 </FormField>
//                 <FormField
//                   label='Last Name'
//                   isRequired
//                   isValid={!!formData.client.lastName?.trim()}
//                   isTouched={true}
//                 >
//                   <ValidatedInput
//                     value={formData.client.lastName}
//                     onChange={value => updateClientData({ lastName: value as string })}
//                     placeholder='Smith'
//                     isValid={!!formData.client.lastName?.trim()}
//                     fieldName='lastName'
//                     autoFormat
//                   />
//                 </FormField>
//               </div>
//               <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
//                 <FormField
//                   label='Email'
//                   isRequired
//                   isValid={!!formData.client.email?.trim() && formData.client.email.includes('@')}
//                   isTouched={true}
//                 >
//                   <ValidatedInput
//                     type='email'
//                     value={formData.client.email}
//                     onChange={value => updateClientData({ email: value as string })}
//                     placeholder='john@example.com'
//                     isValid={!!formData.client.email?.trim() && formData.client.email.includes('@')}
//                     fieldName='email'
//                     autoFormat
//                   />
//                 </FormField>
//                 <FormField
//                   label='Phone'
//                   isRequired
//                   isValid={!!formData.client.phone?.trim() && formData.client.phone.length >= 10}
//                   isTouched={true}
//                 >
//                   <ValidatedInput
//                     type='tel'
//                     value={formData.client.phone}
//                     onChange={value => updateClientData({ phone: value as string })}
//                     placeholder='(714) 555-0123'
//                     isValid={!!formData.client.phone?.trim() && formData.client.phone.length >= 10}
//                     fieldName='phone'
//                     autoFormat
//                   />
//                 </FormField>
//               </div>
//               <FormField
//                 label='Property Address'
//                 isRequired
//                 isValid={!!formData.client.address?.trim()}
//                 isTouched={true}
//               >
//                 <ValidatedInput
//                   value={formData.client.address}
//                   onChange={value => updateClientData({ address: value as string })}
//                   placeholder='123 Main Street'
//                   isValid={!!formData.client.address?.trim()}
//                   fieldName='address'
//                   autoFormat
//                 />
//               </FormField>
//               <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
//                 <FormField
//                   label='City'
//                   isRequired
//                   isValid={!!formData.client.city?.trim()}
//                   isTouched={true}
//                 >
//                   <ValidatedInput
//                     value={formData.client.city}
//                     onChange={value => updateClientData({ city: value as string })}
//                     placeholder='Garden Grove'
//                     isValid={!!formData.client.city?.trim()}
//                     fieldName='city'
//                     autoFormat
//                   />
//                 </FormField>
//                 <FormField
//                   label='State'
//                   isRequired
//                   isValid={!!formData.client.state?.trim()}
//                   isTouched={true}
//                 >
//                   <ValidatedInput
//                     value={formData.client.state}
//                     onChange={value => updateClientData({ state: value as string })}
//                     placeholder='CA'
//                     isValid={!!formData.client.state?.trim()}
//                     fieldName='state'
//                     autoFormat
//                   />
//                 </FormField>
//                 <FormField
//                   label='ZIP Code'
//                   isRequired
//                   isValid={!!formData.client.zipCode?.trim() && formData.client.zipCode.length >= 5}
//                   isTouched={true}
//                 >
//                   <ValidatedInput
//                     value={formData.client.zipCode}
//                     onChange={value => updateClientData({ zipCode: value as string })}
//                     placeholder='92683'
//                     isValid={
//                       !!formData.client.zipCode?.trim() && formData.client.zipCode.length >= 5
//                     }
//                     fieldName='zipCode'
//                     autoFormat
//                   />
//                 </FormField>
//               </div>
//               <FormField
//                 label='Proposal Date'
//                 isRequired={false}
//                 isValid={!!formData.proposalDate?.trim()}
//                 isTouched={true}
//               >
//                 <ValidatedInput
//                   value={formData.proposalDate || ''}
//                   onChange={value => updateFormData({ proposalDate: value as string })}
//                   placeholder='January 1, 2025'
//                   isValid={!!formData.proposalDate?.trim()}
//                   fieldName='proposalDate'
//                   autoFormat
//                 />
//               </FormField>
//             </FormSection>
// 
//             {/* ADU Configuration */}
//             <FormSection
//               icon={<Home className='w-5 h-5' />}
//               title='ADU Configuration'
//               subtitle='Size, type, and room configuration'
//             >
//               <ADUConfigurationForm
//                 pricingData={pricingData}
//                 setPricingData={setPricingData}
//                 updateProjectData={updateProjectData}
//               />
//             </FormSection>
// 
//             {/* Utility Connections */}
//             <FormSection
//               icon={<Zap className='w-5 h-5' />}
//               title='Utility Connections *'
//               subtitle='Meter configurations (Required)'
//             >
//               <UtilityConnectionsForm pricingData={pricingData} setPricingData={setPricingData} />
//             </FormSection>
// 
//             {/* Design Services */}
//             <FormSection
//               icon={<Compass className='w-5 h-5' />}
//               title='Design Services & Features'
//               subtitle='Professional services'
//             >
//               <DesignServicesForm pricingData={pricingData} setPricingData={setPricingData} />
//             </FormSection>
// 
//             {/* Optional Add-Ons */}
//             <FormSection
//               icon={<Square className='w-5 h-5' />}
//               title='Optional Add-Ons'
//               subtitle='Standard and custom upgrades'
//             >
//               <AddOnsForm
//                 pricingData={pricingData}
//                 setPricingData={setPricingData}
//                 updateProjectData={updateProjectData}
//               />
//             </FormSection>
//           </div>
// 
//           {/* Sidebar - Fixed Position on Desktop */}
//           <div className='space-y-6 lg:sticky lg:top-6 lg:h-fit lg:max-h-screen lg:overflow-y-auto'>
//             {/* Live Pricing */}
//             <PricingCard liveCalculation={liveCalculation} pricingData={pricingData} />
// 
//             {/* Payment Schedule */}
//             <PaymentScheduleCard liveCalculation={liveCalculation} />
// 
//             {/* Actions */}
//             <ActionCard />
// 
//             {/* Trust Indicators */}
//             <TrustIndicators />
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
// 
// // Form Section Component
// interface FormSectionProps {
//   icon: React.ReactNode;
//   title: string;
//   subtitle: string;
//   children: React.ReactNode;
// }

// function FormSection({ icon, title, subtitle, children }: FormSectionProps) {
//   return (
//     <div className='bg-white rounded-xl p-6 shadow-md border border-slate-200'>
//       <div className='flex items-center space-x-3 mb-6 pb-3 border-b-2 border-blue-100'>
//         <div className='w-9 h-9 bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center text-white'>
//           {icon}
//         </div>
//         <div>
//           <h2 className='text-base font-semibold text-slate-800'>{title}</h2>
//           <p className='text-xs text-slate-600'>{subtitle}</p>
//         </div>
//       </div>
//       {children}
//     </div>
//   );
// }
// 
// // ADU Configuration Form Component
// function ADUConfigurationForm({ pricingData, setPricingData, updateProjectData }: any) {
//   const handleSizeChange = (value: number) => {
//     setPricingData((prev: any) => ({ ...prev, sqft: value }));
//     updateProjectData({ squareFootage: value });
//   };
// 
//   const handleADUTypeChange = (type: string, price: number) => {
//     setPricingData((prev: any) => ({ ...prev, aduType: type, pricePerSqFt: price }));
//     updateProjectData({ aduType: type === 'attached' ? 'attached' : 'detached' });
//   };
// 
//   const handleRoomChange = (type: 'bedrooms' | 'bathrooms', value: number) => {
//     setPricingData((prev: any) => ({ ...prev, [type]: value }));
//     updateProjectData({ [type]: value });
//   };
// 
//   return (
//     <div className='space-y-6'>
//       {/* Square Footage */}
//       <div>
//         <label className='text-xs font-medium text-slate-700 mb-2 block'>Square Footage *</label>
//         <div className='flex items-center space-x-4 mb-4'>
//           <input
//             type='number'
//             value={pricingData.sqft}
//             onChange={e => handleSizeChange(parseInt(e.target.value) || 600)}
//             min='300'
//             max='1200'
//             className='w-32 px-3 py-3 border-2 border-blue-500 rounded-lg text-base font-semibold text-center bg-blue-50'
//           />
//           <span className='text-sm text-slate-600'>sq ft (300-1200)</span>
//         </div>
//         <div className='grid grid-cols-5 gap-2'>
//           {[400, 600, 800, 1000, 1200].map(size => (
//             <button
//               key={size}
//               onClick={() => handleSizeChange(size)}
//               className={`px-2 py-2 text-xs text-center rounded-lg border transition-all ${
//                 pricingData.sqft === size
//                   ? 'border-blue-500 bg-blue-50 font-semibold'
//                   : 'border-slate-200 hover:border-blue-300'
//               }`}
//             >
//               ~{size}
//             </button>
//           ))}
//         </div>
//       </div>
// 
//       {/* ADU Type */}
//       <div>
//         <label className='text-xs font-medium text-slate-700 mb-3 block'>ADU Type</label>
//         <div className='grid grid-cols-2 gap-3'>
//           {[
//             {
//               type: 'detached-1story',
//               price: 220,
//               title: 'Detached 1-Story',
//               desc: 'Single level standalone unit',
//             },
//             {
//               type: 'detached-2story',
//               price: 240,
//               title: 'Detached 2-Story',
//               desc: 'Two level standalone unit',
//             },
//             {
//               type: 'attached',
//               price: 200,
//               title: 'Attached ADU',
//               desc: 'Connected to existing home',
//             },
//             {
//               type: 'junior-adu',
//               price: 244,
//               title: 'Junior ADU (Garage Conversion)',
//               desc: 'Garage converted to living space',
//             },
//           ].map(option => (
//             <button
//               key={option.type}
//               onClick={() => handleADUTypeChange(option.type, option.price)}
//               className={`p-4 rounded-lg border-2 text-left transition-all ${
//                 pricingData.aduType === option.type
//                   ? 'border-blue-500 bg-blue-50'
//                   : 'border-slate-200 hover:border-blue-300'
//               }`}
//             >
//               <div className='mb-2'>
//                 <h3 className='font-semibold text-sm text-slate-800'>{option.title}</h3>
//               </div>
//               <p className='text-xs text-slate-600'>{option.desc}</p>
//             </button>
//           ))}
//         </div>
//       </div>
// 
//       {/* Bedrooms and Bathrooms */}
//       <div className='grid grid-cols-2 gap-6'>
//         <div>
//           <label className='text-xs font-medium text-slate-700 mb-2 block'>Bedrooms</label>
//           <div className='grid grid-cols-5 gap-2'>
//             {[
//               { value: 0, label: 'Studio' },
//               { value: 1, label: '1' },
//               { value: 2, label: '2' },
//               { value: 3, label: '3' },
//               { value: 4, label: '4' },
//             ].map(option => (
//               <button
//                 key={option.value}
//                 onClick={() => handleRoomChange('bedrooms', option.value)}
//                 className={`px-2 py-2 text-xs text-center rounded-lg border transition-all ${
//                   pricingData.bedrooms === option.value
//                     ? 'border-blue-500 bg-blue-50 font-semibold'
//                     : 'border-slate-200 hover:border-blue-300'
//                 }`}
//               >
//                 {option.label}
//               </button>
//             ))}
//           </div>
//         </div>
// 
//         <div>
//           <label className='text-xs font-medium text-slate-700 mb-2 block'>Bathrooms</label>
//           <div className='grid grid-cols-3 gap-2'>
//             {[1, 2, 3].map(num => (
//               <button
//                 key={num}
//                 onClick={() => handleRoomChange('bathrooms', num)}
//                 className={`px-2 py-2 text-xs text-center rounded-lg border transition-all ${
//                   pricingData.bathrooms === num
//                     ? 'border-blue-500 bg-blue-50 font-semibold'
//                     : 'border-slate-200 hover:border-blue-300'
//                 }`}
//               >
//                 {num}
//               </button>
//             ))}
//           </div>
//         </div>
//       </div>
// 
//       {/* HVAC System */}
//       <div>
//         <label className='text-xs font-medium text-slate-700 mb-2 block'>HVAC System *</label>
//         <div className='grid grid-cols-2 gap-3'>
//           <button
//             onClick={() => {
//               setPricingData((prev: any) => ({ ...prev, hvacType: 'central-ac' }));
//               updateProjectData({ hvacType: 'central-ac' });
//             }}
//             className={`p-3 rounded-lg border-2 text-left transition-all ${
//               pricingData.hvacType === 'central-ac'
//                 ? 'border-blue-500 bg-blue-50 font-semibold'
//                 : 'border-slate-200 hover:border-blue-300'
//             }`}
//           >
//             <div className='mb-1'>
//               <h4 className='font-semibold text-xs text-slate-800'>Central Air/Heat</h4>
//             </div>
//             <p className='text-xs text-slate-600'>Ducted HVAC system</p>
//           </button>
// 
//           <button
//             onClick={() => {
//               setPricingData((prev: any) => ({ ...prev, hvacType: 'mini-split' }));
//               updateProjectData({ hvacType: 'mini-split' });
//             }}
//             className={`p-3 rounded-lg border-2 text-left transition-all ${
//               pricingData.hvacType === 'mini-split'
//                 ? 'border-blue-500 bg-blue-50 font-semibold'
//                 : 'border-slate-200 hover:border-blue-300'
//             }`}
//           >
//             <div className='mb-1'>
//               <h4 className='font-semibold text-xs text-slate-800'>Mini-Split System</h4>
//             </div>
//             <p className='text-xs text-slate-600'>Ductless heat pump</p>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
// 
// // Utility Connections Form Component
// function UtilityConnectionsForm({ pricingData, setPricingData }: any) {
//   const handleUtilityChange = (utility: string, cost: number) => {
//     setPricingData((prev: any) => ({
//       ...prev,
//       utilities: { ...prev.utilities, [utility]: cost },
//     }));
//   };
// 
//   const utilities = [
//     {
//       key: 'water',
//       label: 'Water Meter',
//       options: [
//         { title: 'Shared', cost: 0 },
//         { title: 'Separate', cost: 1000 },
//       ],
//     },
//     {
//       key: 'gas',
//       label: 'Gas Meter',
//       options: [
//         { title: 'Shared', cost: 0 },
//         { title: 'Separate', cost: 1500 },
//       ],
//     },
//     {
//       key: 'electric',
//       label: 'Electric Meter',
//       options: [
//         { title: 'Shared', cost: 0 },
//         { title: 'Separate', cost: 2000 },
//       ],
//     },
//   ];
// 
//   return (
//     <div className='space-y-3'>
//       {utilities.map(utility => (
//         <div key={utility.key} className='grid grid-cols-4 gap-3 items-center'>
//           <div className='text-xs font-medium text-slate-700'>{utility.label}</div>
//           <div className='col-span-3 grid grid-cols-2 gap-2'>
//             {utility.options.map(option => (
//               <button
//                 key={`${utility.key}-${option.cost}`}
//                 onClick={() => handleUtilityChange(utility.key, option.cost)}
//                 className={`p-2 rounded-lg border text-center text-xs transition-all ${
//                   pricingData.utilities[utility.key] === option.cost
//                     ? 'border-blue-500 bg-blue-50 font-semibold'
//                     : pricingData.utilities[utility.key] === null
//                       ? 'border-red-200 hover:border-blue-300'
//                       : 'border-slate-200 hover:border-blue-300'
//                 }`}
//               >
//                 <span className='block font-medium text-slate-800 mb-1'>{option.title}</span>
//                 <span
//                   className={`text-xs font-semibold ${option.cost === 0 ? 'text-green-600' : 'text-blue-600'}`}
//                 >
//                   {option.cost === 0 ? 'No Cost' : `+$${option.cost.toLocaleString()}`}
//                 </span>
//               </button>
//             ))}
//           </div>
//         </div>
//       ))}
// 
//       {/* Electrical Panel Dropdown */}
//       <div className='grid grid-cols-4 gap-3 items-center'>
//         <div className='text-xs font-medium text-slate-700'>Electrical Panel</div>
//         <div className='col-span-3'>
//           <select
//             value={pricingData.utilities.electricalPanel ?? 0}
//             onChange={e => handleUtilityChange('electricalPanel', parseInt(e.target.value))}
//             className='w-full p-2 rounded-lg border border-slate-200 text-xs focus:border-blue-500 focus:ring-2 focus:ring-blue-100'
//           >
//             <option value={-100}>100 Amp - No Cost</option>
//             <option value={0}>200 Amp - No Cost (Default)</option>
//             <option value={500}>300 Amp - +$500</option>
//             <option value={1000}>400 Amp - +$1,000</option>
//           </select>
//         </div>
//       </div>
//     </div>
//   );
// }
// 
// // Design Services Form Component
// function DesignServicesForm({ pricingData, setPricingData }: any) {
//   const handleServiceChange = (service: string, cost: number, checked: boolean) => {
//     setPricingData((prev: any) => ({
//       ...prev,
//       services: { ...prev.services, [service]: checked ? cost : 0 },
//     }));
//   };
// 
//   const services = [
//     {
//       key: 'design',
//       label: 'Full Design Package',
//       cost: 12500,
//       desc: 'Complete architectural design, structural engineering, MEP design, and zoning compliance review.',
//     },
//     {
//       key: 'solar',
//       label: 'Solar Design Preparation',
//       cost: 0,
//       desc: 'Pre-wire and structural prep for future solar installation.',
//     },
//     {
//       key: 'fema',
//       label: 'FEMA Flood Compliance',
//       cost: 2000,
//       desc: 'Required in flood zones for elevated construction standards.',
//     },
//   ];
// 
//   return (
//     <div className='space-y-3'>
//       {services.map(service => (
//         <div
//           key={service.key}
//           className={`p-3 rounded-lg border cursor-pointer transition-all ${
//             service.key === 'solar' || pricingData.services[service.key] > 0
//               ? 'border-blue-500 bg-blue-50'
//               : 'border-slate-200 hover:border-blue-300'
//           }`}
//           onClick={() => {
//             if (service.key === 'solar') return; // Solar is always included, can't be unchecked
//             handleServiceChange(service.key, service.cost, pricingData.services[service.key] === 0);
//           }}
//         >
//           <div className='flex items-start space-x-3'>
//             <input
//               type='checkbox'
//               checked={service.key === 'solar' ? true : pricingData.services[service.key] > 0}
//               onChange={() => {}}
//               className='mt-0.5 w-4 h-4 text-blue-600'
//             />
//             <div className='flex-1'>
//               <div className='flex justify-between items-center mb-1'>
//                 <span className='font-semibold text-xs text-slate-800'>{service.label}</span>
//                 <span className='font-semibold text-xs text-blue-600'>
//                   {service.cost === 0 ? 'No Cost' : `+$${service.cost.toLocaleString()}`}
//                 </span>
//               </div>
//               <p className='text-xs text-slate-600 leading-tight'>{service.desc}</p>
//             </div>
//           </div>
//         </div>
//       ))}
//     </div>
//   );
// }
// 
// // Add-Ons Form Component
// function AddOnsForm({ pricingData, setPricingData, updateProjectData }: any) {
//   const handleAddonChange = (addon: string, cost: number, checked: boolean) => {
//     setPricingData((prev: any) => {
//       // Update the pricing data first
//       const newAddons = { ...prev.addons, [addon]: checked ? cost : 0 };
// 
//       // Calculate the updated selected addons list
//       const selectedAddons = Object.keys(newAddons).filter(key => newAddons[key] > 0);
// 
//       // Update form data with the new selections
//       updateProjectData({ selectedAddOns: selectedAddons });
// 
//       return {
//         ...prev,
//         addons: newAddons,
//       };
//     });
//   };
// 
//   const handleManualAddonChange = (index: number, value: string) => {
//     const cost = parseInt(value) || 0;
//     setPricingData((prev: any) => {
//       const newManualAddons = [...prev.manualAddons];
//       newManualAddons[index] = cost;
//       return { ...prev, manualAddons: newManualAddons };
//     });
//   };
// 
//   const addManualAddon = () => {
//     setPricingData((prev: any) => ({
//       ...prev,
//       manualAddons: [...prev.manualAddons, 0],
//     }));
//   };
// 
//   const removeManualAddon = (index: number) => {
//     setPricingData((prev: any) => ({
//       ...prev,
//       manualAddons: prev.manualAddons.filter((_: any, i: number) => i !== index),
//     }));
//   };
// 
//   const standardAddons = [
//     {
//       key: 'bathroom',
//       label: 'Extra Bathroom',
//       cost: 8000,
//       desc: 'Additional bathroom beyond standard configuration.',
//     },
//     {
//       key: 'driveway',
//       label: 'Dedicated Driveway',
//       cost: 5000,
//       desc: 'Dedicated driveway and parking space.',
//     },
//     {
//       key: 'landscaping',
//       label: 'Basic Landscaping',
//       cost: 10000,
//       desc: 'Basic landscaping package around the ADU.',
//     },
//   ];
// 
//   return (
//     <div className='space-y-4'>
//       {/* Standard Add-ons */}
//       <div className='space-y-3'>
//         {standardAddons.map(addon => (
//           <div
//             key={addon.key}
//             className={`p-3 rounded-lg border cursor-pointer transition-all ${
//               pricingData.addons[addon.key] > 0
//                 ? 'border-blue-500 bg-blue-50'
//                 : 'border-slate-200 hover:border-blue-300'
//             }`}
//             onClick={() =>
//               handleAddonChange(addon.key, addon.cost, pricingData.addons[addon.key] === 0)
//             }
//           >
//             <div className='flex items-start space-x-3'>
//               <input
//                 type='checkbox'
//                 checked={pricingData.addons[addon.key] > 0}
//                 onChange={() => {}}
//                 className='mt-0.5 w-4 h-4 text-blue-600'
//               />
//               <div className='flex-1'>
//                 <div className='flex justify-between items-center mb-1'>
//                   <span className='font-semibold text-xs text-slate-800'>{addon.label}</span>
//                   <span className='font-semibold text-xs text-blue-600'>
//                     +${addon.cost.toLocaleString()}
//                   </span>
//                 </div>
//                 <p className='text-xs text-slate-600 leading-tight'>{addon.desc}</p>
//               </div>
//             </div>
//           </div>
//         ))}
//       </div>
// 
//       {/* Manual Add-ons */}
//       <div>
//         <label className='text-xs font-medium text-slate-700 mb-2 block'>Custom Add-ons</label>
//         <div className='space-y-2'>
//           {pricingData.manualAddons.map((cost: number, index: number) => (
//             <div key={index} className='grid grid-cols-12 gap-2 items-center'>
//               <input
//                 type='text'
//                 placeholder='Description (e.g., Premium flooring)'
//                 className='col-span-8 px-2 py-2 border border-slate-200 rounded-lg text-xs'
//               />
//               <input
//                 type='number'
//                 value={cost || ''}
//                 onChange={e => handleManualAddonChange(index, e.target.value)}
//                 placeholder='0'
//                 className='col-span-3 px-2 py-2 border border-slate-200 rounded-lg text-xs text-right'
//               />
//               <button
//                 onClick={() => removeManualAddon(index)}
//                 className='col-span-1 w-7 h-7 border border-slate-200 rounded-lg bg-white text-slate-500 hover:bg-red-50 hover:text-red-600 hover:border-red-200 flex items-center justify-center text-xs transition-all'
//               >
//                 <X className='w-3 h-3' />
//               </button>
//             </div>
//           ))}
//           <button
//             onClick={addManualAddon}
//             className='w-full px-4 py-2 border border-dashed border-slate-300 rounded-lg bg-slate-50 text-slate-600 hover:border-blue-500 hover:text-blue-600 transition-colors text-xs flex items-center justify-center space-x-2'
//           >
//             <Plus className='w-3 h-3' />
//             <span>Add More</span>
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// }
// 
// // Pricing Card Component
// function PricingCard({ liveCalculation, pricingData }: any) {
//   return (
//     <div className='bg-white rounded-xl p-6 shadow-lg border border-slate-200'>
//       <div className='text-center mb-6'>
//         <div className='text-xs text-slate-600 mb-2'>Estimated Total</div>
//         <div className='text-2xl font-bold text-blue-600 transition-all duration-200'>
//           ${liveCalculation.finalTotal.toLocaleString()}
//         </div>
//         <div className='grid grid-cols-2 gap-3 mt-4'>
//           <div className='p-3 bg-slate-50 rounded-lg border border-slate-200'>
//             <div className='text-xs text-slate-600 font-medium mb-1'>Base Construction</div>
//             <div className='text-lg font-bold text-slate-700'>
//               ${pricingData.pricePerSqFt} per sq ft
//             </div>
//           </div>
//           <div className='p-3 bg-blue-50 rounded-lg border border-blue-200'>
//             <div className='text-xs text-blue-600 font-medium mb-1'>Total Project Cost</div>
//             <div className='text-lg font-bold text-blue-700'>
//               ${liveCalculation.pricePerSqFt} per sq ft
//             </div>
//           </div>
//         </div>
//       </div>
// 
//       <div className='space-y-2 mb-6'>
//         <div className='flex justify-between items-center text-xs'>
//           <span className='text-slate-600'>Base Construction</span>
//           <span className='font-semibold'>
//             ${liveCalculation.baseConstruction.toLocaleString()}
//           </span>
//         </div>
//         <div className='flex justify-between items-center text-xs'>
//           <span className='text-slate-600'>Design Services</span>
//           <span className='font-semibold'>${liveCalculation.servicesTotal.toLocaleString()}</span>
//         </div>
//         <div className='flex justify-between items-center text-xs'>
//           <span className='text-slate-600'>Utilities & Permits</span>
//           <span className='font-semibold'>${liveCalculation.utilitiesTotal.toLocaleString()}</span>
//         </div>
//         <div className='flex justify-between items-center text-xs'>
//           <span className='text-slate-600'>Add-ons</span>
//           <span className='font-semibold'>${liveCalculation.addonsTotal.toLocaleString()}</span>
//         </div>
//         <div className='flex justify-between items-center text-xs'>
//           <span className='text-slate-600'>Subtotal</span>
//           <span className='font-semibold'>${liveCalculation.subtotal.toLocaleString()}</span>
//         </div>
//         <div className='flex justify-between items-center text-xs'>
//           <span className='text-slate-600'>Contractor Markup (15%)</span>
//           <span className='font-semibold'>${liveCalculation.markup.toLocaleString()}</span>
//         </div>
//         <div className='flex justify-between items-center text-sm font-semibold pt-3 mt-3 border-t-2 border-slate-200'>
//           <span className='text-slate-800'>Total Investment</span>
//           <span className='text-blue-600'>${liveCalculation.finalTotal.toLocaleString()}</span>
//         </div>
//       </div>
//     </div>
//   );
// }
// 
// // Payment Schedule Card Component
// function PaymentScheduleCard({ liveCalculation }: any) {
//   const milestones = [
//     { number: 1, name: 'Mobilization', percentage: 20 },
//     { number: 2, name: 'Trenching & Underground Plumbing', percentage: 20 },
//     { number: 3, name: 'Foundation', percentage: 20 },
//     { number: 4, name: 'Framing', percentage: 15 },
//     { number: 5, name: 'Mechanical, Electrical, Plumbing (MEP)', percentage: 15 },
//     { number: 6, name: 'Drywall', percentage: 10 },
//     { number: 7, name: 'Property Final', percentage: 5 },
//   ];
// 
//   // Excel-style calculation: (Total - Design - Deposit) for construction amount
//   const deposit = 1000; // Fixed $1,000 deposit
//   const designAmount = 12500; // Design services (could be dynamic)
//   const constructionAmount = liveCalculation.finalTotal - designAmount - deposit;
// 
//   // Calculate milestones using Excel ROUND(amount, -3) formula
//   const calculateMilestone = (percentage: number, isLast: boolean = false) => {
//     if (isLast) {
//       // Final milestone: remainder to ensure exact total
//       const previousSum = milestones.slice(0, -1).reduce((sum, m) => {
//         const baseAmount = (constructionAmount * m.percentage) / 100;
//         return sum + Math.round(baseAmount / 1000) * 1000; // ROUND(amount, -3)
//       }, 0);
//       return constructionAmount - previousSum;
//     } else {
//       // Regular milestone: ROUND(percentage * constructionAmount / 100, -3)
//       const baseAmount = (constructionAmount * percentage) / 100;
//       return Math.round(baseAmount / 1000) * 1000; // ROUND(amount, -3)
//     }
//   };
// 
//   return (
//     <div className='bg-white rounded-xl p-4 shadow-md border border-slate-200'>
//       <h3 className='font-semibold text-slate-800 mb-3 text-sm'>Payment Milestones</h3>
//       <div className='space-y-2'>
//         {milestones.map((milestone, index) => {
//           const amount = calculateMilestone(milestone.percentage, index === milestones.length - 1);
//           return (
//             <div key={milestone.number} className='flex justify-between items-center text-xs'>
//               <div className='flex items-center space-x-2'>
//                 <span className='w-5 h-5 bg-slate-100 text-slate-600 rounded-full flex items-center justify-center text-xs font-semibold'>
//                   {milestone.number}
//                 </span>
//                 <span className='text-slate-800'>{milestone.name}</span>
//               </div>
//               <span className='font-semibold text-slate-800'>
//                 ${amount.toLocaleString()} ({milestone.percentage}%)
//               </span>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }
// 
// // Action Card Component
// function ActionCard() {
//   return (
//     <div className='bg-white rounded-xl p-4 shadow-md border border-slate-200'>
//       <button className='w-full px-4 py-3 bg-white text-slate-700 border border-slate-200 rounded-lg font-semibold text-xs flex items-center justify-center space-x-2 hover:bg-slate-50 transition-colors'>
//         <Eye className='w-4 h-4' />
//         <span>Preview Sample</span>
//       </button>
//     </div>
//   );
// }
// 
// // Trust Indicators Component
// function TrustIndicators() {
//   const indicators = [
//     { icon: <Shield className='w-3 h-3' />, text: 'Licensed & Insured' },
//     { icon: <Award className='w-3 h-3' />, text: '50+ ADUs Built' },
//     { icon: <Clock className='w-3 h-3' />, text: '4-6 Month Timeline' },
//   ];
// 
//   return (
//     <div className='bg-white rounded-xl p-4 shadow-md border border-slate-200'>
//       <div className='space-y-2'>
//         {indicators.map((indicator, index) => (
//           <div key={index} className='flex items-center space-x-2'>
//             <div className='w-6 h-6 bg-green-500 rounded-full flex items-center justify-center text-white'>
//               {indicator.icon}
//             </div>
//             <span className='text-xs font-medium text-slate-800'>{indicator.text}</span>
//           </div>
//         ))}
//       </div>
//     </div>
//   );
// }
// 
// Wrap App with Debug Profiler for complete performance monitoring
function ProfiledApp() {
  return (
    <DebugProfiler id="App">
      <App />
    </DebugProfiler>
  );
}

export default ProfiledApp;
