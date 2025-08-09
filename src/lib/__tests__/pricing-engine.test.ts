/**
 * Unit tests for AnchorPricingEngine
 * Tests pricing calculations, add-on processing, and milestone payments
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { AnchorPricingEngine, type PricingInputs } from '../pricing-engine';

describe('AnchorPricingEngine', () => {
  let pricingEngine: AnchorPricingEngine;

  beforeEach(() => {
    pricingEngine = new AnchorPricingEngine();
  });

  describe('Basic ADU Pricing', () => {
    it('should calculate pricing for detached 1-story ADU', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);

      expect(result).toBeDefined();
      expect(result.lineItems).toHaveLength(2); // Base construction + electric meter
      expect(result.grandTotal).toBeGreaterThan(0);
      expect(result.pricePerSqFt).toBe(result.grandTotal / inputs.squareFootage);
    });

    it('should calculate pricing for detached 2-story ADU', () => {
      const inputs: PricingInputs = {
        squareFootage: 800,
        aduType: 'detached',
        stories: 2,
        bedrooms: 2,
        bathrooms: 2,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'central-ac',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);

      expect(result).toBeDefined();
      expect(result.lineItems).toHaveLength(2); // Base construction + electric meter
      expect(result.grandTotal).toBeGreaterThan(0);
    });

    it('should calculate pricing for attached ADU', () => {
      const inputs: PricingInputs = {
        squareFootage: 500,
        aduType: 'attached',
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);

      expect(result).toBeDefined();
      expect(result.lineItems).toHaveLength(2); // Base construction + electric meter
      expect(result.grandTotal).toBeGreaterThan(0);
    });
  });

  describe('Design Services', () => {
    it('should include design services when needsDesign is true', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: true,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      const designServiceItem = result.lineItems.find(item => 
        item.category === 'Design Services'
      );

      expect(designServiceItem).toBeDefined();
      expect(designServiceItem?.isOptional).toBe(true);
      expect(designServiceItem?.totalPrice).toBeGreaterThan(0);
    });

    it('should not include design services when needsDesign is false', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      const designServiceItem = result.lineItems.find(item => 
        item.category === 'Design Services'
      );

      expect(designServiceItem).toBeUndefined();
    });
  });

  describe('Utility Connections', () => {
    it('should include separate water meter cost when selected', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'separate',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      const waterMeterItem = result.lineItems.find(item => 
        item.description.includes('Water Meter')
      );

      expect(waterMeterItem).toBeDefined();
      expect(waterMeterItem?.totalPrice).toBeGreaterThan(0);
    });

    it('should include separate gas meter cost when selected', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'separate',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      const gasMeterItem = result.lineItems.find(item => 
        item.description.includes('Gas Meter')
      );

      expect(gasMeterItem).toBeDefined();
      expect(gasMeterItem?.totalPrice).toBeGreaterThan(0);
    });

    it('should always include separate electric meter cost', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      const electricMeterItem = result.lineItems.find(item => 
        item.description.includes('Electric Meter')
      );

      expect(electricMeterItem).toBeDefined();
      expect(electricMeterItem?.totalPrice).toBeGreaterThan(0);
    });
  });

  describe('Add-ons Processing', () => {
    it('should include selected add-ons in pricing', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: ['Extra Bathroom', 'Driveway'],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      const addOnItems = result.lineItems.filter(item => 
        item.category === 'Add-Ons' && item.isOptional
      );

      expect(addOnItems.length).toBeGreaterThan(0);
      addOnItems.forEach(item => {
        expect(item.totalPrice).toBeGreaterThan(0);
        expect(item.isOptional).toBe(true);
      });
    });

    it('should not include unselected add-ons', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      const optionalAddOnItems = result.lineItems.filter(item => 
        item.category === 'Add-Ons' && item.isOptional
      );

      expect(optionalAddOnItems).toHaveLength(0);
    });
  });

  describe('Price Overrides', () => {
    it('should apply base price override when provided', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
        priceOverrides: {
          basePricePerSqFt: 500,
        },
      };

      const result = pricingEngine.calculateProposal(inputs);
      const baseConstructionItem = result.lineItems.find(item => 
        item.category === 'Base Construction'
      );

      expect(baseConstructionItem).toBeDefined();
      expect(baseConstructionItem?.unitPrice).toBe(500);
      expect(baseConstructionItem?.description).toContain('*'); // Override indicator
    });

    it('should apply design services override when provided', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: true,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
        priceOverrides: {
          designServices: 15000,
        },
      };

      const result = pricingEngine.calculateProposal(inputs);
      const designServiceItem = result.lineItems.find(item => 
        item.category === 'Design Services'
      );

      expect(designServiceItem).toBeDefined();
      expect(designServiceItem?.unitPrice).toBe(15000);
      expect(designServiceItem?.description).toContain('*'); // Override indicator
    });

    it('should apply markup percentage override when provided', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
        priceOverrides: {
          markupPercentage: 0.25, // 25%
        },
      };

      const result = pricingEngine.calculateProposal(inputs);

      expect(result.markupPercentage).toBe(0.25);
      expect(result.markupAmount).toBe(result.totalBeforeMarkup * 0.25);
      expect(result.grandTotal).toBe(result.totalBeforeMarkup + result.markupAmount);
    });
  });

  describe('Pricing Calculations', () => {
    it('should correctly calculate subtotal from line items', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'separate',
          gasMeter: 'separate',
          electricMeter: 'separate',
        },
        needsDesign: true,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: ['Basic Landscaping'],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      const calculatedSubtotal = result.lineItems.reduce((sum, item) => sum + item.totalPrice, 0);

      expect(result.subtotal).toBe(calculatedSubtotal);
      expect(result.totalBeforeMarkup).toBe(result.subtotal);
    });

    it('should correctly calculate markup and grand total', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      const expectedMarkupAmount = result.subtotal * result.markupPercentage;
      const expectedGrandTotal = result.subtotal + expectedMarkupAmount;

      expect(result.markupAmount).toBeCloseTo(expectedMarkupAmount, 2);
      expect(result.grandTotal).toBeCloseTo(expectedGrandTotal, 2);
    });

    it('should correctly calculate price per square foot', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      const expectedPricePerSqFt = result.grandTotal / inputs.squareFootage;

      expect(result.pricePerSqFt).toBeCloseTo(expectedPricePerSqFt, 2);
    });
  });

  describe('Helper Methods', () => {
    it('should return ADU type options', () => {
      const options = pricingEngine.getAduTypeOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it('should return utility options', () => {
      const options = pricingEngine.getUtilityOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it('should return add-on options', () => {
      const options = pricingEngine.getAddOnOptions();
      expect(Array.isArray(options)).toBe(true);
      expect(options.length).toBeGreaterThan(0);
    });

    it('should return design services info', () => {
      const services = pricingEngine.getDesignServices();
      expect(services).toBeDefined();
      expect(typeof services.planningDesign).toBe('number');
      expect(typeof services.description).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should handle minimum square footage', () => {
      const inputs: PricingInputs = {
        squareFootage: 200,
        aduType: 'detached',
        stories: 1,
        bedrooms: 0,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: [],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      expect(result.grandTotal).toBeGreaterThan(0);
    });

    it('should handle maximum square footage', () => {
      const inputs: PricingInputs = {
        squareFootage: 1200,
        aduType: 'detached',
        stories: 2,
        bedrooms: 3,
        bathrooms: 3,
        utilities: {
          waterMeter: 'separate',
          gasMeter: 'separate',
          electricMeter: 'separate',
        },
        needsDesign: true,
        appliancesIncluded: true,
        hvacType: 'central-ac',
        selectedAddOns: ['Extra Bathroom', 'Driveway', 'Basic Landscaping'],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      expect(result.grandTotal).toBeGreaterThan(0);
      expect(result.lineItems.length).toBeGreaterThanOrEqual(5); // Base + utilities + design + add-ons
    });

    it('should handle invalid add-on names gracefully', () => {
      const inputs: PricingInputs = {
        squareFootage: 600,
        aduType: 'detached',
        stories: 1,
        bedrooms: 1,
        bathrooms: 1,
        utilities: {
          waterMeter: 'shared',
          gasMeter: 'shared',
          electricMeter: 'separate',
        },
        needsDesign: false,
        appliancesIncluded: true,
        hvacType: 'mini-split',
        selectedAddOns: ['NonExistentAddOn', 'AnotherFakeAddOn'],
        sewerConnection: 'existing-lateral',
        solarDesign: false,
        femaIncluded: false,
      };

      const result = pricingEngine.calculateProposal(inputs);
      
      // Should not crash, and should not include the invalid add-ons
      expect(result).toBeDefined();
      const addOnItems = result.lineItems.filter(item => 
        item.category === 'Add-Ons' && item.isOptional
      );
      expect(addOnItems).toHaveLength(0);
    });
  });
});