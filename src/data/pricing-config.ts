// Anchor Builders ADU Pricing Configuration - Real System
// Based on actual Excel pricing model

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

// ADU Type Pricing - Real Anchor Builders Model
export const aduTypePricing: AduTypePricing[] = [
  {
    name: 'Detached ADU (1-Story)',
    type: 'detached',
    stories: 1,
    pricePerSqFt: 220,
    description: 'Single level standalone unit',
  },
  {
    name: 'Detached ADU (2-Story)',
    type: 'detached',
    stories: 2,
    pricePerSqFt: 240,
    description: 'Two level standalone unit',
  },
  {
    name: 'Attached ADU',
    type: 'attached',
    pricePerSqFt: 200,
    description: 'Connected to existing home',
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
    percentage: 20,
    description: 'Project setup, permits, and mobilization',
  },
  {
    code: 'M2',
    name: 'Trenching & Underground Plumbing',
    percentage: 20,
    description: 'Site preparation and underground utilities',
  },
  {
    code: 'M3',
    name: 'Foundation',
    percentage: 20,
    description: 'Foundation and concrete work',
  },
  {
    code: 'M4',
    name: 'Framing',
    percentage: 15,
    description: 'Structural framing and roof',
  },
  {
    code: 'M5',
    name: 'MEP (Mechanical, Electrical, Plumbing)',
    percentage: 15,
    description: 'Rough mechanical, electrical, and plumbing',
  },
  {
    code: 'M6',
    name: 'Drywall',
    percentage: 10,
    description: 'Drywall installation and finish',
  },
  {
    code: 'M7',
    name: 'Property Final',
    percentage: 0,
    description: 'Final inspection and completion',
  },
];

// Calculate milestone payments exactly like Excel formulas
export const calculateMilestonePayments = (
  totalAmount: number,
  designAmount: number = 12500,
  deposit: number = 1000
) => {
  // Excel-style calculation: (Total - Design - Deposit) for construction amount
  const constructionAmount = totalAmount - designAmount - deposit;

  let runningTotal = 0;
  const payments = [];

  // Calculate milestones using Excel ROUND(amount, -3) formula
  milestonePayments.forEach((milestone, index) => {
    if (index < milestonePayments.length - 1) {
      // Regular milestone: ROUND(percentage * constructionAmount / 100, -3)
      const baseAmount = (constructionAmount * milestone.percentage) / 100;
      const roundedAmount = Math.round(baseAmount / 1000) * 1000; // ROUND(amount, -3)
      runningTotal += roundedAmount;

      payments.push({
        ...milestone,
        amount: roundedAmount,
        baseAmount: baseAmount,
      });
    } else {
      // Final milestone: remainder to ensure exact total
      const finalAmount = constructionAmount - runningTotal;
      payments.push({
        ...milestone,
        amount: finalAmount,
        baseAmount: finalAmount,
      });
    }
  });

  return payments;
};
