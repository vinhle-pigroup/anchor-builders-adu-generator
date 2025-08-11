import { jsPDF } from 'jspdf';
import { AnchorProposalFormData } from '../types/proposal';
import { AnchorPricingEngine } from './pricing-engine';
import { AnchorPDFTemplateGenerator } from './pdf-template-generator';

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

  async generateProposal(
    formData: AnchorProposalFormData,
    selectedTemplate?: string
  ): Promise<void> {
    // Try to use the new template generator first
    try {
      const templateGenerator = new AnchorPDFTemplateGenerator();
      await templateGenerator.generateProposal(formData, selectedTemplate);
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
