// Anchor Builders ADU Pricing Configuration

export interface PricingTier {
  name: string;
  minSqFt: number;
  maxSqFt: number;
  basePrice: number;
  pricePerSqFt: number;
}

export interface FoundationPricing {
  type: string;
  basePrice: number;
  pricePerSqFt: number;
  description: string;
}

export interface SiteworkPricing {
  level: string;
  basePrice: number;
  multiplier: number;
  description: string;
}

export interface UtilityPricing {
  type: string;
  price: number;
  required: boolean;
  description: string;
}

export interface FinishPricing {
  level: string;
  pricePerSqFt: number;
  description: string;
}

export interface AddOnPricing {
  name: string;
  price: number;
  category: string;
  description: string;
}

// ADU Size and Base Pricing Tiers
export const aduPricingTiers: PricingTier[] = [
  {
    name: 'Studio ADU',
    minSqFt: 300,
    maxSqFt: 500,
    basePrice: 95000,
    pricePerSqFt: 285,
  },
  {
    name: 'Small 1-Bedroom ADU',
    minSqFt: 501,
    maxSqFt: 650,
    basePrice: 125000,
    pricePerSqFt: 275,
  },
  {
    name: 'Large 1-Bedroom ADU',
    minSqFt: 651,
    maxSqFt: 800,
    basePrice: 160000,
    pricePerSqFt: 265,
  },
  {
    name: '2-Bedroom ADU',
    minSqFt: 801,
    maxSqFt: 1200,
    basePrice: 195000,
    pricePerSqFt: 255,
  },
];

// Foundation Options
export const foundationPricing: FoundationPricing[] = [
  {
    type: 'slab',
    basePrice: 8000,
    pricePerSqFt: 12,
    description: 'Concrete slab foundation (standard)',
  },
  {
    type: 'crawl-space',
    basePrice: 15000,
    pricePerSqFt: 18,
    description: 'Crawl space with vapor barrier',
  },
  {
    type: 'basement',
    basePrice: 35000,
    pricePerSqFt: 45,
    description: 'Full basement foundation',
  },
];

// Sitework Complexity
export const siteworkPricing: SiteworkPricing[] = [
  {
    level: 'minimal',
    basePrice: 5000,
    multiplier: 1.0,
    description: 'Level lot, easy access, minimal prep',
  },
  {
    level: 'moderate',
    basePrice: 12000,
    multiplier: 1.15,
    description: 'Some grading, tree removal, utility relocation',
  },
  {
    level: 'extensive',
    basePrice: 25000,
    multiplier: 1.35,
    description: 'Significant grading, retaining walls, complex access',
  },
];

// Utility Connections
export const utilityPricing: UtilityPricing[] = [
  {
    type: 'electric',
    price: 3500,
    required: true,
    description: 'Electrical service connection and panel',
  },
  {
    type: 'plumbing',
    price: 4500,
    required: true,
    description: 'Water and sewer connections',
  },
  {
    type: 'gas',
    price: 2800,
    required: false,
    description: 'Natural gas line installation',
  },
  {
    type: 'cable-internet',
    price: 800,
    required: false,
    description: 'Cable/internet service installation',
  },
];

// Finish Levels
export const finishPricing: FinishPricing[] = [
  {
    level: 'basic',
    pricePerSqFt: 45,
    description: 'Standard finishes, laminate floors, basic fixtures',
  },
  {
    level: 'standard',
    pricePerSqFt: 65,
    description: 'Mid-grade finishes, hardwood floors, quality fixtures',
  },
  {
    level: 'premium',
    pricePerSqFt: 95,
    description: 'High-end finishes, custom cabinets, luxury fixtures',
  },
  {
    level: 'luxury',
    pricePerSqFt: 135,
    description: 'Luxury finishes, premium materials, custom details',
  },
];

// Add-On Options
export const addOnPricing: AddOnPricing[] = [
  // HVAC Options
  {
    name: 'Central AC/Heat',
    price: 8500,
    category: 'hvac',
    description: 'Central air conditioning and heating system',
  },
  {
    name: 'Mini-Split System',
    price: 4500,
    category: 'hvac',
    description: 'Ductless mini-split heating/cooling system',
  },
  {
    name: 'Radiant Floor Heating',
    price: 6500,
    category: 'hvac',
    description: 'In-floor radiant heating system',
  },

  // Kitchen Upgrades
  {
    name: 'Kitchen Island',
    price: 3500,
    category: 'kitchen',
    description: 'Custom kitchen island with storage',
  },
  {
    name: 'Premium Appliance Package',
    price: 8000,
    category: 'kitchen',
    description: 'Stainless steel appliance upgrade',
  },
  {
    name: 'Quartz Countertops',
    price: 2800,
    category: 'kitchen',
    description: 'Upgrade to quartz countertops',
  },

  // Bathroom Upgrades
  {
    name: 'Walk-in Shower',
    price: 4500,
    category: 'bathroom',
    description: 'Custom tile walk-in shower',
  },
  {
    name: 'Soaking Tub',
    price: 3200,
    category: 'bathroom',
    description: 'Freestanding soaking tub',
  },
  {
    name: 'Double Vanity',
    price: 2500,
    category: 'bathroom',
    description: 'Double sink vanity upgrade',
  },

  // Outdoor Features
  {
    name: 'Covered Patio',
    price: 8500,
    category: 'outdoor',
    description: 'Covered outdoor patio space',
  },
  {
    name: 'Deck Addition',
    price: 6500,
    category: 'outdoor',
    description: 'Composite deck with railing',
  },
  {
    name: 'Landscaping Package',
    price: 4500,
    category: 'outdoor',
    description: 'Professional landscaping and irrigation',
  },

  // Storage & Organization
  {
    name: 'Walk-in Closet',
    price: 3500,
    category: 'storage',
    description: 'Custom walk-in closet system',
  },
  {
    name: 'Built-in Storage',
    price: 2800,
    category: 'storage',
    description: 'Custom built-in storage solutions',
  },
  {
    name: 'Garage Conversion Prep',
    price: 5500,
    category: 'storage',
    description: 'Prep existing garage for ADU conversion',
  },

  // Energy Efficiency
  {
    name: 'Solar Panel System',
    price: 15000,
    category: 'energy',
    description: 'Rooftop solar panel installation',
  },
  {
    name: 'Energy Star Windows',
    price: 4500,
    category: 'energy',
    description: 'Upgrade to Energy Star rated windows',
  },
  {
    name: 'Smart Home Package',
    price: 3500,
    category: 'energy',
    description: 'Smart thermostat, lighting, and security',
  },

  // Accessibility
  {
    name: 'ADA Compliance Package',
    price: 8500,
    category: 'accessibility',
    description: 'Full ADA compliance modifications',
  },
  {
    name: 'Wheelchair Ramp',
    price: 3500,
    category: 'accessibility',
    description: 'Custom wheelchair accessible ramp',
  },
];

// Permit and Professional Service Costs
export const professionalServices = {
  permits: {
    base: 5000,
    percentage: 0.02, // 2% of construction cost
    description: 'Building permits and plan review',
  },
  design: {
    base: 8000,
    pricePerSqFt: 12,
    description: 'Architectural design and engineering',
  },
  management: {
    percentage: 0.15, // 15% of total project cost
    description: 'Project management and coordination',
  },
};

// Regional Cost Multipliers (by zip code or area)
export const regionalMultipliers = {
  '90210': 1.45, // Beverly Hills - High cost
  '94301': 1.4, // Palo Alto - High cost
  '95014': 1.35, // Cupertino - High cost
  '92651': 1.25, // Laguna Beach - Above average
  '90405': 1.3, // Santa Monica - High cost
  default: 1.0, // Base pricing
};

// Timeline Impact on Pricing
export const timelineMultipliers = {
  rush: 1.25, // Rush job (< 4 months)
  standard: 1.0, // Standard timeline (6-8 months)
  flexible: 0.95, // Flexible timeline (> 10 months)
};
