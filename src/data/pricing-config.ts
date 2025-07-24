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

// ADU Type Pricing - Real Anchor Builders Model (Based on actual proposals)
export const aduTypePricing: AduTypePricing[] = [
  {
    name: 'Detached ADU',
    type: 'detached',
    pricePerSqFt: 240, // $240/sqft for 750+ sqft
    description: 'Detached single-story ADU (1 Story)',
  },
  {
    name: 'Attached ADU', 
    type: 'attached',
    pricePerSqFt: 244, // $244.19/sqft for garage conversions
    description: 'Attached ADU or Garage Conversion',
  },
];

// Size-based pricing tiers from actual proposals
export const getSizeBasedPricing = (sqft: number, isAttached: boolean = false): number => {
  if (isAttached && sqft <= 430) {
    return 244.19; // Garage conversion rate
  }
  if (sqft <= 600) {
    return 250; // Small ADU rate
  }
  return 240; // Standard rate for 750+ sqft
};

// Design Services - Fixed Fee (from actual proposals)
export const designServices: DesignServices = {
  planningDesign: 8500, // Range: $8,500-$12,500, using lower end
  description: 'ADU Plan Design, Structural Engineering, MEP Design, Zoning & Site Planning Review, Title 24 Energy Compliance',
};

// Design service pricing tiers
export const getDesignPricing = (sqft: number): number => {
  if (sqft <= 600) return 8500;
  if (sqft <= 750) return 10000;
  return 12500; // For larger ADUs
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

// Add-On Options - From actual Anchor Builders proposals
export const addOnOptions: AddOnOption[] = [
  {
    name: 'Additional Bathroom',
    price: 10250, // Average from proposals: $8,000-$12,500
    description: 'Additional bathroom beyond standard configuration',
  },
  {
    name: 'Third-Party Testing (HERS, QII, Compaction)',
    price: 1500, // From proposals: $1,000-$2,000
    description: 'Required testing and certifications',
  },
  {
    name: 'Family/Friends Discount',
    price: -2000, // From proposals
    description: 'Special discount for family and friends',
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
    description: 'Structural framing and roof construction'
  },
  {
    code: 'M5',
    name: 'Mechanical, Electrical, Plumbing (MEP)',
    percentage: 15,
    description: 'Rough mechanical, electrical, and plumbing installation'
  },
  {
    code: 'M6',
    name: 'Drywall',
    percentage: 10,
    description: 'Drywall installation and interior finishes'
  },
  {
    code: 'M7',
    name: 'Property Final',
    percentage: 5,
    description: 'Final inspection, cleanup, and project completion'
  }
];

// Calculate milestone payments exactly like Excel formulas
export const calculateMilestonePayments = (totalAmount: number, designAmount: number = 0) => {
  const deposit = Math.min(1000, totalAmount * 0.10); // Max $1,000 or 10% per CA law
  const constructionAmount = totalAmount - designAmount - deposit;
  
  const payments = [];
  
  // Add deposit as first payment
  payments.push({
    code: 'DEPOSIT',
    name: 'Deposit',
    percentage: (deposit / totalAmount) * 100,
    description: 'Initial deposit to begin project (max $1,000 per CA law)',
    amount: deposit,
    baseAmount: deposit
  });
  
  // Add design payment if applicable
  if (designAmount > 0) {
    payments.push({
      code: 'DESIGN',
      name: 'Design & Planning',
      percentage: (designAmount / totalAmount) * 100,
      description: 'ADU Plan Design, Structural Engineering, MEP Design',
      amount: designAmount,
      baseAmount: designAmount
    });
  }
  
  // Calculate construction milestone payments
  let runningTotal = 0;
  
  milestonePayments.forEach((milestone, index) => {
    if (index < milestonePayments.length - 1) {
      // Round to nearest $1,000 like Excel formula ROUND(amount, -3)
      const baseAmount = (milestone.percentage * constructionAmount) / 100;
      const roundedAmount = Math.round(baseAmount / 1000) * 1000;
      runningTotal += roundedAmount;
      
      payments.push({
        ...milestone,
        amount: roundedAmount,
        baseAmount: baseAmount
      });
    } else {
      // Final milestone is remainder to ensure exact total
      const finalAmount = constructionAmount - runningTotal;
      payments.push({
        ...milestone,
        amount: finalAmount,
        baseAmount: finalAmount
      });
    }
  });
  
  return payments;
};
