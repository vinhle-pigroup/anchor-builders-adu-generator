/**
 * Server-side PDF Service Client
 * Connects to the Railway-deployed PDF service for professional PDF generation
 */

import { AnchorProposalFormData } from '../types/proposal';

export class ServerPDFService {
  private readonly serviceUrl = 'https://anchor-pdf-service-production.up.railway.app';
  // Generated API key - make sure this matches Railway environment variable
  private readonly apiKey = 'ed4d39521ec3544888eb604721ed6b5ea1581d18aa49aed0f9041d59c7c1b5d2';

  async generateProposal(formData: AnchorProposalFormData, template: string = 'anchor-proposal'): Promise<void> {
    try {
      console.log('🚀 Sending to Railway PDF service:', this.serviceUrl);
      
      // Flatten the form data to match template variables like {{CLIENT_NAME}}
      const flattenedData = {
        CLIENT_NAME: `${formData.client.firstName} ${formData.client.lastName}`.trim(),
        CLIENT_PHONE: formData.client.phone || '',
        CLIENT_EMAIL: formData.client.email || '',
        CLIENT_ADDRESS: formData.client.address || '',
        SQUARE_FOOTAGE: formData.project.squareFootage || 800,
        BEDROOMS: formData.project.bedrooms || 1,
        BATHROOMS: formData.project.bathrooms || 1,
        ADU_TYPE: formData.project.aduType || 'Detached',
        GRAND_TOTAL: '150000', // TODO: Calculate from pricing
        COST_PER_SQFT: Math.round(150000 / (formData.project.squareFootage || 800)).toString(),
      };

      console.log('📋 Payload data:', JSON.stringify(flattenedData, null, 2));

      // Prepare the request payload in the format expected by anchor-pdf-service
      const payload = {
        template: template,
        data: flattenedData,
        options: {
          format: 'A4',
          printBackground: true,
          margin: {
            top: '0.5in',
            right: '0.5in',
            bottom: '0.5in',
            left: '0.5in'
          }
        }
      };

      // Send request to Railway PDF service
      const response = await fetch(`${this.serviceUrl}/pdf/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.apiKey
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ PDF service response:', {
          status: response.status,
          statusText: response.statusText,
          errorText: errorText
        });
        throw new Error(`PDF service error: ${response.status} ${response.statusText} - ${errorText}`);
      }

      // Get the PDF blob
      const pdfBlob = await response.blob();
      console.log('✅ Received PDF from Railway service, size:', pdfBlob.size);

      // Download the PDF
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Anchor-Builders-ADU-Proposal-${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ PDF downloaded successfully');
    } catch (error) {
      console.error('❌ Railway PDF service error:', error);
      throw error;
    }
  }

  async checkHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.serviceUrl}/healthz`);
      return response.ok;
    } catch (error) {
      console.error('PDF service health check failed:', error);
      return false;
    }
  }
}