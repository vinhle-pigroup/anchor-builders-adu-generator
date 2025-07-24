import {
  aduTypePricing,
  designServices,
  utilityOptions,
  addOnOptions,
  businessSettings,
  getSizeBasedPricing,
  getDesignPricing,
  type AduTypePricing,
  type UtilityOption,
  type AddOnOption,
} from '../data/pricing-config';

export interface PricingInputs {
  // Basic Project Info
  squareFootage: number;
  aduType: 'detached' | 'attached';
  bedrooms: number;
  bathrooms: number;

  // Utilities - Simplified to separate/shared
  utilities: {
    waterMeter: 'shared' | 'separate';
    gasMeter: 'shared' | 'separate';
    electricMeter: 'separate'; // Always separate
  };

  // Services
  needsDesign: boolean;
  appliancesIncluded: boolean;
  hvacType: 'central-ac';

  // Add-ons (array of add-on names)
  selectedAddOns: string[];

  // Connection types
  sewerConnection: 'existing-lateral';
  solarDesign: boolean;
  femaIncluded: boolean;
}

export interface PricingLineItem {
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  isOptional: boolean;
}

export interface PricingBreakdown {
  lineItems: PricingLineItem[];
  subtotal: number;
  markupPercentage: number;
  markupAmount: number;
  totalBeforeMarkup: number;
  grandTotal: number;
  pricePerSqFt: number;
  baseConstructionPricePerSqFt: number;
}

export class AnchorPricingEngine {
  calculateProposal(inputs: PricingInputs): PricingBreakdown {
    const lineItems: PricingLineItem[] = [];

    // 1. Base ADU Construction Cost ($/sqft model)
    this.calculateBaseConstructionCost(inputs, lineItems);

    // 2. Design & Planning Phase (always included)
    this.calculateDesignServices(inputs, lineItems);

    // 3. Utility Connections
    this.calculateUtilityConnections(inputs, lineItems);

    // 4. Add-ons 
    this.calculateAddOns(inputs, lineItems);

    // Calculate subtotal
    const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // No markup applied - prices are already final (based on actual proposals)
    const markupPercentage = 0;
    const markupAmount = 0;
    const grandTotal = subtotal;

    // Calculate base construction price per sqft (just the construction cost)
    const baseConstructionItem = lineItems.find(item => item.category === 'CONSTRUCTION');
    const baseConstructionPricePerSqFt = baseConstructionItem 
      ? baseConstructionItem.totalPrice / inputs.squareFootage
      : getSizeBasedPricing(inputs.squareFootage, inputs.aduType === 'attached');

    return {
      lineItems,
      subtotal,
      markupPercentage,
      markupAmount,
      totalBeforeMarkup: subtotal,
      grandTotal,
      pricePerSqFt: grandTotal / inputs.squareFootage,
      baseConstructionPricePerSqFt,
    };
  }

  private calculateBaseConstructionCost(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    // Use size-based pricing from actual proposals
    const pricePerSqFt = getSizeBasedPricing(inputs.squareFootage, inputs.aduType === 'attached');
    const baseConstructionCost = inputs.squareFootage * pricePerSqFt;
    
    lineItems.push({
      category: 'CONSTRUCTION',
      description: `${inputs.aduType === 'attached' ? 'Attached/Garage Conversion' : 'Detached'} ADU Construction (${inputs.squareFootage} sqft)`,
      quantity: inputs.squareFootage,
      unitPrice: pricePerSqFt,
      totalPrice: baseConstructionCost,
      isOptional: false,
    });
  }

  private calculateDesignServices(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    const designCost = getDesignPricing(inputs.squareFootage);
    
    lineItems.push({
      category: 'DESIGN & PLANNING',
      description: 'ADU Plan Design, Structural Engineering, MEP Design, Zoning & Site Planning Review, Title 24 Energy Compliance',
      quantity: 1,
      unitPrice: designCost,
      totalPrice: designCost,
      isOptional: false,
    });
  }

  private calculateUtilityConnections(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    // Water Meter
    if (inputs.utilities.waterMeter === 'separate') {
      const waterUtility = utilityOptions.find(u => u.name === 'Water Meter');
      if (waterUtility) {
        lineItems.push({
          category: 'Utilities',
          description: 'Separate Water Meter Connection',
          quantity: 1,
          unitPrice: waterUtility.separatePrice,
          totalPrice: waterUtility.separatePrice,
          isOptional: false,
        });
      }
    }

    // Gas Meter
    if (inputs.utilities.gasMeter === 'separate') {
      const gasUtility = utilityOptions.find(u => u.name === 'Gas Meter');
      if (gasUtility) {
        lineItems.push({
          category: 'Utilities',
          description: 'Separate Gas Meter Connection',
          quantity: 1,
          unitPrice: gasUtility.separatePrice,
          totalPrice: gasUtility.separatePrice,
          isOptional: false,
        });
      }
    }

    // Electric Meter (always separate)
    const electricUtility = utilityOptions.find(u => u.name === 'Electric Meter');
    if (electricUtility) {
      lineItems.push({
        category: 'Utilities',
        description: 'Separate Electric Meter Connection',
        quantity: 1,
        unitPrice: electricUtility.separatePrice,
        totalPrice: electricUtility.separatePrice,
        isOptional: false,
      });
    }
  }

  private calculateAddOns(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    inputs.selectedAddOns.forEach(addOnName => {
      const addOn = addOnOptions.find(a => a.name === addOnName);
      if (!addOn) return;

      lineItems.push({
        category: 'Add-Ons',
        description: addOn.description,
        quantity: 1,
        unitPrice: addOn.price,
        totalPrice: addOn.price,
        isOptional: true,
      });
    });
  }

  // Helper methods for form components
  getAduTypeOptions() {
    return aduTypePricing;
  }

  getUtilityOptions() {
    return utilityOptions;
  }

  getAddOnOptions() {
    return addOnOptions;
  }

  getDesignServices() {
    return designServices;
  }
}
