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
      additionalNotes: formData.additionalNotes,
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

    console.log('Calculated pricing:', {
      grandTotal: calculation.grandTotal,
      pricePerSqFt: calculation.pricePerSqFt,
    });

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
      ADU_TYPE: this.getAduTypeDisplay(formData.project.aduType),

      // Pricing (formatted to match HTML design)
      DESIGN_PRICE: '12,500',
      CONSTRUCTION_SUBTOTAL: calculation.totalBeforeMarkup.toLocaleString(),
      GRAND_TOTAL: calculation.grandTotal.toLocaleString(),
      COST_PER_SQFT: Math.round(calculation.pricePerSqFt).toString(),

      // Milestone Payments (formatted for HTML template)
      MILESTONE_1: `$${milestones[0]?.amount.toLocaleString() || '20,000'}`,
      MILESTONE_2: `$${milestones[1]?.amount.toLocaleString() || '20,000'}`,
      MILESTONE_3: `$${milestones[2]?.amount.toLocaleString() || '20,000'}`,
      MILESTONE_4: `$${milestones[3]?.amount.toLocaleString() || '15,000'}`,
      MILESTONE_5: `$${milestones[4]?.amount.toLocaleString() || '15,000'}`,
      MILESTONE_6: `$${milestones[5]?.amount.toLocaleString() || '9,000'}`,
      MILESTONE_7: `$${milestones[6]?.amount.toLocaleString() || '5,000'}`,
      DRYWALL_COST: `$${milestones[5]?.amount.toLocaleString() || '5,000'}`,
      PROPERTY_FINAL: `$${milestones[6]?.amount.toLocaleString() || '0'}`,

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

  private getAduTypeDisplay(aduType: string): string {
    switch (aduType) {
      case 'detached':
        return 'Detached ADU';
      case 'attached':
        return 'Attached ADU';
      case 'junior-adu':
        return 'Garage Conversion';
      case 'detached-1story':
        return 'Detached 1-Story';
      case 'detached-2story':
        return 'Detached 2-Story';
      default:
        return 'Custom ADU';
    }
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
    // Improved template with better print layout controls
    const template =
      '<!DOCTYPE html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"><title>ADU Construction Proposal - Anchor Builders</title><style>@import url(\'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap\');*{margin:0;padding:0;box-sizing:border-box}@page{size:A4;margin:20mm 15mm;orphans:4;widows:4}body{font-family:\'Inter\',\'Arial\',sans-serif;line-height:1.4;color:#374151;background:white;font-size:12px}.proposal-container{max-width:180mm;margin:0 auto;background:white;min-height:250mm}.section-divider{height:1px;background:linear-gradient(to right,transparent,#e5e7eb 20%,#e5e7eb 80%,transparent);margin:10px 0}.section-divider.thick{height:2px;background:linear-gradient(to right,transparent,#d1d5db 20%,#d1d5db 80%,transparent);margin:14px 0}.header{background:linear-gradient(135deg,#3b82f6 0%,#60a5fa 100%);color:white;padding:15px 25px;margin-bottom:0;border-radius:0 0 8px 8px}.header-top{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px}.header-left{display:flex;align-items:center;gap:15px}.logo-section{display:flex;align-items:center}.anchor-icon{width:40px;height:40px;background:rgba(255,255,255,0.15);border:1px solid rgba(255,255,255,0.25);border-radius:8px;display:flex;align-items:center;justify-content:center;color:white;font-size:20px;margin-right:10px}.company-info{line-height:1.1}.company-name{font-size:24px;font-weight:600;letter-spacing:-0.3px}.company-tagline{font-size:9px;opacity:0.85;font-weight:400;letter-spacing:1.5px;text-transform:uppercase}.header-property-image{border:2px solid rgba(255,255,255,0.3);border-radius:6px;overflow:hidden;background:rgba(255,255,255,0.1);width:120px}.header-image{width:120px;height:80px;background:rgba(255,255,255,0.1);display:flex;align-items:center;justify-content:center;color:white;font-size:8px;text-align:center;line-height:1.2;border-bottom:1px solid rgba(255,255,255,0.2)}.header-image img{width:100%;height:100%;object-fit:cover}.header-image-caption{padding:3px 5px;background:rgba(255,255,255,0.15);font-size:7px;color:white;font-weight:500;text-align:center}.header-contact{text-align:right;font-size:9px;line-height:1.2;opacity:0.9}.proposal-title{text-align:center;border-top:1px solid rgba(255,255,255,0.15);border-bottom:1px solid rgba(255,255,255,0.15);padding:12px 0}.proposal-title h1{font-size:28px;font-weight:600;margin-bottom:3px;letter-spacing:-0.8px}.proposal-title h2{font-size:12px;font-weight:300;opacity:0.85;letter-spacing:0.8px}.proposal-meta{display:flex;justify-content:space-between;align-items:center;margin-top:12px;font-size:9px}.proposal-date{background:rgba(255,255,255,0.12);padding:5px 12px;border-radius:15px;font-weight:500}.project-info{padding:15px 28px;background:#f8fafc}.info-header{text-align:center;margin-bottom:18px}.info-header h3{color:#4f46e5;font-size:18px;font-weight:600;margin-bottom:3px}.info-subtitle{color:#6b7280;font-size:11px}.info-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.info-card{background:white;border:1px solid #e5e7eb;border-radius:6px;padding:18px;box-shadow:0 1px 3px rgba(0,0,0,0.05)}.info-card h4{color:#4f46e5;font-size:12px;font-weight:600;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.4px;border-bottom:1px solid #e0e7ff;padding-bottom:4px}.info-row{display:flex;justify-content:space-between;margin-bottom:6px;padding:2px 0}.info-label{font-weight:500;color:#6b7280;font-size:10px}.info-value{font-weight:400;color:#374151;font-size:10px}.price-section{padding:15px 28px;background:white}.price-header{text-align:center;margin-bottom:18px}.price-header h3{color:#4f46e5;font-size:18px;font-weight:600;margin-bottom:3px}.price-subtitle{color:#6b7280;font-size:11px}.price-table-container{background:white;border:1px solid #e5e7eb;border-radius:6px;overflow:hidden;margin-bottom:15px}.price-table{width:100%;border-collapse:collapse}.price-table th{background:#4f46e5;color:white;padding:10px 12px;text-align:left;font-size:11px;font-weight:600;letter-spacing:0.2px}.price-table th:last-child{text-align:right}.price-table td{padding:5px 12px;border-bottom:1px solid #f3f4f6;font-size:10px;vertical-align:top;line-height:1.3}.price-table tr:nth-child(even){background:#f9fafb}.phase-header{background:#f3f4f6!important;font-weight:600!important;color:#4b5563!important;text-transform:uppercase;letter-spacing:0.3px}.phase-header.design{background:#fef7cd!important;color:#92400e!important}.phase-header.coordination{background:#f3e8ff!important;color:#7c3aed!important}.phase-header.construction{background:#dbeafe!important;color:#1d4ed8!important}.subtotal-row{background:#f9fafb!important;font-weight:600!important;border-top:1px solid #e5e7eb!important;border-bottom:1px solid #e5e7eb!important}.total-row{background:#4f46e5!important;color:white!important;font-weight:700!important;font-size:12px!important}.price-right{text-align:right;font-weight:600}.price-included{color:#059669;font-style:italic}.footer{background:#4f46e5;color:white;padding:15px 28px;border-radius:8px 8px 0 0}.footer-info{display:flex;justify-content:space-between;align-items:center;margin-bottom:15px;padding-bottom:12px;border-bottom:1px solid rgba(255,255,255,0.15)}.company-details{font-size:10px;line-height:1.4}.company-details strong{font-size:12px;display:block;margin-bottom:2px}.website-info{text-align:right;font-size:10px}.website-info strong{font-size:11px}.signature-section{background:white;color:#374151;padding:18px;margin-top:12px;border:1px solid rgba(255,255,255,0.25);border-radius:5px}.signature-header{background:#6b7280;color:white;padding:8px;text-align:center;margin:-18px -18px 15px -18px;font-size:11px;font-weight:600;letter-spacing:0.3px}.acceptance-text{font-size:10px;line-height:1.4;text-align:center;margin-bottom:20px;padding:12px;background:#f9fafb;border:1px solid #e5e7eb;border-radius:5px}.signature-grid{display:grid;grid-template-columns:1fr 1fr;gap:30px}.signature-field{text-align:center}.signature-line{border-bottom:1px solid #6b7280;height:30px;margin-bottom:6px}.signature-label{font-size:9px;color:#6b7280;font-weight:500}.terms-text{margin-top:15px;font-size:8px;line-height:1.3;color:rgba(255,255,255,0.85)}.terms-text p{margin-bottom:6px}.terms-text strong{color:white;font-weight:600}.details-section{background:#f8fafc;border:1px solid #e5e7eb;border-radius:6px;padding:14px;margin-bottom:16px}.details-section h4{color:#4f46e5;font-size:11px;font-weight:600;margin-bottom:12px;text-transform:uppercase;letter-spacing:0.4px;border-bottom:1px solid #e0e7ff;padding-bottom:4px}.details-grid{display:grid;grid-template-columns:1fr 1fr;gap:20px}.details-card{background:white;border:1px solid #e2e8f0;border-radius:6px;padding:14px}.details-card h5{color:#6b7280;font-size:10px;font-weight:600;margin-bottom:10px;text-transform:uppercase;letter-spacing:0.3px}.details-card ul{list-style:none;font-size:9px;line-height:1.5}.details-card li{margin-bottom:4px;padding-left:8px;position:relative}.details-card li:before{content:"•";color:#4f46e5;font-weight:bold;position:absolute;left:0}@media print{body{font-size:11px;-webkit-print-color-adjust:exact;color-adjust:exact;margin:0;line-height:1.4}.proposal-container{box-shadow:none;max-width:180mm;width:180mm;margin:0 auto;padding:0}.price-table th,.phase-header,.total-row,.header,.footer,.signature-section .signature-header{-webkit-print-color-adjust:exact;color-adjust:exact}.section-divider{margin:8px 0}.section-divider.thick{margin:12px 0;page-break-after:avoid}.project-info,.price-section{padding:15px 20px}.header{padding:15px 20px;page-break-inside:avoid;page-break-after:avoid}.footer{page-break-inside:avoid;margin-top:24px}h3{margin-bottom:12px!important;font-size:16px!important}.info-header,.price-header{margin-bottom:16px!important}.price-table th{font-size:10px!important;padding:8px 10px!important}.price-table td{font-size:10px!important;padding:6px 10px!important;line-height:1.4!important}.details-card ul{font-size:10px!important;line-height:1.6!important}.details-card h5{font-size:11px!important}.terms-text{font-size:9px!important;line-height:1.4!important}.signature-section{padding:20px!important}.page-break{page-break-before:always}.page-break-avoid{page-break-inside:avoid}.timeline-section{page-break-inside:avoid;margin-bottom:20px}.price-section{page-break-before:always;page-break-inside:avoid;page-break-after:avoid}.details-section{page-break-inside:avoid;margin-bottom:24px;page-break-before:auto}.price-table-container{page-break-inside:avoid;page-break-before:auto}.details-grid{page-break-inside:avoid}.signature-section{page-break-inside:avoid;margin-top:20px;page-break-before:auto}.terms-text{page-break-inside:avoid}.price-table{page-break-inside:auto;border-collapse:collapse}.price-table thead{display:table-header-group}.price-table tbody{page-break-inside:auto}.price-table tr{page-break-inside:avoid;page-break-after:auto}.price-table tr.phase-header{page-break-after:avoid}.price-table tr.subtotal-row{page-break-before:avoid;page-break-after:avoid}.price-table tr.total-row{page-break-before:avoid;page-break-inside:avoid}.price-table tbody tr:last-child{page-break-after:avoid}.project-info{page-break-after:avoid;page-break-inside:avoid}.scope-section{page-break-before:avoid;page-break-after:avoid;page-break-inside:avoid}.timeline-wrapper{page-break-inside:avoid;margin:20px 0;page-break-after:avoid}.footer-info{page-break-inside:avoid}.project-scope-section{page-break-before:auto;page-break-inside:avoid;margin-bottom:20px}.testing-requirements{page-break-inside:avoid;page-break-before:auto;margin-top:20px}.enhancement-options{page-break-inside:avoid;page-break-before:auto}.large-content-section{page-break-before:auto;page-break-inside:avoid}.content-section-break{page-break-before:always}}</style></head><body><div class="proposal-container"><div class="header"><div class="header-top"><div class="header-left"><div class="logo-section"><div class="anchor-icon">⚓</div><div class="company-info"><div class="company-name">ANCHOR</div><div class="company-tagline">BUILDERS</div></div></div><div class="header-contact"><strong>12962 Main Street, Garden Grove, CA 92840</strong><br>Licensed General Contractor • CSLB# 1029392<br>Phone: (714) 555-0123 • www.AnchorBuilders.io</div></div><div class="header-property-image"><div class="header-image"><div>Project Site<br><span style="font-size: 7px;">Satellite View</span></div></div><div class="header-image-caption">Property Location</div></div></div><div class="proposal-title"><h1>ADU CONSTRUCTION PROPOSAL</h1><h2>Accessory Dwelling Unit Development</h2></div><div class="proposal-meta"><div style="font-size: 10px; opacity: 0.8;">Professional ADU Construction Services</div><div class="proposal-date">{{PROPOSAL_DATE}}</div></div></div><div class="section-divider thick"></div><div class="project-info"><div class="info-header"><h3>PROJECT INFORMATION</h3><div class="info-subtitle">Client Details & Property Specifications</div></div><div style="background: white; border: 1px solid #e5e7eb; border-radius: 6px; padding: 16px; box-shadow: 0 1px 3px rgba(0,0,0,0.05);"><div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; font-size: 10px;"><div><h4 style="color: #4f46e5; font-size: 11px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #e0e7ff; padding-bottom: 3px;">Client Information</h4><div style="margin-bottom: 4px;"><span style="font-weight: 500; color: #6b7280; display: inline-block; width: 45px;">NAME:</span><span style="font-weight: 400; color: #374151;">{{CLIENT_FIRST_NAME}} {{CLIENT_LAST_NAME}}</span></div><div style="margin-bottom: 4px;"><span style="font-weight: 500; color: #6b7280; display: inline-block; width: 45px;">PHONE:</span><span style="font-weight: 400; color: #374151;">{{CLIENT_PHONE}}</span></div><div style="margin-bottom: 4px;"><span style="font-weight: 500; color: #6b7280; display: inline-block; width: 45px;">EMAIL:</span><span style="font-weight: 400; color: #374151;">{{CLIENT_EMAIL}}</span></div></div><div><h4 style="color: #4f46e5; font-size: 11px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #e0e7ff; padding-bottom: 3px;">Property Information</h4><div style="margin-bottom: 4px;"><span style="font-weight: 500; color: #6b7280; display: inline-block; width: 55px;">ADDRESS:</span><span style="font-weight: 400; color: #374151;">{{PROJECT_ADDRESS}}</span></div><div style="margin-bottom: 4px;"><span style="font-weight: 500; color: #6b7280; display: inline-block; width: 55px;">CITY:</span><span style="font-weight: 400; color: #374151;">{{PROJECT_CITY}}, {{PROJECT_STATE}} {{PROJECT_ZIP}}</span></div><div style="margin-bottom: 4px;"><span style="font-weight: 500; color: #6b7280; display: inline-block; width: 55px;">COUNTY:</span><span style="font-weight: 400; color: #374151;">Orange County</span></div></div><div><h4 style="color: #4f46e5; font-size: 11px; font-weight: 600; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.4px; border-bottom: 1px solid #e0e7ff; padding-bottom: 3px;">Project Details</h4><div style="margin-bottom: 4px;"><span style="font-weight: 500; color: #6b7280; display: inline-block; width: 70px;">DATE:</span><span style="font-weight: 400; color: #374151;">{{PROPOSAL_DATE}}</span></div><div style="margin-bottom: 4px;"><span style="font-weight: 500; color: #6b7280; display: inline-block; width: 70px;">JURISDICTION:</span><span style="font-weight: 400; color: #374151;">City of {{PROJECT_CITY}}</span></div><div style="margin-bottom: 4px;"><span style="font-weight: 500; color: #6b7280; display: inline-block; width: 70px;">PERMIT TYPE:</span><span style="font-weight: 400; color: #374151;">ADU Construction</span></div></div></div></div></div><div class="section-divider"></div><div style="padding: 15px 28px; background: white;"><div style="text-align: center; margin-bottom: 18px;"><h3 style="color: #4f46e5; font-size: 18px; font-weight: 600;">PROJECT SCOPE & SPECIFICATIONS</h3><div style="color: #6b7280; font-size: 11px; font-style: italic;">Complete ADU Construction & Development Services</div></div><div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px; margin-bottom: 20px;"><div style="text-align: center; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 15px 12px; border-radius: 6px;"><div style="font-size: 16px; font-weight: 600; color: #4f46e5; margin-bottom: 4px;">{{BEDROOMS}} BR / {{BATHROOMS}} BA</div><div style="font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.4px;">Bedrooms / Bathrooms</div></div><div style="text-align: center; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 15px 12px; border-radius: 6px;"><div style="font-size: 16px; font-weight: 600; color: #4f46e5; margin-bottom: 4px;">{{SQUARE_FOOTAGE}} sq ft</div><div style="font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.4px;">Total Living Area</div></div><div style="text-align: center; background: #f1f5f9; border: 1px solid #e2e8f0; padding: 15px 12px; border-radius: 6px;"><div style="font-size: 16px; font-weight: 600; color: #4f46e5; margin-bottom: 4px;">{{ADU_TYPE}}</div><div style="font-size: 9px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.4px;">ADU Configuration</div></div></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;"><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;"><h4 style="color: #4f46e5; font-size: 11px; font-weight: 600; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.4px;">Included Features & Systems</h4><ul style="list-style: none; font-size: 9px; line-height: 1.4;"><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Standardized finishes & fixtures from curated material selection</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Central HVAC system with energy-efficient controls</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Separate electrical panel with dedicated 200-amp service</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Shared utility connections (gas & water meter setup)</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Custom kitchen cabinetry with soft-close doors & drawers</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Bathroom vanity with integrated storage solutions</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Complete appliance package: range, hood, dishwasher, sink</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Connection to existing lateral sewer system</li></ul></div><div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px;"><h4 style="color: #4f46e5; font-size: 11px; font-weight: 600; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.4px;">Professional Services</h4><ul style="list-style: none; font-size: 9px; line-height: 1.4;"><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Architectural design & detailed construction drawings</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Structural engineering for foundation & roof systems</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• MEP engineering (Mechanical, Electrical, Plumbing)</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Title 24 energy compliance calculations & certification</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Zoning analysis & site planning review</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Building permit coordination & plan check services</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Professional project management & construction oversight</li><li style="margin-bottom: 5px; padding-left: 10px; position: relative;">• Quality assurance inspections & final walkthrough</li></ul></div></div></div><div class="section-divider thick"></div><div class="price-section page-break-avoid"><div class="price-header"><h3>DETAILED COST BREAKDOWN</h3><div class="price-subtitle">Comprehensive pricing with transparent line items</div></div><div class="price-table-container"><table class="price-table"><thead><tr><th style="width: 70%;">Description of Services</th><th style="width: 30%; text-align: right;">Cost</th></tr></thead><tbody><tr class="phase-header design"><td colspan="2"><strong>DESIGN & PLANNING PHASE</strong></td></tr><tr><td>Architectural Design & ADU Plans</td><td class="price-right">${{DESIGN_PRICE}}</td></tr><tr><td>Structural Engineering (Foundation & Roof Plans)</td><td class="price-right price-included">included</td></tr><tr><td>MEP Engineering (Mechanical, Electrical, Plumbing)</td><td class="price-right price-included">included</td></tr><tr><td>Zoning & Site Planning Review</td><td class="price-right price-included">included</td></tr><tr><td>Title 24 Energy Compliance Calculations</td><td class="price-right price-included">included</td></tr><tr class="subtotal-row"><td><strong>Design & Planning Subtotal</strong></td><td class="price-right"><strong>${{DESIGN_PRICE}}</strong></td></tr><tr class="phase-header coordination"><td colspan="2"><strong>COORDINATION SERVICES</strong></td></tr><tr><td>Plan Check Coordination</td><td class="price-right">$0</td></tr><tr><td>Building Permit Coordination</td><td class="price-right">$0</td></tr><tr><td>Utility & Public Works Coordination</td><td class="price-right">$0</td></tr><tr><td>Solar Integration Coordination</td><td class="price-right">$0</td></tr><tr class="phase-header construction"><td colspan="2"><strong>CONSTRUCTION PHASE</strong></td></tr><tr><td>Project Deposit & Mobilization</td><td class="price-right">{{MILESTONE_1}}</td></tr><tr><td>Interior Design & Finish Selection</td><td class="price-right">{{MILESTONE_2}}</td></tr><tr><td>Site Mobilization & Preparation</td><td class="price-right">{{MILESTONE_3}}</td></tr><tr><td>Trenching & Underground Plumbing</td><td class="price-right">{{MILESTONE_4}}</td></tr><tr><td>Foundation & Structural Work</td><td class="price-right">{{MILESTONE_5}}</td></tr><tr><td>Framing & Structural Assembly</td><td class="price-right">{{MILESTONE_6}}</td></tr><tr><td>MEP Installation (Mechanical, Electrical, Plumbing)</td><td class="price-right">{{MILESTONE_7}}</td></tr><tr><td>Drywall Installation & Finishing</td><td class="price-right">{{DRYWALL_COST}}</td></tr><tr><td>Final Finishes & Project Completion</td><td class="price-right">{{PROPERTY_FINAL}}</td></tr><tr class="subtotal-row"><td><strong>Construction Subtotal (without add-on work)</strong></td><td class="price-right"><strong>${{CONSTRUCTION_SUBTOTAL}}</strong></td></tr><tr class="total-row"><td><strong>TOTAL PROJECT INVESTMENT</strong></td><td class="price-right"><strong>${{GRAND_TOTAL}}</strong></td></tr></tbody></table></div><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; margin-top: 15px;"><div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; text-align: center;"><div style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px;">Cost Per Square Foot</div><div style="font-size: 20px; font-weight: 600; color: #4f46e5; margin-bottom: 4px;">${{COST_PER_SQFT}}</div><div style="font-size: 9px; color: #6b7280;">(excluding design & coordination)</div></div><div style="background: #f1f5f9; border: 1px solid #e2e8f0; border-radius: 6px; padding: 15px; text-align: center;"><div style="font-size: 10px; color: #6b7280; text-transform: uppercase; letter-spacing: 0.4px; margin-bottom: 6px;">Payment Terms</div><div style="font-size: 20px; font-weight: 600; color: #4f46e5; margin-bottom: 4px;">30 Days</div><div style="font-size: 9px; color: #6b7280;">Proposal validity period</div></div></div></div><div class="section-divider thick"></div><div style="padding: 15px 28px; background: #f8fafc;"><div style="text-align: center; margin-bottom: 20px;"><h3 style="color: #4f46e5; font-size: 16px; font-weight: 600; margin-bottom: 3px;">PROJECT TIMELINE & DELIVERY SCHEDULE</h3><div style="color: #6b7280; font-size: 10px;">Estimated phases subject to city permitting and material availability</div></div><div style="position: relative; display: flex; justify-content: space-between; align-items: center; margin: 25px 0; padding: 0 40px;"><div style="position: absolute; top: 50%; left: 40px; right: 40px; height: 3px; background: linear-gradient(to right, #60a5fa, #4f46e5, #8b5cf6); border-radius: 2px; transform: translateY(-50%); z-index: 1;"></div><div style="position: relative; z-index: 2; text-align: center; background: white; padding: 15px 8px; border-radius: 8px; border: 2px solid #60a5fa; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); min-width: 120px; background: linear-gradient(135deg, #dbeafe, #f0f9ff);"><div style="width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 14px; color: white; font-weight: 700; background: linear-gradient(135deg, #60a5fa, #3b82f6);">1</div><div style="font-weight: 600; color: #374151; font-size: 11px; margin-bottom: 3px;">Design Phase</div><div style="font-size: 9px; color: #6b7280; font-weight: 500;">21 business days</div><div style="font-size: 8px; color: #9ca3af; margin-top: 2px; line-height: 1.2;">Plans & Engineering</div></div><div style="position: relative; z-index: 2; text-align: center; background: white; padding: 15px 8px; border-radius: 8px; border: 2px solid #4f46e5; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); min-width: 120px; background: linear-gradient(135deg, #e0e7ff, #f0f4ff);"><div style="width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 14px; color: white; font-weight: 700; background: linear-gradient(135deg, #4f46e5, #3730a3);">2</div><div style="font-weight: 600; color: #374151; font-size: 11px; margin-bottom: 3px;">Planning & Permits</div><div style="font-size: 9px; color: #6b7280; font-weight: 500;">3-4 months</div><div style="font-size: 8px; color: #9ca3af; margin-top: 2px; line-height: 1.2;">City Approvals</div></div><div style="position: relative; z-index: 2; text-align: center; background: white; padding: 15px 8px; border-radius: 8px; border: 2px solid #8b5cf6; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); min-width: 120px; background: linear-gradient(135deg, #ede9fe, #f5f3ff);"><div style="width: 35px; height: 35px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 8px; font-size: 14px; color: white; font-weight: 700; background: linear-gradient(135deg, #8b5cf6, #7c3aed);">3</div><div style="font-weight: 600; color: #374151; font-size: 11px; margin-bottom: 3px;">Construction</div><div style="font-size: 9px; color: #6b7280; font-weight: 500;">4-6 months</div><div style="font-size: 8px; color: #9ca3af; margin-top: 2px; line-height: 1.2;">Build & Completion</div></div></div><div style="text-align: center; margin-top: 20px; padding: 12px; background: linear-gradient(135deg, #dbeafe, #f0f9ff); border: 1px solid #93c5fd; border-radius: 8px; position: relative; overflow: hidden;"><div style="position: absolute; top: 0; left: 0; right: 0; height: 3px; background: linear-gradient(to right, #60a5fa, #4f46e5, #8b5cf6);"></div><strong style="color: #4f46e5; font-size: 12px; display: block; margin-bottom: 2px;">Total Estimated Project Duration: 8-12 months</strong><div style="font-size: 8px; color: #6b7280; margin-top: 3px;">Timeline may vary based on complexity and permit processing times</div></div></div><div class="section-divider thick"></div><div style="padding: 15px 28px; background: white;"><div style="text-align: center; margin-bottom: 18px;"><h3 style="color: #4f46e5; font-size: 18px; font-weight: 600;">PROJECT DETAILS & OPTIONS</h3><div style="color: #6b7280; font-size: 11px; font-style: italic;">Comprehensive scope & exclusions for your ADU project</div></div><div class="details-grid"><div class="details-card"><h5>Items Not Included</h5><ul><li>New gas & water service connections to street</li><li>Primary electrical service upgrade or panel replacement</li><li>Site drainage modifications or French drain systems</li><li>Hardscape, landscape, or irrigation installation</li><li>Pool/spa electrical or plumbing connections</li><li>Property line setback adjustments or variances</li><li>Soil remediation or hazardous material removal</li><li>Elevator installation for multi-story units</li><li>Smart home automation systems</li><li>Specialty finishes beyond our standard selections</li></ul></div><div class="details-card"><h5>Optional Enhancement Services</h5><ul><li>Premium appliance package upgrade (+$3,500)</li><li>Luxury bathroom fixture package (+$2,800)</li><li>Hardwood flooring throughout (+$4,200)</li><li>Upgraded HVAC system with zoning (+$2,100)</li><li>Smart electrical panel with monitoring (+$1,850)</li><li>Tankless water heater upgrade (+$1,250)</li><li>Custom tile work in kitchen & bath (+$3,200)</li><li>Interior design consultation (3 sessions) (+$450)</li><li>Architectural design modifications (+$850/revision)</li><li>Expedited permit processing coordination (+$750)</li></ul></div></div></div><div class="section-divider"></div><div style="padding: 15px 28px; background: #f8fafc;"><div style="text-align: center; margin-bottom: 18px;"><h3 style="color: #4f46e5; font-size: 18px; font-weight: 600;">ADDITIONAL SCOPE REQUIREMENTS</h3><div style="color: #6b7280; font-size: 11px; font-style: italic;">Testing & compliance for your peace of mind</div></div><div style="background: white; border: 1px solid #e2e8f0; border-radius: 6px; padding: 18px;"><h4 style="color: #4f46e5; font-size: 12px; font-weight: 600; margin-bottom: 12px;">Required Testing & Verification</h4><div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px; font-size: 10px; line-height: 1.5;"><div style="background: #f8fafc; padding: 12px; border-radius: 5px; border-left: 3px solid #4f46e5;"><strong style="color: #4f46e5; display: block; margin-bottom: 8px;">Electrical Testing</strong><ul style="list-style: none; margin-left: 0;"><li style="margin-bottom: 4px;">• Panel load calculation verification</li><li style="margin-bottom: 4px;">• GFCI outlet testing throughout unit</li><li style="margin-bottom: 4px;">• Electrical system grounding verification</li><li style="margin-bottom: 4px;">• Code compliance inspection coordination</li></ul></div><div style="background: #f8fafc; padding: 12px; border-radius: 5px; border-left: 3px solid #4f46e5;"><strong style="color: #4f46e5; display: block; margin-bottom: 8px;">Plumbing & MEP Testing</strong><ul style="list-style: none; margin-left: 0;"><li style="margin-bottom: 4px;">• Water pressure testing & flow verification</li><li style="margin-bottom: 4px;">• Sewer line connection & testing</li><li style="margin-bottom: 4px;">• HVAC system performance verification</li><li style="margin-bottom: 4px;">• Final walkthrough with quality checklist</li></ul></div></div></div></div><div class="section-divider thick"></div><div class="footer"><div class="footer-info"><div class="company-details"><strong>Anchor Builders</strong>12962 Main Street, Garden Grove, CA 92840<br>Licensed General Contractor • CSLB# 1029392<br>Phone: (714) 555-0123 • Email: info@anchorbuilders.io</div><div class="website-info"><strong>www.AnchorBuilders.io</strong><br>Professional ADU Construction<br>Serving Orange County Since 2018</div></div><div class="signature-section"><div class="signature-header">CLIENT ACCEPTANCE & AUTHORIZATION</div><div class="acceptance-text">I, <strong>{{CLIENT_FIRST_NAME}} {{CLIENT_LAST_NAME}}</strong>, acknowledge that I have read and understand the terms and conditions outlined in this proposal. I hereby accept the above scope of work to be completed by Anchor Builders for the total project investment of <strong>${{GRAND_TOTAL}}</strong>.</div><div class="signature-grid"><div class="signature-field"><div class="signature-line"></div><div class="signature-label">Client Signature: {{CLIENT_FIRST_NAME}} {{CLIENT_LAST_NAME}}</div></div><div class="signature-field"><div class="signature-line"></div><div class="signature-label">Date</div></div></div></div><div class="terms-text"><p><strong>TERMS & CONDITIONS:</strong> This proposal is valid for 30 days from the issue date. A formal construction contract will be prepared upon acceptance. Project timeline depends on city permitting, material availability, and client responsiveness.</p><p><strong>CHANGE ORDERS:</strong> Any modifications to scope, materials, or layout must be requested in writing. Approved changes may affect timeline and cost with updated documentation provided.</p><p><strong>IMPORTANT NOTICE:</strong> <em>This is a non-binding estimate. Final cost is subject to plan approval, scope adjustments, and change orders.</em></p><p><strong>DESIGN SERVICES:</strong> Interior Design includes 2 consultation sessions (2 hours each). Additional sessions available at $150 per hour.</p><p><strong>WARRANTY:</strong> All construction work carries a 1-year warranty. Structural elements carry a 10-year warranty as required by California law.</p><p><strong>INSURANCE & BONDING:</strong> Anchor Builders maintains comprehensive general liability insurance and is fully bonded for your protection.</p></div></div></div></body></html>';

    return template;
  }

  private getFallbackTemplate(): string {
    return this.getModernTemplate();
  }
}
