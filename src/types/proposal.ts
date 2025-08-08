/**
 * Core proposal and form data types for Anchor Builders ADU Generator
 */

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
  aduType: 'detached' | 'attached';
  stories?: 1 | 2;
  squareFootage: number;
  bedrooms: number;
  bathrooms: number;
  appliancesIncluded: boolean;
  hvacType: 'central-ac' | 'mini-split';
  finishLevel: 'standard';
  utilities: {
    waterMeter: 'shared' | 'separate';
    gasMeter: 'shared' | 'separate';
    electricMeter: 'separate';
    electricalPanel: string;
  };
  sewerConnection: 'existing-lateral';
  needsDesign: boolean;
  solarDesign: boolean;
  femaIncluded: boolean;
  selectedAddOns: string[];
  priceOverrides?: {
    basePricePerSqFt?: number;
    designServices?: number;
    addOnPrices?: Record<string, number>;
    markupPercentage?: number;
  };
}

export interface AnchorProposalFormData {
  id?: string;
  createdAt?: string;
  lastModified?: string;
  client: ClientInfo;
  project: ProjectInfo;
  additionalNotes: string;
  timeline: string;
  proposalDate: string;
}

// FIXED: Correct interface based on actual usage in pdf-template-generator.ts
export interface ProposalData {
  clientInfo?: {
    name?: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  projectInfo?: {
    address?: string;
    type?: string;
    bedrooms?: number;
    bathrooms?: number;
    squareFootage?: number;
  };
  pricing?: {
    baseCost?: number;
    totalCost?: number;
    estimatedTimeline?: string;
  };
  // Utility selections for scope of work display
  utilities?: {
    waterMeter?: 'shared' | 'separate';
    gasMeter?: 'shared' | 'separate';
    electricMeter?: 'separate';
    electricalPanel?: string; // Panel size (e.g., '100', '200')
  };
  // Selected add-ons for bathroom count calculation
  selectedAddOns?: string[];
  additionalServices?: Array<{
    name?: string;
    description?: string;
    cost?: number;
  }>;
  // Template-specific arrays for {{#each}} loops
  ADD_ON_ITEMS?: Array<{
    number?: string;
    name?: string;
    description?: string;
    cost?: string; // Formatted currency string
  }>;
}

// Legacy interface for backward compatibility (renamed to avoid confusion)
export interface LegacyProposalData {
  aduSize: number;
  aduType: string;
  foundationType: string;
  exteriorFinish: string;
  interiorFinish: string;
  flooringType: string;
  hvacConfig: string;
  addOns: string[];
  basePrice: number;
  totalPrice: number;
}

export interface PricingResult {
  basePrice: number;
  totalPrice: number;
}

export interface HVACConfiguration {
  type: 'central-ac' | 'mini-split';
  cost: number;
}