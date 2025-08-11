export interface ClientInfo {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

// Type aliases for backward compatibility with EnhancedProductionGrid
export interface ProjectData {
  clientName?: string;
  clientEmail?: string;
  clientPhone?: string;
  // Secondary client fields (HOL design)
  secondaryClientFirstName?: string;
  secondaryClientLastName?: string;
  secondaryClientEmail?: string;
  secondaryClientPhone?: string;
  // Property info
  propertyAddress?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  aduType?: string;
  squareFootage?: number;
  bedrooms?: number;
  bathrooms?: number;
  hvacType?: string;
  additionalNotes?: string;
}

export interface PricingData {
  designServices?: number;
  utilities?: Record<string, number>;
  additionalServices?: Record<string, number>;
  // Additional services from HOL design
  extraBathroom?: number;
  dedicatedDriveway?: number;
  basicLandscaping?: number;
  // HOL design features
  friendsAndFamilyDiscount?: boolean;
  solarReady?: boolean;
  femaCompliance?: boolean;
}

export interface ProjectInfo {
  // Basic ADU Details - matching Excel form
  aduType: 'detached' | 'attached' | string;
  stories?: 1 | 2; // For detached ADUs only
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;

  // Features - matching Excel form
  appliancesIncluded: boolean;
  hvacType: 'central-ac' | 'mini-split';
  finishLevel: 'standard'; // Only standard in real system

  // Utilities - simplified to separate/shared
  utilities: {
    waterMeter: 'shared' | 'separate';
    gasMeter: 'shared' | 'separate';
    electricMeter: 'separate'; // Always separate
    electricalPanel?: number; // Electrical panel upgrade cost
  };

  // Connections
  sewerConnection: 'existing-lateral';

  // Services
  needsDesign: boolean;

  // Optional features
  solarDesign: boolean;
  femaIncluded: boolean;

  // Add-ons
  selectedAddOns: string[];

  // Additional notes for project requirements
  additionalNotes?: string;

  // Price Overrides - Manual adjustments
  priceOverrides?: {
    basePricePerSqFt?: number; // Override base construction rate
    designServices?: number; // Override design fee
    addOnPrices?: Record<string, number>; // Override specific add-on prices
    markupPercentage?: number; // Override markup percentage
  };
}

export interface PricingItem {
  category: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface ProposalCalculation {
  items: PricingItem[];
  subtotal: number;
  tax: number;
  total: number;
  deposit: number;
  monthlyPayment?: number;
}

export interface AnchorProposalFormData {
  id?: string;
  client: ClientInfo;
  project: ProjectInfo;
  additionalNotes: string;
  timeline: string;
  proposalDate?: string; // Auto-populated but manually editable
  createdAt?: string;
  lastModified?: string;
  // HOL design secondary client fields
  secondaryClientFirstName?: string;
  secondaryClientLastName?: string;
  secondaryClientEmail?: string;
  secondaryClientPhone?: string;
}

export interface SavedProposal {
  id: number;
  clientName: string;
  projectType: string;
  totalAmount: number;
  status: 'draft' | 'sent' | 'approved' | 'rejected';
  createdDate: string;
  updatedDate: string;
  formData: AnchorProposalFormData;
}
