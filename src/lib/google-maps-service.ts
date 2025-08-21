/**
 * Google Maps service for satellite imagery (placeholder)
 */

export async function getSafePropertyImage(address: string): Promise<string | null> {
  console.warn('Google Maps service not configured - returning null for address:', address);
  // In a real implementation, this would call Google Maps Static API
  // For now, return null so the PDF generation continues without satellite images
  return null;
}

export function createGoogleMapsService() {
  console.warn('Google Maps service not configured');
  return null;
}

export class GoogleMapsService {
  constructor(_apiKey: string) {
    console.warn('GoogleMapsService created but not functional without proper configuration');
  }
  
  async getSatelliteImage(): Promise<string | null> {
    return null;
  }
  
  async getHeaderSatelliteImage(): Promise<string | null> {
    return null;
  }
}