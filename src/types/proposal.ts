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
  lotSize: string;
  aduType: 'studio' | 'one-bedroom' | 'two-bedroom' | 'custom' | 'detached' | 'attached';
  squareFootage: number;
  foundationType: 'slab' | 'crawl-space' | 'basement';
  sitework: 'minimal' | 'moderate' | 'extensive';
  utilities: {
    electric: boolean;
    plumbing: boolean;
    gas: boolean;
    sewer: boolean;
  };
  permits: boolean;
  design: boolean;
  selectedAddOns?: string[]; // Array of selected add-on names
  priceOverrides?: any; // Price override configuration
  stories?: number; // Number of stories (1 or 2)
  bedrooms?: number; // Number of bedrooms
  bathrooms?: number; // Number of bathrooms
  needsDesign?: boolean; // Whether design services are needed
  appliancesIncluded?: boolean; // Whether appliances are included
  hvacType?: string; // HVAC system type
  sewerConnection?: 'shared' | 'separate'; // Sewer connection type
  solarDesign?: boolean; // Whether solar design is included
  femaIncluded?: boolean; // Whether FEMA compliance is included
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
  proposalNumber?: string;  // Add missing proposalNumber field
  client: ClientInfo;
  project: any; // Using any temporarily for flexibility with project structure
  pricing?: any; // Pricing calculation data
  additionalNotes: string;
  timeline: string;
  proposalDate?: string;
  proposalValidityDays?: number;
  depositAmount?: number;
  secondaryClientFirstName?: string;
  secondaryClientLastName?: string;
  secondaryClientEmail?: string;
  secondaryClientPhone?: string;
  customServicesCount?: number; // Number of custom services
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
