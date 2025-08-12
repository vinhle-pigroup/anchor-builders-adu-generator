/**
 * Returns the Anchor logo as base64 for PDF embedding
 * This fetches the logo from the public directory and converts it to base64
 */

export async function getAnchorLogoAsBase64(): Promise<string> {
  try {
    // Fetch the image from the public directory
    const response = await fetch('/anchor-logo-main.png');
    if (!response.ok) {
      throw new Error(`Failed to fetch logo: ${response.status}`);
    }
    
    const blob = await response.blob();
    
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // This already includes the data:image/png;base64, prefix
        const base64 = reader.result as string;
        console.log('✅ Logo converted to base64, length:', base64.length);
        resolve(base64);
      };
      reader.onerror = () => {
        console.error('❌ Failed to read logo as base64');
        reject(new Error('Failed to read logo'));
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error('Failed to load logo as base64:', error);
    // Return a simple text-based SVG as fallback
    const svgFallback = `<svg width="200" height="80" xmlns="http://www.w3.org/2000/svg">
      <text x="10" y="40" font-family="Arial" font-size="24" fill="#1e3a8a">ANCHOR BUILDERS</text>
    </svg>`;
    // Convert SVG to base64 without using Buffer (not available in browser)
    const base64Svg = btoa(svgFallback);
    return `data:image/svg+xml;base64,${base64Svg}`;
  }
}