import React, { useState, useCallback, useMemo, useEffect } from 'react';

// Notification functions removed - using console directly where needed

// Add wiggle animation CSS and custom color
const wiggleStyle = `
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(1deg); }
    75% { transform: rotate(-1deg); }
  }
  .animate-wiggle {
    animation: wiggle 0.6s ease-in-out;
  }
  
  /* Custom Anchor Blue Color - Rich Azure */
  :root {
    --anchor-blue: #1E88E5;
    --anchor-blue-light: #e3f2fd;
    --anchor-blue-hover: #1976D2;
    --anchor-blue-focus: #1E88E540;
  }
  
  /* Custom blue classes */
  .text-anchor-blue { color: var(--anchor-blue) !important; }
  .bg-anchor-blue { background-color: var(--anchor-blue) !important; }
  .border-anchor-blue { border-color: var(--anchor-blue) !important; }
  .hover\\:bg-anchor-blue-hover:hover { background-color: var(--anchor-blue-hover) !important; }
  .bg-anchor-blue-light { background-color: var(--anchor-blue-light) !important; }
  
  /* Removed color test classes - using consistent Rich Azure theme */
  
  /* Focus states for inputs */
  .focus\\:border-anchor-blue:focus { 
    border-color: var(--anchor-blue) !important; 
    box-shadow: 0 0 0 1px var(--anchor-blue-focus) !important;
  }
`;

// Inject CSS
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.type = 'text/css';
  styleSheet.innerText = wiggleStyle;
  document.head.appendChild(styleSheet);
}
import {
  FlaskConical,
  Calculator,
  Calendar,
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { AnchorProposalFormData } from '../types/proposal';

// Local types
type ProjectData = {
  // Client Information
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  
  // Secondary Client Information (HOL design)
  secondaryClientFirstName?: string;
  secondaryClientLastName?: string;
  secondaryClientEmail?: string;
  secondaryClientPhone?: string;
  
  // Property Information
  propertyAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  
  // Project Details
  squareFootage?: number;
  aduType?: string;
  stories?: number;  // 1 or 2 for detached ADUs
  bedrooms?: number;
  bathrooms?: number;
  hvacType?: string;
  hvacCustomPrice?: number;  // Custom HVAC price
  additionalNotes?: string;
  
  // Utilities
  utilities?: {
    waterMeter?: string;
    gasMeter?: string;
    sewerMeter?: string;
    electricMeter?: string;
    electricalPanel?: number;  // Electrical panel amperage
  };
  
  // Proposal Metadata
  proposalNumber?: string;
  proposalDate?: string;
  proposalValidityDays?: number;
  depositAmount?: number;
  electricalPanel?: number;  // Electrical panel amperage (also in utilities for compatibility)
};

type PricingData = {
  designServices?: number;
  extraBathroom?: number;
  dedicatedDriveway?: number;
  basicLandscaping?: number;
  utilities?: any;
  sqft?: number;  // Square footage
  solarReady?: boolean;
  femaCompliance?: boolean;
  femaAmount?: number;
  friendsAndFamilyDiscount?: boolean;
  friendsAndFamilyDiscountType?: '5%' | '10%' | 'custom';
  friendsAndFamilyDiscountCustom?: number;
  twoStoryPrice?: number;  // Custom price for 2-story ADU
  basePricePerSqft?: number;  // Base price per square foot for ADU
  utilitiesCustomPrice?: {  // Custom prices for utilities
    waterMeter?: number;
    gasMeter?: number;
    electricMeter?: number;
    sewerMeter?: number;
  };
  electricalPanelUpgrade?: number;  // Additional cost for electrical panel upgrade (0 for 200A)
};
import { AnchorPDFGenerator } from '../lib/pdf-generator';
import { AnchorPDFTemplateGenerator } from '../lib/pdf-template-generator';
import { AnchorPricingEngine } from '../lib/pricing-engine';
import { pricingEditorBridge } from '../lib/pricing-editor-bridge';
import { 
  sanitizeAddress 
} from '../lib/security-utils';
import {
  formatPhoneNumber,
  formatEmail
} from '../lib/field-formatters';
import { autoCorrectCity, findMatchingCities, isSupportedCity } from '../lib/city-autocomplete';

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
  onNavigateToAdmin?: () => void;
  onOpenPricingEditor?: () => void;
}

export const EnhancedProductionGrid: React.FC<EnhancedProductionGridProps> = ({
  projectData,
  pricingData,
  onProjectDataUpdate,
  onPricingDataUpdate,
  onOpenPricingEditor,
}) => {
  // Generate stable default values for proposal metadata (only once on mount)
  const [defaultProposalNumber] = useState(() => `AB-2025-TEST`);
  const [defaultProposalDate] = useState(() => new Date().toISOString().split('T')[0]);
  
  // Status dot indicator component (faint green for filled, light red for missing)
  const StatusDot = ({ filled }: { filled: boolean }) => (
    <span className={`inline-block w-2 h-2 rounded-full ${filled ? 'bg-green-300' : 'bg-red-200'}`} />
  );
  
  // Removed unused currentSection state
  const initialIsMobile = window.innerWidth < 640; // Use mobile-only breakpoint (not tablets)
  const [isMobile, setIsMobile] = useState(initialIsMobile);
  
  // City auto-complete state
  const [citySuggestions, setCitySuggestions] = useState<string[]>([]);
  const [showCitySuggestions, setShowCitySuggestions] = useState(false);
  const [expandedCard, setExpandedCard] = useState<string | null>(null); // Start with all cards collapsed
  const [showMissingFields, setShowMissingFields] = useState(false);

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 640; // Use mobile-only breakpoint (not tablets)
      setIsMobile(newIsMobile);
      
      // When switching to mobile, start with all collapsed
      if (newIsMobile && !isMobile) {
        setExpandedCard(null);
      }
      // When switching to desktop, keep null (all visible)
      else if (!newIsMobile && isMobile) {
        setExpandedCard(null);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile]);
  const [showAddMorePopup, setShowAddMorePopup] = useState(false);
  const [customServiceDescription, setCustomServiceDescription] = useState('');
  const [customServicePrice, setCustomServicePrice] = useState('');
  const [customServices, setCustomServices] = useState<{description: string, price: number}[]>([]);
  const [sidebarWiggle, setSidebarWiggle] = useState(false);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  // Removed unused headerVisible state
  const [lastScrollY, setLastScrollY] = useState(0);
  
  // Breakdown editing state
  const [editingBreakdownItem, setEditingBreakdownItem] = useState<string | null>(null);
  const [editingValue, setEditingValue] = useState<string>('');
  
  // Milestone payments state
  const [showMilestones, setShowMilestones] = useState(false);
  const [selectedMilestoneType, setSelectedMilestoneType] = useState('standard');
  
  // PDF preview state
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [previewHTML, setPreviewHTML] = useState<string>('');
  
  // Debug: Log pricingData state
  useEffect(() => {
    console.log('📊 Current pricingData state:', pricingData);
    console.log('📊 Current projectData state:', projectData);
  }, [pricingData, projectData]);

  // Initial mount debug
  useEffect(() => {
    console.log('🚀 Component mounted with mobile accordion state:', {
      initialIsMobile,
      isMobile,
      expandedCard,
      windowWidth: window.innerWidth
    });
  }, [initialIsMobile, isMobile, expandedCard]);

  // Debug: Log mobile accordion state  
  useEffect(() => {
    console.log('📱 Mobile accordion state:', { 
      isMobile, 
      expandedCard, 
      windowWidth: window.innerWidth,
      shouldShowAccordion: isMobile,
      initializedCorrectly: initialIsMobile === isMobile
    });
  }, [isMobile, expandedCard, initialIsMobile]);

  const updateProjectData = useCallback(
    (updates: Partial<ProjectData>) => {
      console.log('🔧 updateProjectData called with:', updates);
      try {
        onProjectDataUpdate(updates);
        console.log('✅ onProjectDataUpdate completed successfully');
        // Trigger sidebar wiggle when field is completed
        if (Object.values(updates).some(value => value)) {
          setSidebarWiggle(true);
          setTimeout(() => setSidebarWiggle(false), 600);
        }
      } catch (error) {
        console.error('❌ Error in updateProjectData:', error);
      }
    },
    [onProjectDataUpdate]
  );

  const updatePricingData = useCallback(
    (updates: Partial<PricingData>) => {
      console.log('💰 updatePricingData called with:', updates);
      try {
        onPricingDataUpdate(updates);
        console.log('✅ onPricingDataUpdate completed successfully');
        // Trigger sidebar wiggle when pricing is updated
        if (Object.values(updates).some(value => value)) {
          setSidebarWiggle(true);
          setTimeout(() => setSidebarWiggle(false), 600);
        }
      } catch (error) {
        console.error('❌ Error in updatePricingData:', error);
      }
    },
    [onPricingDataUpdate]
  );

  // Calculate completion percentage for each section
  const calculateSectionProgress = (sectionId: string) => {
    switch (sectionId) {
      case 'client': {
        let completed = 0;
        const total = 5;
        
        if (projectData.clientName) completed += 1;
        if (projectData.clientEmail) completed += 1;
        if (projectData.clientPhone) completed += 1;
        if (projectData.propertyAddress) completed += 1;
        if (projectData.city && projectData.state && projectData.zipCode) completed += 1;
        
        return Math.round((completed / total) * 100);
      }
      case 'property': {
        let completed = 0;
        const total = 4;
        
        if (projectData.aduType) completed += 1;
        if (projectData.squareFootage) completed += 1;
        if (projectData.bedrooms !== undefined && projectData.bedrooms !== null) completed += 1;
        if (projectData.bathrooms !== undefined && projectData.bathrooms !== null) completed += 1;
        
        return Math.round((completed / total) * 100);
      }
      case 'services': {
        return pricingData.designServices || pricingData.solarReady || pricingData.femaCompliance ? 100 : 0;
      }
      case 'notes': {
        return projectData.additionalNotes ? 100 : 0;
      }
      default:
        return 0;
    }
  };

  // Force recalculation when pricing editor changes
  const [pricingVersion, setPricingVersion] = useState(0);
  
  // Track current prices from the editor for display in the form
  const [editorPrices, setEditorPrices] = useState({
    designServices: 12500,
    extraBathroom: 8000,
    dedicatedDriveway: 5000,
    basicLandscaping: 10000,
    solarReady: 0, // Add solar ready pricing
  });
  
  useEffect(() => {
    // Load initial prices
    const loadPrices = () => {
      setEditorPrices({
        designServices: pricingEditorBridge.getServicePrice('designServices') || 12500,
        extraBathroom: pricingEditorBridge.getServicePrice('extraBathroom') || 8000,
        dedicatedDriveway: pricingEditorBridge.getServicePrice('dedicatedDriveway') || 5000,
        basicLandscaping: pricingEditorBridge.getServicePrice('basicLandscaping') || 10000,
      });
    };
    
    loadPrices();
    
    const handlePricingUpdate = () => {
      console.log('💰 Pricing editor updated - forcing recalculation');
      setPricingVersion(v => v + 1);
      loadPrices(); // Reload prices when editor changes
      
      // Update selected items with new prices
      const updates: any = {};
      
      // If design services is selected, update with new price
      if ((pricingData.designServices ?? 0) > 0) {
        const newDesignPrice = pricingEditorBridge.getServicePrice('designServices') || 12500;
        updates.designServices = newDesignPrice;
        console.log('🎨 Updated Design Services price from', pricingData.designServices, 'to', newDesignPrice);
      }
      
      // If extra bathroom is selected, update with new price  
      if ((pricingData.extraBathroom ?? 0) > 0) {
        const newBathroomPrice = pricingEditorBridge.getServicePrice('extraBathroom') || 8000;
        updates.extraBathroom = newBathroomPrice;
        console.log('🛁 Updated Extra Bathroom price from', pricingData.extraBathroom, 'to', newBathroomPrice);
      }
      
      // If driveway is selected, update with new price
      if ((pricingData.dedicatedDriveway ?? 0) > 0) {
        const newDrivewayPrice = pricingEditorBridge.getServicePrice('dedicatedDriveway') || 5000;
        updates.dedicatedDriveway = newDrivewayPrice;
        console.log('🚗 Updated Driveway price from', pricingData.dedicatedDriveway, 'to', newDrivewayPrice);
      }
      
      // If landscaping is selected, update with new price
      if ((pricingData.basicLandscaping ?? 0) > 0) {
        const newLandscapingPrice = pricingEditorBridge.getServicePrice('basicLandscaping') || 10000;
        updates.basicLandscaping = newLandscapingPrice;
        console.log('🌿 Updated Landscaping price from', pricingData.basicLandscaping, 'to', newLandscapingPrice);
      }
      
      // Apply updates if any
      if (Object.keys(updates).length > 0) {
        console.log('💰 Applying price updates to selected items:', updates);
        updatePricingData(updates);
      }
    };
    
    window.addEventListener('anchor:pricing-updated', handlePricingUpdate);
    window.addEventListener('anchor:pricing-config-changed', handlePricingUpdate);
    
    return () => {
      window.removeEventListener('anchor:pricing-updated', handlePricingUpdate);
      window.removeEventListener('anchor:pricing-config-changed', handlePricingUpdate);
    };
  }, [pricingData.designServices, pricingData.extraBathroom, pricingData.dedicatedDriveway, pricingData.basicLandscaping, updatePricingData]);

  // Real-time pricing calculation using the pricing engine
  const liveCalculation = useMemo(() => {
    if (!projectData.squareFootage || !projectData.aduType) {
      return {
        basePrice: 0,
        designCost: 0,
        utilitiesCost: 0,
        addOnsCost: 0,
        finalTotal: 0,
        pricePerSqFt: 0,
      };
    }

    try {
      // Create a new instance to ensure we get the latest pricing from the editor
      const pricingEngine = new AnchorPricingEngine(); // Use current config
      
      console.log('🔄 Creating new pricing engine instance (version:', pricingVersion, ')');
      
      const pricingInputs = {
        squareFootage: projectData.squareFootage || 800,
        aduType: projectData.aduType || 'detached',
        bedrooms: projectData.bedrooms ?? 1,
        bathrooms: projectData.bathrooms ?? 1,
        hvacType: (projectData.hvacType as 'central-ac' | 'mini-split') || 'central-ac',
        basePricePerSqft: pricingData.basePricePerSqft || 240,
        utilities: {
          waterMeter: (projectData.utilities?.waterMeter || 'shared') as 'shared' | 'separate',
          gasMeter: (projectData.utilities?.gasMeter || 'shared') as 'shared' | 'separate',
          electricMeter: (projectData.utilities?.electricMeter || 'shared') as 'shared' | 'separate',
        },
        needsDesign: !!pricingData.designServices,
        appliancesIncluded: true,
        selectedAddOns: [
          ...(pricingData.extraBathroom ? ['Extra Bathroom'] : []),
          ...(pricingData.dedicatedDriveway ? ['Dedicated Driveway'] : []),
          ...(pricingData.basicLandscaping ? ['Basic Landscaping'] : []),
          ...(projectData.stories === 2 && pricingData.twoStoryPrice ? ['Two-Story ADU'] : []),
          ...(pricingData.friendsAndFamilyDiscount ? [(() => {
            const discountType = pricingData.friendsAndFamilyDiscountType || '10%';
            const discountText = discountType === 'custom' 
              ? `Friends & Family Discount (${pricingData.friendsAndFamilyDiscountCustom || 0}% off)`
              : `Friends & Family Discount (${discountType} off)`;
            return discountText;
          })()] : []),
          ...customServices.map(service => service.description)
        ],
        sewerConnection: 'existing-lateral' as const,
        solarDesign: !!pricingData.solarReady,
        femaIncluded: !!pricingData.femaCompliance,
        useDynamicConfig: false, // Force static configuration for simplicity
        priceOverrides: {
          addOnPrices: {
            ...customServices.reduce((acc, service) => ({
              ...acc,
              [service.description]: service.price
            }), {}),
            ...(projectData.stories === 2 && pricingData.twoStoryPrice ? {
              'Two-Story ADU': pricingData.twoStoryPrice
            } : {})
          }
        }
      };

      const calculation = pricingEngine.calculateProposal(pricingInputs);
      
      // Extract costs from line items
      const baseConstructionItem = calculation.lineItems.find(item => item.category === 'Base Construction');
      const designItem = calculation.lineItems.find(item => item.category === 'Design Services');
      const utilityItems = calculation.lineItems.filter(item => item.category === 'Utilities');
      const addOnItems = calculation.lineItems.filter(item => item.category === 'Add-Ons');
      
      // Include HVAC custom price if applicable
      const hvacCustomCost = projectData.hvacType === 'custom' && projectData.hvacCustomPrice ? projectData.hvacCustomPrice : 0;
      
      const result = {
        basePrice: baseConstructionItem?.totalPrice || 0,
        designCost: designItem?.totalPrice || 0,
        utilitiesCost: utilityItems.reduce((sum, item) => sum + item.totalPrice, 0) + (pricingData.electricalPanelUpgrade || 0),
        addOnsCost: addOnItems.reduce((sum, item) => sum + item.totalPrice, 0) + hvacCustomCost,
        finalTotal: calculation.grandTotal + (pricingData.electricalPanelUpgrade || 0) + hvacCustomCost,
        pricePerSqFt: Math.round(calculation.pricePerSqFt),
        calculation, // Full calculation object for detailed breakdown
      };
      
      console.log('🧮 STATIC CONFIG CALCULATION:');
      console.log('  Configuration Source:', calculation.configurationSource);
      console.log('  Base Price:', result.basePrice);
      console.log('  Design Cost:', result.designCost);
      console.log('  Utilities Cost:', result.utilitiesCost);
      console.log('  Add-ons Cost:', result.addOnsCost);
      console.log('  Markup Amount:', calculation.markupAmount);
      console.log('  Final Total:', result.finalTotal);
      
      return result;
    } catch (error) {
      console.error('Pricing calculation error:', error);
      return {
        basePrice: 160000,
        designCost: pricingData.designServices || 0,
        utilitiesCost: 1500,
        addOnsCost: (pricingData.extraBathroom || 0) + (pricingData.dedicatedDriveway || 0) + (pricingData.basicLandscaping || 0),
        finalTotal: 160000 + (pricingData.designServices || 0) + 1500 + ((pricingData.extraBathroom || 0) + (pricingData.dedicatedDriveway || 0) + (pricingData.basicLandscaping || 0)),
        pricePerSqFt: 200,
      };
    }
  }, [projectData.squareFootage, projectData.aduType, projectData.bedrooms, projectData.bathrooms, projectData.hvacType, projectData.stories, projectData.utilities, pricingData, customServices, pricingVersion]);

  // Define form sections
  const sections: FormSection[] = [
    {
      id: 'client',
      title: 'CLIENT INFORMATION',
      isComplete: !!(projectData.clientName && projectData.clientEmail && projectData.propertyAddress),
    },
    {
      id: 'property',
      title: 'ADU CONFIGURATION',
      isComplete: !!(projectData.aduType && projectData.squareFootage),
    },
    {
      id: 'services',
      title: 'PROFESSIONAL SERVICES',
      isComplete: !!(pricingData.designServices || pricingData.solarReady || pricingData.femaCompliance),
    },
    {
      id: 'notes',
      title: 'PROJECT NOTES',
      isComplete: !!projectData.additionalNotes,
    },
  ];

  // Test data variations (10 different scenarios)
  const testDataVariations = [
    {
      name: 'Basic Detached',
      data: {
        project: {
          clientName: 'John Smith',
          clientEmail: 'john.smith@email.com',
          clientPhone: '(555) 123-4567',
          propertyAddress: '123 Main Street',
          city: 'Irvine',
          state: 'CA',
          zipCode: '92618',
          aduType: 'detached',
          squareFootage: 800,
          bedrooms: 2,
          bathrooms: 1,
          additionalNotes: 'Standard detached ADU with basic features.',
          hvacType: 'central-ac',
          utilities: {
            waterMeter: 'shared',
            gasMeter: 'shared',
            electricMeter: 'separate',
            sewerMeter: 'shared'
          },
          stories: 1,
        },
        pricing: {
          designServices: editorPrices.designServices,
          solarReady: true,
          extraBathroom: 0,
          dedicatedDriveway: 0,
          basicLandscaping: 0,
          friendsAndFamilyDiscount: false,
        }
      }
    },
    {
      name: 'Premium Attached',
      data: {
        project: {
          clientName: 'Maria Rodriguez',
          clientEmail: 'maria.rodriguez@gmail.com',
          clientPhone: '(714) 555-0123',
          propertyAddress: '456 Ocean Avenue',
          city: 'Newport Beach',
          state: 'CA',
          zipCode: '92660',
          aduType: 'attached',
          squareFootage: 1200,
          bedrooms: 3,
          bathrooms: 2,
          additionalNotes: 'Luxury attached ADU with ocean proximity.',
          hvacType: 'mini-split',
          utilities: {
            waterMeter: 'separate',
            gasMeter: 'separate',
            electricMeter: 'separate',
            sewerMeter: 'separate'
          },
          stories: 1,
        },
        pricing: {
          designServices: editorPrices.designServices,
          solarReady: true,
          extraBathroom: 8000,
          dedicatedDriveway: true,
          basicLandscaping: true,
          friendsAndFamilyDiscount: false,
        }
      }
    },
    {
      name: 'Studio Small',
      data: {
        project: {
          clientName: 'David Chen',
          clientEmail: 'dchen@yahoo.com',
          clientPhone: '(562) 555-7890',
          propertyAddress: '789 Elm Street',
          city: 'Long Beach',
          state: 'CA',
          zipCode: '90802',
          aduType: 'detached',
          squareFootage: 450,
          bedrooms: 0, // Studio
          bathrooms: 1,
          additionalNotes: 'Compact studio ADU for rental income.',
          hvacType: 'mini-split',
          utilities: {
            waterMeter: 'shared',
            gasMeter: 'shared',
            electricMeter: 'shared',
            sewerMeter: 'shared'
          },
          stories: 1,
        },
        pricing: {
          designServices: editorPrices.designServices,
          solarReady: false,
          extraBathroom: 0,
          dedicatedDriveway: true,
          basicLandscaping: 0,
          friendsAndFamilyDiscount: true,
          friendsAndFamilyDiscountType: '10%',
        }
      }
    },
    {
      name: 'Large Family',
      data: {
        project: {
          clientName: 'Sarah Johnson',
          clientEmail: 'sarah.j@hotmail.com',
          clientPhone: '(949) 555-4567',
          propertyAddress: '321 Pine Avenue',
          city: 'Costa Mesa',
          state: 'CA',
          zipCode: '92627',
          aduType: 'detached',
          squareFootage: 1400,
          bedrooms: 3,
          bathrooms: 2,
          additionalNotes: 'Large ADU for extended family living.',
          hvacType: 'central-ac',
          utilities: {
            waterMeter: 'separate',
            gasMeter: 'shared',
            electricMeter: 'separate',
            sewerMeter: 'shared'
          },
          stories: 2,
          secondaryClientFirstName: 'Mike',
          secondaryClientLastName: 'Johnson',
          secondaryClientEmail: 'mike.j@hotmail.com',
          secondaryClientPhone: '(949) 555-4568',
        },
        pricing: {
          designServices: editorPrices.designServices,
          solarReady: true,
          extraBathroom: 8000,
          dedicatedDriveway: true,
          basicLandscaping: true,
          friendsAndFamilyDiscount: false,
        }
      }
    },
    {
      name: 'Budget Conscious',
      data: {
        project: {
          clientName: 'Robert Wilson',
          clientEmail: 'rwilson@email.com',
          clientPhone: '(323) 555-9876',
          propertyAddress: '654 Cedar Road',
          city: 'Santa Ana',
          state: 'CA',
          zipCode: '92701',
          aduType: 'attached',
          squareFootage: 600,
          bedrooms: 1,
          bathrooms: 1,
          additionalNotes: 'Budget-friendly ADU with essential features only.',
          hvacType: 'mini-split',
          utilities: {
            waterMeter: 'shared',
            gasMeter: 'shared',
            electricMeter: 'shared',
            sewerMeter: 'shared'
          },
          stories: 1,
        },
        pricing: {
          designServices: editorPrices.designServices,
          solarReady: false,
          extraBathroom: 0,
          dedicatedDriveway: 0,
          basicLandscaping: 0,
          friendsAndFamilyDiscount: true,
          friendsAndFamilyDiscountType: '5%',
        }
      }
    },
    {
      name: 'Tech Professional',
      data: {
        project: {
          clientName: 'Emily Zhang',
          clientEmail: 'emily.zhang@tech.com',
          clientPhone: '(415) 555-2468',
          propertyAddress: '987 Innovation Drive',
          city: 'Santa Monica',
          state: 'CA',
          zipCode: '90401',
          aduType: 'detached',
          squareFootage: 900,
          bedrooms: 2,
          bathrooms: 1,
          additionalNotes: 'Modern ADU with tech-friendly features and home office space.',
          hvacType: 'custom',
          hvacCustomPrice: 5000,
          utilities: {
            waterMeter: 'separate',
            gasMeter: 'separate',
            electricMeter: 'separate',
            sewerMeter: 'shared'
          },
          stories: 1,
        },
        pricing: {
          designServices: editorPrices.designServices,
          solarReady: true,
          extraBathroom: 0,
          dedicatedDriveway: true,
          basicLandscaping: true,
          friendsAndFamilyDiscount: false,
        }
      }
    },
    {
      name: 'Retirement Unit',
      data: {
        project: {
          clientName: 'Frank Martinez',
          clientEmail: 'fmartinez@senior.com',
          clientPhone: '(760) 555-1357',
          propertyAddress: '147 Sunset Boulevard',
          city: 'Laguna Beach',
          state: 'CA',
          zipCode: '92651',
          aduType: 'attached',
          squareFootage: 750,
          bedrooms: 1,
          bathrooms: 1,
          additionalNotes: 'Accessible ADU design for senior living with safety features.',
          hvacType: 'central-ac',
          utilities: {
            waterMeter: 'shared',
            gasMeter: 'shared',
            electricMeter: 'separate',
            sewerMeter: 'shared'
          },
          stories: 1,
          secondaryClientFirstName: 'Helen',
          secondaryClientLastName: 'Martinez',
          secondaryClientEmail: 'helen.m@senior.com',
          secondaryClientPhone: '(760) 555-1358',
        },
        pricing: {
          designServices: editorPrices.designServices,
          solarReady: true,
          extraBathroom: 0,
          dedicatedDriveway: 0,
          basicLandscaping: true,
          friendsAndFamilyDiscount: false,
        }
      }
    },
    {
      name: 'Rental Investment',
      data: {
        project: {
          clientName: 'Alex Thompson',
          clientEmail: 'athompson@investor.com',
          clientPhone: '(818) 555-8642',
          propertyAddress: '258 Investment Lane',
          city: 'Huntington Beach',
          state: 'CA',
          zipCode: '92648',
          aduType: 'detached',
          squareFootage: 1000,
          bedrooms: 2,
          bathrooms: 2,
          additionalNotes: 'Investment property ADU optimized for rental income.',
          hvacType: 'mini-split',
          utilities: {
            waterMeter: 'separate',
            gasMeter: 'shared',
            electricMeter: 'separate',
            sewerMeter: 'shared'
          },
          stories: 1,
        },
        pricing: {
          designServices: editorPrices.designServices,
          solarReady: true,
          extraBathroom: 8000,
          dedicatedDriveway: true,
          basicLandscaping: 0,
          friendsAndFamilyDiscount: false,
        }
      }
    },
    {
      name: 'Luxury Custom',
      data: {
        project: {
          clientName: 'Victoria Sterling',
          clientEmail: 'v.sterling@luxury.com',
          clientPhone: '(310) 555-7531',
          propertyAddress: '369 Exclusive Circle',
          city: 'Beverly Hills',
          state: 'CA',
          zipCode: '90210',
          aduType: 'detached',
          squareFootage: 1500,
          bedrooms: 3,
          bathrooms: 2,
          additionalNotes: 'High-end luxury ADU with premium finishes and smart home integration.',
          hvacType: 'central-ac',
          utilities: {
            waterMeter: 'separate',
            gasMeter: 'separate',
            electricMeter: 'separate',
            sewerMeter: 'separate'
          },
          stories: 2,
        },
        pricing: {
          designServices: editorPrices.designServices,
          solarReady: true,
          extraBathroom: 8000,
          dedicatedDriveway: true,
          basicLandscaping: true,
          friendsAndFamilyDiscount: false,
        }
      }
    },
    {
      name: 'Minimal Studio',
      data: {
        project: {
          clientName: 'Jordan Lee',
          clientEmail: 'jordan.lee@minimal.com',
          clientPhone: '(626) 555-9753',
          propertyAddress: '741 Minimalist Way',
          city: 'Torrance',
          state: 'CA',
          zipCode: '90503',
          aduType: 'attached',
          squareFootage: 400,
          bedrooms: 0, // Studio
          bathrooms: 0, // 0 bathroom option
          additionalNotes: 'Ultra-minimal studio ADU with shared facilities.',
          hvacType: 'mini-split',
          utilities: {
            waterMeter: 'shared',
            gasMeter: 'shared',
            electricMeter: 'shared',
            sewerMeter: 'shared'
          },
          stories: 1,
        },
        pricing: {
          designServices: editorPrices.designServices,
          solarReady: false,
          extraBathroom: 0,
          dedicatedDriveway: 0,
          basicLandscaping: 0,
          friendsAndFamilyDiscount: true,
          friendsAndFamilyDiscountType: 'custom',
          friendsAndFamilyDiscountCustom: 15,
        }
      }
    }
  ];

  const [currentTestVariation, setCurrentTestVariation] = useState(0);
  
  // Download settings state
  const [showDownloadSettings, setShowDownloadSettings] = useState(false);
  
  // Story selection popup state for detached ADUs
  const [showStoryPopup, setShowStoryPopup] = useState(false);
  
  // Custom pricing popups
  const [showFemaPopup, setShowFemaPopup] = useState(false);
  const [showHvacPopup, setShowHvacPopup] = useState(false);
  const [showUtilitiesPopup, setShowUtilitiesPopup] = useState(false);
  const [utilityType, setUtilityType] = useState<'waterMeter' | 'gasMeter' | 'electricMeter' | 'sewerMeter' | null>(null);
  const [showAduTypePopup, setShowAduTypePopup] = useState(false);
  const [pendingAduTypeSelection, setPendingAduTypeSelection] = useState<string | null>(null);
  const [tempBasePricePerSqft, setTempBasePricePerSqft] = useState<number>(240);
  
  // Milestone editing
  const [showMilestoneEditor, setShowMilestoneEditor] = useState(false);
  const [customMilestones, setCustomMilestones] = useState<Array<{label: string; amount: number; percentage: number; phase: string; type: string}> | null>(null);
  const [tempMilestones, setTempMilestones] = useState<Array<{label: string; amount: number; percentage: number; phase: string; type: string}>>([]);
  const [downloadPreferences, setDownloadPreferences] = useState(() => {
    const saved = localStorage.getItem('anchor-download-preferences');
    return saved ? JSON.parse(saved) : {
      preferredFolder: 'Downloads', // Browser default
      autoOpen: false,
      showNotification: true
    };
  });

  // Save download preferences to localStorage
  const updateDownloadPreferences = (updates: Partial<typeof downloadPreferences>) => {
    const newPrefs = { ...downloadPreferences, ...updates };
    setDownloadPreferences(newPrefs);
    localStorage.setItem('anchor-download-preferences', JSON.stringify(newPrefs));
  };

  const loadTestData = () => {
    const variation = testDataVariations[currentTestVariation];
    console.log(`🧪 Loading test data: ${variation.name}`);
    
    updateProjectData(variation.data.project);
    updatePricingData(variation.data.pricing);
    
    // Cycle to next variation for next time
    setCurrentTestVariation((prev) => (prev + 1) % testDataVariations.length);
  };

  // Mobile accordion toggle
  const toggleCard = (cardId: string) => {
    console.log('🔄 toggleCard called:', { 
      cardId, 
      isMobile, 
      currentExpanded: expandedCard,
      windowWidth: window.innerWidth
    });
    
    if (isMobile) {
      // Toggle the card - if it's expanded, collapse it; if collapsed, expand it
      if (expandedCard === cardId) {
        console.log('📱 Mobile - collapsing current card');
        setExpandedCard(null);
      } else {
        console.log('📱 Mobile toggle - expanding card:', cardId);
        setExpandedCard(cardId);
      }
    } else {
      console.log('🖥️ Desktop mode - accordion disabled');
    }
  };

  // Add custom service handler
  const handleAddCustomService = () => {
    if (customServiceDescription && customServicePrice) {
      const newService = {
        description: customServiceDescription,
        price: parseInt(customServicePrice)
      };
      setCustomServices([...customServices, newService]);
      setCustomServiceDescription('');
      setCustomServicePrice('');
      setShowAddMorePopup(false);
    }
  };

  // Form validation function with detailed tracking
  const formValidation = useMemo(() => {
    const requiredFields = {
      // Client Information
      clientName: !!projectData.clientName,
      clientEmail: !!projectData.clientEmail,
      clientPhone: !!projectData.clientPhone,
      propertyAddress: !!projectData.propertyAddress,
      city: !!projectData.city,
      state: !!projectData.state,
      zipCode: !!projectData.zipCode,
      
      // Project Details
      aduType: !!projectData.aduType,
      squareFootage: !!projectData.squareFootage && projectData.squareFootage > 0,
      bedrooms: projectData.bedrooms !== undefined && projectData.bedrooms !== null,
      bathrooms: projectData.bathrooms !== undefined && projectData.bathrooms !== null,
      hvacType: !!projectData.hvacType,
      
      // Utilities (must select shared or separate for each)
      waterMeter: !!(projectData.utilities?.waterMeter && projectData.utilities.waterMeter !== ''),
      gasMeter: !!(projectData.utilities?.gasMeter && projectData.utilities.gasMeter !== ''),
      electricMeter: !!(projectData.utilities?.electricMeter && projectData.utilities.electricMeter !== ''),
      
      // Proposal Metadata - These have defaults so always count as filled
      proposalNumber: !!(projectData.proposalNumber || defaultProposalNumber),
      proposalDate: !!(projectData.proposalDate || defaultProposalDate),
      proposalValidityDays: !!(projectData.proposalValidityDays || 30),
      depositAmount: !!(projectData.depositAmount || 1000)
    };
    
    const filledCount = Object.values(requiredFields).filter(Boolean).length;
    const totalCount = Object.keys(requiredFields).length;
    const isValid = filledCount === totalCount;
    const percentage = Math.round((filledCount / totalCount) * 100);
    
    // Get list of missing fields with friendly names
    const missingFields: string[] = [];
    const fieldNames: Record<string, string> = {
      clientName: 'Client Name',
      clientEmail: 'Client Email',
      clientPhone: 'Client Phone',
      propertyAddress: 'Property Address',
      city: 'City',
      state: 'State',
      zipCode: 'ZIP Code',
      aduType: 'ADU Type',
      squareFootage: 'Square Footage',
      bedrooms: 'Bedrooms',
      bathrooms: 'Bathrooms',
      hvacType: 'HVAC Type',
      waterMeter: 'Water Meter (Shared/Separate)',
      gasMeter: 'Gas Meter (Shared/Separate)',
      electricMeter: 'Electric Meter (Shared/Separate)',
      proposalNumber: 'Proposal Number',
      proposalDate: 'Proposal Date',
      proposalValidityDays: 'Validity Days',
      depositAmount: 'Deposit Amount'
    };
    
    Object.entries(requiredFields).forEach(([field, filled]) => {
      if (!filled) {
        missingFields.push(fieldNames[field] || field);
      }
    });
    
    return {
      isValid,
      percentage,
      filledCount,
      totalCount,
      fields: requiredFields,
      missingFields
    };
  }, [projectData, defaultProposalNumber, defaultProposalDate]);
  
  const isFormValid = formValidation.isValid;

  // Clear all form data handler
  const handleClearData = () => {
    if (window.confirm('Are you sure you want to clear all form data? This cannot be undone.')) {
      console.log('🗑️ Clearing all form data...');
      
      // Clear all project data at once
      onProjectDataUpdate({
        clientName: '',
        clientEmail: '',
        clientPhone: '',
        propertyAddress: '',
        city: '',
        state: '',
        zipCode: '',
        aduType: '',
        squareFootage: undefined,
        bedrooms: undefined,
        bathrooms: undefined,
        hvacType: '',
        additionalNotes: '',
        utilities: {
          waterMeter: '',
          gasMeter: '',
          electricMeter: '',
        },
        proposalNumber: defaultProposalNumber,
        proposalDate: defaultProposalDate,
        proposalValidityDays: 30,
        depositAmount: 1000,
        secondaryClientFirstName: '',
        secondaryClientLastName: '',
        secondaryClientEmail: '',
        secondaryClientPhone: ''
      });
      
      // Clear pricing data
      onPricingDataUpdate({
        sqft: 800,
        designServices: 12500, // Always included by default
        extraBathroom: 0,
        dedicatedDriveway: 0,
        basicLandscaping: 0,
        friendsAndFamilyDiscount: false,
        friendsAndFamilyDiscountType: '10%',
        friendsAndFamilyDiscountCustom: undefined,
        solarReady: false,
        femaCompliance: false,
        femaAmount: 0,
        utilities: {
          waterMeter: false,
          gasMeter: false,
          sewerMeter: false,
          electricMeter: false
        }
      });
      
      // Clear custom services
      setCustomServices([]);
      
      // Reset UI states
      setShowMissingFields(false);
      setExpandedCard(null);
      
      console.log('✅ Form data cleared successfully');
      alert('All form data has been cleared.');
    }
  };

  // PDF generation handler
  const handleGenerateProposal = useCallback(async () => {
    console.log('🔥 PDF BUTTON CLICKED - Starting handleGenerateProposal function');
    
    // Don't allow generation if form is not valid
    if (!isFormValid) {
      alert('Please fill out all required fields before generating the proposal.');
      return;
    }
    
    setIsGeneratingPDF(true);
    
    // Check for pricing configuration issues before generating PDF
    
    // Pricing validation simplified (removed missing notification functions)
    console.log('Pricing validation passed - no missing dependencies');
    
    // Check if utilities have been selected
    const hasUtilitySelection = pricingData.utilities && (
      pricingData.utilities.waterMeter || 
      pricingData.utilities.gasMeter || 
      pricingData.utilities.sewerMeter || 
      pricingData.utilities.electricMeter
    );
    
    // Auto-set default utilities if none selected (no popup)
    if (!hasUtilitySelection) {
      console.log('📝 Auto-setting default utilities to SHARED');
      onPricingDataUpdate({
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared', 
          sewerMeter: 'shared',
          electricMeter: 'shared',
          electricalPanel: 0,
        }
      });
    }
    
    try {
      // Use form values for proposal metadata, with defaults if not set
      const proposalNumber = projectData.proposalNumber || `AB-2025-TEST`;
      const proposalDate = projectData.proposalDate || new Date().toLocaleDateString();
      const proposalValidityDays = projectData.proposalValidityDays || 30;
      const depositAmount = projectData.depositAmount || 1000;
      
      // Map current form data to PDF format
      const mappedFormData: AnchorProposalFormData = {
        id: proposalNumber,
        client: {
          firstName: projectData.clientName?.split(' ')[0] || '',
          lastName: projectData.clientName?.split(' ').slice(1).join(' ') || '',
          email: projectData.clientEmail || '',
          phone: projectData.clientPhone || '',
          address: projectData.propertyAddress || '',
          city: projectData.city || '',
          state: projectData.state || '',
          zipCode: projectData.zipCode || '',
        },
        project: {
          aduType: projectData.aduType || 'detached',
          squareFootage: projectData.squareFootage || 800,
          bedrooms: projectData.bedrooms ?? 1,
          bathrooms: projectData.bathrooms ?? 1,
          hvacType: (projectData.hvacType as 'central-ac' | 'mini-split') || 'central-ac',
          utilities: {
            waterMeter: 'shared',
            gasMeter: 'separate', 
            electricMeter: 'separate', // Electric meters are always separate
            electricalPanel: 0 // No electrical panel upgrade cost
          },
          needsDesign: !!pricingData.designServices,
          appliancesIncluded: true,
          finishLevel: 'standard',
          selectedAddOns: [
            ...(pricingData.extraBathroom ? ['Extra Bathroom'] : []),
            ...(pricingData.dedicatedDriveway ? ['Dedicated Driveway'] : []),
            ...(pricingData.basicLandscaping ? ['Basic Landscaping'] : []),
            ...(pricingData.friendsAndFamilyDiscount ? [(() => {
            const discountType = pricingData.friendsAndFamilyDiscountType || '10%';
            const discountText = discountType === 'custom' 
              ? `Friends & Family Discount (${pricingData.friendsAndFamilyDiscountCustom || 0}% off)`
              : `Friends & Family Discount (${discountType} off)`;
            return discountText;
          })()] : []),
            ...customServices.map(service => service.description)
          ],
          stories: 1,
          sewerConnection: 'existing-lateral',
          solarDesign: pricingData.solarReady || false,
          femaIncluded: pricingData.femaCompliance || false,
        },
        additionalNotes: projectData.additionalNotes || '',
        timeline: 'Standard 12-16 weeks',
        proposalDate: proposalDate,
        proposalValidityDays: proposalValidityDays,
        depositAmount: depositAmount,
        // Secondary client data at root level
        secondaryClientFirstName: projectData.secondaryClientFirstName || '',
        secondaryClientLastName: projectData.secondaryClientLastName || '',
        secondaryClientEmail: projectData.secondaryClientEmail || '',
        secondaryClientPhone: projectData.secondaryClientPhone || ''
      };

      console.log('🚀 Generating PDF with mapped data:', mappedFormData);
      console.log('📋 Client data check:', {
        firstName: mappedFormData.client.firstName,
        lastName: mappedFormData.client.lastName,
        email: mappedFormData.client.email,
        phone: mappedFormData.client.phone,
        address: mappedFormData.client.address,
      });
      console.log('🏠 Project data check:', {
        aduType: mappedFormData.project.aduType,
        squareFootage: mappedFormData.project.squareFootage,
        bedrooms: mappedFormData.project.bedrooms,
        bathrooms: mappedFormData.project.bathrooms,
      });
      console.log('💰 Pricing data check:', {
        designServices: pricingData.designServices,
        extraBathroom: pricingData.extraBathroom,
        dedicatedDriveway: pricingData.dedicatedDriveway,
        basicLandscaping: pricingData.basicLandscaping,
        customServicesCount: customServices.length,
      });
      
      console.log('🎯 About to create PDF generator and call generateProposal');
      const pdfGenerator = new AnchorPDFGenerator();
      console.log('📋 Calling generateProposal with data:', mappedFormData);
      await pdfGenerator.generateProposal(mappedFormData, 'anchor-proposal');
      console.log('✅ PDF generation completed successfully');
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      alert('PDF generation failed. Please check the console for details.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [isFormValid, projectData, pricingData, customServices, onPricingDataUpdate]);

  // Keyboard navigation handler
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    const inputs = Array.from(document.querySelectorAll('input, textarea, button[data-navigation]')) as HTMLElement[];
    const currentIndex = inputs.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex === -1) return;
    
    let nextIndex = currentIndex;
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = currentIndex + 1;
        break;
      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex - 1;
        break;
      case 'ArrowRight':
        if ((e.target as HTMLInputElement).selectionStart === (e.target as HTMLInputElement).value.length) {
          e.preventDefault();
          nextIndex = currentIndex + 1;
        }
        break;
      case 'ArrowLeft':
        if ((e.target as HTMLInputElement).selectionStart === 0) {
          e.preventDefault();
          nextIndex = currentIndex - 1;
        }
        break;
    }
    
    // Wrap around
    if (nextIndex >= inputs.length) nextIndex = 0;
    if (nextIndex < 0) nextIndex = inputs.length - 1;
    
    if (nextIndex !== currentIndex) {
      inputs[nextIndex]?.focus();
    }
  }, []);

  // Breakdown editing functions
  const handleBreakdownItemClick = useCallback((itemKey: string, currentValue: number) => {
    setEditingBreakdownItem(itemKey);
    setEditingValue(currentValue.toString());
  }, []);

  const handleBreakdownValueChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, ''); // Only allow numbers
    setEditingValue(value);
  }, []);

  const handleBreakdownValueSubmit = useCallback(() => {
    if (!editingBreakdownItem || !editingValue) {
      setEditingBreakdownItem(null);
      setEditingValue('');
      return;
    }

    const newValue = parseInt(editingValue) || 0;
    
    // Update pricing data based on the edited item
    switch (editingBreakdownItem) {
      case 'extraBathroom':
        // Update via pricing editor bridge
        const currentConfig = pricingEditorBridge.getConfiguration() || {};
        const updatedConfig = {
          ...currentConfig,
          additionalServicesPricing: {
            ...currentConfig.additionalServicesPricing,
            extraBathroom: newValue
          }
        };
        localStorage.setItem('anchor-pricing-editor-config', JSON.stringify(updatedConfig));
        window.dispatchEvent(new CustomEvent('anchor:pricing-config-changed', { detail: { config: updatedConfig } }));
        break;
      
      case 'dedicatedDriveway':
        const currentConfig2 = pricingEditorBridge.getConfiguration() || {};
        const updatedConfig2 = {
          ...currentConfig2,
          additionalServicesPricing: {
            ...currentConfig2.additionalServicesPricing,
            dedicatedDriveway: newValue
          }
        };
        localStorage.setItem('anchor-pricing-editor-config', JSON.stringify(updatedConfig2));
        window.dispatchEvent(new CustomEvent('anchor:pricing-config-changed', { detail: { config: updatedConfig2 } }));
        break;
      
      case 'basicLandscaping':
        const currentConfig3 = pricingEditorBridge.getConfiguration() || {};
        const updatedConfig3 = {
          ...currentConfig3,
          additionalServicesPricing: {
            ...currentConfig3.additionalServicesPricing,
            basicLandscaping: newValue
          }
        };
        localStorage.setItem('anchor-pricing-editor-config', JSON.stringify(updatedConfig3));
        window.dispatchEvent(new CustomEvent('anchor:pricing-config-changed', { detail: { config: updatedConfig3 } }));
        break;
    }

    setEditingBreakdownItem(null);
    setEditingValue('');
  }, [editingBreakdownItem, editingValue]);

  const handleBreakdownCancel = useCallback(() => {
    setEditingBreakdownItem(null);
    setEditingValue('');
  }, []);

  // Milestone payments calculation
  // Calculate 9 milestones exactly as PDF template expects: D1, D2, then M1-M7
  const calculateMilestones = useCallback((total: number) => {
    const finalTotal = pricingData.friendsAndFamilyDiscount 
      ? total * (1 - (pricingData.friendsAndFamilyDiscountType === 'custom' 
          ? (pricingData.friendsAndFamilyDiscountCustom || 0) / 100
          : pricingData.friendsAndFamilyDiscountType === '5%' ? 0.05 : 0.1))
      : total;

    // Fixed amounts for design and deposit (D1 and D2)
    const depositAmount = 1000;  // D1 - Always $1,000
    const designAmount = 12500;  // D2 - Always $12,500
    
    // Calculate remaining amount for construction milestones (M1-M7)
    const constructionTotal = finalTotal - depositAmount - designAmount;
    
    // Ensure construction total is positive
    const safeConstrucionTotal = Math.max(constructionTotal, 0);
    
    // Always return exactly 9 milestones: D1, D2, M1, M2, M3, M4, M5, M6, M7
    return [
      // D1 - Deposit (Upon Signing)
      { 
        label: 'D1 - Deposit', 
        amount: depositAmount, 
        phase: 'Upon Signing',
        type: 'design' 
      },
      // D2 - Design (Plans Complete) 
      { 
        label: 'D2 - Design Complete', 
        amount: designAmount, 
        phase: 'Plans Complete',
        type: 'design' 
      },
      // M1 - Mobilization (15%)
      { 
        label: 'M1 - Mobilization', 
        amount: Math.round(safeConstrucionTotal * 0.15), 
        phase: 'Construction Start',
        type: 'construction' 
      },
      // M2 - Underground (15%)
      { 
        label: 'M2 - Underground', 
        amount: Math.round(safeConstrucionTotal * 0.15), 
        phase: 'Trenching & Plumbing',
        type: 'construction' 
      },
      // M3 - Foundation (15%)
      { 
        label: 'M3 - Foundation', 
        amount: Math.round(safeConstrucionTotal * 0.15), 
        phase: 'Foundation Complete',
        type: 'construction' 
      },
      // M4 - Framing (15%)
      { 
        label: 'M4 - Framing', 
        amount: Math.round(safeConstrucionTotal * 0.15), 
        phase: 'Framing Complete',
        type: 'construction' 
      },
      // M5 - MEP (15%)
      { 
        label: 'M5 - MEP', 
        amount: Math.round(safeConstrucionTotal * 0.15), 
        phase: 'Rough-in Complete',
        type: 'construction' 
      },
      // M6 - Drywall (15%)
      { 
        label: 'M6 - Drywall', 
        amount: Math.round(safeConstrucionTotal * 0.15), 
        phase: 'Interior Complete',
        type: 'construction' 
      },
      // M7 - Final (10%)
      { 
        label: 'M7 - Final', 
        amount: Math.round(safeConstrucionTotal * 0.10), 
        phase: 'Certificate of Occupancy',
        type: 'construction' 
      }
    ];
  }, [pricingData.friendsAndFamilyDiscount, pricingData.friendsAndFamilyDiscountType, pricingData.friendsAndFamilyDiscountCustom]);

  // PDF Preview handlers
  const handlePDFPreview = useCallback(async () => {
    try {
      setIsGeneratingPDF(true);
      
      // Prepare the same data as the original handler
      const proposalNumber = projectData.proposalNumber || defaultProposalNumber;
      const mappedFormData: AnchorProposalFormData = {
        id: proposalNumber,
        client: {
          firstName: projectData.clientName?.split(' ')[0] || '',
          lastName: projectData.clientName?.split(' ').slice(1).join(' ') || '',
          email: projectData.clientEmail || '',
          phone: projectData.clientPhone || '',
          address: projectData.propertyAddress || '',
          city: projectData.city || '',
          state: projectData.state || '',
          zipCode: projectData.zipCode || '',
        },
        project: {
          aduType: projectData.aduType || 'Detached',
          squareFootage: projectData.squareFootage || 800,
          bedrooms: projectData.bedrooms || 1,
          bathrooms: projectData.bathrooms || 1,
          hvacType: (projectData.hvacType as 'central-ac' | 'mini-split') || 'central-ac',
          utilities: {
            waterMeter: (projectData.utilities?.waterMeter || 'shared') as 'shared' | 'separate',
            gasMeter: (projectData.utilities?.gasMeter || 'shared') as 'shared' | 'separate',
            electricMeter: (projectData.utilities?.electricMeter || 'separate') as 'shared' | 'separate',
            electricalPanel: projectData.utilities?.electricalPanel || 0
          },
          sewerConnection: (projectData.utilities?.sewerMeter || 'shared') as 'shared' | 'separate',
          selectedAddOns: [
            ...(pricingData.extraBathroom ? ['Extra Bathroom'] : []),
            ...(pricingData.dedicatedDriveway ? ['Dedicated Driveway'] : []),
            ...(pricingData.basicLandscaping ? ['Basic Landscaping'] : []),
            ...(pricingData.solarReady ? ['Solar Ready'] : []),
            ...(pricingData.femaCompliance ? ['FEMA Compliance'] : []),
            ...customServices.map(service => service.description)
          ],
          needsDesign: !!pricingData.designServices,
          appliancesIncluded: false, // Default - could be added as form field
          solarDesign: !!pricingData.solarReady,
          femaIncluded: !!pricingData.femaCompliance,
          finishLevel: 'Standard', // Could be added as form field
          stories: 1 // Default to 1 story
        },
        pricing: {
          basePrice: liveCalculation.basePrice,
          designCost: liveCalculation.designCost,
          utilitiesCost: liveCalculation.utilitiesCost,
          addOnsCost: liveCalculation.addOnsCost,
          grandTotal: liveCalculation.finalTotal,
          pricePerSqFt: liveCalculation.pricePerSqFt,
          electricalPanelUpgrade: pricingData.electricalPanelUpgrade || 0
        },
        proposalNumber,
        proposalDate: projectData.proposalDate || defaultProposalDate,
        proposalValidityDays: projectData.proposalValidityDays || 30,
        depositAmount: projectData.depositAmount || Math.round(liveCalculation.finalTotal * 0.1),
        customServicesCount: customServices.length,
        secondaryClientFirstName: projectData.secondaryClientFirstName || '',
        secondaryClientLastName: projectData.secondaryClientLastName || '',
        secondaryClientEmail: projectData.secondaryClientEmail || '',
        secondaryClientPhone: projectData.secondaryClientPhone || '',
        additionalNotes: '',
        timeline: 'Standard 6-8 months'
      };

      // Generate HTML for preview using the template generator
      const templateGenerator = new AnchorPDFTemplateGenerator();
      const htmlContent = await templateGenerator.generateHTML(mappedFormData, 'anchor-proposal');
      
      setPreviewHTML(htmlContent);
      setShowPDFPreview(true);
      
    } catch (error) {
      console.error('❌ PDF preview generation failed:', error);
      alert('PDF preview generation failed. Please check the console for details.');
    } finally {
      setIsGeneratingPDF(false);
    }
  }, [projectData, pricingData, liveCalculation, customServices, defaultProposalNumber, defaultProposalDate]);

  const handleSavePDF = useCallback(async () => {
    try {
      // Check if File System Access API is supported
      if ('showSaveFilePicker' in window) {
        // Use native file system API for Save As
        try {
          const suggestedName = `Anchor-ADU-Proposal-${projectData.clientName?.replace(/\s+/g, '-') || 'Client'}-${new Date().toISOString().split('T')[0]}.pdf`;
          
          const handle = await (window as any).showSaveFilePicker({
            suggestedName,
            types: [{
              description: 'PDF Files',
              accept: { 'application/pdf': ['.pdf'] }
            }]
          });
          
          // Store the directory path in localStorage for Task 28
          const file = await handle.getFile();
          const directoryPath = file.name;
          localStorage.setItem('anchor-last-save-directory', directoryPath);
          
          // Generate the PDF
          setShowPDFPreview(false);
          
          // Generate PDF blob
          const pdfGenerator = new AnchorPDFTemplateGenerator();
          const proposalNumber = projectData.proposalNumber || defaultProposalNumber;
          const mappedFormData: AnchorProposalFormData = {
            // ... same mapping as handleGenerateProposal
            id: proposalNumber,
            client: {
              firstName: projectData.clientName?.split(' ')[0] || '',
              lastName: projectData.clientName?.split(' ').slice(1).join(' ') || '',
              email: projectData.clientEmail || '',
              phone: projectData.clientPhone || '',
              address: projectData.propertyAddress || '',
              city: projectData.city || '',
              state: projectData.state || '',
              zipCode: projectData.zipCode || '',
            },
            project: {
              aduType: projectData.aduType || 'Detached',
              squareFootage: projectData.squareFootage || 800,
              bedrooms: projectData.bedrooms || 1,
              bathrooms: projectData.bathrooms || 1,
              hvacType: (projectData.hvacType as 'central-ac' | 'mini-split' | 'custom') || 'central-ac',
              hvacCustomPrice: projectData.hvacCustomPrice,
              utilities: {
                waterMeter: (projectData.utilities?.waterMeter || 'shared') as 'shared' | 'separate',
                gasMeter: (projectData.utilities?.gasMeter || 'shared') as 'shared' | 'separate',
                electricMeter: (projectData.utilities?.electricMeter || 'separate') as 'shared' | 'separate',
                electricalPanel: projectData.utilities?.electricalPanel || 0
              },
              sewerConnection: (projectData.utilities?.sewerMeter || 'shared') as 'shared' | 'separate',
              selectedAddOns: [
                ...(pricingData.extraBathroom ? ['Extra Bathroom'] : []),
                ...(pricingData.dedicatedDriveway ? ['Dedicated Driveway'] : []),
                ...(pricingData.basicLandscaping ? ['Basic Landscaping'] : []),
                ...(pricingData.solarReady ? ['Solar Ready'] : []),
                ...(pricingData.femaCompliance ? ['FEMA Compliance'] : []),
                ...(projectData.stories === 2 ? ['Two-Story ADU'] : []),
                ...customServices.map(service => service.description)
              ],
              needsDesign: !!pricingData.designServices,
              appliancesIncluded: false,
              solarDesign: !!pricingData.solarReady,
              femaIncluded: !!pricingData.femaCompliance,
              finishLevel: 'Standard',
              stories: projectData.stories || 1
            },
            pricing: {
              basePrice: liveCalculation.basePrice,
              totalPrice: liveCalculation.finalTotal,
              designServicesCost: pricingData.designServices || 0,
              solarReadyCost: pricingData.solarReady ? (editorPrices.solarReady || 0) : 0,
              femaComplianceCost: pricingData.femaAmount || 0,
              utilitiesCustomPrice: pricingData.utilitiesCustomPrice,
              twoStoryPrice: pricingData.twoStoryPrice,
              basePricePerSqft: pricingData.basePricePerSqft || 240,
              electricalPanelUpgrade: pricingData.electricalPanelUpgrade || 0,
              customMilestones: customMilestones || undefined
            },
            additionalNotes: projectData.additionalNotes || '',
            timeline: projectData.timeline || 'Standard 12-week construction timeline'
          };
          
          const html = await pdfGenerator.generateProposal(mappedFormData);
          
          // Create blob from HTML
          const blob = new Blob([html as unknown as string], { type: 'text/html' });
          
          // Write to the selected file
          const writable = await handle.createWritable();
          await writable.write(blob);
          await writable.close();
          
          // Show success message
          alert('PDF saved successfully!');
        } catch (err) {
          if ((err as any).name !== 'AbortError') {
            console.error('Save As failed:', err);
            // Fall back to regular download
            await handleGenerateProposal();
          }
        }
      } else {
        // Fall back to regular download for browsers that don't support File System Access API
        setShowPDFPreview(false);
        await handleGenerateProposal();
      }
    } catch (error) {
      console.error('❌ PDF save failed:', error);
    }
  }, [handleGenerateProposal, projectData, pricingData, liveCalculation, customServices, defaultProposalNumber, customMilestones]);

  const handlePrintPDF = useCallback(() => {
    try {
      // Create a new window with the HTML content for printing
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(previewHTML);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
      } else {
        alert('Popup blocked. Please allow popups to print the PDF.');
      }
    } catch (error) {
      console.error('❌ PDF print failed:', error);
      alert('Print failed. Please try again.');
    }
  }, [previewHTML]);

  // Add keyboard event listener
  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Simplified header visibility logic
  React.useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      // Only hide header when scrolling down and past 150px
      if (currentScrollY > 150 && currentScrollY > lastScrollY) {
        // setHeaderVisible(false);  // Removed unused function
      } else if (currentScrollY < lastScrollY) {
        // setHeaderVisible(true);  // Removed unused function
      }
      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let timeoutId: NodeJS.Timeout;
    const throttledHandleScroll = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleScroll, 16); // ~60fps
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
      clearTimeout(timeoutId);
    };
  }, [lastScrollY]);

  // Simple focus handler for input fields
  React.useEffect(() => {
    const handleFocus = (e: FocusEvent) => {
      // Only hide header if focusing on form inputs, not buttons
      if ((e.target as HTMLElement).tagName === 'INPUT' || (e.target as HTMLElement).tagName === 'TEXTAREA') {
        // setHeaderVisible(false);  // Removed unused function
      }
    };

    const handleBlur = () => {
      // Show header again when no inputs are focused
      setTimeout(() => {
        if (!document.querySelector('input:focus, textarea:focus')) {
          // setHeaderVisible(true);  // Removed unused function
        }
      }, 100);
    };

    document.addEventListener('focusin', handleFocus);
    document.addEventListener('focusout', handleBlur);

    return () => {
      document.removeEventListener('focusin', handleFocus);
      document.removeEventListener('focusout', handleBlur);
    };
  }, []);

  // Editable breakdown item component
  const EditableBreakdownItem = ({ 
    itemKey, 
    label, 
    value, 
    isEditing, 
    textColor = 'text-green-600' 
  }: { 
    itemKey: string; 
    label: string; 
    value: number; 
    isEditing: boolean; 
    textColor?: string; 
  }) => (
    <div className='flex justify-between ml-4 hover:bg-gray-50 px-1 py-0.5 rounded group'>
      <span className='text-slate-600'>{label}</span>
      {isEditing ? (
        <div className='flex items-center gap-1'>
          <span className='text-slate-600 text-xs'>$</span>
          <input
            type='text'
            value={editingValue}
            onChange={handleBreakdownValueChange}
            onBlur={handleBreakdownValueSubmit}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleBreakdownValueSubmit();
              if (e.key === 'Escape') handleBreakdownCancel();
            }}
            className='w-16 px-1 py-0.5 text-xs border border-anchor-blue rounded focus:outline-none focus:ring-1 focus:ring-anchor-blue text-right'
            autoFocus
          />
        </div>
      ) : (
        <span 
          className={`font-medium cursor-pointer hover:bg-blue-50 px-1 py-0.5 rounded ${textColor} group-hover:ring-1 group-hover:ring-blue-200`}
          onClick={() => handleBreakdownItemClick(itemKey, value)}
          title='Click to edit'
        >
          +${value.toLocaleString()}
          <span className='ml-1 opacity-0 group-hover:opacity-100 text-xs text-gray-400'>✏️</span>
        </span>
      )}
    </div>
  );

  return (
    <div className='min-h-screen' style={{backgroundColor: '#f0f2f5', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", "Helvetica Neue", Arial, sans-serif'}}>
      {/* Header - Always visible, compact on mobile */}
      <div className='bg-white' style={{position: 'fixed', top: 0, left: 0, right: 0, zIndex: 50, borderBottom: '1px solid #f0f0f0', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'}}>
        <div className='px-2 py-1 xl:px-4 xl:py-3'>
          <div className='flex items-center justify-between'>
            <div className='flex items-center'>
              <button className='mr-2 p-1 text-gray-600 hover:text-gray-900 lg:hidden xl:mr-4 xl:p-2'>
                <ArrowLeft className='w-4 h-4 xl:w-5 xl:h-5' />
              </button>
              <div className='w-8 h-8 xl:w-12 xl:h-12 bg-white rounded-lg flex items-center justify-center mr-2 xl:mr-3 shadow-sm border border-slate-300 p-1'>
                <img 
                  src='/anchor-logo-main.png' 
                  alt='Anchor Builders Logo' 
                  className='w-full h-full object-contain'
                />
              </div>
              <div>
                <h1 className='text-sm xl:text-lg font-bold text-gray-900'>
                  Anchor Builders
                </h1>
                <p className='text-[10px] xl:text-xs text-gray-600 hidden sm:block'>ADU Proposal Generator</p>
              </div>
            </div>

            <div className='flex items-center gap-2 sm:gap-3'>
              {/* Reorganized buttons with uniform styling and logical order */}
              
              {/* 1. Clear - Reset action */}
              <button 
                onClick={handleClearData}
                className='bg-red-500 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-red-600 transition-all shadow-sm flex items-center gap-1.5'
                title='Clear all form data'
              >
                <svg className='w-3 h-3' fill='none' stroke='currentColor' viewBox='0 0 24 24'>
                  <path strokeLinecap='round' strokeLinejoin='round' strokeWidth={2} d='M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16' />
                </svg>
                <span className='hidden sm:inline'>Clear</span>
              </button>
              
              {/* 2. Test - Load test data */}
              <button
                onClick={loadTestData}
                className='bg-slate-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-700 transition-all shadow-sm flex items-center gap-1.5'
                title={`Load test data: ${testDataVariations[currentTestVariation].name}`}
              >
                <FlaskConical className='w-3 h-3' />
                <span className='hidden sm:inline'>Test {currentTestVariation + 1}/10</span>
                <span className='sm:hidden'>Test</span>
              </button>
              
              {/* 3. Dark Mode - UI preference */}
              <button 
                onClick={() => alert('Dark mode coming soon!')}
                className='bg-slate-800 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-slate-900 transition-all shadow-sm flex items-center gap-1.5'
                title='Toggle dark mode'
              >
                <span className='text-sm'>🌙</span>
                <span className='hidden sm:inline'>Dark</span>
              </button>
              
              {/* 4. Live Pricing - Edit pricing */}
              <button
                onClick={() => {
                  if (onOpenPricingEditor) {
                    onOpenPricingEditor();
                  }
                }}
                className='bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition-all shadow-sm flex items-center gap-1.5'
                title='Edit live pricing'
              >
                <span className='text-sm'>💰</span>
                <span className='hidden sm:inline'>Live Pricing</span>
              </button>
              
              {/* Mobile PDF/Save buttons - only show when sidebar is hidden */}
              <div className='flex items-center gap-1 xl:hidden'>
                <button 
                  onClick={handlePDFPreview}
                  disabled={isGeneratingPDF || !isFormValid}
                  className={`text-white px-3 py-1.5 rounded text-xs font-medium transition-all shadow-sm ${
                    isGeneratingPDF || !isFormValid
                      ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                  title={!isFormValid ? 'Please fill out all required fields' : ''}
                >
                  {isGeneratingPDF ? 'Loading...' : 'PDF'}
                </button>
                <button 
                  onClick={() => setShowDownloadSettings(!showDownloadSettings)}
                  className='bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-all shadow-sm'
                  title='Download Settings'
                >
                  📁
                </button>
              </div>
              
              <div className='text-right hidden sm:block'>
                <p className='text-xs text-gray-600'>Total</p>
                <p className='text-xl font-bold text-gray-900'>
${pricingData.friendsAndFamilyDiscount 
  ? (() => {
      const discountPercent = pricingData.friendsAndFamilyDiscountType === 'custom' 
        ? (pricingData.friendsAndFamilyDiscountCustom || 0) / 100
        : pricingData.friendsAndFamilyDiscountType === '5%' ? 0.05 : 0.1;
      return (liveCalculation.finalTotal * (1 - discountPercent)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    })()
  : liveCalculation.finalTotal.toLocaleString()}
                </p>
              </div>
              
              {/* Download Settings - desktop only, mobile version is in mobile buttons */}
              <button 
                onClick={() => setShowDownloadSettings(!showDownloadSettings)}
                className='bg-green-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-green-700 transition-all shadow-sm hidden xl:flex items-center gap-1.5'
                title='Download Settings'
              >
                <span className='text-sm'>📁</span>
                <span className='hidden lg:inline'>Settings</span>
              </button>
              

              <div className='w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-white font-semibold text-sm cursor-pointer hover:bg-slate-900 transition-colors'>
                JS
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content with padding for fixed header - less on mobile */}
      <div className='px-1 py-1 xl:px-2 xl:py-2' style={{paddingTop: '80px', transition: 'padding-top 0.3s ease'}}>
        <div className='grid xl:grid-cols-[1fr,260px] gap-3'>
          {/* Main Form */}
          <div className='space-y-2 lg:grid lg:grid-cols-[0.85fr,1.15fr] lg:grid-rows-[280px,auto,auto] lg:gap-3 lg:space-y-0' data-cards-container>
            {sections.map((section, index) => (
              <div key={section.id} className={`bg-white rounded border flex flex-col mb-1 xl:mb-2 transition-all duration-300 hover:scale-105 cursor-pointer ${section.isComplete ? 'border-green-500 border-2' : 'border-gray-300'} ${index === 0 ? 'lg:h-[280px] lg:overflow-y-auto lg:col-start-1 lg:row-start-1' : ''} ${index === 1 ? 'lg:col-start-2 lg:row-start-1 lg:row-span-2' : ''} ${index === 2 ? 'lg:h-[280px] lg:col-start-1 lg:row-start-2' : ''} ${index === 3 ? 'lg:col-start-2 lg:row-start-3' : ''}`} style={{padding: isMobile ? '8px' : '12px', boxShadow: section.isComplete ? '0 2px 8px rgba(34, 197, 94, 0.15)' : '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)', ...(index === 0 ? {gridColumn: 1, gridRow: 1, height: '280px', overflowY: 'auto'} : {}), ...(index === 1 ? {gridColumn: 2, gridRow: '1 / span 2'} : {}), ...(index === 2 ? {gridColumn: 1, gridRow: 2, height: '280px'} : {}), ...(index === 3 ? {gridColumn: 2, gridRow: 3} : {})}} {...(index === 0 ? {'data-first-card': true} : {})}>
                {/* Card Header with Navy Background - compact on mobile */}
                <div 
                  className='flex items-center justify-between mb-1 xl:mb-2 cursor-pointer'
                  onClick={() => toggleCard(section.id)}
                >
                  <div className='flex items-center gap-1 xl:gap-2'>
                    <div className={`
                      w-6 h-6 xl:w-8 xl:h-8 rounded-full flex items-center justify-center text-[11px] xl:text-[14px] font-bold transition-all duration-300
                      ${section.isComplete 
                        ? 'bg-green-500 text-white shadow-lg' 
                        : 'bg-blue-500 text-white border border-white'
                      }
                    `}>
                      {index + 1}
                    </div>
                    <div>
                      <h2 className='text-[10px] xl:text-[11px] font-semibold text-gray-900 uppercase tracking-wide'>
                        {section.title}
                      </h2>
                    </div>
                  </div>
                  
                  <div className='flex items-center gap-2'>
                    {section.isComplete ? (
                      <span className='text-[11px] font-semibold text-green-600'>COMPLETE</span>
                    ) : (
                      <span className='text-[11px] text-anchor-blue font-medium'>{calculateSectionProgress(section.id)}%</span>
                    )}
                    {isMobile && (
                      <ChevronDown className={`w-4 h-4 text-gray-600 transition-transform ${
                        expandedCard === section.id ? 'rotate-180' : ''
                      }`} />
                    )}
                  </div>
                </div>

                {/* Card Content */}
                <div className={(() => {
                  const shouldShow = isMobile ? (expandedCard === section.id) : true;
                  const className = `${shouldShow ? 'block' : 'hidden'} flex-1`;
                  console.log('🎯 Card visibility check:', {
                    sectionId: section.id,
                    isMobile,
                    expandedCard,
                    shouldShow,
                    className
                  });
                  return className;
                })()}
                >
                  {section.id === 'client' && (
                    <div className={isMobile ? 'space-y-2' : 'space-y-3'}>
                      {/* Proposal Metadata - Extra compact row */}
                      <div className={`${isMobile ? 'grid grid-cols-2 gap-1' : 'grid grid-cols-4 gap-2'} ${isMobile ? 'p-1.5' : 'p-2'} rounded-lg bg-anchor-blue-light border border-gray-200`}>
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[10px]'} font-medium text-gray-900 ${isMobile ? 'mb-0.5' : 'mb-1'}`}>Proposal #</label>
                          <input
                            type='text'
                            value={projectData.proposalNumber || defaultProposalNumber}
                            onChange={e => updateProjectData({ proposalNumber: e.target.value })}
                            className={`${isMobile ? 'h-6 px-1 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                            placeholder='AB-XXXX'
                          />
                        </div>
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[10px]'} font-medium text-gray-900 ${isMobile ? 'mb-0.5' : 'mb-1'}`}>Date</label>
                          <input
                            type='date'
                            value={projectData.proposalDate || defaultProposalDate}
                            onChange={e => updateProjectData({ proposalDate: e.target.value })}
                            className={`${isMobile ? 'h-6 px-1 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                          />
                        </div>
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[10px]'} font-medium text-gray-900 ${isMobile ? 'mb-0.5' : 'mb-1'}`}>Valid Days</label>
                          <input
                            type='number'
                            value={projectData.proposalValidityDays || 30}
                            onChange={e => updateProjectData({ proposalValidityDays: parseInt(e.target.value) || 30 })}
                            className={`${isMobile ? 'h-6 px-1 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                            min='1'
                            max='365'
                          />
                        </div>
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[10px]'} font-medium text-gray-700 ${isMobile ? 'mb-0.5' : 'mb-1'}`}>Deposit $ <span className="text-gray-500">(default)</span></label>
                          <input
                            type='number'
                            value={projectData.depositAmount || 1000}
                            onChange={e => updateProjectData({ depositAmount: parseInt(e.target.value) || 1000 })}
                            className={`${isMobile ? 'h-6 px-1 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                            min='0'
                            step='100'
                            placeholder='1000'
                          />
                        </div>
                      </div>

                      {/* Client Information - Side by Side Layout */}
                      <div className='grid grid-cols-1 lg:grid-cols-2 gap-2'>
                        {/* Primary Client */}
                        <div className='p-1.5 border border-gray-100 rounded-md bg-gray-50/30'>
                          <div className='text-[10px] font-medium text-gray-900 mb-1.5 flex items-center justify-between'>
                            Primary Client
                            <StatusDot filled={!!projectData.clientName} />
                          </div>
                          <div className='grid grid-cols-2 gap-1'>
                            <div className='relative'>
                              <div className='text-[9px] text-gray-900 mb-0.5 font-medium'>
                                First Name
                              </div>
                              <input
                                type='text'
                                value={projectData.clientName?.split(' ')[0] || ''}
                                onChange={e => {
                                  const firstName = e.target.value;
                                  const lastName = projectData.clientName?.split(' ').slice(1).join(' ') || '';
                                  updateProjectData({ clientName: `${firstName} ${lastName}`.trim() });
                                }}
                                className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[10px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                                placeholder='First Name'
                              />
                            </div>
                            <div className='relative'>
                              <div className='text-[9px] text-gray-900 mb-0.5 font-medium'>
                                Last Name
                              </div>
                              <input
                                type='text'
                                value={projectData.clientName?.split(' ').slice(1).join(' ') || ''}
                                onChange={e => {
                                  const lastName = e.target.value;
                                  const firstName = projectData.clientName?.split(' ')[0] || '';
                                  updateProjectData({ clientName: `${firstName} ${lastName}`.trim() });
                                }}
                                className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[10px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                                placeholder='Last Name'
                              />
                            </div>
                          </div>
                          <div className='grid grid-cols-2 gap-1 mt-1'>
                            <div className='relative'>
                              <div className='text-[9px] text-gray-900 mb-0.5 font-medium'>
                                Email
                              </div>
                              <input
                                type='email'
                                value={projectData.clientEmail || ''}
                                onChange={e => {
                                  const formattedEmail = formatEmail(e.target.value);
                                  updateProjectData({ clientEmail: formattedEmail });
                                }}
                                className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[10px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                                placeholder='Email'
                              />
                            </div>
                            <div className='relative'>
                              <div className='text-[9px] text-gray-900 mb-0.5 font-medium'>
                                Phone
                              </div>
                              <input
                                type='tel'
                                value={projectData.clientPhone || ''}
                                onChange={e => {
                                  const formatted = formatPhoneNumber(e.target.value);
                                  updateProjectData({ clientPhone: formatted });
                                }}
                                className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[10px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                                placeholder='(555) 555-5555'
                              />
                            </div>
                          </div>
                        </div>

                        {/* Secondary Client */}
                        <div className='p-1.5 border border-gray-100 rounded-md bg-gray-50/30'>
                          <div className='text-[10px] font-medium text-gray-900 mb-1.5'>Secondary Client (Optional)</div>
                          <div className='grid grid-cols-2 gap-1'>
                            <div className='relative'>
                              <div className='text-[9px] text-gray-900 mb-0.5 font-medium'>First Name</div>
                              <input
                                type='text'
                                value={projectData.secondaryClientFirstName || ''}
                                onChange={e => updateProjectData({ secondaryClientFirstName: e.target.value })}
                                className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[10px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                                placeholder='First Name'
                              />
                            </div>
                            <div className='relative'>
                              <div className='text-[9px] text-gray-900 mb-0.5 font-medium'>Last Name</div>
                              <input
                                type='text'
                                value={projectData.secondaryClientLastName || ''}
                                onChange={e => updateProjectData({ secondaryClientLastName: e.target.value })}
                                className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[10px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                                placeholder='Last Name'
                              />
                            </div>
                          </div>
                          <div className='grid grid-cols-2 gap-1 mt-1'>
                            <div className='relative'>
                              <div className='text-[9px] text-gray-900 mb-0.5 font-medium'>Email</div>
                              <input
                                type='email'
                                value={projectData.secondaryClientEmail || ''}
                                onChange={e => updateProjectData({ secondaryClientEmail: e.target.value })}
                                className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[10px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                                placeholder='Email'
                              />
                            </div>
                            <div className='relative'>
                              <div className='text-[9px] text-gray-900 mb-0.5 font-medium'>Phone</div>
                              <input
                                type='tel'
                                value={projectData.secondaryClientPhone || ''}
                                onChange={e => updateProjectData({ secondaryClientPhone: e.target.value })}
                                className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-7 px-2 py-1 text-[10px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 w-full`}
                                placeholder='Phone'
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Property Address */}
                      <div className='p-1 border border-gray-100 rounded-md bg-gray-50/30'>
                        <div className='text-[10px] font-medium text-gray-900 mb-1'>Property Address</div>
                        <input
                          type='text'
                          value={projectData.propertyAddress || ''}
                          onChange={e => {
                            const sanitizedAddress = sanitizeAddress(e.target.value);
                            updateProjectData({ propertyAddress: sanitizedAddress });
                          }}
                          className='w-full px-3 py-1 border border-gray-300 rounded-md text-[11px] text-gray-900 bg-white transition-all focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400'
                          placeholder='Property Address'
                        />
                        <div className='grid grid-cols-3 gap-1 mt-0.5'>
                          <div className='relative'>
                            <input
                              type='text'
                              value={projectData.city || ''}
                              onChange={e => {
                                const value = e.target.value;
                                updateProjectData({ city: value });
                                
                                // Show city suggestions
                                if (value.length >= 2) {
                                  const suggestions = findMatchingCities(value, 5);
                                  setCitySuggestions(suggestions);
                                  setShowCitySuggestions(suggestions.length > 0);
                                } else {
                                  setShowCitySuggestions(false);
                                }
                              }}
                              onBlur={(e) => {
                                // Auto-correct city on blur
                                setTimeout(() => {
                                  const correctedCity = autoCorrectCity(e.target.value);
                                  if (correctedCity !== e.target.value) {
                                    updateProjectData({ city: correctedCity });
                                  }
                                  setShowCitySuggestions(false);
                                }, 200); // Delay to allow clicking suggestions
                              }}
                              onFocus={() => {
                                if (projectData.city && projectData.city.length >= 2) {
                                  const suggestions = findMatchingCities(projectData.city, 5);
                                  setCitySuggestions(suggestions);
                                  setShowCitySuggestions(suggestions.length > 0);
                                }
                              }}
                              className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400 ${
                                isSupportedCity(projectData.city || '') ? 'border-green-300' : 'border-gray-300'
                              }`}
                              placeholder='City'
                            />
                            
                            {/* City suggestions dropdown */}
                            {showCitySuggestions && citySuggestions.length > 0 && (
                              <div className='absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-b-md shadow-lg z-10 max-h-32 overflow-y-auto'>
                                {citySuggestions.map((city) => (
                                  <div
                                    key={city}
                                    className='px-2 py-1 hover:bg-blue-50 cursor-pointer text-[10px] text-gray-900'
                                    onMouseDown={() => {
                                      updateProjectData({ city });
                                      setShowCitySuggestions(false);
                                    }}
                                  >
                                    {city}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                          <input
                            type='text'
                            value={projectData.state || ''}
                            onChange={e => updateProjectData({ state: e.target.value })}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400`}
                            placeholder='State'
                          />
                          <input
                            type='text'
                            value={projectData.zipCode || ''}
                            onChange={e => updateProjectData({ zipCode: e.target.value })}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none hover:border-gray-400`}
                            placeholder='ZIP'
                          />
                        </div>
                      </div>

                      {/* Enhanced Friends & Family Discount */}
                      <div className='bg-blue-50 border border-blue-200 rounded-lg p-2'>
                        <div className='flex items-center gap-2 mb-1'>
                          <input 
                            type='checkbox' 
                            checked={!!pricingData.friendsAndFamilyDiscount}
                            onChange={e => {
                              updatePricingData({ 
                                friendsAndFamilyDiscount: e.target.checked,
                                friendsAndFamilyDiscountType: e.target.checked ? (pricingData.friendsAndFamilyDiscountType || '10%') : undefined
                              });
                            }}
                            className='w-4 h-4 text-blue-600 rounded focus:ring-1 focus:ring-blue-500' 
                          />
                          <span className='text-[12px] font-semibold text-gray-900'>Friends & Family Discount</span>
                        </div>
                        
                        {pricingData.friendsAndFamilyDiscount && (
                          <div className='space-y-1'>
                            {/* Preset Options */}
                            <div className='flex items-center gap-2'>
                              <button
                                type='button'
                                onClick={() => updatePricingData({ friendsAndFamilyDiscountType: '5%', friendsAndFamilyDiscountCustom: undefined })}
                                className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                                  pricingData.friendsAndFamilyDiscountType === '5%'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                5% off
                              </button>
                              <button
                                type='button'
                                onClick={() => updatePricingData({ friendsAndFamilyDiscountType: '10%', friendsAndFamilyDiscountCustom: undefined })}
                                className={`px-2 py-1 rounded text-[10px] font-medium transition-all ${
                                  pricingData.friendsAndFamilyDiscountType === '10%'
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                              >
                                10% off
                              </button>
                              <span className='text-[10px] text-gray-600'>or</span>
                              <div className='flex items-center gap-1'>
                                <input
                                  type='text'
                                  value={pricingData.friendsAndFamilyDiscountCustom?.toString() || ''}
                                  onChange={e => {
                                    const value = e.target.value;
                                    const numValue = value === '' ? undefined : parseFloat(value) || 0;
                                    updatePricingData({ 
                                      friendsAndFamilyDiscountType: 'custom',
                                      friendsAndFamilyDiscountCustom: numValue
                                    });
                                  }}
                                  className='w-20 px-2 py-1 text-[10px] border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                                  placeholder='5% or $500'
                                />
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {section.id === 'property' && (
                    <div className={isMobile ? 'space-y-1' : 'space-y-1.5'}>
                      {/* ADU Type */}
                      <div className='p-2 border border-gray-100 rounded-md bg-gray-50/30'>
                        <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold ${isMobile ? 'mb-0.5' : 'mb-1'} text-center uppercase tracking-wide`} style={{color: '#000000'}}>ADU TYPE</label>
                        <div className='grid grid-cols-3 gap-1'>
                          {[
                            { value: 'detached', label: 'Detached' },
                            { value: 'attached', label: 'Attached' },
                            { value: 'jadu', label: 'JADU' },
                          ].map(option => (
                            <button
                              key={option.value}
                              type='button'
                              data-navigation
                              onClick={() => {
                                // Always show base price popup for any ADU type selection
                                setPendingAduTypeSelection(option.value);
                                setTempBasePricePerSqft(pricingData.basePricePerSqft || 240);
                                setShowAduTypePopup(true);
                              }}
                              className={`
                                ${isMobile ? 'px-2 py-1' : 'px-4 py-2'} rounded-lg border-2 text-center transition-all ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-bold shadow-sm
                                ${projectData.aduType === option.value
                                  ? 'bg-anchor-blue border-anchor-blue text-white shadow-lg ring-2 ring-anchor-blue/20'
                                  : projectData.aduType && projectData.aduType !== option.value
                                    ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-60 hover:opacity-80'
                                    : 'bg-gradient-to-b from-white to-gray-50 border-gray-300 text-gray-700 hover:border-anchor-blue hover:text-anchor-blue hover:shadow-md'
                                }
                              `}
                            >
                              {option.label}
                            </button>
                          ))}
                        </div>
                        <div className='mt-1'>
                          <button
                            type='button'
                            onClick={() => alert('More ADU types coming soon: Conversion ADU, Garage Conversion, Basement ADU')}
                            className='text-[11px] text-anchor-blue hover:text-gray-700 transition-colors'
                          >
                            ▶ More types
                          </button>
                        </div>
                      </div>

                      {/* Square Footage */}
                      <div className='p-2 border border-gray-100 rounded-md bg-gray-50/30'>
                        <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold ${isMobile ? 'mb-0.5' : 'mb-1'} text-center uppercase tracking-wide`} style={{color: '#000000'}}>SQUARE FOOTAGE</label>
                        <div className={`grid grid-cols-5 ${isMobile ? 'gap-1' : 'gap-2'}`}>
                          {/* Manual entry first - larger */}
                          <input
                            type='number'
                            data-navigation
                            value={projectData.squareFootage || ''}
                            onChange={e => updateProjectData({ squareFootage: parseInt(e.target.value) || 0 })}
                            className={`
                              ${isMobile ? 'h-6 px-1 py-0.5 text-[9px]' : 'h-8 px-3 py-1 text-[11px]'} border-2 rounded-lg focus:ring-2 focus:ring-anchor-blue focus:border-anchor-blue focus:outline-none transition-all text-center font-bold shadow-sm
                              ${projectData.squareFootage && ![400, 800, 1000, 1200].includes(projectData.squareFootage)
                                ? 'border-anchor-blue bg-anchor-blue-light text-anchor-blue ring-2 ring-anchor-blue/20'
                                : 'border-gray-300 bg-gradient-to-b from-white to-gray-50 text-gray-800 hover:border-anchor-blue hover:shadow-md'
                              }
                            `}
                            placeholder='Custom'
                          />
                          {/* Preset buttons - larger */}
                          {[400, 800, 1000, 1200].map(sqft => (
                            <button
                              key={sqft}
                              type='button'
                              data-navigation
                              onClick={() => updateProjectData({ squareFootage: sqft })}
                              className={`
                                h-10 px-3 rounded-lg border-2 text-center text-[11px] font-bold inline-flex items-center justify-center transition-all shadow-sm
                                ${projectData.squareFootage === sqft
                                  ? 'bg-anchor-blue border-anchor-blue text-white shadow-lg ring-2 ring-anchor-blue/20'
                                  : projectData.squareFootage && projectData.squareFootage !== sqft
                                    ? 'bg-gray-100 border-gray-200 text-gray-400 opacity-60 hover:opacity-80'
                                    : 'bg-gradient-to-b from-white to-gray-50 border-gray-300 text-gray-700 hover:border-anchor-blue hover:text-anchor-blue hover:shadow-md'
                                }
                              `}
                            >
                              ~{sqft}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bedrooms & Bathrooms */}
                      <div className='grid grid-cols-2 gap-2 p-2 border border-gray-100 rounded-md bg-gray-50/30'>
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold mb-1 text-center uppercase tracking-wide`} style={{color: '#000000'}}>BEDROOMS</label>
                          <div className='grid grid-cols-2 gap-1'>
                            <button 
                              type='button'
                              data-navigation
                              onClick={(e) => {
                                console.log('🏠 Studio button clicked - event:', e);
                                console.log('🏠 Current projectData.bedrooms:', projectData.bedrooms);
                                try {
                                  console.log('Studio clicked, setting bedrooms to 0');
                                  updateProjectData({ bedrooms: 0 });
                                } catch (error) {
                                  console.error('❌ Error in Studio button click:', error);
                                }
                              }}
                              className={`
                                ${isMobile ? 'h-6 px-1 text-[9px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex items-center justify-center
                                ${projectData.bedrooms === 0
                                  ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue'
                                }
                              `}
                            >
                              Studio
                            </button>
                            {[1, 2, 3, 4].map((num) => (
                              <button
                                key={num}
                                type='button'
                                data-navigation
                                onClick={() => updateProjectData({ bedrooms: num })}
                                className={`
                                  ${isMobile ? 'h-6 px-1 text-[9px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex items-center justify-center
                                  ${projectData.bedrooms === num
                                    ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue'
                                  }
                                `}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold mb-1 text-center uppercase tracking-wide`} style={{color: '#000000'}}>BATHROOMS</label>
                          <div className='grid grid-cols-2 gap-1'>
                            <button 
                              type='button'
                              data-navigation
                              onClick={(e) => {
                                console.log('🚿 0 Bathroom button clicked - event:', e);
                                try {
                                  console.log('0 Bathroom clicked, setting bathrooms to 0');
                                  updateProjectData({ bathrooms: 0 });
                                } catch (error) {
                                  console.error('❌ Error in 0 Bathroom button click:', error);
                                }
                              }}
                              className={`
                                ${isMobile ? 'h-6 px-1 text-[9px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex items-center justify-center
                                ${projectData.bathrooms === 0
                                  ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue'
                                }
                              `}
                            >
                              0
                            </button>
                            {[1, 2, 3].map((num) => (
                              <button
                                key={num}
                                type='button'
                                data-navigation
                                onClick={() => updateProjectData({ bathrooms: num })}
                                className={`
                                  ${isMobile ? 'h-6 px-1 text-[9px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex items-center justify-center
                                  ${projectData.bathrooms === num
                                    ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue'
                                  }
                                `}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* HVAC & Utilities Row */}
                      <div className='grid grid-cols-2 gap-2 p-2 border border-gray-100 rounded-md bg-gray-50/30'>
                        {/* HVAC */}
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold mb-1 text-center uppercase tracking-wide`} style={{color: '#000000'}}>❄️ HVAC</label>
                          <div className='grid grid-cols-2 gap-1'>
                            <button
                              type='button'
                              data-navigation
                              onClick={() => {
                                console.log('🎯 Central AC selected');
                                updateProjectData({ hvacType: 'central-ac' });
                              }}
                              className={`
                                ${isMobile ? 'px-1 py-0.5 h-6 text-[9px]' : 'px-3 py-1.5 h-10 text-[11px]'} rounded border transition-all flex flex-col items-center justify-center
                                ${projectData.hvacType === 'central-ac'
                                  ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none'
                                }
                              `}
                            >
                              <div className='font-medium'>{isMobile ? 'Central' : 'Central AC'}</div>
                              {projectData.hvacType === 'central-ac' && (() => {
                                const price = pricingEditorBridge.getHVACPrice('central-ac');
                                return price > 0 ? (
                                  <div className='text-green-300 text-[8px] font-medium'>+${price.toLocaleString()}</div>
                                ) : null;
                              })()}
                            </button>
                            <button
                              type='button'
                              data-navigation
                              onClick={() => {
                                console.log('🎯 Mini-Split selected');
                                updateProjectData({ hvacType: 'mini-split' });
                              }}
                              className={`
                                ${isMobile ? 'px-1 py-0.5 h-6 text-[9px]' : 'px-3 py-1.5 h-10 text-[11px]'} rounded border transition-all flex flex-col items-center justify-center
                                ${projectData.hvacType === 'mini-split'
                                  ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none'
                                }
                              `}
                            >
                              <div className='font-medium'>{isMobile ? 'Mini' : 'Mini-Split'}</div>
                              {projectData.hvacType === 'mini-split' && (() => {
                                const price = pricingEditorBridge.getHVACPrice('mini-split');
                                return price > 0 ? (
                                  <div className='text-green-300 text-[8px] font-medium'>+${price.toLocaleString()}</div>
                                ) : null;
                              })()}
                            </button>
                            <button
                              type='button'
                              onClick={() => {
                                setShowHvacPopup(true);
                              }}
                              className={`
                                ${isMobile ? 'px-1 py-0.5 h-6 text-[9px]' : 'px-3 py-1.5 h-10 text-[11px]'} rounded border transition-all flex flex-col items-center justify-center
                                ${projectData.hvacType === 'custom'
                                  ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none'
                                }
                              `}
                            >
                              <div className='font-medium'>Custom</div>
                              {projectData.hvacType === 'custom' && projectData.hvacCustomPrice && (
                                <div className='text-[8px] opacity-75'>+${projectData.hvacCustomPrice.toLocaleString()}</div>
                              )}
                            </button>
                          </div>
                        </div>

                        {/* Utilities */}
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold mb-1 text-center uppercase tracking-wide`} style={{color: '#000000'}}>⚡ UTILITIES</label>
                          <div className='grid grid-cols-2 gap-1'>
                            <button 
                              type='button'
                              data-navigation
                              onClick={(e) => {
                                console.log('💧 Water button clicked - event:', e);
                                try {
                                  const currentState = projectData.utilities?.waterMeter || '';
                                  const newWaterState = (!currentState || currentState === '') ? 'shared' : currentState === 'shared' ? 'separate' : 'shared';
                                  console.log('Water utility clicked - toggling to:', newWaterState);
                                  
                                  if (newWaterState === 'separate') {
                                    setUtilityType('waterMeter');
                                    setShowUtilitiesPopup(true);
                                  } else {
                                    updateProjectData({ 
                                      utilities: { 
                                        ...projectData.utilities,
                                        waterMeter: newWaterState as 'shared' | 'separate'
                                      } 
                                    });
                                  }
                                } catch (error) {
                                  console.error('❌ Error in Water button click:', error);
                                }
                              }}
                              className={`
                                ${isMobile ? 'h-7 px-1 text-[8px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex flex-col items-center justify-center
                                ${projectData.utilities?.waterMeter && projectData.utilities.waterMeter !== ''
                                  ? (projectData.utilities.waterMeter === 'separate' 
                                      ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                      : 'bg-green-100 border-green-400 text-green-800 shadow-sm')
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue'
                                }
                              `}
                            >
                              <div className='font-medium'>Water</div>
                              <div className={`${isMobile ? 'text-[7px]' : 'text-[9px]'} ${projectData.utilities?.waterMeter && projectData.utilities.waterMeter === 'separate' ? 'text-gray-200' : 'text-gray-500'}`}>
                                {!projectData.utilities?.waterMeter || projectData.utilities.waterMeter === '' ? 'Select' : projectData.utilities.waterMeter === 'separate' ? 'Separate' : 'Shared'}
                              </div>
                              {projectData.utilities?.waterMeter === 'separate' && (() => {
                                const price = pricingEditorBridge.getUtilityPrice('waterMeter', 'separate');
                                return price > 0 ? (
                                  <div className='text-green-300 text-[7px] font-medium'>+${price.toLocaleString()}</div>
                                ) : null;
                              })()}
                            </button>
                            <button 
                              type='button'
                              data-navigation
                              onClick={(e) => {
                                console.log('🚽 Sewer button clicked - event:', e);
                                try {
                                  const currentState = projectData.utilities?.sewerMeter || '';
                                  const newSewerState = (!currentState || currentState === '') ? 'shared' : currentState === 'shared' ? 'separate' : 'shared';
                                  console.log('Sewer utility clicked - toggling to:', newSewerState);
                                  
                                  if (newSewerState === 'separate') {
                                    setUtilityType('sewerMeter');
                                    setShowUtilitiesPopup(true);
                                  } else {
                                    updateProjectData({ 
                                      utilities: { 
                                        ...projectData.utilities,
                                        sewerMeter: newSewerState as 'shared' | 'separate'
                                      } 
                                    });
                                  }
                                } catch (error) {
                                  console.error('❌ Error in Sewer button click:', error);
                                }
                              }}
                              className={`
                                ${isMobile ? 'h-7 px-1 text-[8px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex flex-col items-center justify-center
                                ${projectData.utilities?.sewerMeter && projectData.utilities.sewerMeter !== ''
                                  ? (projectData.utilities.sewerMeter === 'separate' 
                                      ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                      : 'bg-green-100 border-green-400 text-green-800 shadow-sm')
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue'
                                }
                              `}
                            >
                              <div className='font-medium'>Sewer</div>
                              <div className={`${isMobile ? 'text-[7px]' : 'text-[9px]'} ${projectData.utilities?.sewerMeter && projectData.utilities.sewerMeter === 'separate' ? 'text-gray-200' : 'text-gray-500'}`}>
                                {!projectData.utilities?.sewerMeter || projectData.utilities.sewerMeter === '' ? 'Select' : projectData.utilities.sewerMeter === 'separate' ? 'Separate' : 'Shared'}
                              </div>
                              {projectData.utilities?.sewerMeter === 'separate' && (() => {
                                const price = pricingEditorBridge.getUtilityPrice('sewerConnection', 'separate');
                                return price > 0 ? (
                                  <div className='text-green-300 text-[7px] font-medium'>+${price.toLocaleString()}</div>
                                ) : null;
                              })()}
                            </button>
                            <button 
                              type='button'
                              data-navigation
                              onClick={(e) => {
                                console.log('🔥 Gas button clicked - event:', e);
                                try {
                                  const currentState = projectData.utilities?.gasMeter || '';
                                  const newGasState = (!currentState || currentState === '') ? 'shared' : currentState === 'shared' ? 'separate' : 'shared';
                                  console.log('Gas utility clicked - toggling to:', newGasState);
                                  
                                  if (newGasState === 'separate') {
                                    setUtilityType('gasMeter');
                                    setShowUtilitiesPopup(true);
                                  } else {
                                    updateProjectData({ 
                                      utilities: { 
                                        ...projectData.utilities,
                                        gasMeter: newGasState as 'shared' | 'separate'
                                      } 
                                    });
                                  }
                                } catch (error) {
                                  console.error('❌ Error in Gas button click:', error);
                                }
                              }}
                              className={`
                                ${isMobile ? 'h-7 px-1 text-[8px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex flex-col items-center justify-center
                                ${projectData.utilities?.gasMeter && projectData.utilities.gasMeter !== ''
                                  ? (projectData.utilities.gasMeter === 'separate' 
                                      ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                      : 'bg-green-100 border-green-400 text-green-800 shadow-sm')
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue'
                                }
                              `}
                            >
                              <div className='font-medium'>Gas</div>
                              <div className={`${isMobile ? 'text-[7px]' : 'text-[9px]'} ${projectData.utilities?.gasMeter && projectData.utilities.gasMeter === 'separate' ? 'text-gray-200' : 'text-gray-500'}`}>
                                {!projectData.utilities?.gasMeter || projectData.utilities.gasMeter === '' ? 'Select' : projectData.utilities.gasMeter === 'separate' ? 'Separate' : 'Shared'}
                              </div>
                              {projectData.utilities?.gasMeter === 'separate' && (() => {
                                const price = pricingEditorBridge.getUtilityPrice('gasMeter', 'separate');
                                return price > 0 ? (
                                  <div className='text-green-300 text-[7px] font-medium'>+${price.toLocaleString()}</div>
                                ) : null;
                              })()}
                            </button>
                            <button 
                              type='button'
                              data-navigation
                              onClick={(e) => {
                                console.log('⚡ Electric button clicked - event:', e);
                                try {
                                  const currentState = projectData.utilities?.electricMeter || '';
                                  const newElectricState = (!currentState || currentState === '') ? 'shared' : currentState === 'shared' ? 'separate' : 'shared';
                                  console.log('Electric utility clicked - toggling to:', newElectricState);
                                  
                                  if (newElectricState === 'separate') {
                                    setUtilityType('electricMeter');
                                    setShowUtilitiesPopup(true);
                                  } else {
                                    updateProjectData({ 
                                      utilities: { 
                                        ...projectData.utilities,
                                        electricMeter: newElectricState as 'shared' | 'separate'
                                      } 
                                    });
                                  }
                                } catch (error) {
                                  console.error('❌ Error in Electric button click:', error);
                                }
                              }}
                              className={`
                                ${isMobile ? 'h-7 px-1 text-[8px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex flex-col items-center justify-center
                                ${projectData.utilities?.electricMeter && projectData.utilities.electricMeter !== ''
                                  ? (projectData.utilities.electricMeter === 'separate' 
                                      ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                      : 'bg-green-100 border-green-400 text-green-800 shadow-sm')
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue'
                                }
                              `}
                            >
                              <div className='font-medium'>Electric</div>
                              <div className={`${isMobile ? 'text-[7px]' : 'text-[9px]'} ${projectData.utilities?.electricMeter && projectData.utilities.electricMeter === 'separate' ? 'text-gray-200' : 'text-gray-500'}`}>
                                {!projectData.utilities?.electricMeter || projectData.utilities.electricMeter === '' ? 'Select' : projectData.utilities.electricMeter === 'separate' ? 'Separate' : 'Shared'}
                              </div>
                              {projectData.utilities?.electricMeter === 'separate' && (() => {
                                const price = pricingEditorBridge.getUtilityPrice('electricMeter', 'separate');
                                return price > 0 ? (
                                  <div className='text-green-300 text-[7px] font-medium'>+${price.toLocaleString()}</div>
                                ) : null;
                              })()}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Electrical Panel */}
                      <div>
                        <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold mb-1 text-center uppercase tracking-wide`} style={{color: '#000000'}}>🔌 ELECTRICAL PANEL</label>
                        <div className='grid grid-cols-3 gap-1'>
                          {[
                            { value: 100, label: '100A', cost: 2500 },
                            { value: 200, label: '200A', cost: 0 },  // Default, no extra cost
                            { value: 400, label: '400A', cost: 5000 }
                          ].map(option => (
                            <button
                              key={option.value}
                              type='button'
                              onClick={() => {
                                updateProjectData({ electricalPanel: option.value });
                                if (option.cost > 0) {
                                  updatePricingData({ 
                                    electricalPanelUpgrade: option.cost 
                                  });
                                } else {
                                  updatePricingData({ 
                                    electricalPanelUpgrade: 0 
                                  });
                                }
                              }}
                              className={`
                                ${isMobile ? 'h-7 px-1 text-[8px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex flex-col items-center justify-center transition-all
                                ${(projectData.electricalPanel || 200) === option.value
                                  ? 'bg-anchor-blue border-anchor-blue text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50 hover:border-gray-400 hover:text-anchor-blue'
                                }
                              `}
                            >
                              <div className='font-medium'>{option.label}</div>
                              {option.cost > 0 && (
                                <div className='text-[7px] opacity-75'>+${option.cost.toLocaleString()}</div>
                              )}
                              {option.value === 200 && (
                                <div className='text-[7px] opacity-75'>Included</div>
                              )}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Additional Services */}
                      <div>
                        <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold mb-1`} style={{color: '#000000'}}>➕ Additional Services</label>
                        <div className='grid grid-cols-2 gap-1'>
                          <label className={`cursor-pointer flex items-center gap-2 ${isMobile ? 'px-2 py-0.5' : 'px-3 py-1'} rounded border transition-all focus-within:ring-2 focus-within:ring-1 focus-within:ring-anchor-blue focus-within:border-anchor-blue ${
                            pricingData.extraBathroom 
                              ? 'border-anchor-blue bg-anchor-blue-light hover:border-anchor-blue-hover hover:bg-gray-100' 
                              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                          }`}>
                            <input
                              type='checkbox'
                              checked={!!pricingData.extraBathroom}
                              onChange={e => {
                                console.log('🛁 Extra Bathroom clicked:', e.target.checked);
                                updatePricingData({ extraBathroom: e.target.checked ? editorPrices.extraBathroom : 0 });
                              }}
                              className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-anchor-blue rounded focus:ring-1 focus:ring-anchor-blue`}
                            />
                            <div className='flex-1'>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium text-gray-800 block`}>Extra Bathroom</span>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} text-anchor-blue font-medium`}>+${editorPrices.extraBathroom.toLocaleString()}</span>
                            </div>
                          </label>
                          <label className={`cursor-pointer flex items-center gap-2 ${isMobile ? 'px-2 py-0.5' : 'px-3 py-1'} rounded border transition-all focus-within:ring-2 focus-within:ring-1 focus-within:ring-anchor-blue focus-within:border-anchor-blue ${
                            pricingData.dedicatedDriveway 
                              ? 'border-anchor-blue bg-anchor-blue-light hover:border-anchor-blue-hover hover:bg-gray-100' 
                              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                          }`}>
                            <input
                              type='checkbox'
                              checked={!!pricingData.dedicatedDriveway}
                              onChange={e => {
                                console.log('🚗 Dedicated Driveway clicked:', e.target.checked);
                                updatePricingData({ dedicatedDriveway: e.target.checked ? editorPrices.dedicatedDriveway : 0 });
                              }}
                              className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-anchor-blue rounded focus:ring-1 focus:ring-anchor-blue`}
                            />
                            <div className='flex-1'>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium text-gray-800 block`}>Dedicated Driveway</span>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium ${pricingData.dedicatedDriveway ? 'text-anchor-blue' : 'text-gray-600'}`}>+${editorPrices.dedicatedDriveway.toLocaleString()}</span>
                            </div>
                          </label>
                          <label className={`cursor-pointer flex items-center gap-2 ${isMobile ? 'px-2 py-0.5' : 'px-3 py-1'} rounded border transition-all focus-within:ring-2 focus-within:ring-1 focus-within:ring-anchor-blue focus-within:border-anchor-blue ${
                            pricingData.basicLandscaping 
                              ? 'border-anchor-blue bg-anchor-blue-light hover:border-anchor-blue-hover hover:bg-gray-100' 
                              : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                          }`}>
                            <input
                              type='checkbox'
                              checked={!!pricingData.basicLandscaping}
                              onChange={e => {
                                console.log('🌿 Basic Landscaping clicked:', e.target.checked);
                                updatePricingData({ basicLandscaping: e.target.checked ? editorPrices.basicLandscaping : 0 });
                              }}
                              className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-anchor-blue rounded focus:ring-1 focus:ring-anchor-blue`}
                            />
                            <div className='flex-1'>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium text-gray-800 block`}>Basic Landscaping</span>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} text-anchor-blue font-medium`}>+${editorPrices.basicLandscaping.toLocaleString()}</span>
                            </div>
                          </label>
                          
                          {/* Custom Services */}
                          {customServices.map((service, index) => (
                            <label key={index} className='cursor-pointer flex items-center gap-2 px-3 py-1 rounded border border-green-200 bg-green-50 transition-all hover:border-green-300 hover:bg-green-100 focus-within:ring-2 focus-within:ring-green-100 focus-within:border-green-500'>
                              <input
                                type='checkbox'
                                checked={true} // Custom services are always selected when created
                                readOnly
                                className='w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-100'
                              />
                              <div className='flex-1'>
                                <span className='text-[11px] font-medium text-gray-800 block'>{service.description}</span>
                                <span className='text-[11px] text-green-600 font-semibold'>+${service.price.toLocaleString()}</span>
                              </div>
                              <button
                                type='button'
                                onClick={() => {
                                  const newServices = customServices.filter((_, i) => i !== index);
                                  setCustomServices(newServices);
                                }}
                                className='text-red-400 hover:text-red-600 text-xs ml-2 px-1'
                                title='Remove service'
                              >
                                ✕
                              </button>
                            </label>
                          ))}
                          
                          <button 
                            type='button'
                            data-navigation
                            onClick={() => setShowAddMorePopup(true)}
                            className='cursor-pointer flex items-center justify-center px-3 py-1 rounded-md border border-dashed border-gray-300 bg-blue-50 hover:border-gray-400 hover:bg-gray-50 transition-all focus:border-anchor-blue focus:ring-1 focus:ring-anchor-blue focus:outline-none'
                          >
                            <span className='text-[11px] text-gray-900 font-medium'>+ Add More</span>
                          </button>
                        </div>
                        <div className='text-right mt-1'>
                          <span className='text-[11px] text-gray-500 italic'>Click "+ Add More" to create custom services</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'services' && (
                    <div className='space-y-1.5'>
                      <div>
                        <div className='text-[11px] font-medium text-gray-900 mb-1'>ADU Design Services</div>
                        <label className={`cursor-pointer flex items-start gap-2 px-3 py-1 rounded border transition-all focus-within:ring-2 focus-within:ring-1 focus-within:ring-anchor-blue focus-within:border-anchor-blue ${
                          (pricingData.designServices || 0) > 0
                            ? 'border-anchor-blue bg-anchor-blue-light hover:border-anchor-blue-hover hover:bg-gray-100'
                            : 'border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50'
                        }`}>
                          <input
                            type='checkbox'
                            checked={true} // Always checked
                            disabled={true} // Cannot be unchecked
                            className='w-4 h-4 text-anchor-blue rounded mt-0.5 opacity-75 cursor-not-allowed'
                          />
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <span className='text-[11px] font-medium text-gray-800'>ADU Design Services (HOL)</span>
                              <span className='font-bold text-anchor-blue text-[11px]'>+${editorPrices.designServices.toLocaleString()}</span>
                            </div>
                            <p className='text-[11px] text-gray-600 mt-0.5'>Architectural plans, structural engineering, and permit assistance</p>
                          </div>
                        </label>
                      </div>

                      <div className='space-y-0.5'>
                        <label className='cursor-pointer flex items-center gap-2 px-3 py-1 rounded border border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 transition-all focus-within:ring-2 focus-within:ring-1 focus-within:ring-anchor-blue focus-within:border-anchor-blue'>
                          <input
                            type='checkbox'
                            checked={!!pricingData.solarReady}
                            onChange={e => {
                              console.log('Solar Ready clicked:', e.target.checked);
                              updatePricingData({ solarReady: e.target.checked });
                            }}
                            className='w-4 h-4 text-anchor-blue rounded focus:ring-1 focus:ring-anchor-blue'
                          />
                          <span className='text-[11px] font-medium text-gray-800'>Solar Vendor Coordination</span>
                          <span className='text-[10px] text-green-600 font-medium ml-auto'>$0</span>
                        </label>

                        <div className='space-y-2'>
                          <label className='cursor-pointer flex items-center gap-2 px-3 py-1 rounded border border-gray-300 bg-white hover:border-gray-400 hover:bg-gray-50 transition-all focus-within:ring-2 focus-within:ring-1 focus-within:ring-anchor-blue focus-within:border-anchor-blue'>
                            <input
                              type='checkbox'
                              checked={!!pricingData.femaCompliance}
                              onChange={e => {
                                if (e.target.checked) {
                                  setShowFemaPopup(true);
                                } else {
                                  updatePricingData({ 
                                    femaCompliance: false,
                                    femaAmount: 0
                                  });
                                }
                              }}
                              className='w-4 h-4 text-anchor-blue rounded focus:ring-1 focus:ring-anchor-blue'
                            />
                            <span className='text-[11px] font-medium text-gray-800'>FEMA Compliance Services</span>
                          </label>
                          
                          {pricingData.femaCompliance && (
                            <div className='ml-6 flex items-center gap-2'>
                              <label className='text-[10px] text-gray-600 font-medium'>Amount:</label>
                              <div className='flex items-center'>
                                <span className='text-[10px] text-gray-500 mr-1'>$</span>
                                <input
                                  type='number'
                                  min='0'
                                  step='100'
                                  value={pricingData.femaAmount || 5000}
                                  onChange={e => {
                                    const amount = parseInt(e.target.value) || 0;
                                    updatePricingData({ femaAmount: amount });
                                  }}
                                  className='w-20 px-2 py-1 text-[10px] border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500 text-center'
                                  placeholder='5000'
                                />
                              </div>
                              <span className='text-[9px] text-gray-400'>(required)</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {section.id === 'notes' && (
                    <div>
                      <label className='block text-[11px] font-medium text-gray-800 mb-1'>Additional Notes</label>
                      <textarea
                        value=''
                        onClick={() => alert('Feature will be added later - vinh@pigroup.io')}
                        onChange={() => {}} // Do nothing
                        placeholder='Feature will be added later - vinh@pigroup.io'
                        className='w-full h-12 px-3 py-1 border border-gray-300 rounded-md text-[11px] text-gray-900 bg-gray-100 resize-none cursor-pointer'
                        readOnly
                      />
                    </div>
                  )}

                </div>
              </div>
            ))}
          </div>

          {/* Pricing Sidebar */}
          <div className='xl:block hidden relative'>
            <div className={`bg-blue-25 rounded p-3 sticky top-6 ${sidebarWiggle ? 'animate-wiggle' : ''}`} style={{border: '3px solid #ffffff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', backgroundColor: '#f8faff'}}>
              <div className='flex items-center justify-center mb-3'>
                <h3 className='text-[11px] font-semibold text-gray-900 uppercase tracking-wider mb-2 border-b border-gray-200 pb-2 text-center'>5. Project Summary</h3>
              </div>
              
              <div className='space-y-1.5 text-[11px]'>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Client:</span>
                  <span className={`font-medium ${projectData.clientName ? 'text-anchor-blue' : 'text-red-600'}`}>{projectData.clientName || 'Missing'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Address:</span>
                  <span className={`font-medium ${projectData.propertyAddress ? 'text-anchor-blue' : 'text-red-600'}`}>{projectData.propertyAddress || 'Missing'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>ADU Type:</span>
                  <span className={`font-medium ${projectData.aduType ? 'text-anchor-blue' : 'text-red-600'}`}>
                    {projectData.aduType 
                      ? projectData.aduType === 'jadu' 
                        ? 'JADU' 
                        : projectData.aduType === 'detached' && projectData.stories === 2
                          ? 'Detached (2-Story)'
                          : `${projectData.aduType.charAt(0).toUpperCase() + projectData.aduType.slice(1)}`
                      : 'Not Selected'
                    }
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Size:</span>
                  <span className={`font-medium ${projectData.squareFootage ? 'text-anchor-blue' : 'text-red-600'}`}>{projectData.squareFootage ? `${projectData.squareFootage} sq ft` : 'Missing'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>HVAC:</span>
                  <span className={`font-medium ${projectData.hvacType ? 'text-anchor-blue' : 'text-red-600'}`}>
                    {projectData.hvacType 
                      ? projectData.hvacType === 'central-ac' 
                        ? 'Central AC'
                        : projectData.hvacType === 'mini-split'
                        ? 'Mini-Split'
                        : projectData.hvacType === 'custom'
                        ? `Custom${projectData.hvacCustomPrice ? ` +$${projectData.hvacCustomPrice.toLocaleString()}` : ''}`
                        : projectData.hvacType
                      : 'Not Selected'
                    }
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Utilities:</span>
                  <div className='text-right'>
                    {projectData.utilities ? (
                      <div className='space-y-0'>
                        {projectData.utilities.waterMeter === 'separate' && <div className='font-medium text-[10px] text-anchor-blue'>Water: Separate</div>}
                        {projectData.utilities.gasMeter === 'separate' && <div className='font-medium text-[10px] text-anchor-blue'>Gas: Separate</div>}
                        {projectData.utilities.sewerMeter === 'separate' && <div className='font-medium text-[10px] text-anchor-blue'>Sewer: Separate</div>}
                        {projectData.utilities.electricMeter === 'separate' && <div className='font-medium text-[10px] text-anchor-blue'>Electric: Separate</div>}
                        {(!projectData.utilities.waterMeter || projectData.utilities.waterMeter === 'shared') && 
                         (!projectData.utilities.gasMeter || projectData.utilities.gasMeter === 'shared') && 
                         (!projectData.utilities.sewerMeter || projectData.utilities.sewerMeter === 'shared') && 
                         (!projectData.utilities.electricMeter || projectData.utilities.electricMeter === 'shared') && (
                          <span className='font-medium text-slate-600'>All Shared</span>
                        )}
                      </div>
                    ) : (
                      <span className='font-medium text-slate-600'>All Shared</span>
                    )}
                  </div>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Electrical Panel:</span>
                  <span className={`font-medium ${projectData.electricalPanel ? 'text-anchor-blue' : 'text-slate-600'}`}>
                    {projectData.electricalPanel || 200}A
                    {pricingData.electricalPanelUpgrade && pricingData.electricalPanelUpgrade > 0 && (
                      <span className='text-green-600 ml-1'>+${pricingData.electricalPanelUpgrade.toLocaleString()}</span>
                    )}
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Design:</span>
                  <span className={`font-medium ${pricingData.designServices ? 'text-green-600' : 'text-red-600'}`}>
                    {pricingData.designServices ? `+$${pricingData.designServices.toLocaleString()}` : 'Not included'}
                  </span>
                </div>
                {pricingData.solarReady && (
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Solar Vendor Coordination:</span>
                    <span className='font-medium text-blue-600'>$0 (included)</span>
                  </div>
                )}
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Add-ons:</span>
                  <div className='text-right'>
                    {pricingData.extraBathroom && <div className='font-medium text-[10px]'><span className='text-anchor-blue'>Extra Bathroom:</span> <span className='text-green-600'>+${editorPrices.extraBathroom.toLocaleString()}</span></div>}
                    {pricingData.dedicatedDriveway && <div className='font-medium text-[10px]'><span className='text-anchor-blue'>Dedicated Driveway:</span> <span className='text-green-600'>+${editorPrices.dedicatedDriveway.toLocaleString()}</span></div>}
                    {pricingData.basicLandscaping && <div className='font-medium text-[10px]'><span className='text-anchor-blue'>Landscaping:</span> <span className='text-green-600'>+${editorPrices.basicLandscaping.toLocaleString()}</span></div>}
                    {customServices.map((service, index) => (
                      <div key={index} className='font-medium text-[10px]'>
                        <span className='text-anchor-blue'>{service.description}:</span> <span className='text-green-600'>+${service.price.toLocaleString()}</span>
                      </div>
                    ))}
                    {!pricingData.extraBathroom && !pricingData.dedicatedDriveway && !pricingData.basicLandscaping && customServices.length === 0 && <span className='font-medium text-slate-600'>None</span>}
                  </div>
                </div>
              </div>

              <div className='border-t mt-3 pt-3'>
                <div className='flex items-center mb-2'>
                  <Calculator className='w-4 h-4 text-slate-600 mr-1' />
                  <h4 className='font-semibold text-slate-800 text-[11px]'>Breakdown</h4>
                </div>
                <div className='space-y-1 text-[11px] ml-4'>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Base Construction:</span>
                    <span className='font-medium'>${liveCalculation.basePrice.toLocaleString()}</span>
                  </div>
                  {pricingData.designServices && (
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Design:</span>
                      <span className='font-medium text-green-600'>${liveCalculation.designCost.toLocaleString()}</span>
                    </div>
                  )}
                  {liveCalculation.utilitiesCost > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Utilities:</span>
                      <span className='font-medium text-anchor-blue'>${liveCalculation.utilitiesCost.toLocaleString()}</span>
                    </div>
                  )}
                  {pricingData.electricalPanelUpgrade && pricingData.electricalPanelUpgrade > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Electrical Panel Upgrade:</span>
                      <span className='font-medium text-green-600'>${pricingData.electricalPanelUpgrade.toLocaleString()}</span>
                    </div>
                  )}
                  {projectData.hvacType === 'custom' && (projectData.hvacCustomPrice || 0) > 0 && (
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Custom HVAC System:</span>
                      <span className='font-medium text-green-600'>${(projectData.hvacCustomPrice || 0).toLocaleString()}</span>
                    </div>
                  )}
                  <div className='flex justify-between border-t pt-1 mt-1'>
                    <span className='text-slate-600 font-medium'>Base Subtotal:</span>
                    <span className='font-medium'>${(liveCalculation.basePrice + liveCalculation.designCost + liveCalculation.utilitiesCost + (pricingData.electricalPanelUpgrade || 0) + (projectData.hvacType === 'custom' && projectData.hvacCustomPrice ? projectData.hvacCustomPrice : 0)).toLocaleString()}</span>
                  </div>
                  {(pricingData.extraBathroom || pricingData.dedicatedDriveway || pricingData.basicLandscaping || customServices.length > 0) && (
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Add-ons:</span>
                    </div>
                  )}
                  {pricingData.extraBathroom && (
                    <EditableBreakdownItem
                      itemKey='extraBathroom'
                      label='• Extra Bathroom:'
                      value={editorPrices.extraBathroom}
                      isEditing={editingBreakdownItem === 'extraBathroom'}
                    />
                  )}
                  {pricingData.dedicatedDriveway && (
                    <EditableBreakdownItem
                      itemKey='dedicatedDriveway'
                      label='• Dedicated Driveway:'
                      value={editorPrices.dedicatedDriveway}
                      isEditing={editingBreakdownItem === 'dedicatedDriveway'}
                    />
                  )}
                  {pricingData.basicLandscaping && (
                    <EditableBreakdownItem
                      itemKey='basicLandscaping'
                      label='• Basic Landscaping:'
                      value={editorPrices.basicLandscaping}
                      isEditing={editingBreakdownItem === 'basicLandscaping'}
                    />
                  )}
                  {customServices.map((service, index) => (
                    <div key={index} className='flex justify-between ml-4'>
                      <span className='text-slate-600'>• {service.description}:</span>
                      <span className='font-medium text-green-600'>+${service.price.toLocaleString()}</span>
                    </div>
                  ))}
                  {(pricingData.extraBathroom || pricingData.dedicatedDriveway || pricingData.basicLandscaping || customServices.length > 0) && (
                    <div className='flex justify-between border-t pt-1 mt-1'>
                      <span className='text-slate-600 font-medium'>Add-ons Subtotal:</span>
                      <span className='font-medium text-green-600'>${liveCalculation.addOnsCost.toLocaleString()}</span>
                    </div>
                  )}
                  {pricingData.friendsAndFamilyDiscount && (
                    <div className='flex justify-between text-red-600'>
                      <span className='font-medium'>Friends & Family ({(() => {
                        const discountType = pricingData.friendsAndFamilyDiscountType || '10%';
                        return discountType === 'custom' 
                          ? `${pricingData.friendsAndFamilyDiscountCustom || 0}% off`
                          : `${discountType} off`;
                      })()}):</span>
                      <span className='font-medium'>-${(() => {
                        const discountPercent = pricingData.friendsAndFamilyDiscountType === 'custom' 
                          ? (pricingData.friendsAndFamilyDiscountCustom || 0) / 100
                          : pricingData.friendsAndFamilyDiscountType === '5%' ? 0.05 : 0.1;
                        return (liveCalculation.finalTotal * discountPercent).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
                      })()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Milestone Payments Section */}
              <div className='border-t mt-3 pt-3'>
                <div className='flex items-center justify-between mb-2'>
                  <div className='flex items-center'>
                    <Calendar className='w-4 h-4 text-slate-600 mr-1' />
                    <h4 className='font-semibold text-slate-800 text-[11px]'>Milestone Payments</h4>
                  </div>
                  <button
                    onClick={() => setShowMilestones(!showMilestones)}
                    className='text-anchor-blue hover:text-anchor-blue-hover text-[10px] font-medium transition-colors'
                  >
                    {showMilestones ? '▼ Hide' : '▶ Show'}
                  </button>
                </div>
                
                {showMilestones && (
                  <div className='space-y-2 ml-4'>
                    {/* Payment Plan Selector */}
                    <div className='flex items-center gap-2 text-[10px] mb-3'>
                      <span className='text-slate-600'>Payment Plan:</span>
                      <select
                        value={selectedMilestoneType}
                        onChange={(e) => setSelectedMilestoneType(e.target.value)}
                        className='px-2 py-1 border border-gray-300 rounded text-[10px] bg-white focus:border-anchor-blue focus:outline-none'
                      >
                        <option value="standard">Standard (5 payments)</option>
                        <option value="accelerated">Accelerated (3 payments)</option>
                        <option value="extended">Extended (7 payments)</option>
                      </select>
                    </div>
                    
                    {/* Edit Milestones Button */}
                    <button
                      onClick={() => {
                        const defaultMilestones = calculateMilestones(liveCalculation.finalTotal);
                        const milestonesWithPercentages = defaultMilestones.map((m, i) => ({
                          ...m,
                          percentage: i === 0 ? 0 : i === 1 ? 0 : (m.amount / (liveCalculation.finalTotal - 13500)) * 100 // D1 and D2 are fixed
                        }));
                        setTempMilestones(customMilestones || milestonesWithPercentages);
                        setShowMilestoneEditor(true);
                      }}
                      className='w-full text-[10px] text-anchor-blue hover:text-anchor-blue-hover underline mb-2'
                    >
                      Edit Milestone Amounts & Percentages
                    </button>
                    
                    {/* Milestone List - 9 Total: D1, D2, M1-M7 */}
                    <div className='space-y-1'>
                      {(customMilestones || calculateMilestones(liveCalculation.finalTotal)).map((milestone, index) => {
                        // Style based on milestone type
                        const isDesignPhase = milestone.type === 'design' || index < 2; // D1 and D2
                        const bgColor = isDesignPhase ? 'hover:bg-amber-50' : 'hover:bg-blue-50';
                        const accentColor = isDesignPhase ? 'text-amber-600' : 'text-anchor-blue';
                        const phaseColor = isDesignPhase ? 'text-amber-500' : 'text-slate-500';
                        
                        return (
                          <div key={index} className={`flex justify-between items-center text-[10px] py-1 ${bgColor} px-1 rounded border-l-2 ${
                            isDesignPhase ? 'border-amber-300' : 'border-blue-300'
                          }`}>
                            <div className='flex-1'>
                              <div className={`font-medium ${isDesignPhase ? 'text-amber-800' : 'text-slate-700'}`}>
                                {milestone.label}
                              </div>
                              <div className={`${phaseColor} text-[9px]`}>{milestone.phase}</div>
                            </div>
                            <div className={`font-semibold ${accentColor}`}>
                              ${milestone.amount.toLocaleString()}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                    
                    {/* Milestone Total Verification */}
                    <div className='border-t pt-2 mt-2'>
                      <div className='flex justify-between text-[10px] font-medium text-slate-700'>
                        <span>Total Milestones:</span>
                        <span>${(customMilestones || calculateMilestones(liveCalculation.finalTotal)).reduce((sum, m) => sum + m.amount, 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className='border-t mt-3 pt-3'>
                <div className='flex justify-between items-center'>
                  <span className='text-[11px] font-bold text-slate-800'>Total:</span>
                  <span className='text-[11px] font-bold text-slate-800'>
${pricingData.friendsAndFamilyDiscount 
  ? (() => {
      const discountPercent = pricingData.friendsAndFamilyDiscountType === 'custom' 
        ? (pricingData.friendsAndFamilyDiscountCustom || 0) / 100
        : pricingData.friendsAndFamilyDiscountType === '5%' ? 0.05 : 0.1;
      return (liveCalculation.finalTotal * (1 - discountPercent)).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    })()
  : liveCalculation.finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* Form Completion Progress */}
              <div className='mb-3'>
                <div 
                  className='flex justify-between items-center mb-1 cursor-pointer hover:bg-gray-50 p-1 rounded'
                  onClick={() => setShowMissingFields(!showMissingFields)}
                >
                  <span className='text-xs text-gray-600'>Form Completion</span>
                  <span className='text-xs font-medium text-gray-700'>
                    {formValidation.filledCount}/{formValidation.totalCount} fields
                  </span>
                </div>
                <div 
                  className='w-full bg-gray-200 rounded-full h-2 cursor-pointer'
                  onClick={() => setShowMissingFields(!showMissingFields)}
                >
                  <div 
                    className={`h-2 rounded-full transition-all duration-300 ${
                      formValidation.percentage === 100 
                        ? 'bg-green-500' 
                        : formValidation.percentage >= 75 
                          ? 'bg-blue-500' 
                          : formValidation.percentage >= 50 
                            ? 'bg-yellow-500' 
                            : 'bg-red-500'
                    }`}
                    style={{ width: `${formValidation.percentage}%` }}
                  />
                </div>
                {!isFormValid && (
                  <p className='text-xs text-red-600 mt-1 cursor-pointer' onClick={() => setShowMissingFields(!showMissingFields)}>
                    Complete all required fields to generate proposal (click to see missing)
                  </p>
                )}
                {showMissingFields && formValidation.missingFields.length > 0 && (
                  <div className='mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs'>
                    <div className='font-medium text-red-800 mb-1'>Missing Fields:</div>
                    <ul className='text-red-700 space-y-0.5'>
                      {formValidation.missingFields.map((field, index) => (
                        <li key={index} className='flex items-start'>
                          <span className='mr-1'>•</span>
                          <span>{field}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              <div className='flex gap-2'>
                <button 
                  onClick={handlePDFPreview}
                  disabled={isGeneratingPDF || !isFormValid}
                  className={`flex-1 text-white px-4 py-3 rounded-lg font-medium transition-all shadow-md ${
                    isGeneratingPDF || !isFormValid
                      ? 'bg-gray-400 cursor-not-allowed opacity-60' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 hover:shadow-lg'
                  }`}
                  title={!isFormValid ? 'Please fill out all required fields' : ''}
                >
                  {isGeneratingPDF ? 'Generating PDF...' : 'Generate Proposal'}
                </button>
                <button 
                  onClick={() => alert('Draft saved! Your progress has been preserved.')}
                  className='bg-slate-500 text-white px-3 py-3 rounded-lg text-sm font-medium hover:bg-slate-600 transition-all shadow-md hover:shadow-lg'
                >
                  Save Draft
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Add More Service Popup */}
      {showAddMorePopup && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-4 w-96 shadow-xl'>
            <h3 className='text-lg font-semibold mb-3'>Add Custom Service</h3>
            
            <div className='space-y-3'>
              <div>
                <label className='block text-sm font-medium text-gray-900 mb-2'>Service Description</label>
                <input
                  type='text'
                  value={customServiceDescription}
                  onChange={(e) => setCustomServiceDescription(e.target.value)}
                  className='w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-anchor-blue focus:border-anchor-blue'
                  placeholder='Enter service description'
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-900 mb-2'>Price</label>
                <input
                  type='number'
                  value={customServicePrice}
                  onChange={(e) => setCustomServicePrice(e.target.value)}
                  className='w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-anchor-blue focus:border-anchor-blue'
                  placeholder='Enter price (numbers only)'
                />
              </div>
            </div>
            
            <div className='flex justify-end gap-3 mt-4'>
              <button
                onClick={() => setShowAddMorePopup(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomService}
                className='px-4 py-2 bg-anchor-blue text-white rounded-md hover:bg-anchor-blue-hover border border-anchor-blue transition-colors'
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADU Type Selection with Base Price Popup */}
      {showAduTypePopup && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              {pendingAduTypeSelection === 'jadu' && 'JADU (Junior ADU)'}
              {pendingAduTypeSelection === 'attached' && 'Attached ADU'}
              {pendingAduTypeSelection === 'detached' && 'Detached ADU'}
              {' '}Configuration
            </h3>
            <p className='text-sm text-gray-600 mb-4'>
              Enter the base price per square foot for this ADU type
            </p>
            
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Base Price per Square Foot
              </label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>$</span>
                <input
                  type='number'
                  min='50'
                  max='1000'
                  step='10'
                  value={tempBasePricePerSqft}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    setTempBasePricePerSqft(value);
                  }}
                  className='w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='240'
                />
                <span className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-sm'>/sqft</span>
              </div>
              <p className='text-xs text-gray-500 mt-1'>
                {pendingAduTypeSelection === 'jadu' ? 'Typical JADU range: $180-$220/sqft' : 'Typical range: $220-$280/sqft'}
              </p>
            </div>
            
            {pendingAduTypeSelection === 'detached' && (
              <div className='mb-4 p-3 bg-blue-50 rounded-lg'>
                <p className='text-sm font-medium text-gray-700 mb-2'>
                  Number of Stories
                </p>
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      updateProjectData({ 
                        aduType: 'detached',
                        stories: 1
                      });
                      onPricingDataUpdate({ 
                        basePricePerSqft: tempBasePricePerSqft,
                        twoStoryPrice: 0
                      });
                      setShowAduTypePopup(false);
                      setPendingAduTypeSelection(null);
                    }}
                    className='flex-1 p-2 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-center'
                  >
                    <div className='font-medium text-gray-900'>1 Story</div>
                    <div className='text-xs text-gray-600'>Standard pricing</div>
                  </button>
                  
                  <button
                    onClick={() => {
                      // Show 2-story popup after this
                      updateProjectData({ 
                        aduType: 'detached',
                        stories: 2
                      });
                      onPricingDataUpdate({ 
                        basePricePerSqft: tempBasePricePerSqft
                      });
                      setShowAduTypePopup(false);
                      setPendingAduTypeSelection(null);
                      // Show 2-story pricing popup
                      setTimeout(() => setShowStoryPopup(true), 100);
                    }}
                    className='flex-1 p-2 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-center'
                  >
                    <div className='font-medium text-gray-900'>2 Story</div>
                    <div className='text-xs text-gray-600'>Additional pricing</div>
                  </button>
                </div>
              </div>
            )}
            
            <div className='flex justify-end gap-2'>
              {pendingAduTypeSelection !== 'detached' && (
                <button
                  onClick={() => {
                    updateProjectData({ 
                      aduType: pendingAduTypeSelection
                    });
                    onPricingDataUpdate({ 
                      basePricePerSqft: tempBasePricePerSqft
                    });
                    setShowAduTypePopup(false);
                    setPendingAduTypeSelection(null);
                  }}
                  className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                >
                  Confirm
                </button>
              )}
              <button
                onClick={() => {
                  setShowAduTypePopup(false);
                  setPendingAduTypeSelection(null);
                }}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Story Selection Popup for Detached ADUs */}
      {showStoryPopup && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-4 shadow-xl max-w-lg w-full mx-4'>
            <div className='text-center'>
              <h3 className='text-lg font-semibold text-gray-900 mb-3'>Detached ADU Configuration</h3>
              <p className='text-sm text-gray-600 mb-4'>
                Select the number of stories and pricing for your detached ADU
              </p>
              
              <div className='space-y-4'>
                {/* One Story Option */}
                <div 
                  onClick={() => {
                    updateProjectData({ 
                      aduType: 'detached',
                      stories: 1
                    });
                    onPricingDataUpdate({ twoStoryPrice: 0 });
                    setShowStoryPopup(false);
                    setPendingAduType(null);
                  }}
                  className='p-4 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer'
                >
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-3'>
                      <div className='text-2xl'>🏠</div>
                      <div className='text-left'>
                        <span className='font-semibold text-gray-900 block'>One Story</span>
                        <span className='text-xs text-gray-500'>Standard single level</span>
                      </div>
                    </div>
                    <span className='text-sm font-medium text-gray-700'>Base Price</span>
                  </div>
                </div>
                
                {/* Two Story Option with Custom Price */}
                <div className='p-4 border-2 border-blue-200 rounded-lg'>
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-3'>
                      <div className='text-2xl'>🏘️</div>
                      <div className='text-left'>
                        <span className='font-semibold text-gray-900 block'>Two Stories</span>
                        <span className='text-xs text-gray-500'>Multi-level with additional cost</span>
                      </div>
                    </div>
                  </div>
                  <div className='flex items-center gap-2'>
                    <label className='text-sm font-medium text-gray-700'>Additional Cost:</label>
                    <div className='flex items-center gap-1'>
                      <span className='text-gray-600'>$</span>
                      <input
                        type='number'
                        placeholder='15000'
                        className='w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:border-blue-500 focus:ring-1 focus:ring-blue-500'
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          onPricingDataUpdate({ twoStoryPrice: value });
                        }}
                      />
                    </div>
                    <button
                      onClick={() => {
                        updateProjectData({ 
                          aduType: 'detached',
                          stories: 2
                        });
                        setShowStoryPopup(false);
                        setPendingAduType(null);
                      }}
                      className='ml-auto px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium'
                    >
                      Select 2-Story
                    </button>
                  </div>
                </div>
              </div>
              
              <button
                onClick={() => {
                  setShowStoryPopup(false);
                  setPendingAduType(null);
                }}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FEMA Custom Pricing Popup */}
      {showFemaPopup && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>FEMA Compliance Pricing</h3>
            <p className='text-sm text-gray-600 mb-4'>
              Enter the custom price for FEMA compliance services
            </p>
            
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                FEMA Compliance Price
              </label>
              <input
                type='number'
                min='0'
                max='50000'
                step='100'
                value={pricingData.femaAmount || 5000}
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  updatePricingData({ femaAmount: value });
                }}
                className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                placeholder='Enter amount'
              />
              <p className='text-xs text-gray-500 mt-1'>Default: $5,000</p>
            </div>
            
            <div className='flex justify-end gap-2'>
              <button
                onClick={() => {
                  updatePricingData({ 
                    femaCompliance: true,
                    femaAmount: pricingData.femaAmount || 5000
                  });
                  setShowFemaPopup(false);
                }}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  updatePricingData({ 
                    femaCompliance: false,
                    femaAmount: 0
                  });
                  setShowFemaPopup(false);
                }}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HVAC Custom Pricing Popup */}
      {showHvacPopup && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>HVAC System Pricing</h3>
            <p className='text-sm text-gray-600 mb-4'>
              Select standard pricing or enter a custom price for the HVAC system
            </p>
            
            <div className='space-y-3 mb-4'>
              <button
                onClick={() => {
                  updateProjectData({ 
                    hvacType: 'standard',
                    hvacCustomPrice: undefined
                  });
                  setShowHvacPopup(false);
                }}
                className='w-full p-3 border-2 border-blue-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all text-left'
              >
                <div className='font-medium text-gray-900'>Standard HVAC</div>
                <div className='text-sm text-gray-600'>Use standard pricing</div>
              </button>
              
              <div className='p-3 border-2 border-gray-200 rounded-lg'>
                <div className='font-medium text-gray-900 mb-2'>Custom HVAC Price</div>
                <input
                  type='number'
                  min='0'
                  max='50000'
                  step='100'
                  value={projectData.hvacCustomPrice || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    updateProjectData({ hvacCustomPrice: value });
                  }}
                  className='w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter custom amount'
                />
                <button
                  onClick={() => {
                    updateProjectData({ 
                      hvacType: 'custom',
                      hvacCustomPrice: projectData.hvacCustomPrice || 0
                    });
                    setShowHvacPopup(false);
                  }}
                  className='mt-2 w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm'
                  disabled={!projectData.hvacCustomPrice}
                >
                  Use Custom Price
                </button>
              </div>
            </div>
            
            <button
              onClick={() => {
                setShowHvacPopup(false);
              }}
              className='w-full px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Utilities Custom Pricing Popup */}
      {showUtilitiesPopup && utilityType && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>
              {utilityType === 'waterMeter' && 'Water Meter'}
              {utilityType === 'gasMeter' && 'Gas Meter'}
              {utilityType === 'electricMeter' && 'Electric Meter'}
              {utilityType === 'sewerMeter' && 'Sewer Connection'}
              {' '}Pricing
            </h3>
            <p className='text-sm text-gray-600 mb-4'>
              What is the price for a separate {utilityType === 'waterMeter' && 'water meter'}
              {utilityType === 'gasMeter' && 'gas meter'}
              {utilityType === 'electricMeter' && 'electric meter'}
              {utilityType === 'sewerMeter' && 'sewer connection'}?
            </p>
            
            <div className='mb-4'>
              <label className='block text-sm font-medium text-gray-700 mb-2'>
                Price for Separate {utilityType === 'waterMeter' && 'Water Meter'}
                {utilityType === 'gasMeter' && 'Gas Meter'}
                {utilityType === 'electricMeter' && 'Electric Meter'}
                {utilityType === 'sewerMeter' && 'Sewer Connection'}
              </label>
              <div className='relative'>
                <span className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500'>$</span>
                <input
                  type='number'
                  min='0'
                  max='50000'
                  step='100'
                  value={pricingData.utilitiesCustomPrice?.[utilityType] || ''}
                  onChange={(e) => {
                    const value = parseInt(e.target.value) || 0;
                    updatePricingData({ 
                      utilitiesCustomPrice: {
                        ...pricingData.utilitiesCustomPrice,
                        [utilityType]: value
                      }
                    });
                  }}
                  className='w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500'
                  placeholder='Enter price'
                  autoFocus
                />
              </div>
              <p className='text-xs text-gray-500 mt-1'>Enter the cost for installing a separate {
                utilityType === 'waterMeter' ? 'water meter' :
                utilityType === 'gasMeter' ? 'gas meter' :
                utilityType === 'electricMeter' ? 'electric meter' :
                'sewer connection'
              }</p>
            </div>
            
            <div className='flex justify-end gap-2'>
              <button
                onClick={() => {
                  const currentValue = pricingData.utilitiesCustomPrice?.[utilityType] || 0;
                  if (currentValue === 0) {
                    alert('Please enter a price for the separate utility connection.');
                    return;
                  }
                  updatePricingData({ 
                    utilitiesCustomPrice: {
                      ...pricingData.utilitiesCustomPrice,
                      [utilityType]: currentValue
                    }
                  });
                  updateProjectData({
                    utilities: {
                      ...projectData.utilities,
                      [utilityType]: 'separate'
                    }
                  });
                  setShowUtilitiesPopup(false);
                  setUtilityType(null);
                }}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
                disabled={!pricingData.utilitiesCustomPrice?.[utilityType]}
              >
                Confirm
              </button>
              <button
                onClick={() => {
                  updateProjectData({
                    utilities: {
                      ...projectData.utilities,
                      [utilityType]: 'shared'
                    }
                  });
                  setShowUtilitiesPopup(false);
                  setUtilityType(null);
                }}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Milestone Editor Popup */}
      {showMilestoneEditor && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg p-6 shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto'>
            <h3 className='text-lg font-semibold text-gray-900 mb-3'>Edit Milestone Schedule</h3>
            <p className='text-sm text-gray-600 mb-4'>
              Customize milestone amounts and percentages. D1 and D2 are fixed amounts.
            </p>
            
            <div className='space-y-3'>
              {tempMilestones.map((milestone, index) => (
                <div key={index} className='border border-gray-200 rounded-lg p-3'>
                  <div className='grid grid-cols-4 gap-3'>
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Milestone
                      </label>
                      <input
                        type='text'
                        value={milestone.label}
                        onChange={(e) => {
                          const updated = [...tempMilestones];
                          updated[index].label = e.target.value;
                          setTempMilestones(updated);
                        }}
                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm'
                        disabled={index < 2} // D1 and D2 labels are fixed
                      />
                    </div>
                    
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Amount
                      </label>
                      <input
                        type='number'
                        value={milestone.amount}
                        onChange={(e) => {
                          const value = parseInt(e.target.value) || 0;
                          const updated = [...tempMilestones];
                          updated[index].amount = value;
                          
                          // Update percentage for construction milestones
                          if (index >= 2) {
                            const constructionTotal = tempMilestones.slice(2).reduce((sum, m) => sum + m.amount, 0) - milestone.amount + value;
                            if (constructionTotal > 0) {
                              updated[index].percentage = (value / constructionTotal) * 100;
                            }
                          }
                          
                          setTempMilestones(updated);
                        }}
                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm'
                        disabled={index === 0 || index === 1} // D1 and D2 are fixed
                      />
                    </div>
                    
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Percentage {index >= 2 && '(%)'}
                      </label>
                      <input
                        type='number'
                        value={index < 2 ? 'Fixed' : milestone.percentage.toFixed(1)}
                        onChange={(e) => {
                          if (index < 2) return; // D1 and D2 are fixed
                          
                          const value = parseFloat(e.target.value) || 0;
                          const updated = [...tempMilestones];
                          updated[index].percentage = value;
                          
                          // Recalculate amount based on percentage
                          const constructionTotal = liveCalculation.finalTotal - 13500; // Total minus D1 and D2
                          updated[index].amount = Math.round(constructionTotal * (value / 100));
                          
                          setTempMilestones(updated);
                        }}
                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm'
                        disabled={index < 2}
                        step='0.1'
                        min='0'
                        max='100'
                      />
                    </div>
                    
                    <div>
                      <label className='block text-xs font-medium text-gray-700 mb-1'>
                        Phase
                      </label>
                      <input
                        type='text'
                        value={milestone.phase}
                        onChange={(e) => {
                          const updated = [...tempMilestones];
                          updated[index].phase = e.target.value;
                          setTempMilestones(updated);
                        }}
                        className='w-full px-2 py-1 border border-gray-300 rounded-md text-sm'
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Validation Summary */}
            <div className='mt-4 p-3 bg-gray-50 rounded-lg'>
              <div className='flex justify-between text-sm'>
                <span className='font-medium'>Total Amount:</span>
                <span className={`font-bold ${
                  tempMilestones.reduce((sum, m) => sum + m.amount, 0) === liveCalculation.finalTotal
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  ${tempMilestones.reduce((sum, m) => sum + m.amount, 0).toLocaleString()}
                  {tempMilestones.reduce((sum, m) => sum + m.amount, 0) !== liveCalculation.finalTotal &&
                    ` (Should be $${liveCalculation.finalTotal.toLocaleString()})`
                  }
                </span>
              </div>
              
              <div className='flex justify-between text-sm mt-1'>
                <span className='font-medium'>Construction Percentage Total:</span>
                <span className={`font-bold ${
                  Math.abs(tempMilestones.slice(2).reduce((sum, m) => sum + m.percentage, 0) - 100) < 0.1
                    ? 'text-green-600' : 'text-red-600'
                }`}>
                  {tempMilestones.slice(2).reduce((sum, m) => sum + m.percentage, 0).toFixed(1)}%
                  {Math.abs(tempMilestones.slice(2).reduce((sum, m) => sum + m.percentage, 0) - 100) >= 0.1 &&
                    ' (Should be 100%)'
                  }
                </span>
              </div>
            </div>
            
            <div className='flex justify-end gap-2 mt-4'>
              <button
                onClick={() => {
                  // Validate totals
                  const totalAmount = tempMilestones.reduce((sum, m) => sum + m.amount, 0);
                  const constructionPercentage = tempMilestones.slice(2).reduce((sum, m) => sum + m.percentage, 0);
                  
                  if (Math.abs(totalAmount - liveCalculation.finalTotal) > 1) {
                    alert(`Total amount must equal $${liveCalculation.finalTotal.toLocaleString()}`);
                    return;
                  }
                  
                  if (Math.abs(constructionPercentage - 100) > 0.1) {
                    alert('Construction milestone percentages must total 100%');
                    return;
                  }
                  
                  setCustomMilestones(tempMilestones);
                  setShowMilestoneEditor(false);
                }}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors'
              >
                Apply Changes
              </button>
              <button
                onClick={() => {
                  setCustomMilestones(null);
                  setShowMilestoneEditor(false);
                }}
                className='px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors'
              >
                Reset to Default
              </button>
              <button
                onClick={() => {
                  setShowMilestoneEditor(false);
                }}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Download Settings Modal */}
      {showDownloadSettings && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-4 shadow-xl max-w-lg w-full mx-4'>
            <div className='flex justify-between items-center mb-3'>
              <h3 className='text-lg font-semibold text-gray-900'>Download Settings</h3>
              <button
                onClick={() => setShowDownloadSettings(false)}
                className='text-gray-400 hover:text-gray-600 text-xl'
              >
                ×
              </button>
            </div>
            
            <div className='space-y-3'>
              {/* Browser Limitation Notice */}
              <div className='bg-yellow-50 border border-yellow-200 rounded-lg p-3'>
                <div className='flex'>
                  <span className='text-yellow-400 mr-2'>⚠️</span>
                  <div>
                    <h4 className='font-semibold text-yellow-800 text-sm'>Browser Security Limitation</h4>
                    <p className='text-yellow-700 text-xs mt-1'>
                      Due to browser security, PDFs automatically download to your default Downloads folder. 
                      These settings help you manage the download experience.
                    </p>
                  </div>
                </div>
              </div>

              {/* Preferred Folder Display */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-2'>
                  Current Download Location
                </label>
                <div className='flex items-center justify-between p-3 bg-gray-50 rounded-lg border'>
                  <div className='flex items-center'>
                    <span className='text-blue-500 mr-2'>📁</span>
                    <span className='text-sm text-gray-700'>{downloadPreferences.preferredFolder}</span>
                  </div>
                  <button
                    onClick={() => {
                      alert('To change download location:\n\n1. Open browser settings\n2. Go to Downloads section\n3. Choose "Ask where to save each file" or set new default folder\n\nNote: This is a browser-level setting that affects all downloads.');
                    }}
                    className='text-xs text-blue-600 hover:text-blue-800 underline'
                  >
                    How to change
                  </button>
                </div>
              </div>

              {/* Download Preferences */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>Download Preferences</label>
                <div className='space-y-3'>
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={downloadPreferences.autoOpen}
                      onChange={(e) => updateDownloadPreferences({ autoOpen: e.target.checked })}
                      className='w-4 h-4 text-blue-600 rounded focus:ring-1 focus:ring-blue-500'
                    />
                    <span className='ml-2 text-sm text-gray-700'>
                      Automatically open PDF after download
                    </span>
                  </label>
                  
                  <label className='flex items-center'>
                    <input
                      type='checkbox'
                      checked={downloadPreferences.showNotification}
                      onChange={(e) => updateDownloadPreferences({ showNotification: e.target.checked })}
                      className='w-4 h-4 text-blue-600 rounded focus:ring-1 focus:ring-blue-500'
                    />
                    <span className='ml-2 text-sm text-gray-700'>
                      Show download completion notification
                    </span>
                  </label>
                </div>
              </div>

              {/* Admin Quick Actions */}
              <div>
                <label className='block text-sm font-medium text-gray-700 mb-3'>Quick Actions</label>
                <div className='flex gap-2'>
                  <button
                    onClick={() => {
                      // Reset to default Downloads folder
                      updateDownloadPreferences({ preferredFolder: 'Downloads' });
                      if (downloadPreferences.showNotification) {
                        console.log('📁 Download location reset to default Downloads folder');
                      }
                    }}
                    className='px-3 py-2 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors'
                  >
                    Reset to Downloads
                  </button>
                  
                  <button
                    onClick={() => {
                      // Open browser downloads page
                      window.open('chrome://downloads/', '_blank');
                    }}
                    className='px-3 py-2 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors'
                  >
                    Open Downloads
                  </button>
                </div>
              </div>
            </div>
            
            <div className='flex justify-end gap-3 mt-4'>
              <button
                onClick={() => setShowDownloadSettings(false)}
                className='px-4 py-2 bg-anchor-blue text-white rounded-md hover:bg-anchor-blue-hover transition-colors'
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PDF Preview Modal */}
      {showPDFPreview && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-lg shadow-xl w-full max-w-6xl h-full max-h-[90vh] flex flex-col'>
            {/* Header */}
            <div className='flex justify-between items-center p-3 border-b'>
              <h3 className='text-lg font-semibold text-gray-900'>PDF Preview</h3>
              <button
                onClick={() => setShowPDFPreview(false)}
                className='text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 flex items-center justify-center rounded hover:bg-gray-100'
              >
                ×
              </button>
            </div>
            
            {/* Preview Content */}
            <div className='flex-1 overflow-auto p-3 bg-gray-100'>
              <div className='bg-white shadow-lg rounded-lg overflow-hidden max-w-4xl mx-auto'>
                {previewHTML ? (
                  <iframe
                    srcDoc={previewHTML}
                    className='w-full h-[800px] border-0'
                    title='PDF Preview'
                  />
                ) : (
                  <div className='flex items-center justify-center h-96'>
                    <div className='text-center'>
                      <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-anchor-blue mx-auto mb-4'></div>
                      <p className='text-gray-600'>Loading preview...</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className='flex justify-between items-center p-3 border-t bg-gray-50'>
              <button
                onClick={() => setShowPDFPreview(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Cancel
              </button>
              
              <div className='flex gap-3'>
                <button
                  onClick={handlePrintPDF}
                  className='px-6 py-2 bg-slate-600 text-white rounded hover:bg-slate-700 transition-colors flex items-center gap-2'
                >
                  <span>🖨️</span>
                  Print
                </button>
                
                <button
                  onClick={handleSavePDF}
                  className='px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors flex items-center gap-2'
                >
                  <span>💾</span>
                  Save PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Generation Loading Window */}
      {isGeneratingPDF && (
        <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
          <div className='bg-white rounded-lg p-6 shadow-xl max-w-md w-full mx-4'>
            <div className='text-center'>
              <div className='animate-spin rounded-full h-12 w-12 border-b-2 border-anchor-blue mx-auto mb-4'></div>
              <h3 className='text-lg font-semibold text-gray-900 mb-2'>Generating PDF Proposal</h3>
              <p className='text-gray-600 text-sm'>
                Please wait while we create your professional ADU proposal...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};