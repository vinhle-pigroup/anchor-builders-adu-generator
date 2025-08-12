# Pricing Architecture Analysis & Implementation Plan

## Current State Analysis

Based on codebase review of:
- `/home/vinh/code/PiGroup-App/apps/anchor-builders-adu-generator/src/data/pricing-config.ts`
- `/home/vinh/code/PiGroup-App/apps/anchor-builders-adu-generator/src/lib/pricing-engine.ts`
- `/home/vinh/code/PiGroup-App/docs/ANCHOR-BUILDERS-PRICING-GUIDE.md`

### Issues Identified:
1. **Hardcoded pricing** in pricing-config.ts ($220/$240/$200 per sqft)
2. **Validation mismatch** - actual proposals show $240/sqft base rate
3. **No admin interface** for price updates
4. **Code deployment required** for pricing changes

## Data Architecture Design

### 1. TypeScript Interfaces

```typescript
// Core pricing configuration interface
interface PricingConfig {
  version: string;
  lastUpdated: string;
  createdBy: string;
  
  // Base ADU pricing per square foot
  basePricing: {
    junior: number;        // $/sqft
    oneBedroom: number;    // $/sqft  
    twoBedroom: number;    // $/sqft
  };
  
  // Utility connections
  utilities: {
    electrical: number;
    plumbing: number;
    gas: number;
    sewer: number;
  };
  
  // Add-on features
  addOns: {
    bathroom: {
      halfBath: number;
      fullBath: number;
    };
    driveway: {
      concrete: number;    // $/sqft
      asphalt: number;     // $/sqft
      gravel: number;      // $/sqft
    };
    landscaping: {
      basic: number;       // flat fee
      premium: number;     // flat fee
      custom: number;      // $/sqft
    };
    hvac: {
      minisplit: number;
      centralAir: number;
    };
  };
  
  // Discount structure
  discounts: {
    earlyBird: {
      enabled: boolean;
      percentage: number;
      description: string;
    };
    volume: {
      enabled: boolean;
      thresholds: Array<{
        minAmount: number;
        percentage: number;
      }>;
    };
    seasonal: {
      enabled: boolean;
      months: number[];    // 1-12
      percentage: number;
    };
  };
  
  // Labor and material multipliers
  multipliers: {
    laborRate: number;         // $/hour
    materialMarkup: number;    // percentage
    permitFees: number;        // flat fee
    designFees: number;        // flat fee
  };
}

// Validation schema
interface PricingValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

// Config management interface
interface ConfigManager {
  load(): PricingConfig | null;
  save(config: PricingConfig): boolean;
  validate(config: PricingConfig): PricingValidation;
  backup(): void;
  restore(version: string): boolean;
  getHistory(): Array<{version: string, date: string, createdBy: string}>;
}
```

### 2. Data Flow Architecture

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Admin Panel   │───▶│   localStorage   │───▶│ pricing-config  │
│  (UI Changes)   │    │  (Persistence)   │    │   (Data Layer)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
                                                        │
                                                        ▼
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   PDF Export    │◄───│ pricing-engine   │◄───│  Price Calc     │
│   (Proposals)   │    │ (Business Logic) │    │   (Frontend)    │
└─────────────────┘    └──────────────────┘    └─────────────────┘
```

### 3. Integration Points

#### A. pricing-config.ts (Data Layer)
```typescript
// Current fallback + dynamic loading
export class PricingConfigManager implements ConfigManager {
  private static readonly STORAGE_KEY = 'anchor_pricing_config';
  private static readonly BACKUP_KEY = 'anchor_pricing_backup';
  
  // Default configuration (fallback)
  private static readonly DEFAULT_CONFIG: PricingConfig = {
    version: '1.0.0',
    lastUpdated: new Date().toISOString(),
    createdBy: 'system',
    basePricing: {
      junior: 240,      // Corrected from analysis
      oneBedroom: 240,  // Corrected from analysis  
      twoBedroom: 240   // Corrected from analysis
    },
    // ... rest of default config
  };
  
  load(): PricingConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        const validation = this.validate(config);
        if (validation.isValid) {
          return config;
        }
      }
    } catch (error) {
      console.warn('Failed to load pricing config from localStorage:', error);
    }
    
    return PricingConfigManager.DEFAULT_CONFIG;
  }
  
  save(config: PricingConfig): boolean {
    try {
      // Backup current config before saving
      this.backup();
      
      // Validate before saving
      const validation = this.validate(config);
      if (!validation.isValid) {
        throw new Error(`Invalid config: ${validation.errors.join(', ')}`);
      }
      
      // Update metadata
      config.lastUpdated = new Date().toISOString();
      config.version = this.incrementVersion(config.version);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      return true;
    } catch (error) {
      console.error('Failed to save pricing config:', error);
      return false;
    }
  }
}
```

#### B. pricing-engine.ts (Business Logic)
```typescript
// Modified to use dynamic config
export class PricingEngine {
  private configManager: PricingConfigManager;
  private currentConfig: PricingConfig;
  
  constructor() {
    this.configManager = new PricingConfigManager();
    this.currentConfig = this.configManager.load();
  }
  
  // Refresh config (call when admin makes changes)
  refreshConfig(): void {
    this.currentConfig = this.configManager.load();
  }
  
  calculateBaseCost(aduType: string, squareFootage: number): number {
    const rate = this.currentConfig.basePricing[aduType as keyof typeof this.currentConfig.basePricing];
    if (!rate) {
      throw new Error(`Unknown ADU type: ${aduType}`);
    }
    return rate * squareFootage;
  }
  
  // All other methods updated to use this.currentConfig instead of hardcoded values
}
```

#### C. React Components (UI Layer)
```typescript
// Hook for pricing config
export function usePricingConfig() {
  const [config, setConfig] = useState<PricingConfig | null>(null);
  const configManager = new PricingConfigManager();
  
  useEffect(() => {
    setConfig(configManager.load());
  }, []);
  
  const updateConfig = useCallback((newConfig: PricingConfig) => {
    if (configManager.save(newConfig)) {
      setConfig(newConfig);
      // Notify pricing engine to refresh
      window.dispatchEvent(new CustomEvent('pricingConfigUpdated'));
      return true;
    }
    return false;
  }, [configManager]);
  
  return { config, updateConfig, configManager };
}
```

### 4. Fallback Strategy

```typescript
// Multi-tier fallback system
export class FallbackManager {
  static getFallbackConfig(): PricingConfig {
    // Tier 1: localStorage
    try {
      const stored = localStorage.getItem('anchor_pricing_config');
      if (stored) return JSON.parse(stored);
    } catch {}
    
    // Tier 2: sessionStorage (temporary)
    try {
      const session = sessionStorage.getItem('anchor_pricing_temp');
      if (session) return JSON.parse(session);
    } catch {}
    
    // Tier 3: Default hardcoded config
    return DEFAULT_PRICING_CONFIG;
  }
  
  static createEmergencyBackup(config: PricingConfig): void {
    sessionStorage.setItem('anchor_pricing_temp', JSON.stringify(config));
    
    // Also create downloadable backup
    const blob = new Blob([JSON.stringify(config, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `pricing-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }
}
```

### 5. Implementation Steps

#### Phase 1: Data Layer Foundation
1. **Create PricingConfigManager class** in pricing-config.ts
2. **Implement localStorage persistence** with validation
3. **Add backup/restore functionality**
4. **Update DEFAULT_CONFIG** with correct $240/sqft rates

#### Phase 2: Business Logic Integration  
1. **Modify PricingEngine** to use dynamic config
2. **Add config refresh mechanism**
3. **Update all calculation methods** to use configManager
4. **Add validation for price calculations**

#### Phase 3: Admin UI Components
1. **Create AdminPricingPanel component**
2. **Implement form sections** for each config area
3. **Add real-time validation**
4. **Create backup/restore interface**

#### Phase 4: Integration & Testing
1. **Connect admin panel to main app**
2. **Test config propagation** through entire flow
3. **Verify PDF generation** uses updated prices
4. **Create import/export functionality**

### 6. Admin Panel Component Structure

```typescript
// AdminPricingPanel.tsx
export function AdminPricingPanel() {
  const { config, updateConfig, configManager } = usePricingConfig();
  const [activeSection, setActiveSection] = useState('basePricing');
  const [isDirty, setIsDirty] = useState(false);
  
  const sections = [
    { id: 'basePricing', title: 'Base Pricing', icon: '🏠' },
    { id: 'utilities', title: 'Utilities', icon: '⚡' },
    { id: 'addOns', title: 'Add-ons', icon: '➕' },
    { id: 'discounts', title: 'Discounts', icon: '💰' },
    { id: 'multipliers', title: 'Labor & Materials', icon: '🔧' }
  ];
  
  return (
    <div className="admin-pricing-panel">
      <AdminHeader 
        isDirty={isDirty}
        onSave={() => updateConfig(config)}
        onBackup={() => configManager.backup()}
        onImport={(file) => handleImport(file)}
      />
      
      <AdminSidebar 
        sections={sections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />
      
      <AdminMainContent 
        config={config}
        activeSection={activeSection}
        onChange={(newConfig) => {
          setConfig(newConfig);
          setIsDirty(true);
        }}
      />
    </div>
  );
}
```

### 7. Validation & Error Handling

```typescript
// Comprehensive validation
export function validatePricingConfig(config: PricingConfig): PricingValidation {
  const errors: string[] = [];
  const warnings: string[] = [];
  
  // Base pricing validation
  Object.entries(config.basePricing).forEach(([type, price]) => {
    if (price <= 0) {
      errors.push(`Base pricing for ${type} must be positive`);
    }
    if (price < 100 || price > 1000) {
      warnings.push(`Base pricing for ${type} (${price}) seems unusual`);
    }
  });
  
  // Utility validation
  Object.entries(config.utilities).forEach(([type, price]) => {
    if (price < 0) {
      errors.push(`Utility cost for ${type} cannot be negative`);
    }
  });
  
  // Discount validation
  if (config.discounts.earlyBird.percentage < 0 || config.discounts.earlyBird.percentage > 50) {
    errors.push('Early bird discount must be between 0-50%');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
```

## Next Steps

1. **Review and approve this architecture plan**
2. **Implement Phase 1** (Data Layer Foundation)
3. **Test localStorage persistence** with current app
4. **Move to Phase 2** (Business Logic Integration)
5. **Create admin UI mockups** for approval
6. **Implement remaining phases**

This architecture provides:
- ✅ **Flexible pricing configuration** without code changes
- ✅ **Robust fallback system** for reliability  
- ✅ **Version control and backup** for safety
- ✅ **Simple admin interface** for daily use
- ✅ **Integration with existing code** minimal changes required
- ✅ **Validation and error handling** for data integrity