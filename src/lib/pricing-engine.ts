import {
  aduPricingTiers,
  foundationPricing,
  siteworkPricing,
  utilityPricing,
  finishPricing,
  addOnPricing,
  professionalServices,
  regionalMultipliers,
  timelineMultipliers,
  type PricingTier,
  type FoundationPricing,
  type SiteworkPricing,
  type FinishPricing,
} from '../data/pricing-config';

export interface PricingInputs {
  // Basic Project Info
  squareFootage: number;
  aduType: 'studio' | 'one-bedroom' | 'two-bedroom' | 'custom';

  // Construction Details
  foundationType: 'slab' | 'crawl-space' | 'basement';
  sitework: 'minimal' | 'moderate' | 'extensive';
  finishLevel: 'basic' | 'standard' | 'premium' | 'luxury';

  // Utilities
  utilities: {
    electric: boolean;
    plumbing: boolean;
    gas: boolean;
    cableInternet: boolean;
  };

  // Add-ons (array of add-on names)
  selectedAddOns: string[];

  // Services
  needsPermits: boolean;
  needsDesign: boolean;
  needsManagement: boolean;

  // Location and Timeline
  zipCode?: string;
  timeline: 'rush' | 'standard' | 'flexible';
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
  regionalMultiplier: number;
  timelineMultiplier: number;
  adjustedSubtotal: number;
  managementFee: number;
  totalBeforeTax: number;
  taxRate: number;
  taxAmount: number;
  grandTotal: number;
  pricePerSqFt: number;
}

export class AnchorPricingEngine {
  calculateProposal(inputs: PricingInputs): PricingBreakdown {
    const lineItems: PricingLineItem[] = [];

    // 1. Base Construction Cost
    const baseCost = this.calculateBaseCost(inputs, lineItems);

    // 2. Foundation Cost
    this.calculateFoundationCost(inputs, lineItems);

    // 3. Sitework Cost
    this.calculateSiteworkCost(inputs, lineItems);

    // 4. Utilities Cost
    this.calculateUtilitiesCost(inputs, lineItems);

    // 5. Finish Level Cost
    this.calculateFinishCost(inputs, lineItems);

    // 6. Add-ons Cost
    this.calculateAddOnsCost(inputs, lineItems);

    // 7. Professional Services
    this.calculateProfessionalServices(inputs, lineItems);

    // Calculate totals
    const subtotal = lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

    // Regional and timeline multipliers
    const regionalMultiplier = this.getRegionalMultiplier(inputs.zipCode);
    const timelineMultiplier = timelineMultipliers[inputs.timeline];

    const adjustedSubtotal = subtotal * regionalMultiplier * timelineMultiplier;

    // Management fee (if selected)
    const managementFee = inputs.needsManagement
      ? adjustedSubtotal * professionalServices.management.percentage
      : 0;

    if (managementFee > 0) {
      lineItems.push({
        category: 'Professional Services',
        description: 'Project management and coordination',
        quantity: 1,
        unitPrice: managementFee,
        totalPrice: managementFee,
        isOptional: true,
      });
    }

    const totalBeforeTax = adjustedSubtotal + managementFee;

    // Tax calculation (assuming 8.5% average)
    const taxRate = 0.085;
    const taxAmount = totalBeforeTax * taxRate;
    const grandTotal = totalBeforeTax + taxAmount;

    return {
      lineItems,
      subtotal,
      regionalMultiplier,
      timelineMultiplier,
      adjustedSubtotal,
      managementFee,
      totalBeforeTax,
      taxRate,
      taxAmount,
      grandTotal,
      pricePerSqFt: grandTotal / inputs.squareFootage,
    };
  }

  private calculateBaseCost(inputs: PricingInputs, lineItems: PricingLineItem[]): number {
    const tier = this.getAduTier(inputs.squareFootage, inputs.aduType);

    if (!tier) {
      // Custom pricing calculation
      const customPrice = inputs.squareFootage * 250; // Base custom rate
      lineItems.push({
        category: 'Base Construction',
        description: `Custom ADU (${inputs.squareFootage} sq ft)`,
        quantity: inputs.squareFootage,
        unitPrice: 250,
        totalPrice: customPrice,
        isOptional: false,
      });
      return customPrice;
    }

    const basePrice = tier.basePrice + inputs.squareFootage * tier.pricePerSqFt;

    lineItems.push({
      category: 'Base Construction',
      description: `${tier.name} (${inputs.squareFootage} sq ft)`,
      quantity: inputs.squareFootage,
      unitPrice: tier.pricePerSqFt,
      totalPrice: basePrice,
      isOptional: false,
    });

    return basePrice;
  }

  private calculateFoundationCost(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    const foundation = foundationPricing.find(f => f.type === inputs.foundationType);
    if (!foundation) return;

    const foundationCost = foundation.basePrice + inputs.squareFootage * foundation.pricePerSqFt;

    lineItems.push({
      category: 'Foundation',
      description: foundation.description,
      quantity: inputs.squareFootage,
      unitPrice: foundation.pricePerSqFt,
      totalPrice: foundationCost,
      isOptional: false,
    });
  }

  private calculateSiteworkCost(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    const sitework = siteworkPricing.find(s => s.level === inputs.sitework);
    if (!sitework) return;

    lineItems.push({
      category: 'Sitework',
      description: sitework.description,
      quantity: 1,
      unitPrice: sitework.basePrice,
      totalPrice: sitework.basePrice,
      isOptional: false,
    });
  }

  private calculateUtilitiesCost(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    utilityPricing.forEach(utility => {
      const isSelected = inputs.utilities[utility.type as keyof typeof inputs.utilities];

      if (isSelected || utility.required) {
        lineItems.push({
          category: 'Utilities',
          description: utility.description,
          quantity: 1,
          unitPrice: utility.price,
          totalPrice: utility.price,
          isOptional: !utility.required,
        });
      }
    });
  }

  private calculateFinishCost(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    const finish = finishPricing.find(f => f.level === inputs.finishLevel);
    if (!finish) return;

    const finishCost = inputs.squareFootage * finish.pricePerSqFt;

    lineItems.push({
      category: 'Finishes',
      description: finish.description,
      quantity: inputs.squareFootage,
      unitPrice: finish.pricePerSqFt,
      totalPrice: finishCost,
      isOptional: false,
    });
  }

  private calculateAddOnsCost(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    inputs.selectedAddOns.forEach(addOnName => {
      const addOn = addOnPricing.find(a => a.name === addOnName);
      if (!addOn) return;

      lineItems.push({
        category: this.formatCategoryName(addOn.category),
        description: addOn.description,
        quantity: 1,
        unitPrice: addOn.price,
        totalPrice: addOn.price,
        isOptional: true,
      });
    });
  }

  private calculateProfessionalServices(inputs: PricingInputs, lineItems: PricingLineItem[]) {
    // Permits
    if (inputs.needsPermits) {
      const permitCost = professionalServices.permits.base;
      lineItems.push({
        category: 'Professional Services',
        description: professionalServices.permits.description,
        quantity: 1,
        unitPrice: permitCost,
        totalPrice: permitCost,
        isOptional: true,
      });
    }

    // Design
    if (inputs.needsDesign) {
      const designCost =
        professionalServices.design.base +
        inputs.squareFootage * professionalServices.design.pricePerSqFt;
      lineItems.push({
        category: 'Professional Services',
        description: professionalServices.design.description,
        quantity: inputs.squareFootage,
        unitPrice: professionalServices.design.pricePerSqFt,
        totalPrice: designCost,
        isOptional: true,
      });
    }
  }

  private getAduTier(squareFootage: number, aduType: string): PricingTier | null {
    if (aduType === 'custom') return null;

    return (
      aduPricingTiers.find(
        tier => squareFootage >= tier.minSqFt && squareFootage <= tier.maxSqFt
      ) || null
    );
  }

  private getRegionalMultiplier(zipCode?: string): number {
    if (!zipCode) return regionalMultipliers.default;

    return (
      regionalMultipliers[zipCode as keyof typeof regionalMultipliers] ||
      regionalMultipliers.default
    );
  }

  private formatCategoryName(category: string): string {
    return category.charAt(0).toUpperCase() + category.slice(1).replace('-', ' ');
  }

  // Helper method to get available add-ons by category
  getAddOnsByCategory(): Record<string, typeof addOnPricing> {
    const categories: Record<string, typeof addOnPricing> = {};

    addOnPricing.forEach(addOn => {
      if (!categories[addOn.category]) {
        categories[addOn.category] = [];
      }
      categories[addOn.category].push(addOn);
    });

    return categories;
  }

  // Helper method to get finish level options
  getFinishLevelOptions() {
    return finishPricing;
  }

  // Helper method to get foundation options
  getFoundationOptions() {
    return foundationPricing;
  }

  // Helper method to get sitework options
  getSiteworkOptions() {
    return siteworkPricing;
  }
}
