// Template Text Configuration
// Admin-editable text content that appears across all templates

export interface TemplateTextConfig {
  // Scope of Work Section
  scopeOfWork: {
    header: string;
    buildoutDescription: string;
    standardFinishes: string;
    allowanceWorksheet: string;
    appliances: {
      included: string;
      excluded: string;
    };
    cabinets: string;
    additionalTesting: string;
  };

  // Services & Features
  services: {
    hvac: {
      centralAc: string;
      miniSplit: string;
    };
    electrical: string;
    gas: {
      shared: string;
      separate: string;
    };
    water: {
      shared: string;
      separate: string;
    };
  };

  // Pricing Table
  pricing: {
    header: string;
    phases: {
      design: string;
      coordination: string;
      construction: string;
      addOns: string;
    };
  };

  // Section Headers
  headers: {
    bedroomBathroom: string; // Template: "BED/ BATH: {bedrooms} Bedrooms {bathrooms} Bathrooms"
    livingArea: string; // Template: "LIVING AREA: + {squareFootage} sqft"
    aduType: string; // Template: "ADU TYPE: {aduType}"
  };
}

// Default text configuration
export const defaultTemplateText: TemplateTextConfig = {
  scopeOfWork: {
    header: 'SCOPE OF WORK',
    buildoutDescription: 'Full ADU Build-out',
    standardFinishes: '• Standard finishes & fixtures',
    allowanceWorksheet: '• Allowance worksheet included',
    appliances: {
      included: '• Appliances included',
      excluded: '• Appliances excluded',
    },
    cabinets: '• Kitchen & bath cabinets',
    additionalTesting: 'Additional: HERS, CU & Compaction testing',
  },

  services: {
    hvac: {
      centralAc: 'Central AC',
      miniSplit: 'Mini-Split',
    },
    electrical: 'Separate meter',
    gas: {
      shared: 'Shared gas meter',
      separate: 'Separate gas meter',
    },
    water: {
      shared: 'Shared water meter',
      separate: 'Separate water meter',
    },
  },

  pricing: {
    header: 'ESTIMATED PRICE BREAKDOWN',
    phases: {
      design: 'DESIGN<br><br>PLANNING',
      coordination: 'COORDINATION<br>SERVICES',
      construction: 'CONSTRUCTION',
      addOns: 'ADD ON WORK',
    },
  },

  headers: {
    bedroomBathroom: 'BED/ BATH: {bedrooms} Bedrooms {bathrooms} Bathrooms',
    livingArea: 'LIVING AREA: + {squareFootage} sqft',
    aduType: 'ADU TYPE: {aduType}',
  },
};

// Storage identifier for saving custom text
export const TEMPLATE_TEXT_STORAGE_ID = 'anchor-template-text-config';

// Get current template text (from localStorage or default)
export const getTemplateText = (): TemplateTextConfig => {
  try {
    const saved = localStorage.getItem(TEMPLATE_TEXT_STORAGE_ID);
    if (saved) {
      const parsed = JSON.parse(saved);
      // Merge with defaults to ensure all fields exist
      return { ...defaultTemplateText, ...parsed };
    }
  } catch (error) {
    console.warn('Failed to load template text config:', error);
  }
  return defaultTemplateText;
};

// Save template text to localStorage
export const saveTemplateText = (config: TemplateTextConfig): void => {
  try {
    localStorage.setItem(TEMPLATE_TEXT_STORAGE_ID, JSON.stringify(config));
  } catch (error) {
    console.error('Failed to save template text config:', error);
  }
};

// Reset to default text
export const resetTemplateText = (): void => {
  localStorage.removeItem(TEMPLATE_TEXT_STORAGE_ID);
};
