/**
 * Logo utilities for PDF generation
 * Returns the path to the Anchor Builders logo
 * 
 * NOTE: The base64 approach was causing recurring "unterminated string literal" errors
 * because base64 strings are extremely long (often 10,000+ characters) and can break
 * JavaScript parsers when embedded directly in source files.
 * 
 * Solution: Use the actual PNG file from public directory instead.
 * The logo is already available at /anchor-logo-main.png
 */

export function loadAnchorLogoBase64(): string {
  // Return the public path to the logo instead of base64
  // This avoids parser errors and is more maintainable
  return '/anchor-logo-main.png';
}