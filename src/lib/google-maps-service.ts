import { googleMapsConfig } from './env-config';

/**
 * Google Maps Static API Service
 * Generates satellite imagery for property addresses in PDF proposals
 */

interface SatelliteImageOptions {
  address: string;
  zoom?: number;
  size?: string;
  mapType?: 'satellite' | 'hybrid' | 'roadmap';
}

interface GoogleMapsConfig {
  apiKey: string;
  baseUrl: string;
}

export class GoogleMapsService {
  private config: GoogleMapsConfig;

  constructor(apiKey: string) {
    this.config = {
      apiKey,
      baseUrl: 'https://maps.googleapis.com/maps/api/staticmap',
    };
  }

  /**
   * Generate satellite image for property address
   * Returns base64 data URI for PDF embedding
   */
  async getSatelliteImage(options: SatelliteImageOptions): Promise<string | null> {
    try {
      const {
        address,
        zoom = googleMapsConfig.defaultZoom,
        size = googleMapsConfig.imageSize,
        mapType = 'hybrid',
      } = options;

      console.log('🗺️ [DEBUG] Google Maps request with size:', size);

      // Build Google Maps Static API URL
      const params = new URLSearchParams({
        center: address,
        zoom: zoom.toString(),
        size: size,
        maptype: mapType,
        key: this.config.apiKey,
        format: 'png',
        markers: 'color:red|' + address,
      });

      const imageUrl = this.config.baseUrl + '?' + params.toString();

      // Fetch image from Google Maps
      const response = await fetch(imageUrl);

      if (!response.ok) {
        console.error('Google Maps API error:', response.status, response.statusText);
        return null;
      }

      // Convert to base64 data URI (browser-compatible)
      const imageBuffer = await response.arrayBuffer();
      const bytes = new Uint8Array(imageBuffer);
      let binary = '';
      for (let i = 0; i < bytes.byteLength; i++) {
        binary += String.fromCharCode(bytes[i]);
      }
      const base64String = btoa(binary);
      const dataUri = 'data:image/png;base64,' + base64String;

      return dataUri;
    } catch (error) {
      console.error('Error fetching satellite image:', error);
      return null;
    }
  }

  /**
   * Generate header-sized satellite image (120x80px for PDF header)
   */
  async getHeaderSatelliteImage(address: string): Promise<string | null> {
    return this.getSatelliteImage({
      address,
      zoom: googleMapsConfig.defaultZoom,
      size: '200x150', // Force smaller size (50% of 400x300)
      mapType: 'hybrid',
    });
  }

  /**
   * Generate full-size satellite image for property showcase
   */
  async getFullSatelliteImage(address: string): Promise<string | null> {
    return this.getSatelliteImage({
      address,
      zoom: googleMapsConfig.defaultZoom - 1,
      size: googleMapsConfig.imageSize,
      mapType: 'hybrid',
    });
  }

  /**
   * Validate Google Maps API key
   */
  async validateApiKey(): Promise<boolean> {
    try {
      const testAddress = '1600 Amphitheatre Parkway, Mountain View, CA';
      const response = await fetch(
        this.config.baseUrl +
          '?center=' +
          encodeURIComponent(testAddress) +
          '&zoom=15&size=100x100&key=' +
          this.config.apiKey
      );
      return response.ok;
    } catch {
      return false;
    }
  }
}

/**
 * Utility function to create Google Maps service instance
 */
export function createGoogleMapsService(): GoogleMapsService | null {
  const apiKey = googleMapsConfig.apiKey;

  console.log('🔧 [DEBUG] Google Maps config check:', {
    hasApiKey: !!apiKey,
    enabled: googleMapsConfig.enabled,
    apiKeyLength: apiKey?.length || 0,
  });

  if (!apiKey || !googleMapsConfig.enabled) {
    console.warn('❌ [DEBUG] Google Maps service not available - API key missing or disabled');
    return null;
  }

  console.log('✅ [DEBUG] Creating Google Maps service instance');
  return new GoogleMapsService(apiKey);
}

/**
 * Helper function to safely get satellite image with fallback
 */
export async function getSafePropertyImage(address: string): Promise<string | null> {
  const mapsService = createGoogleMapsService();

  if (!mapsService) {
    console.warn('Google Maps service not available - API key missing');
    return null;
  }

  try {
    return await mapsService.getHeaderSatelliteImage(address);
  } catch (error) {
    console.error('Failed to get property satellite image:', error);
    return null;
  }
}
