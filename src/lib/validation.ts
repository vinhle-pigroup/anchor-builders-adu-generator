/**
 * Runtime validation schemas using Zod
 * Ensures data integrity for localStorage and form operations
 */

import { z } from 'zod';

// Client information schema
export const ClientSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Valid email address is required'),
  phone: z.string().regex(/^\(\d{3}\)\s\d{3}-\d{4}$/, 'Phone must be in format (xxx) xxx-xxxx'),
  address: z.string().min(1, 'Address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().length(2, 'State must be 2 characters'),
  zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, 'ZIP code must be 5 or 9 digits'),
});

// Utilities schema
export const UtilitiesSchema = z.object({
  waterMeter: z.enum(['shared', 'separate']),
  gasMeter: z.enum(['shared', 'separate']),
  electricMeter: z.literal('separate'),
  electricalPanel: z.string().regex(/^\d+$/, 'Electrical panel must be numeric'),
});

// Project information schema
export const ProjectSchema = z.object({
  aduType: z.enum(['detached-1story', 'detached-2story', 'attached']),
  squareFootage: z.number().min(200).max(1200),
  bedrooms: z.number().min(0).max(3),
  bathrooms: z.number().min(1).max(3),
  appliancesIncluded: z.boolean(),
  hvacType: z.enum(['central-ac', 'mini-split']),
  finishLevel: z.literal('standard'),
  utilities: UtilitiesSchema,
  sewerConnection: z.literal('existing-lateral'),
  needsDesign: z.boolean(),
  solarDesign: z.boolean(),
  femaIncluded: z.boolean(),
  selectedAddOns: z.array(z.string()),
  priceOverrides: z.object({
    basePricePerSqFt: z.number().min(0).optional(),
    designServices: z.number().min(0).optional(),
    addOnPrices: z.record(z.string(), z.number().min(0)).optional(),
    markupPercentage: z.number().min(0).max(1).optional(),
  }).optional(),
});

// Complete form data schema
export const ProposalFormDataSchema = z.object({
  id: z.string().optional(),
  createdAt: z.string().optional(),
  client: ClientSchema,
  project: ProjectSchema,
  additionalNotes: z.string(),
  timeline: z.string(),
  proposalDate: z.string(),
});

// Array of proposals (for localStorage)
export const ProposalsArraySchema = z.array(ProposalFormDataSchema);

// Pricing data schema
export const PricingDataSchema = z.object({
  aduType: z.string(),
  pricePerSqFt: z.number().min(0),
  sqft: z.number().min(200).max(1200),
  bedrooms: z.number().min(0).max(3),
  bathrooms: z.number().min(1).max(3),
  hvacType: z.enum(['central-ac', 'mini-split']),
  utilities: z.object({
    water: z.number().min(0).nullable(),
    gas: z.number().min(0).nullable(),
    electric: z.number().min(0).nullable(),
  }),
  services: z.object({
    design: z.number().min(0),
    solar: z.number().min(0),
    fema: z.number().min(0),
  }),
  addons: z.record(z.string(), z.number().min(0)),
  manualAddons: z.array(z.number().min(0)),
  overrides: z.object({
    basePricePerSqFt: z.number().min(0),
    designServices: z.number().min(0),
    markupPercentage: z.number().min(0).max(1),
  }),
  needsDesign: z.boolean(),
  solarDesign: z.boolean(),
  femaIncluded: z.boolean(),
});

/**
 * Safe localStorage operations with validation
 */
export class SafeStorage {
  /**
   * Safely save proposals to localStorage with validation
   */
  static saveProposals(proposals: unknown): boolean {
    try {
      const validatedProposals = ProposalsArraySchema.parse(proposals);
      localStorage.setItem('anchorProposals', JSON.stringify(validatedProposals));
      return true;
    } catch (error) {
      console.error('Failed to validate proposals for storage:', error);
      return false;
    }
  }

  /**
   * Safely load proposals from localStorage with validation
   */
  static loadProposals(): any[] {
    try {
      const stored = localStorage.getItem('anchorProposals');
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      const validated = ProposalsArraySchema.parse(parsed);
      return validated;
    } catch (error) {
      console.error('Failed to validate stored proposals:', error);
      // Return empty array instead of potentially corrupted data
      return [];
    }
  }

  /**
   * Safely save a single proposal
   */
  static saveProposal(proposal: unknown): boolean {
    try {
      const validated = ProposalFormDataSchema.parse(proposal);
      const existing = this.loadProposals();
      
      // Update existing or add new
      const proposalId = validated.id || Date.now().toString();
      const proposalToSave = { ...validated, id: proposalId };
      
      const existingIndex = existing.findIndex(p => p.id === proposalId);
      if (existingIndex >= 0) {
        existing[existingIndex] = proposalToSave;
      } else {
        existing.push(proposalToSave);
      }
      
      return this.saveProposals(existing);
    } catch (error) {
      console.error('Failed to validate single proposal:', error);
      return false;
    }
  }

  /**
   * Safely validate form data before submission
   */
  static validateFormData(formData: unknown): { isValid: boolean; errors: string[]; data?: any } {
    try {
      const validated = ProposalFormDataSchema.parse(formData);
      return { isValid: true, errors: [], data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
        return { isValid: false, errors };
      }
      return { isValid: false, errors: ['Unknown validation error'] };
    }
  }

  /**
   * Safely validate pricing data
   */
  static validatePricingData(pricingData: unknown): { isValid: boolean; errors: string[]; data?: any } {
    try {
      const validated = PricingDataSchema.parse(pricingData);
      return { isValid: true, errors: [], data: validated };
    } catch (error) {
      if (error instanceof z.ZodError) {
        const errors = error.issues.map((err: any) => `${err.path.join('.')}: ${err.message}`);
        return { isValid: false, errors };
      }
      return { isValid: false, errors: ['Unknown validation error'] };
    }
  }
}

/**
 * Validation helpers
 */
export const ValidationHelpers = {
  /**
   * Validate email format
   */
  isValidEmail: (email: string): boolean => {
    return z.string().email().safeParse(email).success;
  },

  /**
   * Validate phone format
   */
  isValidPhone: (phone: string): boolean => {
    return z.string().regex(/^\(\d{3}\)\s\d{3}-\d{4}$/).safeParse(phone).success;
  },

  /**
   * Validate ZIP code format
   */
  isValidZipCode: (zip: string): boolean => {
    return z.string().regex(/^\d{5}(-\d{4})?$/).safeParse(zip).success;
  },

  /**
   * Validate square footage
   */
  isValidSquareFootage: (sqft: number): boolean => {
    return z.number().min(200).max(1200).safeParse(sqft).success;
  },

  /**
   * Format phone number to required format
   */
  formatPhone: (phone: string): string => {
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
    return phone;
  },
};

export type ClientInfo = z.infer<typeof ClientSchema>;
export type ProjectInfo = z.infer<typeof ProjectSchema>;
export type ProposalFormData = z.infer<typeof ProposalFormDataSchema>;
export type PricingData = z.infer<typeof PricingDataSchema>;