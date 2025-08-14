/**
 * Bridge between the Pricing Editor V2 and the calculation engine
 * This ensures edited prices are used in real-time calculations
 */

export class PricingEditorBridge {
  private static instance: PricingEditorBridge;
  private editorConfig: any = null;
  
  private constructor() {
    // Load any saved configuration
    this.loadConfiguration();
    
    // Listen for pricing updates
    window.addEventListener('anchor:pricing-updated', this.handlePricingUpdate.bind(this));
    window.addEventListener('anchor:pricing-config-changed', this.handleConfigChange.bind(this));
  }
  
  static getInstance(): PricingEditorBridge {
    if (!PricingEditorBridge.instance) {
      PricingEditorBridge.instance = new PricingEditorBridge();
    }
    return PricingEditorBridge.instance;
  }
  
  private handlePricingUpdate = (event: Event) => {
    const customEvent = event as CustomEvent;
    const { pricing } = customEvent.detail;
    
    if (pricing) {
      this.updateConfiguration(pricing);
    }
  };
  
  private handleConfigChange = (event: Event) => {
    const customEvent = event as CustomEvent;
    const { config } = customEvent.detail;
    
    if (config) {
      this.editorConfig = config;
      localStorage.setItem('anchor-pricing-editor-config', JSON.stringify(config));
    }
  };
  
  private loadConfiguration() {
    const savedEditor = localStorage.getItem('anchor-pricing-v2');
    const savedConfig = localStorage.getItem('anchor-pricing-editor-config');
    
    if (savedConfig) {
      try {
        this.editorConfig = JSON.parse(savedConfig);
      } catch (e) {
        console.error('Failed to load pricing configuration:', e);
      }
    } else if (savedEditor) {
      try {
        const editorData = JSON.parse(savedEditor);
        this.updateConfiguration(editorData);
      } catch (e) {
        console.error('Failed to load editor data:', e);
      }
    }
  }
  
  private updateConfiguration(pricing: any) {
    // Map editor data to config format
    this.editorConfig = {
      aduTypePricing: {
        detached: pricing.aduTypes?.find((t: any) => t.key === 'detached')?.value || 240,
        attached: pricing.aduTypes?.find((t: any) => t.key === 'attached')?.value || 240,
        jadu: pricing.aduTypes?.find((t: any) => t.key === 'jadu')?.value || 200,
      },
      
      sizeAdjustments: {
        baseRate: pricing.squareFootage?.find((s: any) => s.key === 'baseRate')?.value || 240,
        smallUnitPremium: pricing.squareFootage?.find((s: any) => s.key === 'smallUnitPremium')?.value || 250,
        tinyUnitPremium: pricing.squareFootage?.find((s: any) => s.key === 'tinyUnitPremium')?.value || 260,
      },
      
      bathroomPricing: {
        oneHalf: pricing.bathrooms?.find((b: any) => b.key === 'oneHalfBathroom')?.value || 4000,
        two: pricing.bathrooms?.find((b: any) => b.key === 'twoBathroom')?.value || 8000,
      },
      
      hvacPricing: {
        centralAc: pricing.hvac?.find((h: any) => h.key === 'centralAc')?.value || 0,
        miniSplit: pricing.hvac?.find((h: any) => h.key === 'miniSplit')?.value || 0,
      },
      
      utilitiesPricing: {
        waterMeterSeparate: pricing.utilities?.find((u: any) => u.key === 'waterMeterSeparate')?.value || 3500,
        gasMeterSeparate: pricing.utilities?.find((u: any) => u.key === 'gasMeterSeparate')?.value || 3500,
        electricMeterSeparate: pricing.utilities?.find((u: any) => u.key === 'electricMeterSeparate')?.value || 0,
        sewerConnection: pricing.utilities?.find((u: any) => u.key === 'sewerConnection')?.value || 0,
        electricalPanel: pricing.utilities?.find((u: any) => u.key === 'electricalPanel')?.value || 3000,
      },
      
      additionalServicesPricing: {
        designServices: pricing.additionalServices?.find((s: any) => s.key === 'designServices')?.value || 12500,
        solarReady: pricing.additionalServices?.find((s: any) => s.key === 'solarReady')?.value || 0,
        femaCompliance: pricing.additionalServices?.find((s: any) => s.key === 'femaCompliance')?.value || 0,
        extraBathroom: pricing.additionalServices?.find((s: any) => s.key === 'extraBathroom')?.value || 8000,
        dedicatedDriveway: pricing.additionalServices?.find((s: any) => s.key === 'dedicatedDriveway')?.value || 5000,
        basicLandscaping: pricing.additionalServices?.find((s: any) => s.key === 'basicLandscaping')?.value || 10000,
      },
      
      customServicesPricing: pricing.customServices || [],
      
      discountPricing: {
        friendsAndFamily: pricing.discount?.find((d: any) => d.key === 'friendsAndFamily')?.value || 0.10,
      },
    };
    
    localStorage.setItem('anchor-pricing-editor-config', JSON.stringify(this.editorConfig));
  }
  
  // Get pricing for ADU type
  getADUPrice(type: string, squareFootage: number): number {
    if (!this.editorConfig) return 240; // Default
    
    let basePrice = 240;
    
    if (type === 'detached') {
      basePrice = this.editorConfig.aduTypePricing?.detached || 240;
    } else if (type === 'attached') {
      basePrice = this.editorConfig.aduTypePricing?.attached || 240;
    } else if (type === 'jadu') {
      basePrice = this.editorConfig.aduTypePricing?.jadu || 200;
    }
    
    // Apply size adjustments
    if (squareFootage < 400) {
      basePrice = this.editorConfig.sizeAdjustments?.tinyUnitPremium || 260;
    } else if (squareFootage < 600) {
      basePrice = this.editorConfig.sizeAdjustments?.smallUnitPremium || 250;
    }
    
    return basePrice;
  }
  
  // Get utility price
  getUtilityPrice(utility: string, type: 'shared' | 'separate'): number {
    if (!this.editorConfig || type === 'shared') return 0;
    
    const utilityMap: Record<string, string> = {
      'waterMeter': 'waterMeterSeparate',
      'gasMeter': 'gasMeterSeparate',
      'electricMeter': 'electricMeterSeparate',
      'sewerConnection': 'sewerConnection',
      'electricalPanel': 'electricalPanel',
    };
    
    const key = utilityMap[utility];
    return this.editorConfig.utilitiesPricing?.[key] || 0;
  }
  
  // Get additional service price
  getServicePrice(service: string): number {
    if (!this.editorConfig) {
      // Default prices
      const defaults: Record<string, number> = {
        'designServices': 12500,
        'solarReady': 0,
        'femaCompliance': 0,
        'extraBathroom': 8000,
        'dedicatedDriveway': 5000,
        'basicLandscaping': 10000,
      };
      console.log(`💰 [Bridge] No config, using default for ${service}:`, defaults[service] || 0);
      return defaults[service] || 0;
    }
    
    const price = this.editorConfig.additionalServicesPricing?.[service] || 0;
    console.log(`💰 [Bridge] Getting price for ${service}:`, price, 'from config:', this.editorConfig.additionalServicesPricing);
    return price;
  }
  
  // Get HVAC price adjustment
  getHVACPrice(type: string): number {
    if (!this.editorConfig) return 0;
    
    if (type === 'central-ac') {
      return this.editorConfig.hvacPricing?.centralAc || 0;
    } else if (type === 'mini-split') {
      return this.editorConfig.hvacPricing?.miniSplit || 0;
    }
    
    return 0;
  }
  
  // Get bathroom price
  getBathroomPrice(count: number): number {
    if (!this.editorConfig) {
      // Default pricing
      if (count === 1.5) return 4000;
      if (count === 2) return 8000;
      return 0;
    }
    
    if (count === 1.5) {
      return this.editorConfig.bathroomPricing?.oneHalf || 4000;
    } else if (count === 2) {
      return this.editorConfig.bathroomPricing?.two || 8000;
    }
    
    return 0;
  }
  
  // Get discount rate
  getDiscountRate(type: string): number {
    if (!this.editorConfig) {
      if (type === 'friendsAndFamily') return 0.10;
      return 0;
    }
    
    if (type === 'friendsAndFamily') {
      return this.editorConfig.discountPricing?.friendsAndFamily || 0.10;
    }
    
    return 0;
  }
  
  // Get all configuration
  getConfiguration(): any {
    return this.editorConfig;
  }
}

// Export singleton instance
export const pricingEditorBridge = PricingEditorBridge.getInstance();