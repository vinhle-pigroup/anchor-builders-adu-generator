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
  aduType: 'studio' | 'one-bedroom' | 'two-bedroom' | 'custom';
  squareFootage: number;
  foundationType: 'slab' | 'crawl-space' | 'basement';
  sitework: 'minimal' | 'moderate' | 'extensive';
  finishLevel: 'basic' | 'standard' | 'premium' | 'luxury';
  utilities: {
    electric: boolean;
    plumbing: boolean;
    gas: boolean;
    cableInternet: boolean;
  };
  selectedAddOns: string[];
  needsPermits: boolean;
  needsDesign: boolean;
  needsManagement: boolean;
  timeline: 'rush' | 'standard' | 'flexible';
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
  client: ClientInfo;
  project: ProjectInfo;
  additionalNotes: string;
  timeline: string;
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
