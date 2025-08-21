// Anchor Builders ADU Pricing Configuration - Real System
// Based on actual Excel pricing model and validated from real proposals
// Updated 2025-08-12 with CORRECT pricing from PDF analysis

export interface AduTypePricing {
  name: string;
  type: 'detached' | 'attached';
  stories?: 1 | 2; // For detached ADUs
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

// ADU Type Pricing - CORRECTED to $240/sqft base rate
export const aduTypePricing: AduTypePricing[] = [
  {
    name: 'Detached ADU (1-Story)',
    type: 'detached',
    stories: 1,
    pricePerSqFt: 240, // CORRECTED from 220 to 240
    description: 'Single level standalone unit',
  },
  {
    name: 'Detached ADU (2-Story)',
    type: 'detached',
    stories: 2,
    pricePerSqFt: 240, // Confirmed correct at 240
    description: 'Two level standalone unit',
  },
  {
    name: 'Attached ADU',
    type: 'attached',
    pricePerSqFt: 240, // CORRECTED from 200 to 240
    description: 'Connected to existing home',
  },
];

// Design Services - Updated ranges
export const designServices: DesignServices = {
  planningDesign: 12500, // Default for 1-story, updated to match UI
  description: 'ADU Plan Design, Structural Engineering, MEP Design, Zoning & Site Planning',
};

// Utility Options - CORRECTED to $3,500 for separate meters (from CLAUDE.md documentation)
export const utilityOptions: UtilityOption[] = [
  {
    name: 'Water Meter',
    separatePrice: 3500, // CORRECTED: $3,500 for separate meter connection
    sharedPrice: 0,
    required: true,
    description: 'Water service connection',
  },
  {
    name: 'Gas Meter',
    separatePrice: 3500, // CORRECTED: $3,500 for separate meter connection
    sharedPrice: 0,
    required: false,
    description: 'Natural gas service connection',
  },
  {
    name: 'Electric Meter',
    separatePrice: 3500, // CORRECTED: $3,500 for separate meter connection  
    sharedPrice: 0,
    required: true,
    description: 'Electrical service connection',
  },
];

// Add-On Options - CONFIRMED correct pricing
export const addOnOptions: AddOnOption[] = [
  {
    name: 'Extra Bathroom',
    price: 8000, // CONFIRMED correct
    description: 'Additional bathroom beyond standard',
  },
  {
    name: 'Driveway',
    price: 5000, // CONFIRMED correct
    description:
      'Dedicated driveway for ADU (does not include driveway approach - requires separate civil work)',
  },
  {
    name: 'Basic Landscaping',
    price: 10000, // CONFIRMED correct
    description: 'Basic landscaping around ADU',
  },
  {
    name: 'Central AC System',
    price: 0, // To be set in admin panel
    description: 'Central air conditioning system with ductwork',
  },
  {
    name: 'Mini-Split HVAC System',
    price: 0, // To be set in admin panel
    description: 'Ductless mini-split heat pump system',
  },
];

// Business Settings - From Excel Configuration  
export const businessSettings = {
  standardMarkup: 0.0, // No markup - pricing is final
  proposalValidityDays: 30,
  defaultCity: 'Westminster',
  minSizeForStandardPricing: 600, // NEW: Units <600 sqft get $250/sqft
};

// Finish Levels - Standard finish included in base price
export const finishLevels = ['Standard']; // Only standard finish level used

// HVAC Options - From Excel
export const hvacOptions = [
  {
    name: 'Central AC',
    value: 'central-ac',
    description: 'Ducted central air conditioning system',
  },
  { name: 'Mini-Split', value: 'mini-split', description: 'Ductless mini-split heat pump system' },
]; // Central AC is standard, Mini-split available

// Connection Types - From Excel
export const connectionTypes = {
  sewer: ['Existing Lateral'], // Standard sewer connection
  water: ['Shared', 'Separate'], // Water meter options
  gas: ['Shared', 'Separate'], // Gas meter options
  electric: ['Separate'], // Electric meter typically separate
};

// Solar and FEMA Options
export const optionalServices = {
  solarDesign: true, // Always included - no cost
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
    percentage: 18,
    description: 'Project setup, permits, and mobilization',
  },
  {
    code: 'M2',
    name: 'Underground Work',
    percentage: 18,
    description: 'Trenching and underground utilities',
  },
  {
    code: 'M3',
    name: 'Foundation',
    percentage: 18,
    description: 'Foundation and concrete work',
  },
  {
    code: 'M4',
    name: 'Framing',
    percentage: 16,
    description: 'Structural framing and roof',
  },
  {
    code: 'M5',
    name: 'MEP Rough',
    percentage: 14,
    description: 'Rough mechanical, electrical, and plumbing',
  },
  {
    code: 'M6',
    name: 'Drywall',
    percentage: 11,
    description: 'Drywall installation and finish',
  },
  {
    code: 'M7',
    name: 'Final Completion',
    percentage: 5,
    description: 'Final inspection and completion',
  },
];

// Calculate milestone payments exactly like Excel formulas
export const calculateMilestonePayments = (
  totalAmount: number,
  designAmount: number = 8500, // Updated default
  deposit: number = 1000
) => {
  // Excel-style calculation: (Total - Design - Deposit) for construction amount
  const constructionAmount = totalAmount - designAmount - deposit;

  let runningTotal = 0;
  const payments: Array<MilestonePayment & { amount: number; baseAmount: number }> = [];

  // Calculate all milestones first with their base percentages
  milestonePayments.forEach((milestone, index) => {
    const baseAmount = (constructionAmount * milestone.percentage) / 100;
    const roundedAmount = Math.round(baseAmount / 1000) * 1000; // ROUND(amount, -3)

    payments.push({
      ...milestone,
      amount: roundedAmount,
      baseAmount: baseAmount,
    });

    runningTotal += roundedAmount;
  });

  // Adjust the final payment to ensure the total matches exactly
  const finalIndex = payments.length - 1;
  const adjustment = constructionAmount - runningTotal;
  payments[finalIndex].amount += adjustment;

  // Ensure no negative payments
  if (payments[finalIndex].amount < 0) {
    // Distribute the negative amount across other milestones
    const redistributeAmount = Math.abs(payments[finalIndex].amount);
    payments[finalIndex].amount = 1000; // Minimum final payment

    // Reduce each milestone proportionally
    for (let i = 0; i < finalIndex; i++) {
      const reduction = Math.round(redistributeAmount / finalIndex / 1000) * 1000;
      payments[i].amount = Math.max(1000, payments[i].amount - reduction);
    }
  }

  return payments;
};

// Helper function to get price per sqft with size adjustment
export const getPricePerSqFt = (
  aduType: 'detached' | 'attached',
  stories: 1 | 2 = 1,
  squareFootage: number
): number => {
  // Find base pricing configuration
  let baseConfig;
  if (aduType === 'detached') {
    baseConfig = aduTypePricing.find(type => type.type === 'detached' && type.stories === stories);
  } else {
    baseConfig = aduTypePricing.find(type => type.type === 'attached');
  }

  if (!baseConfig) {
    return 240; // Default fallback
  }

  // Apply size-based pricing adjustment
  if (squareFootage < businessSettings.minSizeForStandardPricing) {
    // Premium pricing for smaller units ($250/sqft for <600 sqft)
    return 250;
  }

  return baseConfig.pricePerSqFt;
};
