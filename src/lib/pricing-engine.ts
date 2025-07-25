import {
  aduTypePricing,
  designServices,
  utilityOptions,
  addOnOptions,
  businessSettings,
  type AduTypePricing,
  type UtilityOption,
  type AddOnOption,
} from '../data/pricing-config';

export interface PricingInputs {
  // Basic Project Info
  squareFootage: number;
  aduType: 'detached' | 'attached';
  stories?: 1 | 2; // For detached ADUs only
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

  // Price Overrides
  priceOverrides?: {
    basePricePerSqFt?: number;
    designServices?: number;
    addOnPrices?: Record<string, number>;
    markupPercentage?: number;
  };
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
}

export class AnchorPricingEngine {
  calculateProposal(inputs: PricingInputs): PricingBreakdown {
    const lineItems: PricingLineItem[] = [];

    // 1. Base ADU Construction Cost ($/sqft model)
    this.calculateBaseConstructionCost(inputs, lineItems);

    // 2. Design Services (if selected)
    if (inputs.needsDesign) {
      this.calculateDesignServices(inputs, lineItems);
    }

    // 3. Utility Connections
    this.calculateUtilityConnections(inputs, lineItems);

    // 4. Add-ons
    this.calculateAddOns(inputs, lineItems);

    // Calculate subtotal
    const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Apply markup (use override if available)
    const markupPercentage =
      inputs.priceOverrides?.markupPercentage ?? businessSettings.standardMarkup;
    const markupAmount = subtotal * markupPercentage;
    const grandTotal = subtotal + markupAmount;

    return {
      lineItems,
      subtotal,
      markupPercentage,
      markupAmount,
      totalBeforeMarkup: subtotal,
      grandTotal,
      pricePerSqFt: grandTotal / inputs.squareFootage,
    };
  }

  private calculateBaseConstructionCost(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    // Get price per sqft based on ADU type and stories
    let aduType;
    if (inputs.aduType === 'detached') {
      // For detached, find by stories (default to 1-story if not specified)
      const stories = inputs.stories || 1;
      aduType = aduTypePricing.find(type => type.type === 'detached' && type.stories === stories);
    } else {
      // For attached, just find by type
      aduType = aduTypePricing.find(type => type.type === 'attached');
    }

    if (!aduType) return;

    // Use override price if available, otherwise use default
    const pricePerSqFt = inputs.priceOverrides?.basePricePerSqFt ?? aduType.pricePerSqFt;
    const baseConstructionCost = inputs.squareFootage * pricePerSqFt;
    const isOverridden = inputs.priceOverrides?.basePricePerSqFt !== undefined;

    lineItems.push({
      category: 'Base Construction',
      description: `${aduType.name} (${inputs.squareFootage} sq ft @ $${pricePerSqFt}/sq ft)${isOverridden ? ' *' : ''}`,
      quantity: inputs.squareFootage,
      unitPrice: pricePerSqFt,
      totalPrice: baseConstructionCost,
      isOptional: false,
    });
  }

  private calculateDesignServices(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    // Use override price if available, otherwise use default
    const designPrice = inputs.priceOverrides?.designServices ?? designServices.planningDesign;
    const isOverridden = inputs.priceOverrides?.designServices !== undefined;

    lineItems.push({
      category: 'Design Services',
      description: `${designServices.description}${isOverridden ? ' *' : ''}`,
      quantity: 1,
      unitPrice: designPrice,
      totalPrice: designPrice,
      isOptional: true,
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

      // Use override price if available, otherwise use default
      const addOnPrice = inputs.priceOverrides?.addOnPrices?.[addOnName] ?? addOn.price;
      const isOverridden = inputs.priceOverrides?.addOnPrices?.[addOnName] !== undefined;

      lineItems.push({
        category: 'Add-Ons',
        description: `${addOn.description}${isOverridden ? ' *' : ''}`,
        quantity: 1,
        unitPrice: addOnPrice,
        totalPrice: addOnPrice,
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
