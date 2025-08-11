/**
 * Template text configuration for PDF generation
 */

interface TemplateText {
  companyName: string;
  tagline: string;
  contactInfo: {
    phone: string;
    email: string;
    website: string;
  };
  legalText: {
    disclaimer: string;
    terms: string;
  };
}

export const defaultTemplateText: TemplateText = {
  companyName: "Anchor Builders",
  tagline: "Building Your Dreams, One Foundation at a Time",
  contactInfo: {
    phone: "(555) 123-4567",
    email: "info@anchorbuilders.io",
    website: "www.anchorbuilders.io"
  },
  legalText: {
    disclaimer: "This proposal is valid for 30 days from the date of issue.",
    terms: "All work performed according to local building codes and regulations."
  }
};

export function getTemplateText(): TemplateText {
  return defaultTemplateText;
}