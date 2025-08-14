/**
 * Anchor-specific pricing hook that provides ALL editable pricing data
 * Integrates with HOL's event-driven system for real-time updates
 */

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'anchor-pricing-config';
const EVENT_NAME = 'anchor:pricing-updated';

// Complete Anchor pricing structure - EVERYTHING is editable
export interface AnchorPricingData {
  // Base ADU Pricing (per sqft)
  basePrices: {
    detachedOneStory: number;
    detachedTwoStory: number;
    attachedOneStory: number;
    attachedTwoStory: number;
    garageConversion: number;
    jadu: number;
  };
  
  // Design Services
  designServices: {
    oneStory: number;
    twoStory: number;
    planning: number;
    structuralEngineering: number;
    titleReport: number;
  };
  
  // Utilities
  utilities: {
    waterMeter: number;
    gasMeter: number;
    electricMeter: number;
    sewerConnection: number;
    electricalPanel: number;
  };
  
  // HVAC Options
  hvac: {
    centralAc: number;
    miniSplit: number;
    heatPump: number;
    radiantFloor: number;
  };
  
  // Standard Add-ons
  addOns: {
    extraBathroom: number;
    dedicatedDriveway: number;
    basicLandscaping: number;
    premiumLandscaping: number;
    fence: number;
    patio: number;
    deck: number;
    pergola: number;
    solarReady: number;
    evCharger: number;
    smartHome: number;
  };
  
  // Kitchen & Appliances
  kitchen: {
    standardAppliances: number;
    premiumAppliances: number;
    quartzCountertops: number;
    graniteCountertops: number;
    customCabinets: number;
    kitchenIsland: number;
  };
  
  // Finishes & Upgrades
  finishes: {
    hardwoodFlooring: number;
    tileFlooring: number;
    carpetFlooring: number;
    crownMolding: number;
    recessedLighting: number;
    skylights: number;
    frenchDoors: number;
    slidingDoors: number;
  };
  
  // Size-based adjustments
  sizeAdjustments: {
    under400sqft: number;  // Additional $/sqft
    under600sqft: number;  // Additional $/sqft
    over1000sqft: number;  // Discount $/sqft
    over1200sqft: number;  // Discount $/sqft
  };
  
  // Discounts & Markups
  discounts: {
    friendsAndFamily: number;     // Percentage (0.1 = 10%)
    veteranDiscount: number;      // Percentage
    seniorDiscount: number;       // Percentage
    cashPayment: number;          // Percentage
    referralDiscount: number;     // Percentage
  };
  
  // Business Settings
  settings: {
    standardMarkup: number;       // Percentage (0.15 = 15%)
    rushJobMarkup: number;        // Percentage
    complexSiteMarkup: number;    // Percentage
    salesTax: number;            // Percentage
    permitMultiplier: number;     // Multiplier for permit costs
    contingency: number;          // Percentage for contingency
  };
  
  // Milestone Payments
  milestones: {
    deposit: number;              // Percentage
    permitApproval: number;       // Percentage
    foundation: number;           // Percentage
    framing: number;             // Percentage
    roughInspection: number;      // Percentage
    finalInspection: number;      // Percentage
  };
  
  // Regional Adjustments (for different cities)
  regionalMultipliers: {
    irvine: number;
    newportBeach: number;
    costaMesa: number;
    huntingtonBeach: number;
    tustin: number;
    santaAna: number;
    anaheim: number;
    default: number;
  };
}

// Default pricing values for Anchor
const DEFAULT_ANCHOR_PRICING: AnchorPricingData = {
  basePrices: {
    detachedOneStory: 240,
    detachedTwoStory: 250,
    attachedOneStory: 220,
    attachedTwoStory: 230,
    garageConversion: 180,
    jadu: 200
  },
  designServices: {
    oneStory: 12500,
    twoStory: 15000,
    planning: 3500,
    structuralEngineering: 5000,
    titleReport: 1500
  },
  utilities: {
    waterMeter: 3500,
    gasMeter: 3500,
    electricMeter: 0,
    sewerConnection: 8000,
    electricalPanel: 3000
  },
  hvac: {
    centralAc: 6000,
    miniSplit: 4500,
    heatPump: 7500,
    radiantFloor: 12000
  },
  addOns: {
    extraBathroom: 8000,
    dedicatedDriveway: 5000,
    basicLandscaping: 10000,
    premiumLandscaping: 25000,
    fence: 4000,
    patio: 6000,
    deck: 8000,
    pergola: 5000,
    solarReady: 0,
    evCharger: 2500,
    smartHome: 3500
  },
  kitchen: {
    standardAppliances: 5000,
    premiumAppliances: 12000,
    quartzCountertops: 3500,
    graniteCountertops: 4500,
    customCabinets: 8000,
    kitchenIsland: 4000
  },
  finishes: {
    hardwoodFlooring: 8,  // per sqft
    tileFlooring: 6,      // per sqft
    carpetFlooring: 3,    // per sqft
    crownMolding: 12,     // per linear ft
    recessedLighting: 150, // per fixture
    skylights: 2500,      // each
    frenchDoors: 3000,    // per set
    slidingDoors: 2500    // per set
  },
  sizeAdjustments: {
    under400sqft: 50,     // Add $50/sqft for tiny units
    under600sqft: 10,     // Add $10/sqft for small units
    over1000sqft: -5,     // Subtract $5/sqft for large units
    over1200sqft: -10     // Subtract $10/sqft for extra large
  },
  discounts: {
    friendsAndFamily: 0.10,
    veteranDiscount: 0.05,
    seniorDiscount: 0.05,
    cashPayment: 0.03,
    referralDiscount: 0.02
  },
  settings: {
    standardMarkup: 0.0,      // No markup for transparency
    rushJobMarkup: 0.20,      // 20% for rush jobs
    complexSiteMarkup: 0.15,  // 15% for difficult sites
    salesTax: 0.0775,         // OC sales tax
    permitMultiplier: 1.2,    // 20% above permit cost
    contingency: 0.10         // 10% contingency
  },
  milestones: {
    deposit: 0.10,
    permitApproval: 0.20,
    foundation: 0.20,
    framing: 0.20,
    roughInspection: 0.15,
    finalInspection: 0.15
  },
  regionalMultipliers: {
    irvine: 1.15,
    newportBeach: 1.25,
    costaMesa: 1.05,
    huntingtonBeach: 1.10,
    tustin: 1.05,
    santaAna: 0.95,
    anaheim: 0.95,
    default: 1.00
  }
};

export function useAnchorPricing() {
  const [pricing, setPricing] = useState<AnchorPricingData>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return { ...DEFAULT_ANCHOR_PRICING, ...parsed.data };
      }
    } catch (error) {
      console.error('Failed to load pricing from localStorage:', error);
    }
    return DEFAULT_ANCHOR_PRICING;
  });

  const [lastUpdated, setLastUpdated] = useState<Date>(() => new Date());

  // Save to localStorage whenever pricing changes
  useEffect(() => {
    const toStore = {
      data: pricing,
      lastUpdated: new Date().toISOString(),
      version: '2.0.0'
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    
    // Dispatch event for other components
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: pricing }));
  }, [pricing]);

  // Listen for updates from other tabs/components
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const parsed = JSON.parse(e.newValue);
          setPricing(parsed.data);
          setLastUpdated(new Date(parsed.lastUpdated));
        } catch (error) {
          console.error('Failed to parse storage update:', error);
        }
      }
    };

    const handlePricingUpdate = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) {
        setPricing(customEvent.detail);
        setLastUpdated(new Date());
      }
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener(EVENT_NAME, handlePricingUpdate);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener(EVENT_NAME, handlePricingUpdate);
    };
  }, []);

  // Update a specific price
  const updatePrice = useCallback((
    category: keyof AnchorPricingData,
    key: string,
    value: number
  ) => {
    setPricing(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
  }, []);

  // Batch update multiple prices
  const batchUpdate = useCallback((updates: Partial<AnchorPricingData>) => {
    setPricing(prev => ({
      ...prev,
      ...updates
    }));
  }, []);

  // Reset to defaults
  const resetToDefaults = useCallback(() => {
    if (window.confirm('Reset all prices to default values? This cannot be undone.')) {
      setPricing(DEFAULT_ANCHOR_PRICING);
    }
  }, []);

  // Export pricing as JSON
  const exportPricing = useCallback(() => {
    const dataStr = JSON.stringify(pricing, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `anchor-pricing-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }, [pricing]);

  // Import pricing from JSON
  const importPricing = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const imported = JSON.parse(e.target?.result as string);
        setPricing({ ...DEFAULT_ANCHOR_PRICING, ...imported });
        alert('Pricing imported successfully!');
      } catch (error) {
        alert('Failed to import pricing. Please check the file format.');
      }
    };
    reader.readAsText(file);
  }, []);

  return {
    pricing,
    updatePrice,
    batchUpdate,
    resetToDefaults,
    exportPricing,
    importPricing,
    lastUpdated,
    MIN_PRICE: 0,
    MAX_PRICE: 100000
  };
}