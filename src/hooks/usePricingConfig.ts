import { useState, useEffect } from 'react';
import defaultPricingData from '../data/pricing-tables.json';
import { 
  STORAGE_KEY, 
  SCHEMA_VERSION, 
  MIN_PRICE, 
  MAX_PRICE,
  type StoredPricing
} from '../lib/pricing-storage';

interface PricingData {
  aduTypes: Record<string, any>;
  jaduOptions: Record<string, any>;
  bundleAdditions: Record<string, any>;
  bundleRemodel: Record<string, any>;
  addOns: Record<string, any>;
  settings: Record<string, any>;
}

export const usePricingConfig = () => {
  const [pricingData, setPricingData] = useState<PricingData>(defaultPricingData);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Load pricing from localStorage on mount
  useEffect(() => {
    const loadStoredPricing = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          const parsed: StoredPricing = JSON.parse(stored);
          // Verify schema version compatibility
          if (parsed.schemaVersion === SCHEMA_VERSION && parsed.data) {
            setPricingData(parsed.data);
            setLastUpdated(parsed.lastUpdated);
            setHasChanges(true);
            console.log('✅ Loaded custom pricing from localStorage');
          } else if (parsed.schemaVersion !== SCHEMA_VERSION) {
            // Schema mismatch - prompt user to reset
            console.warn('⚠️ Pricing schema version mismatch. Please reset to defaults.');
            if (window.confirm('Pricing data format has changed. Reset to defaults?')) {
              localStorage.removeItem(STORAGE_KEY);
              setPricingData(defaultPricingData);
            }
          }
        }
      } catch (error) {
        console.error('Failed to load stored pricing:', error);
      }
    };

    loadStoredPricing();
  }, []);

  // Save pricing to localStorage whenever it changes
  const savePricing = (newData: PricingData, updatedBy: string = 'Admin') => {
    try {
      const toStore: StoredPricing = {
        schemaVersion: SCHEMA_VERSION,
        data: newData,
        lastUpdated: new Date().toISOString(),
        updatedBy
      };
      
      localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
      setLastUpdated(toStore.lastUpdated);
      setHasChanges(true);
      console.log('✅ Pricing saved to localStorage');
      
      // Dispatch custom event to notify app of pricing changes
      window.dispatchEvent(new CustomEvent('anchor:pricing-updated'));
    } catch (error) {
      console.error('Failed to save pricing:', error);
    }
  };

  // Validate price is within acceptable range
  const isValidPrice = (value: number): boolean => {
    return Number.isFinite(value) && value >= MIN_PRICE && value <= MAX_PRICE;
  };

  // Update a specific price with validation (handles string or number input)
  const updatePrice = (category: keyof PricingData, item: string, field: string, rawValue: string | number) => {
    // Parse string inputs, removing common formatting characters
    const value = typeof rawValue === 'number' 
      ? rawValue 
      : Number(String(rawValue).replace(/[,$\s]/g, ''));
    
    // Validate the parsed value
    if (!Number.isFinite(value) || value < MIN_PRICE || value > MAX_PRICE) {
      console.error(`Price must be between $${MIN_PRICE} and $${MAX_PRICE}. Got: ${rawValue} -> ${value}`);
      return false;
    }
    
    // Deep clone to avoid mutations
    const newData = JSON.parse(JSON.stringify(pricingData));
    
    // Safe navigation with validation
    if (category in newData && item in newData[category]) {
      newData[category][item] = {
        ...newData[category][item],
        [field]: value
      };
      
      setPricingData(newData);
      savePricing(newData);
      return true;
    }
    
    console.warn(`updatePrice: path not found -> ${String(category)}.${item}.${field}`);
    return false;
  };

  // Reset to default pricing
  const resetToDefaults = () => {
    if (window.confirm('Are you sure you want to reset all prices to defaults? This cannot be undone.')) {
      setPricingData(defaultPricingData);
      localStorage.removeItem(STORAGE_KEY);
      setLastUpdated(null);
      setHasChanges(false);
      console.log('✅ Pricing reset to defaults');
    }
  };

  // Export current pricing as JSON (for Excel compatibility later)
  const exportPricing = () => {
    const dataStr = JSON.stringify(pricingData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `pricing-export-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  // Import pricing from JSON (foundation for Excel import later)
  const importPricing = (jsonData: string) => {
    try {
      const parsed = JSON.parse(jsonData);
      // Validate structure matches expected format
      if (parsed.aduTypes && parsed.addOns) {
        setPricingData(parsed);
        savePricing(parsed);
        return true;
      }
      throw new Error('Invalid pricing data structure');
    } catch (error) {
      console.error('Failed to import pricing:', error);
      return false;
    }
  };

  return {
    pricingData,
    updatePrice,
    resetToDefaults,
    exportPricing,
    importPricing,
    lastUpdated,
    hasChanges,
    isValidPrice,
    MIN_PRICE,
    MAX_PRICE
  };
};