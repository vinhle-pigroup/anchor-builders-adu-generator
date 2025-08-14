/**
 * Adapter to bridge HOL pricing system with Anchor's pricing structure
 * This allows both systems to work side-by-side during migration
 */

import anchorDefaults from '../data/anchor-pricing-default.json';

// Convert HOL format to Anchor format
export function holToAnchorFormat(holData: any) {
  return {
    basePrices: {
      detached: {
        oneStory: holData.aduTypes?.detachedOneStory?.pricePerSqFt || 240,
        twoStory: holData.aduTypes?.detachedTwoStory?.pricePerSqFt || 250
      },
      attached: {
        oneStory: holData.aduTypes?.attachedOneStory?.pricePerSqFt || 220
      },
      garage: {
        conversion: holData.aduTypes?.garageConversion?.pricePerSqFt || 180
      }
    },
    designServices: {
      oneStory: holData.designServices?.oneStory?.price || 12500,
      twoStory: holData.designServices?.twoStory?.price || 15000
    },
    utilities: {
      waterMeter: holData.utilities?.waterMeter?.price || 3500,
      gasMeter: holData.utilities?.gasMeter?.price || 3500,
      electricMeter: holData.utilities?.electricMeter?.price || 0
    },
    addOns: {
      extraBathroom: holData.addOns?.extraBathroom?.price || 8000,
      dedicatedDriveway: holData.addOns?.dedicatedDriveway?.price || 5000,
      basicLandscaping: holData.addOns?.basicLandscaping?.price || 10000
    },
    hvac: {
      centralAc: holData.hvac?.centralAc?.price || 6000,
      miniSplit: holData.hvac?.miniSplit?.price || 4500
    },
    markup: holData.settings?.markup || 0.0,
    friendsAndFamilyDiscount: holData.settings?.friendsAndFamilyDiscount || 0.1
  };
}

// Convert Anchor format to HOL format
export function anchorToHolFormat(anchorData: any) {
  return {
    aduTypes: {
      detachedOneStory: {
        name: "Detached ADU (1-Story)",
        pricePerSqFt: anchorData.basePrices?.detached?.oneStory || 240
      },
      detachedTwoStory: {
        name: "Detached ADU (2-Story)",
        pricePerSqFt: anchorData.basePrices?.detached?.twoStory || 250
      },
      attachedOneStory: {
        name: "Attached ADU (1-Story)",
        pricePerSqFt: anchorData.basePrices?.attached?.oneStory || 220
      },
      garageConversion: {
        name: "Garage Conversion",
        pricePerSqFt: anchorData.basePrices?.garage?.conversion || 180
      }
    },
    designServices: {
      oneStory: {
        name: "Design Services (1-Story)",
        price: anchorData.designServices?.oneStory || 12500
      },
      twoStory: {
        name: "Design Services (2-Story)",
        price: anchorData.designServices?.twoStory || 15000
      }
    },
    utilities: {
      waterMeter: {
        name: "Separate Water Meter",
        price: anchorData.utilities?.waterMeter || 3500
      },
      gasMeter: {
        name: "Separate Gas Meter",
        price: anchorData.utilities?.gasMeter || 3500
      },
      electricMeter: {
        name: "Separate Electric Meter",
        price: anchorData.utilities?.electricMeter || 0
      }
    },
    addOns: {
      extraBathroom: {
        name: "Extra Bathroom",
        price: anchorData.addOns?.extraBathroom || 8000
      },
      dedicatedDriveway: {
        name: "Dedicated Driveway",
        price: anchorData.addOns?.dedicatedDriveway || 5000
      },
      basicLandscaping: {
        name: "Basic Landscaping",
        price: anchorData.addOns?.basicLandscaping || 10000
      }
    },
    hvac: {
      centralAc: {
        name: "Central AC",
        price: anchorData.hvac?.centralAc || 6000
      },
      miniSplit: {
        name: "Mini-Split System",
        price: anchorData.hvac?.miniSplit || 4500
      }
    },
    settings: {
      markup: anchorData.markup || 0.0,
      friendsAndFamilyDiscount: anchorData.friendsAndFamilyDiscount || 0.1,
      version: "1.0.0"
    }
  };
}

// Get default pricing in HOL format
export function getDefaultHolPricing() {
  return anchorDefaults;
}