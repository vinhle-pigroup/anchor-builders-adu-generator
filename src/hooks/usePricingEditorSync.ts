/**
 * Hook to sync pricing editor changes with the pricing engine
 * This connects the V2 editor to the actual calculation engine
 */

import { useEffect, useState } from 'react';
import { AnchorPricingEngine } from '../lib/pricing-engine';

interface PricingEditorData {
  aduTypes: any[];
  squareFootage: any[];
  bedrooms: any[];
  bathrooms: any[];
  hvac: any[];
  utilities: any[];
  additionalServices: any[];
  customServices: any[];
  discount: any[];
}

export function usePricingEditorSync() {
  const [pricingEngine] = useState(() => new AnchorPricingEngine(false));
  
  useEffect(() => {
    // Listen for pricing updates from the editor
    const handlePricingUpdate = (event: CustomEvent) => {
      const { pricing } = event.detail;
      
      if (!pricing) return;
      
      // Update the pricing engine configuration
      updatePricingEngine(pricing);
    };
    
    window.addEventListener('anchor:pricing-updated', handlePricingUpdate as EventListener);
    
    return () => {
      window.removeEventListener('anchor:pricing-updated', handlePricingUpdate as EventListener);
    };
  }, [pricingEngine]);
  
  const updatePricingEngine = (editorData: PricingEditorData) => {
    // Map editor data to pricing engine configuration
    const config = {
      // ADU Type base prices
      aduTypePricing: {
        detached: editorData.aduTypes?.find(t => t.key === 'detached')?.value || 240,
        attached: editorData.aduTypes?.find(t => t.key === 'attached')?.value || 240,
        jadu: editorData.aduTypes?.find(t => t.key === 'jadu')?.value || 200,
      },
      
      // Square footage adjustments
      sizeAdjustments: {
        baseRate: editorData.squareFootage?.find(s => s.key === 'baseRate')?.value || 240,
        smallUnitPremium: editorData.squareFootage?.find(s => s.key === 'smallUnitPremium')?.value || 250,
        tinyUnitPremium: editorData.squareFootage?.find(s => s.key === 'tinyUnitPremium')?.value || 260,
      },
      
      // Bathroom pricing
      bathroomPricing: {
        oneHalf: editorData.bathrooms?.find(b => b.key === 'oneHalfBathroom')?.value || 4000,
        two: editorData.bathrooms?.find(b => b.key === 'twoBathroom')?.value || 8000,
      },
      
      // HVAC pricing
      hvacPricing: {
        centralAc: editorData.hvac?.find(h => h.key === 'centralAc')?.value || 0,
        miniSplit: editorData.hvac?.find(h => h.key === 'miniSplit')?.value || 0,
      },
      
      // Utilities pricing
      utilitiesPricing: {
        waterMeterSeparate: editorData.utilities?.find(u => u.key === 'waterMeterSeparate')?.value || 3500,
        gasMeterSeparate: editorData.utilities?.find(u => u.key === 'gasMeterSeparate')?.value || 3500,
        electricMeterSeparate: editorData.utilities?.find(u => u.key === 'electricMeterSeparate')?.value || 0,
        sewerConnection: editorData.utilities?.find(u => u.key === 'sewerConnection')?.value || 0,
        electricalPanel: editorData.utilities?.find(u => u.key === 'electricalPanel')?.value || 3000,
      },
      
      // Additional services pricing
      additionalServicesPricing: {
        designServices: editorData.additionalServices?.find(s => s.key === 'designServices')?.value || 12500,
        solarReady: editorData.additionalServices?.find(s => s.key === 'solarReady')?.value || 0,
        femaCompliance: editorData.additionalServices?.find(s => s.key === 'femaCompliance')?.value || 0,
        extraBathroom: editorData.additionalServices?.find(s => s.key === 'extraBathroom')?.value || 8000,
        dedicatedDriveway: editorData.additionalServices?.find(s => s.key === 'dedicatedDriveway')?.value || 5000,
        basicLandscaping: editorData.additionalServices?.find(s => s.key === 'basicLandscaping')?.value || 10000,
      },
      
      // Custom services
      customServicesPricing: {
        custom1: editorData.customServices?.find(s => s.key === 'custom1')?.value || 0,
        custom2: editorData.customServices?.find(s => s.key === 'custom2')?.value || 0,
        custom3: editorData.customServices?.find(s => s.key === 'custom3')?.value || 0,
      },
      
      // Discount
      discountPricing: {
        friendsAndFamily: editorData.discount?.find(d => d.key === 'friendsAndFamily')?.value || 0.10,
      },
    };
    
    // Store in localStorage for persistence
    localStorage.setItem('anchor-pricing-config-sync', JSON.stringify(config));
    
    // Dispatch event for other components to react
    window.dispatchEvent(new CustomEvent('anchor:pricing-config-changed', {
      detail: { config }
    }));
  };
  
  // Load saved configuration on mount
  useEffect(() => {
    const saved = localStorage.getItem('anchor-pricing-config-sync');
    if (saved) {
      try {
        const config = JSON.parse(saved);
        window.dispatchEvent(new CustomEvent('anchor:pricing-config-changed', {
          detail: { config }
        }));
      } catch (error) {
        console.error('Failed to load saved pricing configuration:', error);
      }
    }
  }, []);
  
  return {
    pricingEngine
  };
}