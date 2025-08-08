import { jsPDF } from 'jspdf';
import { AnchorProposalFormData, ProposalData } from '../types/proposal';
import { AnchorPricingEngine } from './pricing-engine';
import { PDFTemplateGenerator } from './pdf-template-generator';

export class AnchorPDFGenerator {
  private doc: jsPDF;
  private currentY: number = 20;
  private pageHeight: number = 280;
  private leftMargin: number = 20;
  private rightMargin: number = 190;
  private pageWidth: number = 210;

  constructor() {
    this.doc = new jsPDF();
    // Add some custom fonts if available
  }

  /**
   * Convert AnchorProposalFormData to ProposalData format expected by template generator
   */
  private convertFormDataToProposalData(formData: AnchorProposalFormData): ProposalData {
    // Calculate pricing using the pricing engine
    let baseCost = 0;
    let totalCost = 0;
    let additionalServices: Array<{name?: string, description?: string, cost?: number}> = [];
    
    try {
      // ENHANCED DEBUG: Check form data being passed to pricing engine
      const pricingInputs = {
        squareFootage: formData.project.squareFootage,
        aduType: formData.project.aduType,
        stories: formData.project.stories || 1,
        bedrooms: formData.project.bedrooms,
        bathrooms: formData.project.bathrooms,
        utilities: formData.project.utilities,
        needsDesign: formData.project.needsDesign,
        appliancesIncluded: formData.project.appliancesIncluded,
        hvacType: formData.project.hvacType,
        selectedAddOns: formData.project.selectedAddOns || [],
        priceOverrides: formData.project.priceOverrides,
        // Required fields with defaults
        sewerConnection: formData.project.sewerConnection || 'existing-lateral',
        solarDesign: formData.project.solarDesign || false,
        femaIncluded: formData.project.femaIncluded || false
      };
      
      console.log('🔍 [DEBUG] Pricing engine inputs:');
      console.log('  - selectedAddOns:', pricingInputs.selectedAddOns);
      console.log('  - utilities:', pricingInputs.utilities);
      console.log('  - Full inputs:', pricingInputs);
      
      const pricingEngine = new AnchorPricingEngine();
      const calculation = pricingEngine.calculateProposal(pricingInputs);
      
      baseCost = calculation.totalBeforeMarkup;
      totalCost = calculation.grandTotal;
      
      // ENHANCED DEBUG: Check what the pricing engine calculated
      console.log('🔍 [DEBUG] Pricing calculation result:');
      console.log('  - selectedAddOns from form:', formData.project.selectedAddOns);
      console.log('  - All lineItems from pricing engine:', calculation.lineItems);
      console.log('  - Add-Ons category items:', calculation.lineItems?.filter((item: any) => item.category === 'Add-Ons'));
      
      // Extract additional services from pricing calculation
      additionalServices = (calculation.lineItems || [])
        .filter((item: any) => item.category === 'Add-Ons')
        .map((item: any) => ({
          name: item.name || item.description?.split(' - ')[0] || 'Additional Service',
          description: item.description || `${item.name} upgrade`,
          cost: item.totalPrice || item.cost || 0
        }));
      
      console.log('💰 [DEBUG] Final additional services for PDF:', additionalServices);
      console.log('💰 Pricing calculated:', { baseCost, totalCost, additionalServices: additionalServices.length });
      
    } catch (error) {
      console.error('❌ Pricing calculation failed:', error);
      // Fallback to basic data structure
    }
    
    return {
      clientInfo: {
        name: `${formData.client.firstName} ${formData.client.lastName}`,
        email: formData.client.email,
        phone: formData.client.phone,
        address: formData.client.address,
      },
      projectInfo: {
        address: formData.client.address, // Project address same as client for ADU
        type: formData.project.aduType,
        bedrooms: formData.project.bedrooms,
        bathrooms: formData.project.bathrooms,
        squareFootage: formData.project.squareFootage,
      },
      // Pass through utility selections for scope of work display
      utilities: {
        waterMeter: formData.project.utilities?.waterMeter,
        gasMeter: formData.project.utilities?.gasMeter,
        electricMeter: 'separate', // Always separate for ADUs
        electricalPanel: formData.project.utilities?.electricalPanel
      },
      // Pass through selected add-ons for bathroom count calculation
      selectedAddOns: formData.project.selectedAddOns || [],
      pricing: {
        baseCost: baseCost,
        totalCost: totalCost,
        estimatedTimeline: formData.timeline,
      },
      additionalServices: additionalServices,
      // Template-specific array for {{#each ADD_ON_ITEMS}} loops
      ADD_ON_ITEMS: additionalServices.map((service, index) => ({
        number: (index + 1).toString(),
        name: service.name || 'Additional Service',
        description: service.description || `${service.name} upgrade`,
        cost: new Intl.NumberFormat('en-US').format(service.cost || 0) // Format as number string, not currency
      }))
    };
  }

  /**
   * Create PDF from processed HTML using browser's print functionality
   */
  private createPDFFromHTML(htmlContent: string, filename: string): void {
    console.log('🖨️ Opening HTML in new window for PDF generation...');
    
    // Create a complete HTML document
    const completeHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Anchor Builders ADU Proposal</title>
    <style>
        @media print {
            @page { 
                margin: 0.5in;
                size: letter;
            }
            body { 
                margin: 0;
                font-family: Arial, sans-serif;
                line-height: 1.4;
            }
        }
        body {
            font-family: Arial, sans-serif;
            line-height: 1.4;
            margin: 20px;
        }
        .cost-value { text-align: right; }
        .phase-header { background: #f0f0f0; font-weight: bold; }
        table { border-collapse: collapse; width: 100%; margin: 10px 0; }
        td, th { border: 1px solid #ddd; padding: 8px; }
    </style>
</head>
<body>
    ${htmlContent}
    <script>
        // Auto-open print dialog after page loads
        window.addEventListener('load', function() {
            setTimeout(function() {
                window.print();
                // Close window after printing (user can cancel this)
                setTimeout(function() {
                    if (confirm('Close this window?')) {
                        window.close();
                    }
                }, 1000);
            }, 500);
        });
    </script>
</body>
</html>`;

    // Open in new window
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(completeHtml);
      printWindow.document.close();
      console.log('✅ PDF generation window opened successfully');
    } else {
      console.error('❌ Failed to open print window - popup blocked?');
      // Fallback: download HTML file
      this.downloadHTMLFile(completeHtml, filename.replace('.pdf', '.html'));
    }
  }

  /**
   * Fallback: download HTML file if popup is blocked
   */
  private downloadHTMLFile(htmlContent: string, filename: string): void {
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    console.log('📄 HTML file downloaded as fallback');
  }

  async generateProposal(
    formData: AnchorProposalFormData,
    _selectedTemplate?: string
  ): Promise<void> {
    // Try to use the new template generator first
    try {
      const templateGenerator = new PDFTemplateGenerator();
      const proposalData = this.convertFormDataToProposalData(formData);
      
      // Load the correct template HTML
      const templatePath = '/ENHANCED-DESIGN.html'; // Default to enhanced template
      const response = await fetch(templatePath);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.status}`);
      }
      const templateHtml = await response.text();
      console.log('📄 Template loaded successfully, length:', templateHtml.length);
      
      const processedHtml = await templateGenerator.generateTemplate(templateHtml, proposalData, { debugMode: true });
      
      // Create PDF from the processed HTML
      console.log('🖨️ Creating PDF from processed HTML...');
      this.createPDFFromHTML(processedHtml, `Anchor-Builders-ADU-Proposal-${Date.now()}.pdf`);
    } catch (error) {
      console.warn('Template generator failed, falling back to jsPDF:', error);
      // Fallback to jsPDF generation - create download for this case
      const pdfBlob = this.generateWithJsPDF(formData);
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Anchor-Builders-ADU-Proposal-Fallback-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }

  private generateWithJsPDF(formData: AnchorProposalFormData): Blob {
    // Reset position
    this.currentY = 20;

    // Generate PDF sections
    this.addHeader();
    this.addClientInfo(formData.client);
    this.addProjectDetails(formData.project);
    this.addPricingBreakdown(formData);
    this.addTermsAndConditions();

    // Return PDF as blob
    return this.doc.output('blob');
  }

  private addHeader() {
    // Header background
    this.doc.setFillColor(30, 64, 175); // Primary blue
    this.doc.rect(0, 0, this.pageWidth, 45, 'F');

    // Company name
    this.doc.setTextColor(255, 255, 255); // White text
    this.doc.setFontSize(28);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ANCHOR BUILDERS', this.leftMargin, 25);

    // Tagline
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Professional ADU Construction & Design', this.leftMargin, 35);

    // Proposal title
    this.currentY = 60;
    this.doc.setTextColor(31, 41, 55); // Dark gray
    this.doc.setFontSize(20);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ADU CONSTRUCTION PROPOSAL', this.leftMargin, this.currentY);

    // Date and proposal number
    const today = new Date().toLocaleDateString();
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`Date: ${today}`, 140, this.currentY - 5);
    this.doc.text(`Proposal #: AB-${Date.now().toString().slice(-6)}`, 140, this.currentY + 3);

    this.currentY += 20;
  }

  private addClientInfo(client: any) {
    // Section header with background
    this.addSectionHeader('CLIENT INFORMATION');

    // Client info in a styled box
    this.doc.setFillColor(248, 250, 252); // Light gray background
    this.doc.rect(this.leftMargin, this.currentY, this.rightMargin - this.leftMargin, 30, 'F');
    this.doc.setDrawColor(226, 232, 240); // Border color
    this.doc.rect(this.leftMargin, this.currentY, this.rightMargin - this.leftMargin, 30);

    this.currentY += 8;
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(31, 41, 55);

    // Two column layout
    const leftCol = this.leftMargin + 5;
    const rightCol = this.leftMargin + 95;

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Client:', leftCol, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(`${client.firstName} ${client.lastName}`, leftCol + 20, this.currentY);

    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Email:', rightCol, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(client.email, rightCol + 20, this.currentY);

    this.currentY += 6;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Phone:', leftCol, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(client.phone, leftCol + 20, this.currentY);

    this.currentY += 6;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('Address:', leftCol, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(
      `${client.address}, ${client.city}, ${client.state} ${client.zipCode}`,
      leftCol + 25,
      this.currentY
    );

    this.currentY += 20;
  }

  private addSectionHeader(title: string) {
    this.doc.setFillColor(245, 158, 11); // Accent color
    this.doc.rect(this.leftMargin, this.currentY, this.rightMargin - this.leftMargin, 8, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(title, this.leftMargin + 3, this.currentY + 5.5);

    this.currentY += 15;
    this.doc.setTextColor(31, 41, 55); // Reset text color
  }

  private addProjectDetails(project: any) {
    this.addSectionHeader('PROJECT SPECIFICATIONS');

    // Project specs in styled grid
    this.doc.setFillColor(248, 250, 252);
    this.doc.rect(this.leftMargin, this.currentY, this.rightMargin - this.leftMargin, 45, 'F');
    this.doc.setDrawColor(226, 232, 240);
    this.doc.rect(this.leftMargin, this.currentY, this.rightMargin - this.leftMargin, 45);

    this.currentY += 8;
    this.doc.setFontSize(11);

    const leftCol = this.leftMargin + 5;
    const middleCol = this.leftMargin + 65;
    const rightCol = this.leftMargin + 125;

    // Row 1
    this.addProjectField(
      'ADU Type:',
      project.aduType === 'detached' ? 'Detached (1 Story)' : 'Attached ADU',
      leftCol
    );
    this.addProjectField('Living Area:', `${project.squareFootage} sq ft`, middleCol);

    this.currentY += 7;
    this.addProjectField('Bedrooms:', project.bedrooms.toString(), leftCol);
    this.addProjectField('Bathrooms:', project.bathrooms.toString(), middleCol);
    this.addProjectField('HVAC:', 'Central AC', rightCol);

    this.currentY += 7;
    this.addProjectField('Finish Level:', 'Standard', leftCol);
    this.addProjectField(
      'Appliances:',
      project.appliancesIncluded ? 'Included' : 'Not Included',
      middleCol
    );

    this.currentY += 10;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('UTILITY CONNECTIONS:', leftCol, this.currentY);

    this.currentY += 7;
    this.addProjectField('Water Meter:', project.utilities.waterMeter, leftCol);
    this.addProjectField('Gas Meter:', project.utilities.gasMeter, middleCol);
    this.addProjectField('Electric Meter:', project.utilities.electricMeter, rightCol);

    this.currentY += 25;
  }

  private addProjectField(label: string, value: string, x: number) {
    this.doc.setFont('helvetica', 'bold');
    this.doc.text(label, x, this.currentY);
    this.doc.setFont('helvetica', 'normal');
    this.doc.text(value, x + 25, this.currentY);
  }

  private addPricingBreakdown(formData: AnchorProposalFormData) {
    this.addSectionHeader('INVESTMENT BREAKDOWN');

    // Calculate pricing
    const pricingEngine = new AnchorPricingEngine();
    const pricingInputs = {
      squareFootage: formData.project.squareFootage,
      aduType: formData.project.aduType,
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
    };

    const calculation = pricingEngine.calculateProposal(pricingInputs);

    // Professional table
    this.doc.setFillColor(248, 250, 252);
    const tableHeight = (calculation.lineItems.length + 5) * 6 + 10;
    this.doc.rect(
      this.leftMargin,
      this.currentY,
      this.rightMargin - this.leftMargin,
      tableHeight,
      'F'
    );
    this.doc.setDrawColor(226, 232, 240);
    this.doc.rect(this.leftMargin, this.currentY, this.rightMargin - this.leftMargin, tableHeight);

    // Table header with background
    this.doc.setFillColor(30, 64, 175);
    this.doc.rect(this.leftMargin, this.currentY, this.rightMargin - this.leftMargin, 8, 'F');

    this.currentY += 6;
    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(11);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('DESCRIPTION', this.leftMargin + 3, this.currentY);
    this.doc.text('AMOUNT', 155, this.currentY);

    this.currentY += 6;
    this.doc.setTextColor(31, 41, 55);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');

    // Line items with alternating colors
    calculation.lineItems.forEach((item, index) => {
      if (index % 2 === 0) {
        this.doc.setFillColor(255, 255, 255);
        this.doc.rect(
          this.leftMargin,
          this.currentY - 3,
          this.rightMargin - this.leftMargin,
          6,
          'F'
        );
      }

      this.doc.text(item.description, this.leftMargin + 3, this.currentY);
      this.doc.text(`$${item.totalPrice.toLocaleString()}`, 155, this.currentY);
      this.currentY += 6;
    });

    // Totals section
    this.currentY += 3;
    this.doc.setDrawColor(30, 64, 175);
    this.doc.line(this.leftMargin + 3, this.currentY, this.rightMargin - 3, this.currentY);
    this.currentY += 5;

    this.doc.setFont('helvetica', 'normal');
    this.doc.text('Subtotal:', this.leftMargin + 3, this.currentY);
    this.doc.text(`$${calculation.totalBeforeMarkup.toLocaleString()}`, 155, this.currentY);
    this.currentY += 6;

    this.doc.text(
      `Markup (${(calculation.markupPercentage * 100).toFixed(0)}%):`,
      this.leftMargin + 3,
      this.currentY
    );
    this.doc.text(`$${calculation.markupAmount.toLocaleString()}`, 155, this.currentY);
    this.currentY += 6;

    this.doc.setDrawColor(30, 64, 175);
    this.doc.line(this.leftMargin + 3, this.currentY, this.rightMargin - 3, this.currentY);
    this.currentY += 5;

    // Total with highlight
    this.doc.setFillColor(245, 158, 11);
    this.doc.rect(this.leftMargin, this.currentY - 3, this.rightMargin - this.leftMargin, 8, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(12);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('TOTAL PROJECT INVESTMENT:', this.leftMargin + 3, this.currentY);
    this.doc.text(`$${calculation.grandTotal.toLocaleString()}`, 155, this.currentY);

    this.currentY += 12;
    this.doc.setTextColor(31, 41, 55);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'italic');
    this.doc.text(
      `Cost per square foot: $${Math.round(calculation.pricePerSqFt)} | Living area: ${formData.project.squareFootage} sq ft`,
      this.leftMargin + 3,
      this.currentY
    );

    this.currentY += 15;
  }

  private addTermsAndConditions() {
    // Check if we need a new page
    if (this.currentY > this.pageHeight - 80) {
      this.doc.addPage();
      this.currentY = 20;
    }

    this.addSectionHeader('TERMS & CONDITIONS');

    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'normal');
    this.doc.setTextColor(31, 41, 55);

    const terms = [
      '✓ This proposal is valid for 30 days from the date of issue.',
      '✓ Price includes standard construction and materials as specified.',
      '✓ Final pricing subject to site evaluation and permit requirements.',
      '✓ Timeline: Standard 6-8 month construction period.',
      '✓ Payment schedule: 10% deposit, progress payments, 10% final payment.',
      '✓ All work performed in accordance with local building codes and best practices.',
    ];

    terms.forEach(term => {
      this.doc.text(term, this.leftMargin + 3, this.currentY);
      this.currentY += 6;
    });

    this.currentY += 5;

    // Exclusions in a box
    this.doc.setFillColor(254, 243, 199); // Light amber
    this.doc.rect(this.leftMargin, this.currentY, this.rightMargin - this.leftMargin, 35, 'F');
    this.doc.setDrawColor(245, 158, 11);
    this.doc.rect(this.leftMargin, this.currentY, this.rightMargin - this.leftMargin, 35);

    this.currentY += 8;
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('EXCLUSIONS & ADDITIONAL COSTS:', this.leftMargin + 3, this.currentY);

    this.currentY += 6;
    this.doc.setFont('helvetica', 'normal');
    const exclusions = [
      '• Site preparation beyond minimal grading',
      '• Retaining walls or complex foundation work',
      '• Utility line extensions beyond 50 feet',
      '• Permit fees (estimated separately)',
      '• Landscaping beyond basic restoration',
    ];

    exclusions.forEach(exclusion => {
      this.doc.text(exclusion, this.leftMargin + 5, this.currentY);
      this.currentY += 5;
    });

    this.currentY += 15;

    // Footer with contact info
    this.addFooter();
  }

  private addFooter() {
    // Footer background
    this.doc.setFillColor(30, 64, 175);
    this.doc.rect(0, this.pageHeight - 25, this.pageWidth, 25, 'F');

    this.doc.setTextColor(255, 255, 255);
    this.doc.setFontSize(10);
    this.doc.setFont('helvetica', 'bold');
    this.doc.text('ANCHOR BUILDERS', this.leftMargin, this.pageHeight - 15);

    this.doc.setFont('helvetica', 'normal');
    this.doc.text('www.anchorbuilders.io', this.leftMargin, this.pageHeight - 8);
    this.doc.text('proposals@anchorbuilders.io', this.leftMargin + 50, this.pageHeight - 8);
    this.doc.text('(555) 123-4567', this.leftMargin + 110, this.pageHeight - 8);
  }
}
