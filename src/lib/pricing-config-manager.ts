// Pricing Configuration Manager with localStorage Integration
// Manages dynamic pricing configuration with persistent storage

import {
  AduTypePricing,
  UtilityOption,
  AddOnOption,
  DesignServices,
  MilestonePayment,
  milestonePayments,
} from '../data/pricing-config';

export interface DynamicPricingConfig {
  // Base ADU Pricing
  aduTypePricing: AduTypePricing[];
  
  // Design Services with size-based pricing
  designServices: {
    oneStory: { min: number; max: number; default: number };
    twoStory: { min: number; max: number; default: number };
    description: string;
  };
  
  // Utility Options
  utilityOptions: UtilityOption[];
  
  // Add-On Options
  addOnOptions: AddOnOption[];
  
  // Business Settings
  businessSettings: {
    standardMarkup: number;
    proposalValidityDays: number;
    defaultCity: string;
    minSizeForStandardPricing: number; // 600 sqft threshold
  };
  
  // Milestone Payments
  milestonePayments: MilestonePayment[];
  
  // Configuration metadata
  version: string;
  lastUpdated: Date;
}

// Default configuration based on actual Anchor Builders pricing
export const DEFAULT_PRICING_CONFIG: DynamicPricingConfig = {
  aduTypePricing: [
    {
      name: 'Detached ADU (1-Story)',
      type: 'detached',
      stories: 1,
      pricePerSqFt: 240, // Updated to correct $240/sqft
      description: 'Single level standalone unit',
    },
    {
      name: 'Detached ADU (2-Story)',
      type: 'detached',
      stories: 2,
      pricePerSqFt: 240, // Updated to correct $240/sqft
      description: 'Two level standalone unit',
    },
    {
      name: 'Attached ADU',
      type: 'attached',
      pricePerSqFt: 240, // Updated to correct $240/sqft (base rate)
      description: 'Connected to existing home',
    },
  ],
  
  designServices: {
    oneStory: { min: 8500, max: 12500, default: 8500 },
    twoStory: { min: 12500, max: 15000, default: 12500 },
    description: 'ADU Plan Design, Structural Engineering, MEP Design, Zoning & Site Planning',
  },
  
  utilityOptions: [
    {
      name: 'Water Meter',
      separatePrice: 0, // To be set in admin panel
      sharedPrice: 0,
      required: true,
      description: 'Water service connection',
    },
    {
      name: 'Gas Meter',
      separatePrice: 0, // To be set in admin panel
      sharedPrice: 0,
      required: false,
      description: 'Natural gas service connection',
    },
    {
      name: 'Electric Meter',
      separatePrice: 0, // To be set in admin panel
      sharedPrice: 0,
      required: true,
      description: 'Electrical service connection',
    },
  ],
  
  addOnOptions: [
    {
      name: 'Extra Bathroom',
      price: 8000, // Confirmed correct
      description: 'Additional bathroom beyond standard',
    },
    {
      name: 'Driveway',
      price: 5000, // Confirmed correct
      description: 'Dedicated driveway for ADU (does not include driveway approach - requires separate civil work)',
    },
    {
      name: 'Basic Landscaping',
      price: 10000, // Confirmed correct
      description: 'Basic landscaping around ADU',
    },
  ],
  
  businessSettings: {
    standardMarkup: 0.15, // 15% standard markup
    proposalValidityDays: 30,
    defaultCity: 'Westminster',
    minSizeForStandardPricing: 600, // <600 sqft gets premium pricing
  },
  
  milestonePayments: milestonePayments,
  
  version: '1.0.0',
  lastUpdated: new Date(),
};

const STORAGE_KEY = 'anchorPricingConfig';
const CONFIG_VERSION = '1.0.0';

export class PricingConfigManager {
  private static instance: PricingConfigManager;
  private config: DynamicPricingConfig;

  private constructor() {
    this.config = this.loadConfig();
  }

  public static getInstance(): PricingConfigManager {
    if (!PricingConfigManager.instance) {
      PricingConfigManager.instance = new PricingConfigManager();
    }
    return PricingConfigManager.instance;
  }

  // Load configuration from localStorage with fallback to defaults
  public loadConfig(): DynamicPricingConfig {
    try {
      const storedConfig = localStorage.getItem(STORAGE_KEY);
      if (!storedConfig) {
        return { ...DEFAULT_PRICING_CONFIG };
      }

      const parsed = JSON.parse(storedConfig);
      
      // Version check and migration logic
      if (!parsed.version || parsed.version !== CONFIG_VERSION) {
        console.log('Pricing config version mismatch, migrating to latest');
        return this.migrateConfig(parsed);
      }

      // Convert date strings back to Date objects
      parsed.lastUpdated = new Date(parsed.lastUpdated);
      
      return parsed;
    } catch (error) {
      console.error('Failed to load pricing config from localStorage:', error);
      return { ...DEFAULT_PRICING_CONFIG };
    }
  }

  // Save configuration to localStorage
  public saveConfig(config?: DynamicPricingConfig): boolean {
    try {
      const configToSave = config || this.config;
      configToSave.lastUpdated = new Date();
      configToSave.version = CONFIG_VERSION;
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(configToSave));
      this.config = configToSave;
      return true;
    } catch (error) {
      console.error('Failed to save pricing config to localStorage:', error);
      return false;
    }
  }

  // Get current configuration
  public getConfig(): DynamicPricingConfig {
    return { ...this.config };
  }

  // Update specific parts of the configuration
  public updateConfig(updates: Partial<DynamicPricingConfig>): boolean {
    try {
      this.config = { ...this.config, ...updates };
      return this.saveConfig();
    } catch (error) {
      console.error('Failed to update pricing config:', error);
      return false;
    }
  }

  // Reset configuration to defaults
  public resetToDefaults(): boolean {
    this.config = { ...DEFAULT_PRICING_CONFIG };
    return this.saveConfig();
  }

  // Export configuration as JSON
  public exportConfig(): string {
    return JSON.stringify(this.config, null, 2);
  }

  // Import configuration from JSON
  public importConfig(jsonConfig: string): boolean {
    try {
      const parsedConfig = JSON.parse(jsonConfig);
      
      // Validate the imported config has required properties
      if (!this.validateConfig(parsedConfig)) {
        throw new Error('Invalid configuration format');
      }

      this.config = parsedConfig;
      return this.saveConfig();
    } catch (error) {
      console.error('Failed to import pricing config:', error);
      return false;
    }
  }

  // Get price per sqft for ADU type with size-based adjustments
  public getPricePerSqFt(aduType: 'detached' | 'attached', stories: 1 | 2 = 1, squareFootage: number): number {
    let baseConfig;
    
    if (aduType === 'detached') {
      baseConfig = this.config.aduTypePricing.find(
        type => type.type === 'detached' && type.stories === stories
      );
    } else {
      baseConfig = this.config.aduTypePricing.find(type => type.type === 'attached');
    }

    if (!baseConfig) {
      return DEFAULT_PRICING_CONFIG.aduTypePricing[0].pricePerSqFt;
    }

    // Apply size-based pricing adjustment
    if (squareFootage < this.config.businessSettings.minSizeForStandardPricing) {
      // Premium pricing for smaller units ($250/sqft for <600 sqft)
      return 250;
    }

    return baseConfig.pricePerSqFt;
  }

  // Get design services pricing based on stories
  public getDesignServicesPricing(stories: 1 | 2 = 1): { min: number; max: number; default: number } {
    if (stories === 2) {
      return this.config.designServices.twoStory;
    }
    return this.config.designServices.oneStory;
  }

  // Validate configuration structure
  private validateConfig(config: any): boolean {
    return (
      config &&
      Array.isArray(config.aduTypePricing) &&
      config.designServices &&
      Array.isArray(config.utilityOptions) &&
      Array.isArray(config.addOnOptions) &&
      config.businessSettings &&
      Array.isArray(config.milestonePayments)
    );
  }

  // Migration logic for older config versions
  private migrateConfig(oldConfig: any): DynamicPricingConfig {
    console.log('Migrating pricing config to version', CONFIG_VERSION);
    
    // Start with defaults and overlay any valid existing values
    const migratedConfig = { ...DEFAULT_PRICING_CONFIG };
    
    // Preserve user customizations if they exist and are valid
    if (oldConfig.businessSettings?.standardMarkup) {
      migratedConfig.businessSettings.standardMarkup = oldConfig.businessSettings.standardMarkup;
    }
    
    // Save the migrated config
    this.saveConfig(migratedConfig);
    
    return migratedConfig;
  }

  // Clear all stored configuration (for debugging)
  public clearStoredConfig(): void {
    localStorage.removeItem(STORAGE_KEY);
    this.config = { ...DEFAULT_PRICING_CONFIG };
  }
}

// Export a singleton instance for easy access
export const pricingConfigManager = PricingConfigManager.getInstance();

// Export utility functions for component use
export const getPricingConfig = (): DynamicPricingConfig => {
  return pricingConfigManager.getConfig();
};

export const updatePricingConfig = (updates: Partial<DynamicPricingConfig>): boolean => {
  return pricingConfigManager.updateConfig(updates);
};

export const resetPricingConfig = (): boolean => {
  return pricingConfigManager.resetToDefaults();
};
