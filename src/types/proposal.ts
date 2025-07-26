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

export interface ProjectInfo {
  // Basic ADU Details - matching Excel form
  aduType: 'detached' | 'attached';
  stories?: 1 | 2; // For detached ADUs only
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;

  // Features - matching Excel form
  appliancesIncluded: boolean;
  hvacType: 'central-ac';
  finishLevel: 'standard'; // Only standard in real system

  // Utilities - simplified to separate/shared
  utilities: {
    waterMeter: 'shared' | 'separate';
    gasMeter: 'shared' | 'separate';
    electricMeter: 'separate'; // Always separate
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
  createdAt?: string;
  lastModified?: string;
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
