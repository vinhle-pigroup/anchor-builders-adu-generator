// Anchor Builders ADU Pricing Configuration - Real System
// Based on actual Excel pricing model

export interface AduTypePricing {
  name: string;
  type: 'detached' | 'attached';
  pricePerSqFt: number;
  description: string;
}

export interface UtilityOption {
  name: string;
  separatePrice: number;
  sharedPrice: number;
  required: boolean;
  description: string;
}

export interface AddOnOption {
  name: string;
  price: number;
  description: string;
}

export interface DesignServices {
  planningDesign: number;
  description: string;
}

// ADU Type Pricing - Real Anchor Builders Model
export const aduTypePricing: AduTypePricing[] = [
  {
    name: 'Detached ADU',
    type: 'detached',
    pricePerSqFt: 220,
    description: 'Detached single-story ADU (1 Story)',
  },
  {
    name: 'Attached ADU', 
    type: 'attached',
    pricePerSqFt: 200,
    description: 'Attached ADU to existing structure',
  },
];

// Design Services - Fixed Fee
export const designServices: DesignServices = {
  planningDesign: 12500,
  description: 'ADU Plan Design, Structural Engineering, MEP Design, Zoning & Site Planning',
};

// Utility Options - Separate vs Shared
export const utilityOptions: UtilityOption[] = [
  {
    name: 'Water Meter',
    separatePrice: 1000,
    sharedPrice: 0,
    required: true,
    description: 'Water service connection',
  },
  {
    name: 'Gas Meter',
    separatePrice: 1500,
    sharedPrice: 0,
    required: false,
    description: 'Natural gas service connection',
  },
  {
    name: 'Electric Meter',
    separatePrice: 2000,
    sharedPrice: 0,
    required: true,
    description: 'Electrical service connection',
  },
];

// Add-On Options - Real Anchor Builders Options
export const addOnOptions: AddOnOption[] = [
  {
    name: 'Extra Bathroom',
    price: 8000,
    description: 'Additional bathroom beyond standard',
  },
  {
    name: 'Driveway',
    price: 5000,
    description: 'Dedicated driveway for ADU',
  },
  {
    name: 'Basic Landscaping',
    price: 10000,
    description: 'Basic landscaping around ADU',
  },
];

// Business Settings - From Excel Configuration
export const businessSettings = {
  standardMarkup: 0.15, // 15% standard markup
  proposalValidityDays: 30,
  defaultCity: 'Westminster',
};

// Finish Levels - Standard finish included in base price
export const finishLevels = ['Standard']; // Only standard finish level used

// HVAC Options - From Excel
export const hvacOptions = ['Central AC']; // Central AC is standard

// Connection Types - From Excel
export const connectionTypes = {
  sewer: ['Existing Lateral'], // Standard sewer connection
  water: ['Shared', 'Separate'], // Water meter options
  gas: ['Shared', 'Separate'], // Gas meter options  
  electric: ['Separate'], // Electric meter typically separate
};

// Solar and FEMA Options
export const optionalServices = {
  solarDesign: false, // Default: No
  femaIncluded: false, // Default: No
};

// Milestone Payment Structure - Based on Excel Model
export interface MilestonePayment {
  code: string;
  name: string;
  percentage: number;
  description: string;
}

export const milestonePayments: MilestonePayment[] = [
  {
    code: 'M1',
    name: 'Mobilization',
    percentage: 20,
    description: 'Project setup, permits, and mobilization'
  },
  {
    code: 'M2', 
    name: 'Trenching & Underground Plumbing',
    percentage: 20,
    description: 'Site preparation and underground utilities'
  },
  {
    code: 'M3',
    name: 'Foundation',
    percentage: 20,
    description: 'Foundation and concrete work'
  },
  {
    code: 'M4',
    name: 'Framing',
    percentage: 15,
    description: 'Structural framing and roof'
  },
  {
    code: 'M5',
    name: 'MEP (Mechanical, Electrical, Plumbing)',
    percentage: 15,
    description: 'Rough mechanical, electrical, and plumbing'
  },
  {
    code: 'M6',
    name: 'Drywall',
    percentage: 10,
    description: 'Drywall installation and finish'
  },
  {
    code: 'M7',
    name: 'Property Final',
    percentage: 5,
    description: 'Final inspection and completion'
  }
];

// Calculate milestone payments with rounding to nearest $50
export const calculateMilestonePayments = (totalAmount: number) => {
  return milestonePayments.map(milestone => {
    const baseAmount = (totalAmount * milestone.percentage) / 100;
    // Round to nearest $50 to avoid odd numbers
    const roundedAmount = Math.round(baseAmount / 50) * 50;
    
    return {
      ...milestone,
      amount: roundedAmount,
      baseAmount: baseAmount
    };
  });
};
