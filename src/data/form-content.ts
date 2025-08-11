/**
 * SINGLE SOURCE OF TRUTH FOR ALL FORM CONTENT
 * 
 * This file contains ALL labels, options, prices, and structure for the ADU proposal form.
 * When redesigning the UI, always reference this file to ensure no content is lost.
 * 
 * ⚠️ CRITICAL TODO: PDF Template needs to be updated to include secondary client fields:
 *    - {{secondaryClientFirstName}}, {{secondaryClientLastName}}
 *    - {{secondaryClientEmail}}, {{secondaryClientPhone}}
 *    - Add conditional rendering for optional secondary client section
 */

export interface FormOption {
  value: string;
  label: string;
  price?: number;
  description?: string;
}

export interface FormSection {
  id: string;
  title: string;
  fields: FormField[];
}

export interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'tel' | 'number' | 'textarea' | 'select' | 'checkbox' | 'radio' | 'button-group';
  placeholder?: string;
  options?: FormOption[];
  price?: number;
  description?: string;
  required?: boolean;
  emoji?: string;
}

/**
 * COMPLETE FORM STRUCTURE AND CONTENT
 * This is the authoritative source for all form content
 */
export const FORM_CONTENT: FormSection[] = [
  {
    id: 'client',
    title: 'CLIENT INFORMATION',
    fields: [
      {
        id: 'proposalNumber',
        label: 'Proposal #',
        type: 'text',
        // Auto-generated: AB-2025-{random}
      },
      {
        id: 'date',
        label: 'Date',
        type: 'text',
        // Auto-generated: current date
      },
      {
        id: 'propertyAddress',
        label: 'Property Address',
        type: 'text',
        placeholder: 'Street Address',
        required: true,
      },
      {
        id: 'city',
        label: 'City',
        type: 'text',
        placeholder: 'City',
        required: true,
      },
      {
        id: 'state',
        label: 'State',
        type: 'text',
        placeholder: 'State',
        required: true,
      },
      {
        id: 'zipCode',
        label: 'ZIP Code',
        type: 'text',
        placeholder: 'ZIP',
        required: true,
      },
      {
        id: 'clientName',
        label: 'Client Information',
        type: 'text',
        placeholder: 'Full Name',
        required: true,
      },
      {
        id: 'clientEmail',
        label: 'Email',
        type: 'email',
        placeholder: 'Email',
        required: true,
      },
      {
        id: 'clientPhone',
        label: 'Phone',
        type: 'tel',
        placeholder: 'Phone',
        required: true,
      },
      // Secondary client fields (HOL design)
      {
        id: 'secondaryClientFirstName',
        label: 'Secondary Client First Name',
        type: 'text',
        placeholder: 'First Name',
      },
      {
        id: 'secondaryClientLastName',
        label: 'Secondary Client Last Name',
        type: 'text',
        placeholder: 'Last Name',
      },
      {
        id: 'secondaryClientEmail',
        label: 'Secondary Client Email',
        type: 'email',
        placeholder: 'Email',
      },
      {
        id: 'secondaryClientPhone',
        label: 'Secondary Client Phone',
        type: 'tel',
        placeholder: 'Phone',
      },
      // Friends & Family Discount
      {
        id: 'friendsAndFamilyDiscount',
        label: 'Friends & Family Discount (10% off)',
        type: 'checkbox',
      },
    ]
  },
  {
    id: 'property',
    title: 'ADU CONFIGURATION',
    fields: [
      {
        id: 'aduType',
        label: 'ADU Type',
        type: 'button-group',
        required: true,
        options: [
          { value: 'detached', label: 'Detached' },
          { value: 'attached', label: 'Attached' },
          { value: 'jadu', label: 'JADU' },
        ]
      },
      {
        id: 'squareFootage',
        label: 'Square Footage',
        type: 'button-group',
        required: true,
        options: [
          { value: '400', label: '400' },
          { value: '800', label: '800' },
          { value: '1000', label: '1000' },
          { value: '1200', label: '1200' },
        ]
      },
      {
        id: 'squareFootageCustom',
        label: 'Custom Square Footage',
        type: 'number',
        placeholder: '0',
      },
      {
        id: 'bedrooms',
        label: 'Bedrooms',
        type: 'button-group',
        options: [
          { value: 'studio', label: 'Studio' },
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
        ]
      },
      {
        id: 'bathrooms',
        label: 'Bathrooms',
        type: 'button-group',
        options: [
          { value: '0', label: '0' },
          { value: '1', label: '1' },
          { value: '2', label: '2' },
          { value: '3', label: '3' },
        ]
      },
      {
        id: 'hvac',
        label: 'HVAC',
        type: 'button-group',
        emoji: '❄️',
        options: [
          { 
            value: 'central-ac', 
            label: 'Central AC',
            description: 'Available'
          },
          { 
            value: 'mini-split', 
            label: 'Mini-Split',
            description: 'Available'
          },
        ]
      },
      {
        id: 'utilities',
        label: 'Utilities',
        type: 'button-group',
        emoji: '⚡',
        options: [
          { 
            value: 'water-shared', 
            label: 'Water',
            description: 'Shared'
          },
          { 
            value: 'sewer-separate', 
            label: 'Sewer',
            description: 'Separate'
          },
          { 
            value: 'gas-separate', 
            label: 'Gas',
            description: 'Separate'
          },
          { 
            value: 'electric-shared', 
            label: 'Electric',
            description: 'Shared'
          },
        ]
      },
      {
        id: 'additionalServices',
        label: 'Additional Services',
        type: 'checkbox',
        emoji: '➕',
        options: [
          { 
            value: 'extraBathroom', 
            label: 'Extra Bathroom',
            price: 8000
          },
          { 
            value: 'dedicatedDriveway', 
            label: 'Dedicated Driveway',
            price: 5000
          },
          { 
            value: 'basicLandscaping', 
            label: 'Basic Landscaping',
            price: 10000
          },
        ]
      },
    ]
  },
  {
    id: 'services',
    title: 'DESIGN SERVICES',
    fields: [
      {
        id: 'designServices',
        label: 'Professional Design Services',
        type: 'checkbox',
        options: [
          {
            value: 'includeDesign',
            label: 'Include Design Services',
            price: 12500,
            description: 'Architectural plans, structural engineering, and permit assistance'
          }
        ]
      },
      {
        id: 'solarReady',
        label: 'Solar Ready',
        type: 'checkbox',
      },
      {
        id: 'femaCompliance',
        label: 'FEMA Compliance',
        type: 'checkbox',
      },
    ]
  },
  {
    id: 'notes',
    title: 'ADDITIONAL NOTES',
    fields: [
      {
        id: 'additionalNotes',
        label: 'Additional Notes',
        type: 'textarea',
        placeholder: 'Any special requirements, preferences, or project details...',
      }
    ]
  }
];

/**
 * PRICING CONFIGURATION
 * All prices and calculations in one place
 */
export const PRICING_CONFIG = {
  designServices: 12500,
  extraBathroom: 8000,
  dedicatedDriveway: 5000,
  basicLandscaping: 10000,
  
  // Base prices by ADU type (if needed later)
  basePrices: {
    detached: 180000,
    attached: 160000,
    jadu: 120000,
  }
};

/**
 * UI CONFIGURATION
 * Colors, sizing, and other UI constants
 */
export const UI_CONFIG = {
  colors: {
    primary: 'blue',
    secondary: 'slate',
    accent: 'orange',
    success: 'blue',
  },
  fonts: {
    tiny: 'text-[7px]',
    small: 'text-[8px]',
    base: 'text-[9px]',
    medium: 'text-[10px]',
    large: 'text-[11px]',
    xlarge: 'text-[12px]',
  },
  spacing: {
    tight: 'space-y-0.5',
    normal: 'space-y-1.5',
    loose: 'space-y-2',
  }
};

/**
 * Helper functions to get content
 */
export const getFormSection = (sectionId: string) => 
  FORM_CONTENT.find(section => section.id === sectionId);

export const getFormField = (sectionId: string, fieldId: string) => 
  getFormSection(sectionId)?.fields.find(field => field.id === fieldId);

export const getFieldOptions = (sectionId: string, fieldId: string) => 
  getFormField(sectionId, fieldId)?.options || [];

export const getFieldPrice = (sectionId: string, fieldId: string, optionValue: string) => 
  getFieldOptions(sectionId, fieldId).find(option => option.value === optionValue)?.price || 0;