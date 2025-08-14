/**
 * Centralized pricing storage configuration
 * Single source of truth for storage keys and version
 */

export const STORAGE_KEY = 'anchor-pricing-config';
export const SCHEMA_VERSION = '1.0.0';
export const MIN_PRICE = 100;
export const MAX_PRICE = 50000;

export interface StoredPricing<T = any> {
  schemaVersion: string;
  data: T;
  lastUpdated: string;
  updatedBy?: string;
}

/**
 * Load pricing from localStorage with type safety
 */
export function loadStoredPricing<T>(): StoredPricing<T> | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    
    const parsed = JSON.parse(raw) as StoredPricing<T>;
    
    // Validate schema version
    if (parsed.schemaVersion !== SCHEMA_VERSION) {
      console.warn(`⚠️ Schema version mismatch: expected ${SCHEMA_VERSION}, got ${parsed.schemaVersion}`);
      return null;
    }
    
    return parsed;
  } catch (error) {
    console.error('Failed to load stored pricing:', error);
    return null;
  }
}

/**
 * Save pricing to localStorage
 */
export function saveStoredPricing<T>(data: T, updatedBy = 'Admin'): boolean {
  try {
    const toStore: StoredPricing<T> = {
      schemaVersion: SCHEMA_VERSION,
      data,
      lastUpdated: new Date().toISOString(),
      updatedBy
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(toStore));
    
    // Dispatch update event
    window.dispatchEvent(new CustomEvent('anchor:pricing-updated'));
    
    return true;
  } catch (error) {
    console.error('Failed to save pricing:', error);
    return false;
  }
}