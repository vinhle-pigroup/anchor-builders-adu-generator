import { AnchorProposalFormData } from '../types/proposal';
import { AnchorPricingEngine } from './pricing-engine';
import { calculateMilestonePayments } from '../data/pricing-config';
import { getTemplateText } from '../data/template-text-config';
import { getActiveTemplate, getTemplatePath, logTemplateSelection } from './getActiveTemplate';
import { sanitizeTemplateValue, pdfRateLimiter, validateEmail, validatePhone, validateZipCode, validatePositiveInteger } from './security-utils';

export class AnchorPDFTemplateGenerator {
  constructor() {}

  async generateProposal(
    formData: AnchorProposalFormData,
    selectedTemplate?: string
  ): Promise<void> {
    try {
      // Rate limiting check
      const clientId = `${formData.client.email || 'anonymous'}_${Date.now()}`;
      if (!pdfRateLimiter.isAllowed(clientId, 3, 60000)) { // 3 attempts per minute
        throw new Error('Too many PDF generation attempts. Please wait a minute before trying again.');
      }

      console.log('🚀 [DEBUG] Starting PDF generation with form data:', formData);
      console.log('🎨 [DEBUG] Selected template parameter received:', selectedTemplate);

      // Validate required form data
      this.validateFormData(formData);

      console.log('📊 [DEBUG] Form data validation passed:', {
        client: formData.client,
        project: formData.project,
        additionalNotes: formData.additionalNotes,
      });
    } catch (error) {
      console.error('❌ [ERROR] PDF generation validation failed:', error);
      throw new Error(
        `PDF validation failed: ${error instanceof Error ? error.message : 'Unknown validation error'}`
      );
    }

    // Calculate pricing with error handling
    let calculation;
    let milestones;
    let designAmount;

    try {
      console.log('💰 [DEBUG] Starting pricing calculation...');
      const pricingEngine = new AnchorPricingEngine();
      const pricingInputs = {
        squareFootage: formData.project.squareFootage,
        aduType: formData.project.aduType,
        stories: formData.project.stories,
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
        priceOverrides: formData.project.priceOverrides,
      };

      calculation = pricingEngine.calculateProposal(pricingInputs);
      // Use the actual design services price from the calculation
      const calculationDesignLineItem = calculation.lineItems.find(
        (item: any) => item.category === 'Design Services'
      );
      designAmount = calculationDesignLineItem ? calculationDesignLineItem.totalPrice : 0;
      milestones = calculateMilestonePayments(calculation.grandTotal, designAmount);

      console.log('✅ [DEBUG] Pricing calculation completed:', {
        grandTotal: calculation.grandTotal,
        lineItems: calculation.lineItems.length,
        milestones: milestones.length,
      });
    } catch (error) {
      console.error('❌ [ERROR] Pricing calculation failed:', error);
      throw new Error(
        `Pricing calculation failed: ${error instanceof Error ? error.message : 'Unknown pricing error'}`
      );
    }

    console.log('Calculated pricing:', {
      grandTotal: calculation.grandTotal,
      pricePerSqFt: calculation.pricePerSqFt,
    });

    // Prepare template variables with error handling
    let templateVars;
    try {
      console.log('📝 [DEBUG] Preparing template variables...');
      templateVars = await this.prepareTemplateVariables(
        formData,
        calculation,
        milestones,
        designAmount
      );
      console.log('✅ [DEBUG] Template variables prepared successfully:', {
        keysCount: Object.keys(templateVars).length,
        grandTotal: templateVars.GRAND_TOTAL,
        costPerSqft: templateVars.COST_PER_SQFT,
      });
    } catch (error) {
      console.error('❌ [ERROR] Template variable preparation failed:', error);
      console.error('❌ [ERROR] Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      console.error('❌ [ERROR] Form data structure:', JSON.stringify(formData, null, 2));
      throw new Error(
        `Template preparation failed: ${error instanceof Error ? error.message : 'Unknown template error'}`
      );
    }

    // Process template with error handling
    let processedHtml: string;
    try {
      console.log('🎨 [DEBUG] Processing HTML template...');
      processedHtml = await this.getModernTemplate(selectedTemplate);

      if (!processedHtml || processedHtml.length === 0) {
        throw new Error('Template HTML is empty or invalid');
      }

      console.log('📄 [DEBUG] Template loaded successfully, length:', processedHtml.length);

      // Replace variables in template (skip arrays which are handled in conditional processing)
      let replacementCount = 0;
      Object.entries(templateVars).forEach(([key, value]) => {
        // Skip arrays and objects - these are handled in processConditionalSections
        if (key === 'PROJECT_ITEMS' || key === 'ADDITIONAL_COSTS' || Array.isArray(value) || typeof value === 'object') {
          return;
        }
        
        const regex = new RegExp(`{{${key}}}`, 'g');
        const beforeCount = (processedHtml.match(regex) || []).length;
        processedHtml = processedHtml.replace(regex, value || '');
        if (beforeCount > 0) {
          replacementCount += beforeCount;
          console.log(`✅ Replaced ${beforeCount} instances of {{${key}}}`);
        }
      });

      console.log(`🔄 [DEBUG] Total variable replacements: ${replacementCount}`);
    } catch (error) {
      console.error('❌ [ERROR] Template processing failed:', error);
      throw new Error(
        `Template processing failed: ${error instanceof Error ? error.message : 'Unknown template processing error'}`
      );
    }

    // Check for any remaining unreplaced variables
    const remainingVars = processedHtml.match(/{{[^}]+}}/g);
    if (remainingVars) {
      console.warn('⚠️ [DEBUG] Unreplaced template variables found:', remainingVars);
    } else {
      console.log('✅ [DEBUG] All template variables successfully replaced');
    }

    // Handle conditional sections with error handling
    try {
      console.log('🔧 [DEBUG] Processing conditional sections...');
      processedHtml = this.processConditionalSections(
        processedHtml,
        formData,
        calculation,
        milestones,
        templateVars
      );
      console.log('✅ [DEBUG] Conditional sections processed successfully');
    } catch (error) {
      console.error('❌ [ERROR] Conditional section processing failed:', error);
      throw new Error(
        `Conditional processing failed: ${error instanceof Error ? error.message : 'Unknown conditional processing error'}`
      );
    }

    console.log('✅ [DEBUG] Final processed HTML length:', processedHtml.length);

    // Convert HTML to PDF with error handling
    try {
      console.log('🖨️ [DEBUG] Opening PDF in new window...');
      await this.htmlToPdfBlob(processedHtml);
      console.log('✅ [DEBUG] PDF generation completed successfully');
    } catch (error) {
      console.error('❌ [ERROR] PDF window opening failed:', error);
      throw new Error(
        `PDF generation failed: ${error instanceof Error ? error.message : 'Unknown PDF generation error'}`
      );
    }
  }

  private async prepareTemplateVariables(
    formData: AnchorProposalFormData,
    calculation: any,
    milestones: any[],
    designAmount: number
  ): Promise<Record<string, string>> {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Get current template text configuration
    const textConfig = getTemplateText();

    // Calculate design services price from the calculation
    const designLineItem = calculation.lineItems.find(
      (item: any) => item.category === 'Design Services'
    );
    const calculatedDesignPrice = designLineItem ? designLineItem.totalPrice : 0;

    // Get Google Maps satellite image for property
    let satelliteImage = null;
    try {
      console.log('🔍 [DEBUG] Starting Google Maps integration...');
      const googleMapsModule = await import('./google-maps-service');

      if (googleMapsModule && googleMapsModule.getSafePropertyImage) {
        const fullAddress = `${formData.client.address}, ${formData.client.city}, ${formData.client.state} ${formData.client.zipCode}`;
        console.log('📍 [DEBUG] Full address for Google Maps:', fullAddress);

        satelliteImage = await googleMapsModule.getSafePropertyImage(fullAddress);

        if (satelliteImage) {
          console.log(
            '✅ [DEBUG] Google Maps satellite image loaded successfully, length:',
            satelliteImage.length
          );
        } else {
          console.warn('❌ [DEBUG] Google Maps returned null - using fallback');
        }
      } else {
        console.warn('⚠️ [DEBUG] Google Maps service not available - using fallback');
      }
    } catch (error) {
      console.error('⚠️ [DEBUG] Google Maps integration failed - using fallback:', error);
      satelliteImage = null;
    }

    return {
      // Date - use form data if available, otherwise use today's date
      PROPOSAL_DATE: formData.proposalDate || formattedDate,
      PROPOSAL_NUMBER: formData.id || 'AB-1001', // Use form ID with AB- prefix

      // Client Info  
      CLIENT_FIRST_NAME: sanitizeTemplateValue(formData.client.firstName),
      CLIENT_LAST_NAME: sanitizeTemplateValue(formData.client.lastName),
      CLIENT_NAME: sanitizeTemplateValue(`${formData.client.firstName} ${formData.client.lastName}`.trim()),
      CLIENT_PHONE: sanitizeTemplateValue(formData.client.phone),
      CLIENT_EMAIL: sanitizeTemplateValue(formData.client.email),

      // Project Info
      PROJECT_ADDRESS: formData.client.address,
      PROJECT_CITY: formData.client.city,
      PROJECT_STATE: formData.client.state,
      PROJECT_ZIP: formData.client.zipCode,
      CLIENT_ADDRESS: sanitizeTemplateValue(formData.client.address), // Enhanced template uses CLIENT_ADDRESS

      // Project Details
      BEDROOMS: formData.project.bedrooms.toString(),
      BATHROOMS: formData.project.bathrooms.toString(),
      BEDROOMS_PLURAL: formData.project.bedrooms === 1 ? '' : 's',
      BATHROOMS_PLURAL: formData.project.bathrooms === 1 ? '' : 's',
      SQUARE_FOOTAGE: formData.project.squareFootage.toString(),
      ADU_TYPE: this.getAduTypeDisplay(formData.project.aduType, formData.project.stories),
      ADU_TYPE_LOWER: this.getAduTypeDisplay(formData.project.aduType, formData.project.stories).toLowerCase(),
      STORIES: formData.project.stories?.toString() || '1',

      // Utility Connections - use dynamic text from admin config with safe null checks
      WATER_METER:
        formData.project.utilities?.waterMeter === 'separate'
          ? 'Separate water meter'
          : 'Shared water meter',
      GAS_METER:
        formData.project.utilities?.gasMeter === 'separate'
          ? 'Separate gas meter'
          : 'Shared gas meter',
      ELECTRIC_METER: 'Separate electrical service',

      // Enhanced template utility connection variables
      WATER_CONNECTION:
        formData.project.utilities?.waterMeter === 'separate' ? 'Separate meter' : 'Shared meter',
      GAS_CONNECTION:
        formData.project.utilities?.gasMeter === 'separate' ? 'Separate meter' : 'Shared meter',

      // Conditional flags for pricing table
      WATER_METER_SEPARATE: formData.project.utilities?.waterMeter === 'separate' ? 'true' : '',
      GAS_METER_SEPARATE: formData.project.utilities?.gasMeter === 'separate' ? 'true' : '',

      // Services and Features - use dynamic text from admin config
      NEEDS_DESIGN: formData.project.needsDesign ? 'yes' : 'no',
      APPLIANCES_INCLUDED: formData.project.appliancesIncluded
        ? (textConfig as any).scopeOfWork?.appliances?.included || 'Appliances package included'
        : (textConfig as any).scopeOfWork?.appliances?.excluded || 'Appliances not included',
      APPLIANCES_TEXT: formData.project.appliancesIncluded
        ? (textConfig as any).scopeOfWork?.appliances?.included || 'Appliances package included'
        : (textConfig as any).scopeOfWork?.appliances?.excluded || 'Appliances not included',
      HVAC_TYPE:
        formData.project.hvacType === 'central-ac'
          ? (textConfig as any).services?.hvac?.centralAc || 'Central Air Conditioning'
          : (textConfig as any).services?.hvac?.miniSplit || 'Mini-Split HVAC System',
      FINISH_LEVEL: formData.project.finishLevel,
      SEWER_CONNECTION: formData.project.sewerConnection,
      SOLAR_DESIGN: formData.project.solarDesign ? 'yes' : 'no',
      FEMA_INCLUDED: formData.project.femaIncluded ? 'yes' : 'no',

      // Project Overview Text - Dynamic description based on form data
      PROJECT_OVERVIEW_TEXT: `Anchor Builders will construct a complete ${formData.project.squareFootage} square foot detached ADU featuring ${formData.project.bedrooms} bedroom${formData.project.bedrooms > 1 ? 's' : ''} and ${formData.project.bathrooms} bathroom${formData.project.bathrooms > 1 ? 's' : ''}. This turnkey project includes full design and engineering services, followed by complete construction to create a move-in ready accessory dwelling unit. The project encompasses everything from initial architectural design through final Certificate of Occupancy, including all structural work, mechanical systems (HVAC), electrical, plumbing, finishes, and appliances. Our comprehensive approach ensures code compliance, quality construction, and a seamless process from concept to completion.`,

      // Electrical Panel - Dynamic based on form selection
      ELECTRICAL_PANEL: this.getElectricalPanelDisplay(formData.project.utilities?.electricalPanel || 0),

      // Missing template variables from screenshot analysis
      PROPOSAL_VALID_UNTIL: '30 Days', // Default valid until period
      WATER_CONNECTION_DETAIL:
        formData.project.utilities?.waterMeter === 'separate' ? 'Separate meter' : 'Shared meter',
      GAS_CONNECTION_DETAIL:
        formData.project.utilities?.gasMeter === 'separate' ? 'Separate meter' : 'Shared meter',
      ELECTRIC_CONNECTION_DETAIL: `Separate ${this.getElectricalPanelDisplay(formData.project.utilities?.electricalPanel || 0)} service`,
      SEWER_CONNECTION_DETAIL: 'Connected to main line',
      EXTRA_BATHROOM_SERVICE: 'Extra Bathroom: Additional bathroom beyond standard configuration',
      DEDICATED_DRIVEWAY_SERVICE: 'Dedicated Driveway: Dedicated driveway parking space',

      // Add-ons
      SELECTED_ADD_ONS: formData.project.selectedAddOns.join(', ') || 'None',
      
      // Template-specific variables that the HTML template expects
      PROJECT_ITEMS: calculation.lineItems.map((item: any) => ({
        name: item.description || item.category,
        price: item.totalPrice.toLocaleString()
      })),
      ADDITIONAL_COSTS: calculation.lineItems
        .filter((item: any) => item.category === 'Utilities' || item.category === 'Add-ons')
        .map((item: any) => ({
          name: item.description || item.category,
          price: item.totalPrice.toLocaleString()
        })),
      ADD_ON_WORK_EXISTS: (() => {
        const hasAddOns = formData.project.selectedAddOns?.length > 0;
        const hasWaterMeter = formData.project.utilities?.waterMeter === 'separate';
        const hasGasMeter = formData.project.utilities?.gasMeter === 'separate';
        const result = hasAddOns || hasWaterMeter || hasGasMeter;

        console.log('🔍 [DEBUG] ADD_ON_WORK_EXISTS check:', {
          selectedAddOns: formData.project.selectedAddOns,
          hasAddOns,
          waterMeter: formData.project.utilities?.waterMeter,
          hasWaterMeter,
          gasMeter: formData.project.utilities?.gasMeter,
          hasGasMeter,
          finalResult: result ? 'true' : '',
        });

        return result ? 'true' : '';
      })(),

      // Timeline and Notes
      TIMELINE: formData.timeline || 'Standard 3-4 month construction timeline',
      ADDITIONAL_NOTES: formData.additionalNotes || 'Standard ADU construction as specified above.',

      // Pricing (formatted to match HTML design) - Use actual calculated values
      BASE_PRICE: (() => {
        // Calculate base construction price (total minus design services)
        const basePrice = calculation.grandTotal - (formData.project.needsDesign ? calculatedDesignPrice : 0);
        return basePrice.toLocaleString();
      })(),
      DESIGN_PRICE: formData.project.needsDesign ? calculatedDesignPrice.toLocaleString() : '0',
      DESIGN_SERVICES_FORMATTED: formData.project.needsDesign
        ? calculatedDesignPrice.toLocaleString()
        : '0',
      CONSTRUCTION_SUBTOTAL: (() => {
        // Calculate subtotal as sum of milestones PLUS utilities add-ons to match milestone pricing
        const milestoneSum = milestones.reduce((sum, m) => sum + m.amount, 0);
        const utilitiesCost =
          (formData.project.utilities?.waterMeter === 'separate' ? 3500 : 0) +
          (formData.project.utilities?.gasMeter === 'separate' ? 3500 : 0);
        return (milestoneSum + utilitiesCost).toLocaleString();
      })(),
      // Phase Totals for breakdown
      PHASE_1_TOTAL: (1000 + (formData.project.needsDesign ? designAmount : 0)).toLocaleString(),
      PHASE_2_TOTAL: '0', // Phase 2 services are included
      PHASE_3_TOTAL: (() => {
        const milestoneSum = milestones.reduce((sum, m) => sum + m.amount, 0);
        return milestoneSum.toLocaleString();
      })(),
      ADDITIONAL_SERVICES_TOTAL: (() => {
        // Calculate additional services from pricing engine line items
        const additionalServicesTotal = calculation.lineItems
          .filter((item: any) => item.category === 'Utilities' || item.category === 'Add-ons')
          .reduce((sum: number, item: any) => sum + item.totalPrice, 0);

        return additionalServicesTotal.toLocaleString();
      })(),
      UTILITY_PRICE: (() => {
        // Calculate utility connection costs (CORRECTED to $3,500 each)
        const utilityCost = (formData.project.utilities?.waterMeter === 'separate' ? 3500 : 0) +
                           (formData.project.utilities?.gasMeter === 'separate' ? 3500 : 0);
        return utilityCost > 0 ? utilityCost.toLocaleString() : '0';
      })(),
      GRAND_TOTAL: calculation.grandTotal.toLocaleString(),
      GRAND_TOTAL_FORMATTED: calculation.grandTotal.toLocaleString(),
      COST_PER_SQFT: Math.round(calculation.pricePerSqFt).toString(),

      // D1 and D2 milestone amounts
      DEPOSIT_AMOUNT: milestones[0]?.amount.toLocaleString() || '1,000',  // D1 - Deposit
      DESIGN_AMOUNT: milestones[1]?.amount.toLocaleString() || '12,500',  // D2 - Design
      
      // M1-M7 Construction Milestone Payments (formatted without $ to prevent double dollar signs)
      MILESTONE_1: milestones[2]?.amount.toLocaleString() || '15,000',   // M1 - Mobilization 
      MILESTONE_2: milestones[3]?.amount.toLocaleString() || '15,000',   // M2 - Underground
      MILESTONE_3: milestones[4]?.amount.toLocaleString() || '15,000',   // M3 - Foundation
      MILESTONE_4: milestones[5]?.amount.toLocaleString() || '15,000',   // M4 - Framing
      MILESTONE_5: milestones[6]?.amount.toLocaleString() || '15,000',   // M5 - MEP
      MILESTONE_6: milestones[7]?.amount.toLocaleString() || '15,000',   // M6 - Drywall
      MILESTONE_7: milestones[8]?.amount.toLocaleString() || '10,000',   // M7 - Final

      // Enhanced template formatted milestone variables (M1-M7 only)
      MILESTONE1_FORMATTED: milestones[2]?.amount.toLocaleString() || '15,000',  // M1
      MILESTONE2_FORMATTED: milestones[3]?.amount.toLocaleString() || '15,000',  // M2
      MILESTONE3_FORMATTED: milestones[4]?.amount.toLocaleString() || '15,000',  // M3
      MILESTONE4_FORMATTED: milestones[5]?.amount.toLocaleString() || '15,000',  // M4
      MILESTONE5_FORMATTED: milestones[6]?.amount.toLocaleString() || '15,000',  // M5
      MILESTONE6_FORMATTED: milestones[7]?.amount.toLocaleString() || '15,000',  // M6
      MILESTONE7_FORMATTED: milestones[8]?.amount.toLocaleString() || '10,000',  // M7
      DRYWALL_COST: milestones[7]?.amount.toLocaleString() || '15,000',  // M6 - Drywall
      PROPERTY_FINAL: milestones[8]?.amount.toLocaleString() || '10,000', // M7 - Final

      // Cumulative payment amounts for detailed breakdown table
      // D1 + D2 = Design phase complete
      DESIGN_CUMULATIVE: ((milestones[0]?.amount || 1000) + (milestones[1]?.amount || 12500)).toLocaleString(),
      // D1 + D2 + M1
      M1_CUMULATIVE: (
        (milestones[0]?.amount || 1000) +
        (milestones[1]?.amount || 12500) +
        (milestones[2]?.amount || 0)
      ).toLocaleString(),
      // D1 + D2 + M1 + M2
      M2_CUMULATIVE: (
        (milestones[0]?.amount || 1000) +
        (milestones[1]?.amount || 12500) +
        (milestones[2]?.amount || 0) +
        (milestones[3]?.amount || 0)
      ).toLocaleString(),
      // D1 + D2 + M1 + M2 + M3
      M3_CUMULATIVE: (
        (milestones[0]?.amount || 1000) +
        (milestones[1]?.amount || 12500) +
        (milestones[2]?.amount || 0) +
        (milestones[3]?.amount || 0) +
        (milestones[4]?.amount || 0)
      ).toLocaleString(),
      // D1 + D2 + M1 + M2 + M3 + M4
      M4_CUMULATIVE: (
        (milestones[0]?.amount || 1000) +
        (milestones[1]?.amount || 12500) +
        (milestones[2]?.amount || 0) +
        (milestones[3]?.amount || 0) +
        (milestones[4]?.amount || 0) +
        (milestones[5]?.amount || 0)
      ).toLocaleString(),
      // D1 + D2 + M1 + M2 + M3 + M4 + M5
      M5_CUMULATIVE: (
        (milestones[0]?.amount || 1000) +
        (milestones[1]?.amount || 12500) +
        (milestones[2]?.amount || 0) +
        (milestones[3]?.amount || 0) +
        (milestones[4]?.amount || 0) +
        (milestones[5]?.amount || 0) +
        (milestones[6]?.amount || 0)
      ).toLocaleString(),
      // D1 + D2 + M1 + M2 + M3 + M4 + M5 + M6
      M6_CUMULATIVE: (
        (milestones[0]?.amount || 1000) +
        (milestones[1]?.amount || 12500) +
        (milestones[2]?.amount || 0) +
        (milestones[3]?.amount || 0) +
        (milestones[4]?.amount || 0) +
        (milestones[5]?.amount || 0) +
        (milestones[6]?.amount || 0) +
        (milestones[7]?.amount || 0)
      ).toLocaleString(),

      // Average payment calculation (total divided by 9 payments)
      AVERAGE_PAYMENT: Math.round(calculation.grandTotal / 9).toLocaleString(),

      // Additional
      ADDITIONAL_SCOPE: formData.additionalNotes || 'Standard ADU construction as specified above.',

      // Images with Google Maps integration
      ANCHOR_LOGO_BASE64: await this.getAnchorLogoBase64(), // Returns actual base64 data URL
      COMPANY_LOGO_BASE64: await this.getAnchorLogoBase64(), // Template expects this variable name
      ADU_PHOTO_BASE64: this.getAduPhotoBase64(),
      PROPERTY_SATELLITE_IMAGE_BASE64: satelliteImage || '', // Google Maps satellite image

      // Company Information
      LICENSE_NUMBER: '1034567', // Real CSLB license number

      // Template Text Configuration - Admin Configurable Text with safe fallbacks
      // Scope of Work Section
      SCOPE_OF_WORK_HEADER: (textConfig as any).scopeOfWork?.header || 'Scope of Work',
      BUILDOUT_DESCRIPTION: (textConfig as any).scopeOfWork?.buildoutDescription || 'Complete ADU construction and buildout',
      STANDARD_FINISHES: (textConfig as any).scopeOfWork?.standardFinishes || 'Standard finishes throughout',
      ALLOWANCE_WORKSHEET: (textConfig as any).scopeOfWork?.allowanceWorksheet || 'Allowance worksheet included',
      APPLIANCES_INCLUDED_TEXT: (textConfig as any).scopeOfWork?.appliances?.included || 'Appliances package included',
      APPLIANCES_EXCLUDED_TEXT: (textConfig as any).scopeOfWork?.appliances?.excluded || 'Appliances not included',
      CABINETS_TEXT: (textConfig as any).scopeOfWork?.cabinets || 'Standard cabinet package',
      ADDITIONAL_TESTING: (textConfig as any).scopeOfWork?.additionalTesting || 'All required testing included',

      // Pricing Table Text
      PRICING_HEADER: (textConfig as any).pricing?.header || 'Investment Breakdown',
      DESIGN_PHASE_TEXT: (textConfig as any).pricing?.phases?.design || 'Design Phase',
      COORDINATION_PHASE_TEXT: (textConfig as any).pricing?.phases?.coordination || 'Coordination Phase',
      CONSTRUCTION_PHASE_TEXT: (textConfig as any).pricing?.phases?.construction || 'Construction Phase',
      ADD_ONS_PHASE_TEXT: (textConfig as any).pricing?.phases?.addOns || 'Add-on Services',

      // Section Headers (with dynamic data replacement)
      BEDROOM_BATHROOM_HEADER: ((textConfig as any).headers?.bedroomBathroom || '{bedrooms} Bedroom, {bathrooms} Bathroom')
        .replace('{bedrooms}', sanitizeTemplateValue(formData.project.bedrooms.toString()))
        .replace('{bathrooms}', sanitizeTemplateValue(formData.project.bathrooms.toString())),
      LIVING_AREA_HEADER: ((textConfig as any).headers?.livingArea || '{squareFootage} sq ft Living Area').replace(
        '{squareFootage}',
        sanitizeTemplateValue(formData.project.squareFootage.toString())
      ),
      ADU_TYPE_HEADER: ((textConfig as any).headers?.aduType || '{aduType} ADU').replace(
        '{aduType}',
        sanitizeTemplateValue(this.getAduTypeDisplay(formData.project.aduType, formData.project.stories))
      ),

      // V1.1+ NEW TEMPLATE VARIABLES
      // Proposal Metadata  
      PROPOSAL_VALIDITY_DAYS: (formData.proposalValidityDays || 30).toString(), // Default 30 days validity

      // Enhanced Form Fields
      HVAC_SYSTEM: formData.project.hvacType || 'HVAC system',
      
      // Build utility connections string
      UTILITY_CONNECTIONS: (() => {
        const utilities = formData.project.utilities;
        const connections = [];
        
        if (utilities.waterMeter) {
          connections.push(`Water: ${utilities.waterMeter === 'separate' ? 'Separate meter' : 'Shared meter'}`);
        }
        if (utilities.gasMeter) {
          connections.push(`Gas: ${utilities.gasMeter === 'separate' ? 'Separate meter' : 'Shared meter'}`);
        }
        if (utilities.electricMeter) {
          connections.push(`Electric: ${utilities.electricMeter === 'separate' ? 'Separate meter' : 'Shared meter'}`);
        }
        if (utilities.sewerMeter || formData.project.sewerConnection) {
          connections.push(`Sewer: Connected to main line`);
        }
        
        return connections.length > 0 
          ? connections.join(' • ') 
          : 'Water: Shared meter • Gas: Separate meter • Electric: Separate service • Sewer: Connected to main line';
      })(),
      
      // Extra costs from pricing calculation
      EXTRA_BATHROOM_COST: (() => {
        const bathroomItem = calculation.lineItems.find(
          (item: any) => item.description && item.description.toLowerCase().includes('extra bathroom')
        );
        return bathroomItem ? bathroomItem.totalPrice.toLocaleString() : '8,000';
      })(),
      
      DRIVEWAY_COST: (() => {
        const drivewayItem = calculation.lineItems.find(
          (item: any) => item.description && item.description.toLowerCase().includes('driveway')
        );
        return drivewayItem ? drivewayItem.totalPrice.toLocaleString() : '5,000';
      })(),
    };
  }

  private processConditionalSections(
    html: string,
    formData: AnchorProposalFormData,
    calculation: any,
    milestones: any[],
    templateVars: Record<string, string>
  ): string {
    // Process Handlebars-style conditionals and loops

    // Design services section
    if (formData.project.needsDesign) {
      html = html.replace(/{{#if NEEDS_DESIGN}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      html = html.replace(/{{#if NEEDS_DESIGN}}[\s\S]*?{{\/if}}/g, '');
    }

    // Process other conditional fields
    // Appliances included
    if (formData.project.appliancesIncluded) {
      html = html.replace(/{{#if APPLIANCES_INCLUDED}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
    } else {
      html = html.replace(/{{#if APPLIANCES_INCLUDED}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
    }

    // Solar design
    if (formData.project.solarDesign) {
      html = html.replace(/{{#if SOLAR_DESIGN}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
    } else {
      html = html.replace(/{{#if SOLAR_DESIGN}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
    }

    // FEMA included
    if (formData.project.femaIncluded) {
      html = html.replace(/{{#if FEMA_INCLUDED}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g, '$1');
    } else {
      html = html.replace(/{{#if FEMA_INCLUDED}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g, '$1');
    }

    // Additional notes
    if (formData.additionalNotes && formData.additionalNotes.trim()) {
      html = html.replace(/{{#if ADDITIONAL_NOTES}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      html = html.replace(/{{#if ADDITIONAL_NOTES}}[\s\S]*?{{\/if}}/g, '');
    }

    // Timeline
    if (formData.timeline && formData.timeline.trim()) {
      html = html.replace(/{{#if CUSTOM_TIMELINE}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      html = html.replace(/{{#if CUSTOM_TIMELINE}}[\s\S]*?{{\/if}}/g, '');
    }

    // Google Maps satellite image section
    // Check if we have a satellite image by looking at template variables
    const satelliteImageData = templateVars['PROPERTY_SATELLITE_IMAGE_BASE64'];
    const hasSatelliteImage = satelliteImageData && satelliteImageData.length > 0;

    console.log('🗺️ [DEBUG] Processing satellite image conditional:', {
      hasSatelliteImage,
      dataLength: satelliteImageData?.length || 0,
    });

    if (hasSatelliteImage) {
      // Replace {{#if PROPERTY_SATELLITE_IMAGE_BASE64}} conditional with image content
      html = html.replace(
        /{{#if PROPERTY_SATELLITE_IMAGE_BASE64}}([\s\S]*?){{else}}[\s\S]*?{{\/if}}/g,
        '$1'
      );
      console.log('✅ [DEBUG] Using satellite image content');
    } else {
      // Replace {{#if PROPERTY_SATELLITE_IMAGE_BASE64}} conditional with fallback content
      html = html.replace(
        /{{#if PROPERTY_SATELLITE_IMAGE_BASE64}}[\s\S]*?{{else}}([\s\S]*?){{\/if}}/g,
        '$1'
      );
      console.log('❌ [DEBUG] Using fallback content (no satellite image)');
    }

    // Process PROJECT_ITEMS Handlebars loop
    const projectItems = templateVars['PROJECT_ITEMS'] as any[];
    if (projectItems && Array.isArray(projectItems)) {
      const projectItemRows = projectItems
        .map(item => `<div class="pricing-item">${item.name}</div><div class="pricing-amount">$${item.price}</div>`)
        .join('');
      html = html.replace(/{{#each PROJECT_ITEMS}}[\s\S]*?{{\/each}}/g, projectItemRows);
    } else {
      // Remove the section if no project items
      html = html.replace(/{{#each PROJECT_ITEMS}}[\s\S]*?{{\/each}}/g, '');
    }

    // Process ADDITIONAL_COSTS conditional and loop
    const additionalCosts = templateVars['ADDITIONAL_COSTS'] as any[];
    if (additionalCosts && Array.isArray(additionalCosts) && additionalCosts.length > 0) {
      // Show the ADDITIONAL_COSTS conditional sections
      html = html.replace(/{{#if ADDITIONAL_COSTS}}([\s\S]*?){{\/if}}/g, '$1');
      
      const additionalCostRows = additionalCosts
        .map(cost => `<div class="pricing-item">${cost.name}</div><div class="pricing-amount">$${cost.price}</div>`)
        .join('');
      html = html.replace(/{{#each ADDITIONAL_COSTS}}[\s\S]*?{{\/each}}/g, additionalCostRows);
    } else {
      // Hide the additional costs sections if none exist
      html = html.replace(/{{#if ADDITIONAL_COSTS}}[\s\S]*?{{\/if}}/g, '');
    }

    // Process ADU_IMAGES conditional and loop
    html = html.replace(/{{#if ADU_IMAGES}}[\s\S]*?{{\/if}}/g, ''); // Remove ADU images section for now

    // Milestone payments
    const milestoneRows = milestones
      .map(
        milestone =>
          `<tr><td>${milestone.name}</td><td></td><td class="price">$ ${milestone.amount.toLocaleString()}</td></tr>`
      )
      .join('');
    html = html.replace(/{{#each MILESTONES}}[\s\S]*?{{\/each}}/g, milestoneRows);

    // Add-ons section - Handle ADD_ON_WORK_EXISTS conditional
    const hasAddOnWork =
      formData.project.selectedAddOns.length > 0 ||
      formData.project.utilities?.waterMeter === 'separate' ||
      formData.project.utilities?.gasMeter === 'separate';

    if (hasAddOnWork) {
      // Show the ADD_ON_WORK_EXISTS conditional sections
      html = html.replace(/{{#if ADD_ON_WORK_EXISTS}}([\s\S]*?){{\/if}}/g, '$1');

      // For the scope section, show selected add-ons
      html = html.replace(/{{#if SELECTED_ADD_ONS}}([\s\S]*?){{\/if}}/g, '$1');

      // Create detailed rows for selected add-ons based on pricing data
      const addonMapping = {
        bathroom: {
          name: 'Extra Bathroom',
          description: 'Additional bathroom beyond standard configuration',
        },
        driveway: {
          name: 'Dedicated Driveway',
          description: 'Dedicated driveway and parking space',
        },
        landscaping: {
          name: 'Basic Landscaping',
          description: 'Basic landscaping package around the ADU',
        },
      };

      // Get add-ons from the live pricing data that was passed to generate the PDF
      const selectedAddOns: Array<{
        number: string;
        name: string;
        description: string;
        cost: number;
      }> = [];
      let addOnIndex = 3; // Start after water (A1) and gas (A2) if they exist

      // Add regular add-ons from form selections
      if (formData.project.selectedAddOns && formData.project.selectedAddOns.length > 0) {
        formData.project.selectedAddOns.forEach(addOnKey => {
          const addonInfo = addonMapping[addOnKey as keyof typeof addonMapping];
          if (addonInfo) {
            // Try to find the cost from calculation lineItems first, fallback to predefined costs
            const calculatedAddon = calculation.lineItems.find(
              (item: any) =>
                item.category === 'Add-Ons' &&
                item.description.toLowerCase().includes(addonInfo.name.toLowerCase())
            );

            const cost = calculatedAddon
              ? calculatedAddon.totalPrice
              : addOnKey === 'bathroom'
                ? 8000
                : addOnKey === 'driveway'
                  ? 5000
                  : addOnKey === 'landscaping'
                    ? 10000
                    : 0;

            selectedAddOns.push({
              number: `A${addOnIndex++}`,
              name: addonInfo.name,
              description: addonInfo.description,
              cost: cost,
            });
          }
        });
      }

      const addOnRows = selectedAddOns
        .map(
          addon => `<tr class="milestone-row additional-service">
            <td class="milestone-number">${addon.number}</td>
            <td>${addon.name} - ${addon.description}</td>
            <td class="cost-value">$${addon.cost.toLocaleString()}</td>
           </tr>`
        )
        .join('');

      html = html.replace(/{{#each SELECTED_ADD_ONS}}[\s\S]*?{{\/each}}/g, addOnRows);
      html = html.replace(/{{#each ADD_ON_ITEMS}}[\s\S]*?{{\/each}}/g, addOnRows);

      html = html.replace(/{{#if ADD_ONS}}([\s\S]*?){{\/if}}/g, '$1');
      html = html.replace(/{{#each ADD_ONS}}[\s\S]*?{{\/each}}/g, '');
    } else {
      // Hide all add-on related sections if no add-on work exists
      html = html.replace(/{{#if ADD_ON_WORK_EXISTS}}[\s\S]*?{{\/if}}/g, '');
      html = html.replace(/{{#if SELECTED_ADD_ONS}}[\s\S]*?{{\/if}}/g, '');
      html = html.replace(/{{#if ADD_ONS}}[\s\S]*?{{\/if}}/g, '');
    }

    // Remove any remaining Handlebars syntax
    html = html.replace(/{{#[\s\S]*?}}[\s\S]*?{{\/[\s\S]*?}}/g, '');
    html = html.replace(/{{[^}]*}}/g, '');

    return html;
  }

  private getAduTypeDisplay(aduType: string, stories?: number): string {
    switch (aduType) {
      case 'detached':
        return stories === 2 ? 'Detached 2-Story' : 'Detached';
      case 'attached':
        return 'Attached';
      case 'junior-adu':
        return 'Garage Conversion';
      case 'detached-1story':
        return 'Detached 1-Story';
      case 'detached-2story':
        return 'Detached 2-Story';
      default:
        return 'Custom';
    }
  }

  private validateFormData(formData: AnchorProposalFormData): void {
    // Basic structure validation
    if (!formData || !formData.client || !formData.project) {
      throw new Error('Basic form data structure is missing');
    }

    // Security validation for client data
    if (formData.client.email && !validateEmail(formData.client.email)) {
      console.warn('Invalid email format detected, sanitizing...');
    }
    
    if (formData.client.phone && !validatePhone(formData.client.phone)) {
      console.warn('Invalid phone format detected, sanitizing...');
    }
    
    if (formData.client.zipCode && !validateZipCode(formData.client.zipCode)) {
      console.warn('Invalid ZIP code format detected, sanitizing...');
    }

    // Validate numeric project data
    if (formData.project.bedrooms && !validatePositiveInteger(formData.project.bedrooms, 10)) {
      throw new Error('Invalid bedroom count');
    }
    
    if (formData.project.bathrooms && !validatePositiveInteger(formData.project.bathrooms, 10)) {
      throw new Error('Invalid bathroom count');
    }
    
    if (formData.project.squareFootage && !validatePositiveInteger(formData.project.squareFootage, 5000)) {
      throw new Error('Invalid square footage');
    }
  }

  private getElectricalPanelDisplay(electricalPanel: number | string): string {
    const panel = typeof electricalPanel === 'string' ? parseInt(electricalPanel) : electricalPanel;

    switch (panel) {
      case -100:
        return '100-amp';
      case 0:
        return '200-amp';
      case 500:
        return '300-amp';
      case 1000:
        return '400-amp';
      default:
        return '200-amp'; // Default fallback
    }
  }

  private async getAnchorLogoBase64(): Promise<string> {
    // PRIORITY 1: Try to fetch the actual PNG logo and convert to base64
    try {
      console.log('🎨 Fetching anchor logo for PDF generation...');
      
      const origin = window.location.origin;
      const logoUrl = `${origin}/anchor-logo-main.png`;
      console.log('📍 Logo URL:', logoUrl);
      
      const response = await fetch(logoUrl);
      if (!response.ok) {
        throw new Error(`Failed to fetch logo: ${response.status}`);
      }
      
      const blob = await response.blob();
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result as string;
          console.log('✅ Logo converted to base64, size:', base64.length);
          console.log('✅ Logo starts with:', base64.substring(0, 50));
          resolve(base64);
        };
        reader.onerror = () => {
          console.error('❌ Failed to read logo as base64');
          reject(new Error('Failed to read logo'));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn('⚠️ PNG logo failed, trying SVG fallback:', error);
      
      // PRIORITY 2: High-quality SVG fallback with company colors
      const svgLogo = `<svg width="200" height="60" viewBox="0 0 200 60" xmlns="http://www.w3.org/2000/svg">
        <rect width="200" height="60" fill="#ffffff" stroke="#1e40af" stroke-width="2"/>
        <text x="100" y="25" font-family="Arial, sans-serif" font-size="18" font-weight="bold" fill="#1e40af" text-anchor="middle">ANCHOR</text>
        <text x="100" y="45" font-family="Arial, sans-serif" font-size="14" fill="#1e40af" text-anchor="middle">BUILDERS</text>
        <circle cx="30" cy="30" r="8" fill="#1e40af"/>
        <circle cx="170" cy="30" r="8" fill="#1e40af"/>
      </svg>`;
      
      try {
        const base64Svg = btoa(svgLogo);
        const dataUri = `data:image/svg+xml;base64,${base64Svg}`;
        console.log('✅ SVG fallback created, length:', dataUri.length);
        return dataUri;
      } catch (svgError) {
        console.error('❌ SVG fallback also failed:', svgError);
        
        // PRIORITY 3: Simple text fallback (guaranteed to work)
        return 'data:text/plain;base64,QU5DSE9SIEJVSUxERVJT'; // "ANCHOR BUILDERS" in base64
      }
    }
  }

  private getAduPhotoBase64(): string {
    // Return base64 encoded ADU photo or placeholder
    // This would be replaced with actual photo data
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNjY2Ij5BRFUgSW50ZXJpb3IgUGhvdG88L3RleHQ+PC9zdmc+';
  }

  private async htmlToPdfBlob(html: string): Promise<void> {
    console.log('🖨️ [DEBUG] Opening Enhanced template in new window for PDF printing');
    console.log('🔍 [DEBUG] Final HTML length:', html.length, 'First 200 chars:', html.substring(0, 200));

    try {
      // Create a new window with our Enhanced template
      const printWindow = window.open('', '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
      
      if (!printWindow) {
        throw new Error('Popup blocked - cannot open print window');
      }

      // Write our Enhanced template to the new window
      printWindow.document.open();
      printWindow.document.write(html);
      printWindow.document.close();

      // Wait for the content to load, then trigger print dialog
      printWindow.addEventListener('load', () => {
        console.log('✅ [DEBUG] Print window loaded successfully');
        setTimeout(() => {
          printWindow.focus();
          console.log('🖨️ [DEBUG] Triggering print dialog...');
          printWindow.print();
        }, 1000); // Increased timeout to ensure everything loads
      });

      console.log('✅ [DEBUG] Enhanced template opened for printing - use browser "Print to PDF" option');

    } catch (error) {
      console.error('❌ [ERROR] Print window failed:', error);
      
      // Fallback: download HTML file with instructions
      console.log('🔄 [DEBUG] Falling back to HTML download with print instructions');
      const blob = new Blob([html], { type: 'text/html' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Anchor-Builders-ADU-Proposal-DEBUG-${Date.now()}.html`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('💾 [DEBUG] HTML file downloaded for debugging. Open it to see the processed template with all variables replaced.');
    }
  }


  private async getModernTemplate(selectedTemplate?: string): Promise<string> {
    try {
      // Use resolver for primary template selection
      const templateResult = getActiveTemplate();
      logTemplateSelection(templateResult);
      
      // FORCE USE OF OUR UPDATED ENHANCED-DESIGN.html TEMPLATE
      const templatePath = '/anchor-proposal-compact.html';  // Server-side compact template

      console.log(
        `🎨 [DEBUG] Template switching - Selected: ${selectedTemplate}, Path: ${templatePath}`
      );

      // Try to load the selected template file with cache busting
      const cacheBuster = `?v=${Date.now()}`;
      const fullUrl = templatePath + cacheBuster;
      console.log(`🔗 [DEBUG] Fetching template from: ${fullUrl}`);

      const response = await fetch(fullUrl);
      console.log(`📡 [DEBUG] Fetch response - Status: ${response.status}, OK: ${response.ok}`);

      if (response.ok) {
        let template = await response.text();
        console.log(
          `✅ [DEBUG] Template loaded successfully - Length: ${template.length}, Type: ${selectedTemplate}`
        );

        // Add a debug indicator to the template so we can verify it's the right one
        const debugComment = `<!-- TEMPLATE: ${selectedTemplate?.toUpperCase() || 'DEFAULT'} - Generated: ${new Date().toISOString()} -->`;
        template = template.replace('</head>', `${debugComment}\n</head>`);

        // Also add a visible indicator in the PDF for debugging
        const visibleDebug = `<div style="position: fixed; top: 0; right: 0; background: red; color: white; padding: 2px 8px; font-size: 10px; z-index: 9999;">TEMPLATE: ${selectedTemplate?.toUpperCase()}</div>`;
        template = template.replace('<body>', `<body>${visibleDebug}`);

        return template;
      } else {
        console.error(
          `❌ [DEBUG] Failed to fetch template - Status: ${response.status}, StatusText: ${response.statusText}`
        );
      }
    } catch (error) {
      console.warn('⚠️ Could not load template file, using fallback template:', error);
    }

    // Fallback to inline template with updated logo
    const template =
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ADU Construction Proposal - {{CLIENT_FIRST_NAME}} {{CLIENT_LAST_NAME}}</title><link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet"><style>*{margin:0;padding:0;box-sizing:border-box}:root{--primary:#4f46e5;--primary-dark:#4338ca;--secondary:#374151;--light-bg:#f8fafc;--border:#e2e8f0;--border-dark:#e5e7eb;--success:#059669;--warning-bg:#fef7cd;--purple-bg:#f3e8ff;--blue-bg:#dbeafe;--text-light:#6b7280;--text-dark:#1f2937}body{font-family:Inter,-apple-system,BlinkMacSystemFont,Segoe UI,sans-serif;font-size:11px;line-height:1.5;color:#374151;background:white;-webkit-print-color-adjust:exact;color-adjust:exact;print-color-adjust:exact}.page-container{max-width:8.5in;margin:0 auto;padding:0.75in;background:white}.header-section{margin-bottom:20px;page-break-after:avoid}.header-top{display:flex;justify-content:space-between;align-items:center;padding-bottom:16px;border-bottom:2px solid var(--primary);margin-bottom:20px}.company-logo{display:flex;align-items:center;gap:12px}.logo-image{height:50px;width:auto;object-fit:contain}.contact-info{text-align:right;font-size:10px;color:var(--text-light);line-height:1.4}.contact-info strong{color:var(--secondary);font-weight:600}.proposal-header{background:var(--light-bg);border:1px solid var(--border);border-radius:8px;padding:20px;display:flex;justify-content:space-between;gap:24px;margin-bottom:20px}.proposal-details{flex:1}.proposal-title{font-size:20px;font-weight:700;color:var(--text-dark);margin-bottom:4px}.proposal-subtitle{font-size:13px;color:var(--text-light);margin-bottom:16px}.client-info-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:12px 20px}.client-info-item{display:flex;align-items:center;gap:6px;font-size:11px}.info-label{font-weight:600;color:var(--text-light);min-width:50px}.info-value{color:var(--text-dark)}.proposal-meta{display:flex;align-items:center;gap:12px;margin-top:12px}.date-badge{background:var(--primary);color:white;padding:4px 12px;border-radius:16px;font-size:10px;font-weight:500}.proposal-number{font-size:10px;color:var(--text-light)}.property-image-container{width:220px;height:160px;border-radius:8px;overflow:hidden;border:2px solid var(--border);background:#f3f4f6;flex-shrink:0}.property-image{width:100%;height:100%;object-fit:cover}.stats-section{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-bottom:16px}.stat-card{background:white;border:1px solid var(--border);border-radius:6px;padding:12px;text-align:center}.stat-value{font-size:16px;font-weight:700;color:var(--primary);line-height:1;margin-bottom:3px}.stat-label{font-size:8px;color:var(--text-light);text-transform:uppercase;letter-spacing:0.5px;font-weight:500}.scope-section{margin-bottom:20px;page-break-inside:avoid}.section-header{font-size:14px;font-weight:600;color:var(--text-dark);margin-bottom:12px;padding-bottom:8px;border-bottom:2px solid var(--border)}.scope-content{background:var(--light-bg);border-radius:8px;padding:20px;display:grid;grid-template-columns:repeat(2,1fr);gap:20px}.scope-column h4{font-size:12px;font-weight:600;color:var(--primary);margin-bottom:8px}.feature-list{list-style:none;padding:0}.feature-list li{font-size:10px;color:var(--secondary);padding-left:16px;position:relative;margin-bottom:4px;line-height:1.4}.feature-list li:before{content:"•";position:absolute;left:0;color:var(--primary);font-weight:bold}.cost-section{margin-bottom:20px;page-break-inside:avoid}.cost-table{width:100%;border-collapse:collapse;background:white;border-radius:8px;overflow:hidden;box-shadow:0 1px 3px rgba(0,0,0,0.05)}.cost-table th{background:var(--primary);color:white;padding:10px 12px;font-weight:600;font-size:10px;text-transform:uppercase;letter-spacing:0.5px;text-align:left}.cost-table td{padding:8px 12px;border-bottom:1px solid var(--border);font-size:10px}.phase-header td{background:#f3f4f6;font-weight:600;font-size:11px;color:var(--text-dark);text-transform:uppercase;letter-spacing:0.5px}.phase-design td{background:var(--warning-bg)}.phase-coordination td{background:var(--purple-bg)}.phase-construction td{background:var(--blue-bg)}.milestone-row td{font-size:10px;color:var(--secondary)}.milestone-number{font-weight:600;color:var(--primary)}.included{color:var(--success);font-weight:600}.cost-value{font-weight:600;color:var(--text-dark)}.subtotal-row td{font-weight:600;background:#f8fafc;border-top:1px solid var(--border-dark)}.total-row td{font-weight:700;background:#f8fafc;border-top:2px solid var(--primary);font-size:12px;padding:12px}.payment-section{background:var(--light-bg);border-radius:8px;padding:20px;margin-bottom:20px}.payment-header{font-size:12px;font-weight:600;color:var(--text-dark);margin-bottom:16px}.timeline-container{position:relative;margin:24px 0}.timeline-bar{position:relative;height:4px;background:var(--border);border-radius:2px}.timeline-progress{position:absolute;height:100%;width:100%;background:var(--primary);border-radius:2px}.timeline-steps{display:flex;justify-content:space-between;margin-top:-6px}.timeline-step{text-align:center;position:relative;flex:1;max-width:calc(100%/7)}.step-dot{width:12px;height:12px;background:white;border:3px solid var(--primary);border-radius:50%;margin:0 auto 8px}.step-amount{font-size:13px;font-weight:700;color:var(--text-dark)}.step-label{font-size:9px;color:var(--text-light);margin-top:2px}.footer-section{margin-top:24px;page-break-inside:avoid}.footer-content{background:var(--primary);color:white;border-radius:8px;padding:24px}.signature-section{background:white;border-radius:6px;padding:20px;margin-bottom:20px;color:var(--secondary)}.signature-title{font-size:13px;font-weight:600;color:var(--text-dark);margin-bottom:12px}.signature-text{font-size:10px;color:var(--text-light);margin-bottom:20px}.signature-grid{display:grid;grid-template-columns:1fr 1fr;gap:40px}.signature-block{position:relative}.signature-line{border-bottom:2px solid var(--border-dark);height:40px}.signature-label{font-size:10px;color:var(--text-light);margin-top:6px;display:flex;justify-content:space-between}.footer-info{display:grid;grid-template-columns:1fr 1fr;gap:32px;font-size:10px;line-height:1.6}.footer-column h4{font-size:11px;font-weight:600;margin-bottom:10px;color:white}.footer-column ul{list-style:none;padding:0;opacity:0.9}.footer-column li{padding-left:16px;position:relative;margin-bottom:4px}.footer-column li:before{content:"✓";position:absolute;left:0;color:rgba(255,255,255,0.8)}.terms-section{margin-top:20px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.2);font-size:9px;opacity:0.8;line-height:1.4}@media print{body{font-size:10px}.page-container{padding:0.5in}.header-section,.footer-section,.cost-section,.scope-section{page-break-inside:avoid}.cost-table{font-size:9px}.cost-table th,.cost-table td{padding:6px 10px}}</style></head><body><div class="page-container"><header class="header-section"><div class="header-top"><div class="company-logo"><img src="{{ANCHOR_LOGO_BASE64}}" alt="Anchor Builders" class="logo-image"></div><div class="contact-info"><strong>License #1234567</strong><br>(714) 555-0123<br>info@anchorbuilders.com<br>www.anchorbuilders.com</div></div><div class="proposal-header"><div class="proposal-details"><h1 class="proposal-title">ADU Construction Proposal</h1><p class="proposal-subtitle">{{PROJECT_ADDRESS}}, {{PROJECT_CITY}}, {{PROJECT_STATE}} {{PROJECT_ZIP}}</p><div class="client-info-grid"><div class="client-info-item"><span class="info-label">Client:</span><span class="info-value">{{CLIENT_FIRST_NAME}} {{CLIENT_LAST_NAME}}</span></div><div class="client-info-item"><span class="info-label">Phone:</span><span class="info-value">{{CLIENT_PHONE}}</span></div><div class="client-info-item"><span class="info-label">Email:</span><span class="info-value">{{CLIENT_EMAIL}}</span></div><div class="client-info-item"><span class="info-label">ADU Type:</span><span class="info-value">{{ADU_TYPE}}</span></div></div><div class="proposal-meta"><span class="date-badge">{{PROPOSAL_DATE}}</span><span class="proposal-number">Proposal #2025-{{PROJECT_ZIP}}</span></div></div><div class="property-image-container">{{#if PROPERTY_SATELLITE_IMAGE_BASE64}}<img src="data:image/png;base64,{{PROPERTY_SATELLITE_IMAGE_BASE64}}" alt="Property Satellite View" class="property-image">{{else}}<div style="display:flex;align-items:center;justify-content:center;height:100%;color:#9ca3af;font-size:11px;">Property Image</div>{{/if}}</div></div></header><section class="stats-section"><div class="stat-card"><div class="stat-value">{{SQUARE_FOOTAGE}}</div><div class="stat-label">Square Feet</div></div><div class="stat-card"><div class="stat-value">{{BEDROOMS}}</div><div class="stat-label">Bedrooms</div></div><div class="stat-card"><div class="stat-value">{{BATHROOMS}}</div><div class="stat-label">Bathrooms</div></div><div class="stat-card"><div class="stat-value">${{COST_PER_SQFT}}</div><div class="stat-label">Per Sq Ft</div></div></section><section class="scope-section"><h2 class="section-header">Scope of Work & Specifications</h2><div class="scope-content"><div class="scope-column"><h4>Included Features</h4><ul class="feature-list"><li>Complete architectural design and plans</li><li>All required permit processing</li><li>Site preparation and grading</li><li>Foundation and concrete work</li><li>Complete framing and roofing</li><li>Electrical system ({{ELECTRICAL_PANEL}} subpanel)</li><li>Plumbing for kitchen and bathroom</li><li>HVAC mini-split system</li><li>Insulation (R-13 walls, R-30 ceiling)</li><li>Drywall and interior painting</li><li>Vinyl plank flooring throughout</li><li>Kitchen cabinets and countertops</li><li>Bathroom fixtures and vanity</li><li>Interior and exterior doors</li><li>Double-pane vinyl windows</li><li>Exterior stucco finish</li></ul></div><div class="scope-column"><h4>Construction Standards</h4><ul class="feature-list"><li>Built to current California Building Code</li><li>Title 24 energy compliant</li><li>Engineered foundation design</li><li>Seismic reinforcement included</li><li>Fire-rated assemblies where required</li><li>ADA accessible design available</li></ul><h4 style="margin-top:16px;">Owner Responsibilities</h4><ul class="feature-list"><li>Property survey (if required)</li><li>Utility connections to property line</li><li>Appliances (refrigerator, stove, etc.)</li><li>Window coverings</li><li>Landscaping and irrigation</li><li>Any special finishes or upgrades</li></ul></div></div></section><section class="cost-section"><h2 class="section-header">Project Breakdown</h2><table class="cost-table"><thead><tr><th style="width:10%">Phase</th><th style="width:70%">Scope of Work</th><th style="width:20%">Investment</th></tr></thead><tbody><tr class="phase-header phase-design"><td colspan="4">Phase 1: Design & Planning</td></tr><tr class="milestone-row"><td class="milestone-number">1.1</td><td>Site assessment, measurements, and initial consultation</td><td rowspan="3" style="vertical-align:middle;text-align:center;" class="cost-value">${{DESIGN_PRICE}}</td></tr><tr class="milestone-row"><td class="milestone-number">1.2</td><td>Architectural design, floor plans, and 3D renderings</td></tr><tr class="milestone-row"><td class="milestone-number">1.3</td><td>Construction drawings and engineering calculations</td></tr><tr class="phase-header phase-coordination"><td colspan="4">Phase 2: Permits & Coordination</td></tr><tr class="milestone-row"><td class="milestone-number">2.1</td><td>Building permit application and plan check</td><td class="included">INCLUDED</td></tr><tr class="milestone-row"><td class="milestone-number">2.2</td><td>Utility coordination and approvals</td><td class="included">INCLUDED</td></tr><tr class="phase-header phase-construction"><td colspan="4">Phase 3: Construction</td></tr><tr class="milestone-row"><td class="milestone-number">3.1</td><td>Site prep, excavation, and foundation</td><td class="cost-value">${{MILESTONE_1}}</td></tr><tr class="milestone-row"><td class="milestone-number">3.2</td><td>Framing, roofing, and exterior sheathing</td><td class="cost-value">${{MILESTONE_2}}</td></tr><tr class="milestone-row"><td class="milestone-number">3.3</td><td>Rough electrical, plumbing, and HVAC</td><td class="cost-value">${{MILESTONE_3}}</td></tr><tr class="milestone-row"><td class="milestone-number">3.4</td><td>Insulation, drywall, and interior finishes</td><td class="cost-value">${{MILESTONE_4}}</td></tr><tr class="milestone-row"><td class="milestone-number">3.5</td><td>Flooring, cabinets, and fixtures</td><td class="cost-value">${{MILESTONE_5}}</td></tr><tr class="milestone-row"><td class="milestone-number">3.6</td><td>Exterior finishes and final details</td><td class="cost-value">${{MILESTONE_6}}</td></tr><tr class="milestone-row"><td class="milestone-number">3.7</td><td>Final inspections and certificate of occupancy</td><td class="cost-value">${{MILESTONE_7}}</td></tr><tr class="subtotal-row"><td colspan="2">Construction Subtotal</td><td class="cost-value">${{CONSTRUCTION_SUBTOTAL}}</td></tr><tr class="total-row"><td colspan="2">TOTAL PROJECT COST</td><td style="font-size:14px;">${{GRAND_TOTAL}}</td></tr></tbody></table></section><section class="payment-section"><h3 class="payment-header">Payment Schedule</h3><div class="timeline-container"><div class="timeline-bar"><div class="timeline-progress"></div></div><div class="timeline-steps"><div class="timeline-step"><div class="step-dot"></div><div class="step-amount">M1</div><div class="step-label">Foundation</div></div><div class="timeline-step"><div class="step-dot"></div><div class="step-amount">M2</div><div class="step-label">Framing</div></div><div class="timeline-step"><div class="step-dot"></div><div class="step-amount">M3</div><div class="step-label">MEP Rough</div></div><div class="timeline-step"><div class="step-dot"></div><div class="step-amount">M4</div><div class="step-label">Drywall</div></div><div class="timeline-step"><div class="step-dot"></div><div class="step-amount">M5</div><div class="step-label">Finishes</div></div><div class="timeline-step"><div class="step-dot"></div><div class="step-amount">M6</div><div class="step-label">Exterior</div></div><div class="timeline-step"><div class="step-dot"></div><div class="step-amount">M7</div><div class="step-label">Final</div></div></div></div></section><footer class="footer-section"><div class="footer-content"><div class="signature-section"><h3 class="signature-title">Agreement & Authorization</h3><p class="signature-text">By signing below, you acknowledge that you have reviewed and agree to the terms of this proposal.</p><div class="signature-grid"><div class="signature-block"><div class="signature-line"></div><div class="signature-label"><span>Client Signature</span><span>Date</span></div></div><div class="signature-block"><div class="signature-line"></div><div class="signature-label"><span>Anchor Builders Representative</span><span>Date</span></div></div></div></div><div class="footer-info"><div class="footer-column"><h4>What\'s Included</h4><ul><li>Complete project management</li><li>All permit coordination (permits to be paid by owner)</li><li>Quality materials and craftsmanship</li><li>Licensed and insured contractor</li><li>1-year comprehensive warranty</li></ul></div><div class="footer-column"><h4>Next Steps</h4><ul><li>Review this proposal thoroughly</li><li>Contact us with any questions</li><li>Sign and return this agreement</li><li>Submit initial deposit</li><li>Begin your ADU project</li></ul></div></div><div class="terms-section"><strong>Terms & Conditions:</strong> This proposal is valid for 30 days from the date shown above. Prices are subject to change based on final specifications and site conditions. Payment schedule: 10% upon signing, progress payments as outlined above. All work performed according to California Building Code and local ordinances. Additional terms and conditions apply as outlined in the full contract agreement. Anchor Builders License #1234567.</div></div></footer></div></body></html>';

    return template;
  }

  /**
   * Generate HTML content for preview without converting to PDF
   * This method follows the same flow as generateProposal but returns HTML string
   */
  async generateHTML(
    formData: AnchorProposalFormData,
    selectedTemplate?: string
  ): Promise<string> {
    try {
      // Rate limiting check
      const clientId = `${formData.client.email || 'anonymous'}_${Date.now()}`;
      if (!pdfRateLimiter.isAllowed(clientId, 3, 60000)) { // 3 attempts per minute
        throw new Error('Too many PDF generation attempts. Please wait a minute before trying again.');
      }

      console.log('🚀 [HTML] Starting HTML generation for preview:', formData);

      // Validate required form data
      this.validateFormData(formData);

      // Calculate pricing
      const pricingEngine = new AnchorPricingEngine();
      const pricingInputs = {
        squareFootage: formData.project.squareFootage,
        aduType: formData.project.aduType,
        stories: formData.project.stories,
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
        priceOverrides: formData.project.priceOverrides,
      };

      const calculation = pricingEngine.calculateProposal(pricingInputs);
      
      // Calculate design amount and milestones
      const calculationDesignLineItem = calculation.lineItems.find(
        (item: any) => item.category === 'Design Services'
      );
      const designAmount = calculationDesignLineItem ? calculationDesignLineItem.totalPrice : 0;
      const milestones = calculateMilestonePayments(calculation.grandTotal, designAmount);

      console.log('✅ [HTML] Pricing calculation completed for preview');

      // Prepare template variables
      const templateVars = await this.prepareTemplateVariables(
        formData,
        calculation,
        milestones,
        designAmount
      );

      console.log('✅ [HTML] Template variables prepared for preview');

      // Load and process template
      let processedHtml = await this.getModernTemplate(selectedTemplate);

      if (!processedHtml || processedHtml.length === 0) {
        throw new Error('Template HTML is empty or invalid');
      }

      // Replace template variables
      Object.entries(templateVars).forEach(([key, value]) => {
        if (typeof value !== 'object' && value !== null && value !== undefined) {
          const regex = new RegExp(`{{${key}}}`, 'g');
          processedHtml = processedHtml.replace(regex, value || '');
        }
      });

      // Process conditional sections
      processedHtml = this.processConditionalSections(
        processedHtml,
        formData,
        calculation,
        milestones,
        templateVars
      );

      console.log('✅ [HTML] HTML generated successfully for preview, length:', processedHtml.length);

      return processedHtml;

    } catch (error) {
      console.error('❌ [HTML] HTML generation failed:', error);
      throw new Error(
        `HTML generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
