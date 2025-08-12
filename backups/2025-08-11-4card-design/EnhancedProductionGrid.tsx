import React, { useState, useCallback, useMemo, useEffect } from 'react';

// Add wiggle animation CSS
const wiggleStyle = `
  @keyframes wiggle {
    0%, 100% { transform: rotate(0deg); }
    25% { transform: rotate(1deg); }
    75% { transform: rotate(-1deg); }
  }
  .animate-wiggle {
    animation: wiggle 0.6s ease-in-out;
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
  ArrowLeft,
  ChevronDown,
} from 'lucide-react';
import { ProjectData, PricingData, AnchorProposalFormData } from '../types/proposal';
import { AnchorPDFGenerator } from '../lib/pdf-generator';
import { AnchorPricingEngine } from '../lib/pricing-engine';
import { 
  sanitizeHtmlInput, 
  sanitizeAddress, 
  sanitizeTextarea,
  // validateEmail, 
  // validatePhone, 
  // validateZipCode,
  // validatePositiveInteger 
} from '../lib/security-utils';

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
}

export const EnhancedProductionGrid: React.FC<EnhancedProductionGridProps> = ({
  projectData,
  pricingData,
  onProjectDataUpdate,
  onPricingDataUpdate,
}) => {
  // Removed unused currentSection state
  const initialIsMobile = window.innerWidth < 1280;
  const [isMobile, setIsMobile] = useState(initialIsMobile); // Use xl breakpoint to match sidebar
  const [expandedCard, setExpandedCard] = useState<string | null>(null); // Start with all cards collapsed

  // Handle window resize for mobile detection
  useEffect(() => {
    const handleResize = () => {
      const newIsMobile = window.innerWidth < 1280; // Use xl breakpoint
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
  // Removed unused headerVisible state
  const [lastScrollY, setLastScrollY] = useState(0);
  
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
        if (projectData.bedrooms) completed += 1;
        if (projectData.bathrooms) completed += 1;
        
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
      const pricingEngine = new AnchorPricingEngine();
      const pricingInputs = {
        squareFootage: projectData.squareFootage || 800,
        aduType: projectData.aduType || 'detached',
        bedrooms: projectData.bedrooms ?? 1,
        bathrooms: projectData.bathrooms ?? 1,
        hvacType: (projectData.hvacType as 'central-ac' | 'mini-split') || 'central-ac',
        utilities: {
          waterMeter: (projectData.utilities?.waterMeter || 'separate') as 'shared' | 'separate',
          gasMeter: (projectData.utilities?.gasMeter || 'separate') as 'shared' | 'separate',
          electricMeter: 'separate' as const,
        },
        needsDesign: !!pricingData.designServices,
        appliancesIncluded: true,
        selectedAddOns: [
          ...(pricingData.extraBathroom ? ['Extra Bathroom'] : []),
          ...(pricingData.dedicatedDriveway ? ['Dedicated Driveway'] : []),
          ...(pricingData.basicLandscaping ? ['Basic Landscaping'] : []),
          ...(pricingData.friendsAndFamilyDiscount ? ['Friends & Family Discount (10% off)'] : []),
          ...customServices.map(service => service.description)
        ],
        sewerConnection: 'existing-lateral' as const,
        solarDesign: !!pricingData.solarReady,
        femaIncluded: !!pricingData.femaCompliance,
      };

      const calculation = pricingEngine.calculateProposal(pricingInputs);
      
      // Extract costs from line items
      const baseConstructionItem = calculation.lineItems.find(item => item.category === 'Base Construction');
      const designItem = calculation.lineItems.find(item => item.category === 'Design Services');
      const utilityItems = calculation.lineItems.filter(item => item.category === 'Utilities');
      const addOnItems = calculation.lineItems.filter(item => item.category === 'Add-ons');
      
      return {
        basePrice: baseConstructionItem?.totalPrice || 0,
        designCost: designItem?.totalPrice || 0,
        utilitiesCost: utilityItems.reduce((sum, item) => sum + item.totalPrice, 0),
        addOnsCost: addOnItems.reduce((sum, item) => sum + item.totalPrice, 0),
        finalTotal: calculation.grandTotal,
        pricePerSqFt: Math.round(calculation.pricePerSqFt),
        calculation, // Full calculation object for detailed breakdown
      };
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
  }, [projectData.squareFootage, projectData.aduType, projectData.bedrooms, projectData.bathrooms, projectData.hvacType, projectData.utilities, pricingData, customServices]);

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

  // Test data function
  const loadTestData = () => {
    updateProjectData({
      clientName: 'John Smith',
      clientEmail: 'john.smith@email.com',
      clientPhone: '(555) 123-4567',
      propertyAddress: '123 Main Street',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90210',
      aduType: 'detached',
      squareFootage: 800,
      bedrooms: 2,
      bathrooms: 1,
      additionalNotes: 'This is a sample ADU project for testing the form functionality.',
      hvacType: 'central-ac',
    });

    updatePricingData({
      designServices: 12500,
      solarReady: true,
      utilities: {
        water: 2500,
        gas: 1800,
        electric: 3200,
        sewer: 2200,
      },
    });
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

  // PDF generation handler
  const handleGenerateProposal = async () => {
    try {
      // Generate consistent proposal number and date
      const proposalNumber = `AB-2025-${Math.floor(Math.random() * 900000) + 100000}`;
      const proposalDate = new Date().toLocaleDateString();
      
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
            ...(pricingData.friendsAndFamilyDiscount ? ['Friends & Family Discount (10% off)'] : []),
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
      
      const pdfGenerator = new AnchorPDFGenerator();
      await pdfGenerator.generateProposal(mappedFormData, 'enhanced');
      
    } catch (error) {
      console.error('❌ PDF generation failed:', error);
      alert('PDF generation failed. Please check the console for details.');
    }
  };

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
              <div className='w-8 h-8 xl:w-12 xl:h-12 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg flex items-center justify-center mr-2 xl:mr-3 shadow-sm border border-slate-300'>
                <span className='text-white font-bold text-sm xl:text-lg'>⚓</span>
              </div>
              <div>
                <h1 className='text-sm xl:text-lg font-bold text-gray-900'>
                  Anchor Builders
                </h1>
                <p className='text-[10px] xl:text-xs text-gray-600 hidden sm:block'>ADU Proposal Generator</p>
              </div>
            </div>

            <div className='flex items-center gap-2 sm:gap-4'>
              {/* Mobile PDF/Save buttons - only show when sidebar is hidden */}
              <div className='flex items-center gap-1 xl:hidden'>
                <button 
                  onClick={handleGenerateProposal}
                  className='bg-blue-700 text-white px-2 py-1 rounded text-xs font-medium hover:bg-blue-800 transition-all shadow-sm'
                >
                  PDF
                </button>
                <button 
                  onClick={() => alert('Draft saved! Your progress has been preserved.')}
                  className='bg-slate-500 text-white px-2 py-1 rounded text-xs font-medium hover:bg-slate-600 transition-all shadow-sm'
                >
                  Save
                </button>
              </div>
              
              <div className='text-right hidden sm:block'>
                <p className='text-xs text-gray-600'>Total</p>
                <p className='text-xl font-bold text-gray-900'>
${liveCalculation.finalTotal.toLocaleString()}
                </p>
              </div>
              
              <button
                onClick={loadTestData}
                className='bg-slate-600 text-white px-2 py-1 rounded text-xs font-medium hover:bg-slate-800 transition-all flex items-center'
              >
                <FlaskConical className='w-3 h-3 mr-1' />
                <span>Test</span>
              </button>
              
              <button 
                onClick={() => alert('Dark mode coming soon!')}
                className='bg-slate-800 text-white p-2 rounded hover:bg-slate-900 transition-colors'
              >
                <span className='text-lg'>🌙</span>
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
          <div className='space-y-3 lg:grid lg:grid-cols-[0.85fr,1.15fr] lg:gap-3 lg:space-y-0' data-cards-container>
            {sections.map((section, index) => (
              <div key={section.id} className='bg-white rounded border flex flex-col mb-1 xl:mb-2' style={{border: '1px solid #d9d9d9', padding: isMobile ? '8px' : '12px', boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02), 0 2px 4px 0 rgba(0, 0, 0, 0.02)'}} {...(index === 0 ? {'data-first-card': true} : {})}>
                {/* Card Header with Navy Background - compact on mobile */}
                <div 
                  className='flex items-center justify-between mb-1 xl:mb-2 cursor-pointer'
                  onClick={() => toggleCard(section.id)}
                >
                  <div className='flex items-center gap-1 xl:gap-2'>
                    <div className={`
                      w-4 h-4 xl:w-5 xl:h-5 rounded-full flex items-center justify-center text-[9px] xl:text-[11px] font-bold
                      ${section.isComplete 
                        ? 'bg-slate-600 text-white' 
                        : 'bg-slate-700 text-white border border-white'
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
                      <span className='text-[11px] text-blue-600 font-medium'>{calculateSectionProgress(section.id)}%</span>
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
                    <div className={isMobile ? 'space-y-3' : 'space-y-6'}>
                      {/* Proposal Info */}
                      <div className={`grid grid-cols-2 ${isMobile ? 'gap-2 p-2' : 'gap-4 p-4'} rounded-lg bg-blue-50 border border-blue-200`}>
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium text-gray-900 ${isMobile ? 'mb-0.5' : 'mb-1'}`}>Proposal #</label>
                          <div className='text-[11px] font-semibold text-gray-900'>AB-2025-{Math.floor(Math.random() * 900000) + 100000}</div>
                        </div>
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium text-gray-900 ${isMobile ? 'mb-0.5' : 'mb-1'}`}>Date</label>
                          <div className='text-[11px] font-semibold text-gray-900'>{new Date().toLocaleDateString()}</div>
                        </div>
                      </div>

                      {/* Primary Client */}
                      <div>
                        <div className='text-[11px] font-medium text-gray-800 mb-2'>Primary Client</div>
                        <div className='grid grid-cols-2 gap-1'>
                          <input
                            type='text'
                            value={projectData.clientName?.split(' ')[0] || ''}
                            onChange={e => {
                              const lastName = projectData.clientName?.split(' ').slice(1).join(' ') || '';
                              updateProjectData({ clientName: `${e.target.value} ${lastName}`.trim() });
                            }}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none hover:border-blue-400`}
                            placeholder='First Name'
                          />
                          <input
                            type='text'
                            value={projectData.clientName?.split(' ').slice(1).join(' ') || ''}
                            onChange={e => {
                              const firstName = projectData.clientName?.split(' ')[0] || '';
                              updateProjectData({ clientName: `${firstName} ${e.target.value}`.trim() });
                            }}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none hover:border-blue-400`}
                            placeholder='Last Name'
                          />
                        </div>
                        <div className='grid grid-cols-2 gap-1 mt-1'>
                          <input
                            type='email'
                            value={projectData.clientEmail || ''}
                            onChange={e => {
                              const sanitizedEmail = sanitizeHtmlInput(e.target.value);
                              updateProjectData({ clientEmail: sanitizedEmail });
                            }}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none hover:border-blue-400`}
                            placeholder='Email'
                          />
                          <input
                            type='tel'
                            value={projectData.clientPhone || ''}
                            onChange={e => {
                              const sanitizedPhone = sanitizeHtmlInput(e.target.value);
                              updateProjectData({ clientPhone: sanitizedPhone });
                            }}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none hover:border-blue-400`}
                            placeholder='Phone'
                          />
                        </div>
                      </div>

                      {/* Secondary Client */}
                      <div>
                        <div className='text-[11px] font-medium text-gray-900 mb-1'>Secondary Client (Optional)</div>
                        <div className='grid grid-cols-2 gap-1'>
                          <input
                            type='text'
                            value={projectData.secondaryClientFirstName || ''}
                            onChange={e => updateProjectData({ secondaryClientFirstName: e.target.value })}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none hover:border-blue-400`}
                            placeholder='First Name'
                          />
                          <input
                            type='text'
                            value={projectData.secondaryClientLastName || ''}
                            onChange={e => updateProjectData({ secondaryClientLastName: e.target.value })}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none hover:border-blue-400`}
                            placeholder='Last Name'
                          />
                        </div>
                        <div className='grid grid-cols-2 gap-1 mt-1'>
                          <input
                            type='email'
                            value={projectData.secondaryClientEmail || ''}
                            onChange={e => updateProjectData({ secondaryClientEmail: e.target.value })}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none hover:border-blue-400`}
                            placeholder='Email'
                          />
                          <input
                            type='tel'
                            value={projectData.secondaryClientPhone || ''}
                            onChange={e => updateProjectData({ secondaryClientPhone: e.target.value })}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none hover:border-blue-400`}
                            placeholder='Phone'
                          />
                        </div>
                      </div>

                      {/* Property Address */}
                      <div>
                        <div className='text-[11px] font-medium text-gray-900 mb-1'>Property Address</div>
                        <input
                          type='text'
                          value={projectData.propertyAddress || ''}
                          onChange={e => {
                            const sanitizedAddress = sanitizeAddress(e.target.value);
                            updateProjectData({ propertyAddress: sanitizedAddress });
                          }}
                          className='w-full px-3 py-1 border border-gray-300 rounded-md text-[11px] text-gray-900 bg-white transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none hover:border-gray-400'
                          placeholder='Property Address'
                        />
                        <div className='grid grid-cols-3 gap-1 mt-1'>
                          <input
                            type='text'
                            value={projectData.city || ''}
                            onChange={e => updateProjectData({ city: e.target.value })}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none hover:border-blue-400`}
                            placeholder='City'
                          />
                          <input
                            type='text'
                            value={projectData.state || ''}
                            onChange={e => updateProjectData({ state: e.target.value })}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none hover:border-blue-400`}
                            placeholder='State'
                          />
                          <input
                            type='text'
                            value={projectData.zipCode || ''}
                            onChange={e => updateProjectData({ zipCode: e.target.value })}
                            className={`${isMobile ? 'h-6 px-2 py-0.5 text-[10px]' : 'h-8 px-3 py-1 text-[11px]'} border border-gray-300 rounded text-gray-900 bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-200 focus:outline-none hover:border-blue-400`}
                            placeholder='ZIP'
                          />
                        </div>
                      </div>

                      {/* Friends & Family Discount */}
                      <label 
                        className='cursor-pointer flex items-center gap-2 p-1.5 rounded border border-slate-200 bg-white hover:border-blue-900 transition-all focus-within:ring-2 focus-within:ring-blue-900 focus-within:border-blue-900'
                        onClick={(e) => {
                          console.log('👪 F&F Label clicked, current state:', !!pricingData.friendsAndFamilyDiscount);
                          e.stopPropagation();
                        }}
                      >
                        <input 
                          type='checkbox' 
                          checked={!!pricingData.friendsAndFamilyDiscount}
                          onChange={e => {
                            console.log('Friends & Family Discount clicked:', e.target.checked);
                            console.log('Current F&F value:', pricingData.friendsAndFamilyDiscount);
                            updatePricingData({ friendsAndFamilyDiscount: e.target.checked });
                          }}
                          onClick={(e) => {
                            console.log('👪 F&F Checkbox clicked directly');
                            e.stopPropagation();
                          }}
                          className='w-3 h-3 text-blue-600 rounded focus:ring-1 focus:ring-blue-500' 
                        />
                        <span className='text-[11px] font-medium flex-1' style={{color: '#000000'}}>Friends & Family Discount (10% off)</span>
                      </label>
                    </div>
                  )}

                  {section.id === 'property' && (
                    <div className={isMobile ? 'space-y-1' : 'space-y-1.5'}>
                      {/* ADU Type */}
                      <div>
                        <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold ${isMobile ? 'mb-0.5' : 'mb-1'}`} style={{color: '#000000'}}>ADU Type</label>
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
                              onClick={() => updateProjectData({ aduType: option.value })}
                              className={`
                                ${isMobile ? 'px-2 py-1' : 'px-4 py-2'} rounded-md border text-center transition-all ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium
                                ${projectData.aduType === option.value
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
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
                            className='text-[11px] text-blue-600 hover:text-blue-800 transition-colors'
                          >
                            ▶ More types
                          </button>
                        </div>
                      </div>

                      {/* Square Footage */}
                      <div>
                        <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold ${isMobile ? 'mb-0.5' : 'mb-1'}`} style={{color: '#000000'}}>Square Footage</label>
                        <div className={`grid grid-cols-5 ${isMobile ? 'gap-1' : 'gap-2'}`}>
                          {/* Manual entry first - larger */}
                          <input
                            type='number'
                            data-navigation
                            value={projectData.squareFootage || ''}
                            onChange={e => updateProjectData({ squareFootage: parseInt(e.target.value) || 0 })}
                            className={`
                              ${isMobile ? 'h-6 px-1 py-0.5 text-[9px]' : 'h-8 px-3 py-1 text-[11px]'} border rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all text-center font-medium
                              ${projectData.squareFootage && ![400, 800, 1000, 1200].includes(projectData.squareFootage)
                                ? 'border-blue-500 bg-blue-50 text-blue-900'
                                : 'border-gray-400 bg-white text-gray-800 hover:border-gray-500 hover:bg-gray-50'
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
                                h-10 px-3 rounded border text-center text-[11px] font-medium inline-flex items-center justify-center
                                ${projectData.squareFootage === sqft
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
                                }
                              `}
                            >
                              ~{sqft}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Bedrooms & Bathrooms */}
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold mb-1`} style={{color: '#000000'}}>Bedrooms</label>
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
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
                                }
                              `}
                            >
                              Studio
                            </button>
                            {[1, 2, 3, 4].map(num => (
                              <button
                                key={num}
                                type='button'
                                data-navigation
                                onClick={() => updateProjectData({ bedrooms: num })}
                                className={`
                                  ${isMobile ? 'h-6 px-1 text-[9px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex items-center justify-center
                                  ${projectData.bedrooms === num
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                    : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
                                  }
                                `}
                              >
                                {num}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold mb-1`} style={{color: '#000000'}}>Bathrooms</label>
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
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
                                }
                              `}
                            >
                              0
                            </button>
                            {[1, 2, 3].map(num => (
                              <button
                                key={num}
                                type='button'
                                data-navigation
                                onClick={() => updateProjectData({ bathrooms: num })}
                                className={`
                                  ${isMobile ? 'h-6 px-1 text-[9px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex items-center justify-center
                                  ${projectData.bathrooms === num
                                    ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                    : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
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
                      <div className='grid grid-cols-2 gap-2'>
                        {/* HVAC */}
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold mb-1`} style={{color: '#000000'}}>❄️ HVAC</label>
                          <div className='grid grid-cols-2 gap-1'>
                            <button
                              type='button'
                              data-navigation
                              onClick={() => updateProjectData({ hvacType: 'central-ac' })}
                              className={`
                                ${isMobile ? 'px-1 py-0.5 h-6 text-[9px]' : 'px-3 py-1.5 h-10 text-[11px]'} rounded border transition-all flex flex-col items-center justify-center
                                ${projectData.hvacType === 'central-ac'
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                                }
                              `}
                            >
                              <div className='font-medium'>{isMobile ? 'Central' : 'Central AC'}</div>
                            </button>
                            <button
                              type='button'
                              data-navigation
                              onClick={() => updateProjectData({ hvacType: 'mini-split' })}
                              className={`
                                ${isMobile ? 'px-1 py-0.5 h-6 text-[9px]' : 'px-3 py-1.5 h-10 text-[11px]'} rounded border transition-all flex flex-col items-center justify-center
                                ${projectData.hvacType === 'mini-split'
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
                                }
                              `}
                            >
                              <div className='font-medium'>{isMobile ? 'Mini' : 'Mini-Split'}</div>
                            </button>
                          </div>
                        </div>

                        {/* Utilities */}
                        <div>
                          <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold mb-1`} style={{color: '#000000'}}>⚡ Utilities</label>
                          <div className='grid grid-cols-2 gap-1'>
                            <button 
                              type='button'
                              data-navigation
                              onClick={(e) => {
                                console.log('💧 Water button clicked - event:', e);
                                try {
                                  const newWaterState = projectData.utilities?.waterMeter === 'shared' ? 'separate' : 'shared';
                                  console.log('Water utility clicked - toggling to:', newWaterState);
                                  updateProjectData({ 
                                    utilities: { 
                                      ...projectData.utilities,
                                      waterMeter: newWaterState as 'shared' | 'separate'
                                    } 
                                  });
                                } catch (error) {
                                  console.error('❌ Error in Water button click:', error);
                                }
                              }}
                              className={`
                                ${isMobile ? 'h-7 px-1 text-[8px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex flex-col items-center justify-center
                                ${projectData.utilities?.waterMeter === 'separate'
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
                                }
                              `}
                            >
                              <div className='font-medium'>Water</div>
                              <div className={`${isMobile ? 'text-[7px]' : 'text-[9px]'} ${projectData.utilities?.waterMeter === 'separate' ? 'text-blue-100' : 'text-gray-500'}`}>
                                {projectData.utilities?.waterMeter === 'separate' ? 'Separate' : 'Shared'}
                              </div>
                            </button>
                            <button 
                              type='button'
                              data-navigation
                              onClick={(e) => {
                                console.log('🚽 Sewer button clicked - event:', e);
                                try {
                                  const newSewerState = projectData.utilities?.sewerMeter === 'shared' ? 'separate' : 'shared';
                                  console.log('Sewer utility clicked - toggling to:', newSewerState);
                                  updateProjectData({ 
                                    utilities: { 
                                      ...projectData.utilities,
                                      sewerMeter: newSewerState as 'shared' | 'separate'
                                    } 
                                  });
                                } catch (error) {
                                  console.error('❌ Error in Sewer button click:', error);
                                }
                              }}
                              className={`
                                ${isMobile ? 'h-7 px-1 text-[8px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex flex-col items-center justify-center
                                ${projectData.utilities?.sewerMeter === 'separate'
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
                                }
                              `}
                            >
                              <div className='font-medium'>Sewer</div>
                              <div className={`${isMobile ? 'text-[7px]' : 'text-[9px]'} ${projectData.utilities?.sewerMeter === 'separate' ? 'text-blue-100' : 'text-gray-500'}`}>
                                {projectData.utilities?.sewerMeter === 'separate' ? 'Separate' : 'Shared'}
                              </div>
                            </button>
                            <button 
                              type='button'
                              data-navigation
                              onClick={(e) => {
                                console.log('🔥 Gas button clicked - event:', e);
                                try {
                                  const newGasState = projectData.utilities?.gasMeter === 'shared' ? 'separate' : 'shared';
                                  console.log('Gas utility clicked - toggling to:', newGasState);
                                  updateProjectData({ 
                                    utilities: { 
                                      ...projectData.utilities,
                                      gasMeter: newGasState as 'shared' | 'separate'
                                    } 
                                  });
                                } catch (error) {
                                  console.error('❌ Error in Gas button click:', error);
                                }
                              }}
                              className={`
                                ${isMobile ? 'h-7 px-1 text-[8px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex flex-col items-center justify-center
                                ${projectData.utilities?.gasMeter === 'separate'
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
                                }
                              `}
                            >
                              <div className='font-medium'>Gas</div>
                              <div className={`${isMobile ? 'text-[7px]' : 'text-[9px]'} ${projectData.utilities?.gasMeter === 'separate' ? 'text-blue-100' : 'text-gray-500'}`}>
                                {projectData.utilities?.gasMeter === 'separate' ? 'Separate' : 'Shared'}
                              </div>
                            </button>
                            <button 
                              type='button'
                              data-navigation
                              onClick={(e) => {
                                console.log('⚡ Electric button clicked - event:', e);
                                try {
                                  // Electric can be shared or separate despite types definition
                                  const newElectricState = projectData.utilities?.electricMeter === 'shared' ? 'separate' : 'shared';
                                  console.log('Electric utility clicked - toggling to:', newElectricState);
                                  updateProjectData({ 
                                    utilities: { 
                                      ...projectData.utilities,
                                      electricMeter: newElectricState as 'shared' | 'separate'
                                    } 
                                  });
                                } catch (error) {
                                  console.error('❌ Error in Electric button click:', error);
                                }
                              }}
                              className={`
                                ${isMobile ? 'h-7 px-1 text-[8px]' : 'h-10 px-2 text-[11px]'} rounded border text-center font-medium inline-flex flex-col items-center justify-center
                                ${projectData.utilities?.electricMeter === 'separate'
                                  ? 'bg-blue-600 border-blue-600 text-white shadow-sm'
                                  : 'bg-white border-gray-300 text-gray-900 hover:bg-blue-50 hover:border-blue-400 hover:text-blue-600'
                                }
                              `}
                            >
                              <div className='font-medium'>Electric</div>
                              <div className={`${isMobile ? 'text-[7px]' : 'text-[9px]'} ${projectData.utilities?.electricMeter === 'separate' ? 'text-blue-100' : 'text-gray-500'}`}>
                                {projectData.utilities?.electricMeter === 'separate' ? 'Separate' : 'Shared'}
                              </div>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Additional Services */}
                      <div>
                        <label className={`block ${isMobile ? 'text-[9px]' : 'text-[11px]'} font-semibold mb-1`} style={{color: '#000000'}}>➕ Additional Services</label>
                        <div className='grid grid-cols-2 gap-1'>
                          <label className={`cursor-pointer flex items-center gap-2 ${isMobile ? 'px-2 py-0.5' : 'px-3 py-1'} rounded border border-gray-300 bg-blue-50 transition-all hover:border-blue-400 hover:bg-blue-100 focus-within:ring-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500`}>
                            <input
                              type='checkbox'
                              checked={!!pricingData.extraBathroom}
                              onChange={e => {
                                console.log('🛁 Extra Bathroom clicked:', e.target.checked);
                                updatePricingData({ extraBathroom: e.target.checked ? 8000 : 0 });
                              }}
                              className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-blue-600 rounded focus:ring-1 focus:ring-blue-500`}
                            />
                            <div className='flex-1'>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium text-gray-800 block`}>Extra Bathroom</span>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} text-blue-600 font-medium`}>+$8,000</span>
                            </div>
                          </label>
                          <label className={`cursor-pointer flex items-center gap-2 ${isMobile ? 'px-2 py-0.5' : 'px-3 py-1'} rounded border transition-all focus-within:ring-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500 ${
                            pricingData.dedicatedDriveway 
                              ? 'border-gray-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-100' 
                              : 'border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50'
                          }`}>
                            <input
                              type='checkbox'
                              checked={!!pricingData.dedicatedDriveway}
                              onChange={e => {
                                console.log('🚗 Dedicated Driveway clicked:', e.target.checked);
                                updatePricingData({ dedicatedDriveway: e.target.checked ? 5000 : 0 });
                              }}
                              className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-blue-600 rounded focus:ring-1 focus:ring-blue-500`}
                            />
                            <div className='flex-1'>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium text-gray-800 block`}>Dedicated Driveway</span>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium ${pricingData.dedicatedDriveway ? 'text-blue-600' : 'text-gray-600'}`}>+$5,000</span>
                            </div>
                          </label>
                          <label className={`cursor-pointer flex items-center gap-2 ${isMobile ? 'px-2 py-0.5' : 'px-3 py-1'} rounded border border-gray-300 bg-blue-50 transition-all hover:border-blue-400 hover:bg-blue-100 focus-within:ring-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500`}>
                            <input
                              type='checkbox'
                              checked={!!pricingData.basicLandscaping}
                              onChange={e => {
                                console.log('🌿 Basic Landscaping clicked:', e.target.checked);
                                updatePricingData({ basicLandscaping: e.target.checked ? 10000 : 0 });
                              }}
                              className={`${isMobile ? 'w-3 h-3' : 'w-4 h-4'} text-blue-600 rounded focus:ring-1 focus:ring-blue-500`}
                            />
                            <div className='flex-1'>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} font-medium text-gray-800 block`}>Basic Landscaping</span>
                              <span className={`${isMobile ? 'text-[9px]' : 'text-[11px]'} text-blue-600 font-medium`}>+$10,000</span>
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
                            className='cursor-pointer flex items-center justify-center px-3 py-1 rounded-md border border-dashed border-gray-300 bg-blue-50 hover:border-blue-400 hover:bg-blue-50 transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none'
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
                        <div className='text-[11px] font-medium text-gray-900 mb-1'>Professional Design Services</div>
                        <label className='cursor-pointer flex items-start gap-2 px-3 py-1 rounded border border-gray-300 bg-blue-50 transition-all hover:border-blue-400 hover:bg-blue-100 focus-within:ring-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500'>
                          <input
                            type='checkbox'
                            checked={pricingData.designServices === 12500}
                            onChange={e => {
                              console.log('📐 Design Services clicked:', e.target.checked);
                              updatePricingData({ designServices: e.target.checked ? 12500 : 0 });
                            }}
                            className='w-4 h-4 text-blue-600 rounded mt-0.5 focus:ring-2 focus:ring-blue-200'
                          />
                          <div className='flex-1'>
                            <div className='flex items-center justify-between'>
                              <span className='text-[11px] font-medium text-gray-800'>Include Design Services</span>
                              <span className='font-bold text-blue-600 text-[11px]'>+$12,500</span>
                            </div>
                            <p className='text-[11px] text-gray-600 mt-0.5'>Architectural plans, structural engineering, and permit assistance</p>
                          </div>
                        </label>
                      </div>

                      <div className='space-y-0.5'>
                        <label className='cursor-pointer flex items-center gap-2 px-3 py-1 rounded border border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all focus-within:ring-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500'>
                          <input
                            type='checkbox'
                            checked={!!pricingData.solarReady}
                            onChange={e => {
                              console.log('Solar Ready clicked:', e.target.checked);
                              updatePricingData({ solarReady: e.target.checked });
                            }}
                            className='w-4 h-4 text-blue-600 rounded focus:ring-1 focus:ring-blue-500'
                          />
                          <span className='text-[11px] font-medium text-gray-800'>Solar Ready</span>
                        </label>

                        <label className='cursor-pointer flex items-center gap-2 px-3 py-1 rounded border border-gray-300 bg-white hover:border-blue-400 hover:bg-blue-50 transition-all focus-within:ring-2 focus-within:ring-1 focus-within:ring-blue-500 focus-within:border-blue-500'>
                          <input
                            type='checkbox'
                            checked={!!pricingData.femaCompliance}
                            onChange={e => {
                              console.log('FEMA Compliance clicked:', e.target.checked);
                              updatePricingData({ femaCompliance: e.target.checked });
                            }}
                            className='w-4 h-4 text-blue-600 rounded focus:ring-1 focus:ring-blue-500'
                          />
                          <span className='text-[11px] font-medium text-gray-800'>FEMA Compliance</span>
                        </label>
                      </div>
                    </div>
                  )}

                  {section.id === 'notes' && (
                    <div>
                      <label className='block text-[11px] font-medium text-gray-800 mb-1'>Additional Notes</label>
                      <textarea
                        value={projectData.additionalNotes || ''}
                        onChange={e => {
                          const sanitizedNotes = sanitizeTextarea(e.target.value);
                          updateProjectData({ additionalNotes: sanitizedNotes });
                        }}
                        placeholder='Any special requirements, preferences, or project details...'
                        className='w-full h-12 px-3 py-1 border border-gray-300 rounded-md text-[11px] text-gray-900 bg-white resize-none transition-all focus:border-blue-500 focus:ring-1 focus:ring-blue-500 focus:outline-none hover:border-gray-400'
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Pricing Sidebar */}
          <div className='xl:block hidden relative'>
            <div className={`bg-blue-25 rounded p-4 sticky top-6 ${sidebarWiggle ? 'animate-wiggle' : ''}`} style={{border: '3px solid #ffffff', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)', backgroundColor: '#f8faff'}}>
              <div className='flex items-center justify-center mb-4'>
                <h3 className='text-[11px] font-semibold text-gray-900 uppercase tracking-wider mb-4 border-b border-gray-200 pb-2 text-center'>Project Summary</h3>
              </div>
              
              <div className='space-y-1.5 text-[11px]'>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Client:</span>
                  <span className={`font-medium ${projectData.clientName ? '' : 'text-red-600'}`}>{projectData.clientName || 'Missing'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Address:</span>
                  <span className={`font-medium ${projectData.propertyAddress ? '' : 'text-red-600'}`}>{projectData.propertyAddress || 'Missing'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>ADU Type:</span>
                  <span className={`font-medium ${projectData.aduType ? '' : 'text-red-600'}`}>
                    {projectData.aduType 
                      ? projectData.aduType === 'jadu' 
                        ? 'JADU' 
                        : `${projectData.aduType.charAt(0).toUpperCase() + projectData.aduType.slice(1)}`
                      : 'Not Selected'
                    }
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Size:</span>
                  <span className={`font-medium ${projectData.squareFootage ? '' : 'text-red-600'}`}>{projectData.squareFootage ? `${projectData.squareFootage} sq ft` : 'Missing'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Layout:</span>
                  <span className={`font-medium ${(projectData.bedrooms !== undefined && projectData.bathrooms !== undefined) ? '' : 'text-red-600'}`}>
                    {(projectData.bedrooms !== undefined && projectData.bathrooms !== undefined) 
                      ? `${projectData.bedrooms === 0 ? 'Studio' : projectData.bedrooms + 'BR'} / ${projectData.bathrooms}BA` 
                      : 'Not Selected'
                    }
                  </span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>HVAC:</span>
                  <span className={`font-medium ${projectData.hvacType ? '' : 'text-red-600'}`}>
                    {projectData.hvacType 
                      ? projectData.hvacType === 'central-ac' 
                        ? 'Central AC'
                        : projectData.hvacType === 'mini-split'
                        ? 'Mini-Split'
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
                        {projectData.utilities.waterMeter === 'separate' && <div className='font-medium text-[10px]'>Water: Separate</div>}
                        {projectData.utilities.gasMeter === 'separate' && <div className='font-medium text-[10px]'>Gas: Separate</div>}
                        {projectData.utilities.sewerMeter === 'separate' && <div className='font-medium text-[10px]'>Sewer: Separate</div>}
                        {projectData.utilities.electricMeter === 'separate' && <div className='font-medium text-[10px]'>Electric: Separate</div>}
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
                  <span className='text-slate-600'>Design:</span>
                  <span className={`font-medium ${pricingData.designServices ? 'text-green-600' : 'text-red-600'}`}>{pricingData.designServices ? '+$12,500' : 'Not included'}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-slate-600'>Add-ons:</span>
                  <div className='text-right'>
                    {pricingData.extraBathroom && <div className='font-medium'>Extra Bathroom: +$8,000</div>}
                    {pricingData.dedicatedDriveway && <div className='font-medium'>Dedicated Driveway: +$5,000</div>}
                    {pricingData.basicLandscaping && <div className='font-medium'>Landscaping: +$10,000</div>}
                    {customServices.map((service, index) => (
                      <div key={index} className='font-medium'>
                        {service.description}: +${service.price.toLocaleString()}
                      </div>
                    ))}
                    {!pricingData.extraBathroom && !pricingData.dedicatedDriveway && !pricingData.basicLandscaping && customServices.length === 0 && <span className='font-medium'>None</span>}
                  </div>
                </div>
              </div>

              <div className='border-t mt-4 pt-4'>
                <div className='flex items-center mb-2'>
                  <Calculator className='w-4 h-4 text-slate-600 mr-1' />
                  <h4 className='font-semibold text-slate-800 text-[11px]'>Breakdown</h4>
                </div>
                <div className='space-y-1 text-[11px] ml-4'>
                  <div className='flex justify-between'>
                    <span className='text-slate-600'>Base:</span>
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
                      <span className='font-medium'>${liveCalculation.utilitiesCost.toLocaleString()}</span>
                    </div>
                  )}
                  {(pricingData.extraBathroom || pricingData.dedicatedDriveway || pricingData.basicLandscaping || customServices.length > 0) && (
                    <div className='flex justify-between'>
                      <span className='text-slate-600'>Add-ons:</span>
                      <span className='font-medium'></span>
                    </div>
                  )}
                  {pricingData.extraBathroom && (
                    <div className='flex justify-between ml-4'>
                      <span className='text-slate-600'>• Extra Bathroom:</span>
                      <span className='font-medium text-blue-600'>$8,000</span>
                    </div>
                  )}
                  {pricingData.dedicatedDriveway && (
                    <div className='flex justify-between ml-4'>
                      <span className='text-slate-600'>• Dedicated Driveway:</span>
                      <span className='font-medium text-blue-600'>$5,000</span>
                    </div>
                  )}
                  {pricingData.basicLandscaping && (
                    <div className='flex justify-between ml-4'>
                      <span className='text-slate-600'>• Basic Landscaping:</span>
                      <span className='font-medium text-blue-600'>$10,000</span>
                    </div>
                  )}
                  {customServices.map((service, index) => (
                    <div key={index} className='flex justify-between ml-4'>
                      <span className='text-slate-600'>• {service.description}:</span>
                      <span className='font-medium text-green-600'>${service.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className='border-t mt-4 pt-4'>
                <div className='flex justify-between items-center'>
                  <span className='text-[11px] font-bold text-slate-800'>Total:</span>
                  <span className='text-[11px] font-bold text-slate-800'>
${liveCalculation.finalTotal.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className='flex gap-2 mt-4'>
                <button 
                  onClick={handleGenerateProposal}
                  className='flex-1 bg-gradient-to-r from-blue-700 to-blue-800 text-white px-4 py-3 rounded-lg font-medium hover:from-blue-800 hover:to-blue-900 transition-all shadow-md hover:shadow-lg'
                >
                  Generate Proposal
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
          <div className='bg-white rounded-lg p-6 w-96 shadow-xl'>
            <h3 className='text-lg font-semibold mb-4'>Add Custom Service</h3>
            
            <div className='space-y-4'>
              <div>
                <label className='block text-sm font-medium text-gray-900 mb-2'>Service Description</label>
                <input
                  type='text'
                  value={customServiceDescription}
                  onChange={(e) => setCustomServiceDescription(e.target.value)}
                  className='w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Enter service description'
                />
              </div>
              
              <div>
                <label className='block text-sm font-medium text-gray-900 mb-2'>Price</label>
                <input
                  type='number'
                  value={customServicePrice}
                  onChange={(e) => setCustomServicePrice(e.target.value)}
                  className='w-full px-3 py-1 border border-gray-300 rounded-md focus:ring-1 focus:ring-blue-500 focus:border-blue-500'
                  placeholder='Enter price (numbers only)'
                />
              </div>
            </div>
            
            <div className='flex justify-end gap-3 mt-6'>
              <button
                onClick={() => setShowAddMorePopup(false)}
                className='px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors'
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustomService}
                className='px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 border border-blue-600 transition-colors'
              >
                Add Service
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};