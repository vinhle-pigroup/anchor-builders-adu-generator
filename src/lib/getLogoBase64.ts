/**
 * Logo base64 helper for PDF generation
 * Provides base64 encoded logo for embedding in PDFs
 */

/**
 * Get Anchor Builders logo as base64 string
 * Uses the actual PNG logo file from public directory
 */
export function getAnchorLogoBase64(): string {
  // For client-side PDF generation, we'll fetch the logo from public
  // This is a placeholder that returns a transparent 1x1 PNG if logo loading fails
  const fallbackBase64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==';
  
  // In production, the logo should be loaded from /anchor-builders-logo.png
  // This would typically be done asynchronously when the PDF is generated
  console.log('📸 Logo helper: Ready to load /anchor-builders-logo.png');
  
  // For now, return a placeholder - the actual implementation would:
  // 1. Fetch /anchor-builders-logo.png
  // 2. Convert to base64
  // 3. Cache the result
  return fallbackBase64;
}

/**
 * Async version that actually loads the logo from public
 */
export async function loadAnchorLogoBase64(): Promise<string> {
  try {
    const logoUrl = '/anchor-builders-logo.png';
    console.log(`📸 Loading logo from: ${logoUrl}`);
    
    // Fetch the logo
    const response = await fetch(logoUrl);
    if (!response.ok) {
      console.warn('⚠️ Failed to load logo, using fallback');
      return getAnchorLogoBase64();
    }
    
    // Convert to blob then base64
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        // Remove the data:image/png;base64, prefix
        const base64Data = base64String.split(',')[1];
        console.log('✅ Logo loaded successfully (size:', base64Data.length, 'chars)');
        resolve(base64Data);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('❌ Error loading logo:', error);
    return getAnchorLogoBase64();
  }
}

/**
 * Get logo as data URI (includes data:image/png;base64, prefix)
 */
export async function getAnchorLogoDataURI(): Promise<string> {
  const base64 = await loadAnchorLogoBase64();
  return `data:image/png;base64,${base64}`;
}