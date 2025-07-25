import { AnchorProposalFormData } from '../types/proposal';
import { AnchorPricingEngine } from './pricing-engine';
import { calculateMilestonePayments } from '../data/pricing-config';

export class AnchorPDFTemplateGenerator {
  private templateHtml: string = '';

  constructor() {
    this.loadTemplate();
  }

  private async loadTemplate() {
    // Use embedded modern template instead of fetching
    this.templateHtml = this.getModernTemplate();
  }

  async generateProposal(formData: AnchorProposalFormData): Promise<void> {
    console.log('🚀 [DEBUG] Starting PDF generation with form data:', formData);
    console.log('📊 [DEBUG] Form data details:', {
      client: formData.client,
      project: formData.project,
      additionalNotes: formData.additionalNotes
    });
    
    // Calculate pricing
    const pricingEngine = new AnchorPricingEngine();
    const pricingInputs = {
      squareFootage: formData.project.squareFootage,
      aduType: formData.project.aduType,
      stories: formData.project.stories,
      bedrooms: formData.project.bedrooms,
      bathrooms: formData.project.bathrooms,
      utilities: formData.project.utilities,
      needsDesign: formData.project.needsDesign,
      appliancesIncluded: formData.project.appliancesIncluded,
      hvacType: formData.project.hvacType,
      selectedAddOns: formData.project.selectedAddOns,
      sewerConnection: formData.project.sewerConnection,
      solarDesign: formData.project.solarDesign,
      femaIncluded: formData.project.femaIncluded,
      priceOverrides: formData.project.priceOverrides,
    };

    const calculation = pricingEngine.calculateProposal(pricingInputs);
    const designAmount = formData.project.needsDesign ? 12500 : 0;
    const milestones = calculateMilestonePayments(calculation.grandTotal, designAmount);

    console.log('Calculated pricing:', { grandTotal: calculation.grandTotal, pricePerSqFt: calculation.pricePerSqFt });

    // Prepare template variables (including Google Maps image)
    const templateVars = await this.prepareTemplateVariables(formData, calculation, milestones);
    console.log('📝 [DEBUG] Template variables prepared:');
    console.log('📝 [DEBUG] Template variables keys:', Object.keys(templateVars));
    console.log('📝 [DEBUG] GRAND_TOTAL:', templateVars.GRAND_TOTAL);
    console.log('📝 [DEBUG] COST_PER_SQFT:', templateVars.COST_PER_SQFT);
    console.log('Template variables prepared:', templateVars);

    // Get fresh template HTML
    let processedHtml = this.getModernTemplate();
    console.log('Template loaded, length:', processedHtml.length);

    // Replace variables in template
    Object.entries(templateVars).forEach(([key, value]) => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const beforeCount = (processedHtml.match(regex) || []).length;
      processedHtml = processedHtml.replace(regex, value || '');
      const afterCount = (processedHtml.match(regex) || []).length; 
      if (beforeCount > 0) {
        console.log(`Replaced ${beforeCount} instances of {{${key}}} with "${value}"`);
      }
    });

  // Check for any remaining unreplaced variables
  const remainingVars = processedHtml.match(/{{[^}]+}}/g);
  if (remainingVars) {
    console.warn('⚠️ [DEBUG] Unreplaced template variables found:', remainingVars);
  } else {
    console.log('✅ [DEBUG] All template variables successfully replaced');
  }

  // Handle conditional sections
    processedHtml = this.processConditionalSections(
      processedHtml,
      formData,
      calculation,
      milestones
    );

    console.log('Final processed HTML length:', processedHtml.length);

    // Convert HTML to PDF (using browser's print functionality)
    this.htmlToPdfBlob(processedHtml);
  }

  private async prepareTemplateVariables(
    formData: AnchorProposalFormData,
    calculation: any,
    milestones: any[]
  ): Promise<Record<string, string>> {
    const today = new Date();
    const formattedDate = today.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });

    // Get Google Maps satellite image for property
    const propertyAddress = `${formData.client.address}, ${formData.client.city}, ${formData.client.state} ${formData.client.zipCode}`;
    const satelliteImage = null; // Google Maps integration temporarily disabled

    return {
      // Date
      PROPOSAL_DATE: formattedDate,

      // Client Info
      CLIENT_FIRST_NAME: formData.client.firstName,
      CLIENT_LAST_NAME: formData.client.lastName,
      CLIENT_PHONE: formData.client.phone,
      CLIENT_EMAIL: formData.client.email,

      // Project Info
      PROJECT_ADDRESS: formData.client.address,
      PROJECT_CITY: formData.client.city,
      PROJECT_STATE: formData.client.state,
      PROJECT_ZIP: formData.client.zipCode,

      // Project Details
      BEDROOMS: formData.project.bedrooms.toString(),
      BATHROOMS: formData.project.bathrooms.toString(),
      SQUARE_FOOTAGE: formData.project.squareFootage.toString(),
      ADU_TYPE: formData.project.aduType === 'detached' ? 'Detached (1 Story)' : 'Attached ADU',

      // Utilities
      GAS_WATER_SETUP: this.getUtilitySetupText(formData.project.utilities),

      // Pricing
      DESIGN_PRICE: '12,500',
      CONSTRUCTION_SUBTOTAL: calculation.totalBeforeMarkup.toLocaleString(),
      TOTAL_WITH_ADDONS: calculation.grandTotal.toLocaleString(),
      GRAND_TOTAL: calculation.grandTotal.toLocaleString(),
      COST_PER_SQFT: Math.round(calculation.pricePerSqFt).toString(),
      DEPOSIT: '1,000',

      // Additional
      ADDITIONAL_SCOPE: formData.additionalNotes || 'Standard ADU construction as specified above.',

      // Images with Google Maps integration
      ANCHOR_LOGO_BASE64: this.getAnchorLogoBase64(),
      ADU_PHOTO_BASE64: this.getAduPhotoBase64(),
      PROPERTY_SATELLITE_IMAGE_BASE64: satelliteImage || '', // Google Maps satellite image
    };
  }

  private processConditionalSections(
    html: string,
    formData: AnchorProposalFormData,
    calculation: any,
    milestones: any[]
  ): string {
    // Process Handlebars-style conditionals and loops

    // Design services section
    if (formData.project.needsDesign) {
      html = html.replace(/{{#if NEEDS_DESIGN}}([\s\S]*?){{\/if}}/g, '$1');
    } else {
      html = html.replace(/{{#if NEEDS_DESIGN}}[\s\S]*?{{\/if}}/g, '');
    }

    // Milestone payments
    const milestoneRows = milestones
      .map(
        milestone =>
          `<tr><td>${milestone.name}</td><td></td><td class="price">$ ${milestone.amount.toLocaleString()}</td></tr>`
      )
      .join('');
    html = html.replace(/{{#each MILESTONES}}[\s\S]*?{{\/each}}/g, milestoneRows);

    // Add-ons section
    if (formData.project.selectedAddOns.length > 0) {
      const addOnRows = formData.project.selectedAddOns
        .map(addOnName => {
          const addOn = calculation.lineItems.find((item: any) =>
            item.description.includes(addOnName)
          );
          return addOn
            ? `<tr><td>${addOnName}</td><td>${addOn.description}</td><td class="price">$ ${addOn.totalPrice.toLocaleString()}</td></tr>`
            : '';
        })
        .join('');

      html = html.replace(/{{#if ADD_ONS}}([\s\S]*?){{\/if}}/g, '$1');
      html = html.replace(/{{#each ADD_ONS}}[\s\S]*?{{\/each}}/g, addOnRows);
    } else {
      html = html.replace(/{{#if ADD_ONS}}[\s\S]*?{{\/if}}/g, '');
    }

    // Remove any remaining Handlebars syntax
    html = html.replace(/{{#[\s\S]*?}}[\s\S]*?{{\/[\s\S]*?}}/g, '');
    html = html.replace(/{{[^}]*}}/g, '');

    return html;
  }

  private getUtilitySetupText(utilities: any): string {
    const gas = utilities.gasMeter === 'separate' ? 'Separate gas' : 'Shared gas';
    const water =
      utilities.waterMeter === 'separate'
        ? 'separate water meter setup'
        : 'shared water meter setup';
    return `${gas} & ${water}`;
  }

  private getAnchorLogoBase64(): string {
    // Return base64 encoded logo or placeholder
    // This would be replaced with actual logo data
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjgwIiB2aWV3Qm94PSIwIDAgMjAwIDgwIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjx0ZXh0IHg9IjEwIiB5PSI0MCIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjMWIzNjVkIj5BTkNIT1IgQlVJTERFUlM8L3RleHQ+PC9zdmc+';
  }

  private getAduPhotoBase64(): string {
    // Return base64 encoded ADU photo or placeholder
    // This would be replaced with actual photo data
    return 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjMwMCIgdmlld0JveD0iMCAwIDQwMCAzMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHJlY3Qgd2lkdGg9IjQwMCIgaGVpZ2h0PSIzMDAiIGZpbGw9IiNmNWY1ZjUiLz48dGV4dCB4PSIyMDAiIHk9IjE1MCIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZm9udC1mYW1pbHk9IkFyaWFsIiBmb250LXNpemU9IjE4IiBmaWxsPSIjNjY2Ij5BRFUgSW50ZXJpb3IgUGhvdG88L3RleHQ+PC9zdmc+';
  }

  private htmlToPdfBlob(html: string): void {
    console.log('📄 Final HTML being used for PDF (first 500 chars):', html.substring(0, 500));
    
    // The html parameter already contains the complete modern template with styling
    // No need to wrap it in additional HTML structure
    const completeHtml = html;

    // Create blob and download directly as HTML file (which browsers can "Save as PDF")
    const blob = new Blob([completeHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `Anchor-Builders-ADU-Proposal-${Date.now()}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    // Also open in new window for immediate viewing/printing
    const printWindow = window.open('', '_blank', 'width=1200,height=800');
    if (printWindow) {
      printWindow.document.write(completeHtml);
      printWindow.document.close();
    }
  }

  private getModernTemplate(): string {
    return `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>ADU Construction Proposal - Anchor Builders</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          * { margin: 0; padding: 0; box-sizing: border-box; }
          
          @page { size: letter; margin: 0.5in; }
          
          body {
            font-family: 'Inter', Arial, sans-serif;
            line-height: 1.4;
            color: #374151;
            background: white;
            font-size: 12px;
          }
          
          .proposal-container {
            max-width: 8.5in;
            margin: 0 auto;
            background: white;
            min-height: 11in;
          }
          
          .header {
            background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
            color: white;
            padding: 20px 30px;
            border-radius: 0 0 8px 8px;
          }
          
          .header-top {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
          }
          
          .company-name {
            font-size: 24px;
            font-weight: 600;
            letter-spacing: -0.3px;
          }
          
          .proposal-title {
            text-align: center;
            border-top: 1px solid rgba(255, 255, 255, 0.15);
            padding: 12px 0;
          }
          
          .proposal-title h1 {
            font-size: 28px;
            font-weight: 600;
            margin-bottom: 3px;
          }
          
          .project-info {
            padding: 20px 35px;
            background: #f8fafc;
          }
          
          .info-header h3 {
            color: #4f46e5;
            font-size: 18px;
            font-weight: 600;
            text-align: center;
            margin-bottom: 18px;
          }
          
          .info-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 20px;
          }
          
          .info-card {
            background: white;
            border: 1px solid #e5e7eb;
            border-radius: 6px;
            padding: 18px;
          }
          
          .info-card h4 {
            color: #4f46e5;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 12px;
            text-transform: uppercase;
          }
          
          .info-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 6px;
          }
          
          .info-label {
            font-weight: 500;
            color: #6b7280;
            font-size: 10px;
          }
          
          .info-value {
            font-weight: 400;
            color: #374151;
            font-size: 10px;
          }
          
          @media print {
            body { -webkit-print-color-adjust: exact; color-adjust: exact; }
            .header { -webkit-print-color-adjust: exact; color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="proposal-container">
          <div class="header">
            <div class="header-top">
              <div>
                <div class="company-name">ANCHOR BUILDERS</div>
                <div style="font-size: 9px; opacity: 0.85;">Licensed General Contractor • CSLB# 1029392</div>
              </div>
              <div style="text-align: right; font-size: 9px;">
                12962 Main Street, Garden Grove, CA 92840<br>
                Phone: (714) 555-0123 • www.AnchorBuilders.io
              </div>
            </div>
            
            <div class="proposal-title">
              <h1>ADU CONSTRUCTION PROPOSAL</h1>
              <h2 style="font-size: 12px; font-weight: 300;">Accessory Dwelling Unit Development</h2>
            </div>
            
            <div style="display: flex; justify-content: space-between; margin-top: 12px; font-size: 9px;">
              <div>Professional ADU Construction Services</div>
              <div style="background: rgba(255, 255, 255, 0.12); padding: 5px 12px; border-radius: 15px;">{{PROPOSAL_DATE}}</div>
            </div>
          </div>

          <div class="project-info">
            <div class="info-header">
              <h3>PROJECT INFORMATION</h3>
            </div>
            
            <div class="info-grid">
              <div class="info-card">
                <h4>Client Information</h4>
                <div class="info-row">
                  <span class="info-label">NAME:</span>
                  <span class="info-value">{{CLIENT_FIRST_NAME}} {{CLIENT_LAST_NAME}}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">PHONE:</span>
                  <span class="info-value">{{CLIENT_PHONE}}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">EMAIL:</span>
                  <span class="info-value">{{CLIENT_EMAIL}}</span>
                </div>
              </div>
              
              <div class="info-card">
                <h4>Property Information</h4>
                <div class="info-row">
                  <span class="info-label">ADDRESS:</span>
                  <span class="info-value">{{PROJECT_ADDRESS}}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">CITY:</span>
                  <span class="info-value">{{PROJECT_CITY}}, {{PROJECT_STATE}} {{PROJECT_ZIP}}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">PROJECT:</span>
                  <span class="info-value">{{BEDROOMS}} BR / {{BATHROOMS}} BA • {{SQUARE_FOOTAGE}} sq ft</span>
                </div>
              </div>
            </div>
          </div>

          <div style="padding: 20px 35px; background: white;">
            <div style="text-align: center; margin-bottom: 18px;">
              <h3 style="color: #4f46e5; font-size: 18px; font-weight: 600;">TOTAL PROJECT INVESTMENT</h3>
            </div>
            
            <div style="text-align: center; background: #4f46e5; color: white; padding: 20px; border-radius: 8px;">
              <div style="font-size: 36px; font-weight: 700; margin-bottom: 8px;">\\${{GRAND_TOTAL}}</div>
              <div style="font-size: 14px; opacity: 0.9;">Complete ADU Construction Package</div>
            </div>
            
            <div style="margin-top: 20px; text-align: center; font-size: 11px; color: #6b7280;">
              <p>This proposal includes design, permits, construction, and professional project management.</p>
              <p style="margin-top: 5px;"><strong>Cost per square foot:</strong> \\${{COST_PER_SQFT}} • <strong>Living area:</strong> {{SQUARE_FOOTAGE}} sq ft</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;
  }

  private getFallbackTemplate(): string {
    return this.getModernTemplate();
  }
}
