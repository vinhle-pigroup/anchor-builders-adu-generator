import {
  aduTypePricing,
  designServices,
  utilityOptions,
  addOnOptions,
  businessSettings,
  getPricePerSqFt as getStaticPricePerSqFt,
} from '../data/pricing-config';
import { pricingEditorBridge } from './pricing-editor-bridge';

export interface PricingInputs {
  // Basic Project Info
  squareFootage: number;
  aduType: 'detached' | 'attached' | string;
  stories?: 1 | 2; // For detached ADUs only
  bedrooms: number;
  bathrooms: number;

  // Utilities - Simplified to separate/shared
  utilities: {
    waterMeter: 'shared' | 'separate';
    gasMeter: 'shared' | 'separate';
    electricMeter: 'shared' | 'separate'; // Allow both shared and separate
  };

  // Services
  needsDesign: boolean;
  appliancesIncluded: boolean;
  hvacType: 'central-ac' | 'mini-split';

  // Add-ons (array of add-on names)
  selectedAddOns: string[];

  // Connection types
  sewerConnection: 'existing-lateral';
  solarDesign: boolean;
  femaIncluded: boolean;

  // Price Overrides (legacy support)
  priceOverrides?: {
    basePricePerSqFt?: number;
    designServices?: number;
    addOnPrices?: Record<string, number>;
    markupPercentage?: number;
  };

  // NEW: Use dynamic configuration
  useDynamicConfig?: boolean;
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
  // NEW: Configuration source info
  configurationSource: 'static' | 'dynamic' | 'override';
  configurationVersion?: string;
}

export class AnchorPricingEngine {
  constructor() {
    // Dynamic config now handled by pricingEditorBridge
  }

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

    // Apply markup (check override, then dynamic config, then static)
    let markupPercentage: number;
    if (inputs.priceOverrides?.markupPercentage !== undefined) {
      markupPercentage = inputs.priceOverrides.markupPercentage;
    } else {
      markupPercentage = businessSettings.standardMarkup;
    }

    const markupAmount = subtotal * markupPercentage;
    const grandTotal = subtotal + markupAmount;

    // Determine configuration source
    let configurationSource: 'static' | 'dynamic' | 'override' = 'static';
    if (inputs.priceOverrides) {
      configurationSource = 'override';
    }

    return {
      lineItems,
      subtotal,
      markupPercentage,
      markupAmount,
      totalBeforeMarkup: subtotal,
      grandTotal,
      pricePerSqFt: grandTotal / inputs.squareFootage,
      configurationSource,
      configurationVersion: undefined,
    };
  }

  private calculateBaseConstructionCost(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    let pricePerSqFt: number;
    let aduTypeName: string;
    
    // Check for override first
    if (inputs.priceOverrides?.basePricePerSqFt !== undefined) {
      pricePerSqFt = inputs.priceOverrides.basePricePerSqFt;
      aduTypeName = this.getAduTypeName(inputs.aduType, inputs.stories);
    } else {
      // First try to get price from the pricing editor bridge
      const editorPrice = pricingEditorBridge.getADUPrice(inputs.aduType, inputs.squareFootage);
      if (editorPrice) {
        pricePerSqFt = editorPrice;
        aduTypeName = this.getAduTypeName(inputs.aduType, inputs.stories);
      } else {
        // Fall back to static configuration with size-based adjustments
        pricePerSqFt = getStaticPricePerSqFt(
          inputs.aduType as 'detached' | 'attached',
          inputs.stories,
          inputs.squareFootage
        );
        aduTypeName = this.getAduTypeName(inputs.aduType, inputs.stories);
      }
    }

    const baseConstructionCost = inputs.squareFootage * pricePerSqFt;
    const isOverridden = inputs.priceOverrides?.basePricePerSqFt !== undefined;
    const isDynamic = inputs.useDynamicConfig && !isOverridden;
    const overrideIndicator = isOverridden ? ' *' : '';
    const dynamicIndicator = isDynamic ? ' (Dynamic)' : '';

    lineItems.push({
      category: 'Base Construction',
      description: aduTypeName + ' (' + inputs.squareFootage + ' sq ft @ $' + pricePerSqFt + '/sq ft)' + overrideIndicator + dynamicIndicator,
      quantity: inputs.squareFootage,
      unitPrice: pricePerSqFt,
      totalPrice: baseConstructionCost,
      isOptional: false,
    });
  }

  private calculateDesignServices(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    let designPrice: number;
    let description: string;

    // First try to get price from the pricing editor bridge
    const editorPrice = pricingEditorBridge.getServicePrice('designServices');
    console.log('🎨 [Engine] Design Services - Editor price:', editorPrice);
    
    // Check for override first
    if (inputs.priceOverrides?.designServices !== undefined) {
      designPrice = inputs.priceOverrides.designServices;
      description = designServices.description;
      console.log('🎨 [Engine] Using override price:', designPrice);
    } else if (editorPrice > 0) {
      // Use price from editor
      designPrice = editorPrice;
      description = designServices.description;
      console.log('🎨 [Engine] Using editor price:', designPrice);
    } else {
      // Use static configuration
      designPrice = designServices.planningDesign;
      description = designServices.description;
    }

    const isOverridden = inputs.priceOverrides?.designServices !== undefined;
    const isDynamic = inputs.useDynamicConfig && !isOverridden;
    const overrideIndicator = isOverridden ? ' *' : '';
    const dynamicIndicator = isDynamic ? ' (Dynamic)' : '';

    lineItems.push({
      category: 'Design Services',
      description: description + overrideIndicator + dynamicIndicator,
      quantity: 1,
      unitPrice: designPrice,
      totalPrice: designPrice,
      isOptional: true,
    });
  }

  private calculateUtilityConnections(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    const utilityConfig = utilityOptions;
    const dynamicIndicator = '';

    // Water Meter
    if (inputs.utilities.waterMeter === 'separate') {
      const waterUtility = utilityConfig.find((u: any) => u.name === 'Water Meter');
      if (waterUtility) {
        lineItems.push({
          category: 'Utilities',
          description: 'Separate Water Meter Connection' + dynamicIndicator,
          quantity: 1,
          unitPrice: waterUtility.separatePrice,
          totalPrice: waterUtility.separatePrice,
          isOptional: false,
        });
      }
    }

    // Gas Meter
    if (inputs.utilities.gasMeter === 'separate') {
      const gasUtility = utilityConfig.find((u: any) => u.name === 'Gas Meter');
      if (gasUtility) {
        lineItems.push({
          category: 'Utilities',
          description: 'Separate Gas Meter Connection' + dynamicIndicator,
          quantity: 1,
          unitPrice: gasUtility.separatePrice,
          totalPrice: gasUtility.separatePrice,
          isOptional: false,
        });
      }
    }

    // Electric Meter (always separate)
    const electricUtility = utilityConfig.find((u: any) => u.name === 'Electric Meter');
    if (electricUtility) {
      lineItems.push({
        category: 'Utilities',
        description: 'Separate Electric Meter Connection' + dynamicIndicator,
        quantity: 1,
        unitPrice: electricUtility.separatePrice,
        totalPrice: electricUtility.separatePrice,
        isOptional: false,
      });
    }
  }

  private calculateAddOns(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    const addOnConfig = addOnOptions;

    inputs.selectedAddOns.forEach(addOnName => {
      const addOn = addOnConfig.find((a: any) => a.name === addOnName);
      if (!addOn) return;

      // Use override price if available, otherwise use config (dynamic or static)
      const addOnPrice = inputs.priceOverrides?.addOnPrices?.[addOnName] ?? addOn.price;
      const isOverridden = inputs.priceOverrides?.addOnPrices?.[addOnName] !== undefined;
      const overrideIndicator = isOverridden ? ' *' : '';
      const dynamicIndicator = inputs.useDynamicConfig && !isOverridden ? ' (Dynamic)' : '';

      lineItems.push({
        category: 'Add-Ons',
        description: addOn.description + overrideIndicator + dynamicIndicator,
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

  getBusinessSettings() {
    return businessSettings;
  }

  // NEW: Configuration management methods
  refreshConfiguration(): void {
    // Dynamic configuration now handled by pricingEditorBridge
  }

  getCurrentConfiguration(): any | null {
    // Dynamic configuration now handled by pricingEditorBridge
    return null;
  }

  private getAduTypeName(aduType: string, stories?: 1 | 2): string {
    if (aduType === 'detached') {
      return 'Detached ADU (' + (stories || 1) + '-Story)';
    }
    return 'Attached ADU';
  }

}

// Export a default instance for easy use - STATIC CONFIG ONLY for simplicity
export const anchorPricingEngine = new AnchorPricingEngine();

// Export utility functions
export const calculateProposal = (inputs: PricingInputs): PricingBreakdown => {
  return anchorPricingEngine.calculateProposal(inputs);
};

export const refreshPricingConfiguration = (): void => {
  anchorPricingEngine.refreshConfiguration();
};
