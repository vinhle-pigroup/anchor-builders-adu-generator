// Pricing Configuration Notifications
// Provides user-friendly popups when pricing is not configured

import { getPricingConfig } from './pricing-config-manager';

export interface PricingNotification {
  message: string;
  action: string;
  type: 'warning' | 'info' | 'error';
}

/**
 * Check if utility pricing is configured
 */
export function checkUtilityPricing(utilityType: 'water' | 'gas' | 'electric'): PricingNotification | null {
  const config = getPricingConfig();
  const utility = config.utilityOptions.find(u => 
    u.name.toLowerCase().includes(utilityType.toLowerCase())
  );

  if (!utility || (utility.separatePrice === 0 && utility.sharedPrice === 0)) {
    return {
      message: `${utilityType.charAt(0).toUpperCase() + utilityType.slice(1)} meter pricing is not configured. Please set pricing in the admin panel before generating proposals.`,
      action: `Configure ${utilityType} pricing`,
      type: 'warning'
    };
  }

  return null;
}

/**
 * Check if HVAC pricing is configured
 */
export function checkHVACPricing(hvacType: 'central-ac' | 'mini-split'): PricingNotification | null {
  const config = getPricingConfig();
  const hvacName = hvacType === 'central-ac' ? 'Central AC System' : 'Mini-Split HVAC System';
  const hvacOption = config.addOnOptions.find(option => 
    option.name === hvacName
  );

  if (!hvacOption || hvacOption.price === 0) {
    return {
      message: `${hvacName} pricing is not configured. Please set pricing in the admin panel before generating proposals.`,
      action: `Configure ${hvacName} pricing`,
      type: 'warning'
    };
  }

  return null;
}

/**
 * Show pricing notification popup
 */
export function showPricingNotification(notification: PricingNotification, onAdminRedirect?: () => void): boolean {
  const message = `⚠️ PRICING NOT CONFIGURED\n\n${notification.message}\n\nWould you like to go to the admin panel now?`;
  
  const userConfirmed = window.confirm(message);
  
  if (userConfirmed && onAdminRedirect) {
    onAdminRedirect();
  }
  
  return userConfirmed;
}

/**
 * Check all utility pricing for project
 */
export function checkProjectUtilityPricing(utilities: {
  waterMeter?: 'shared' | 'separate';
  gasMeter?: 'shared' | 'separate';
  electricMeter?: 'shared' | 'separate';
}): PricingNotification[] {
  const notifications: PricingNotification[] = [];

  if (utilities.waterMeter === 'separate') {
    const waterNotification = checkUtilityPricing('water');
    if (waterNotification) notifications.push(waterNotification);
  }

  if (utilities.gasMeter === 'separate') {
    const gasNotification = checkUtilityPricing('gas');
    if (gasNotification) notifications.push(gasNotification);
  }

  if (utilities.electricMeter === 'separate') {
    const electricNotification = checkUtilityPricing('electric');
    if (electricNotification) notifications.push(electricNotification);
  }

  return notifications;
}

/**
 * Check all HVAC pricing for project
 */
export function checkProjectHVACPricing(hvacType: 'central-ac' | 'mini-split'): PricingNotification | null {
  return checkHVACPricing(hvacType);
}

/**
 * Show multiple notifications at once
 */
export function showMultiplePricingNotifications(notifications: PricingNotification[], onAdminRedirect?: () => void): boolean {
  if (notifications.length === 0) return true;

  const items = notifications.map((notif, index) => `${index + 1}. ${notif.action}`).join('\n');
  const message = `⚠️ MULTIPLE PRICING ITEMS NOT CONFIGURED\n\nThe following pricing items need to be configured:\n\n${items}\n\nWould you like to go to the admin panel to configure these prices?`;
  
  const userConfirmed = window.confirm(message);
  
  if (userConfirmed && onAdminRedirect) {
    onAdminRedirect();
  }
  
  return userConfirmed;
}