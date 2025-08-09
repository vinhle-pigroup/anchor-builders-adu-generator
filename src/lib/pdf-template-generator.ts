import { ProposalData } from '../types/proposal';
import { logger } from './logger';
import { calculateMilestonePayments } from '../data/pricing-config';

/**
 * Enhanced PDF Template Generator with proper variable replacement
 * Handles both simple variables and variables within conditional blocks
 */

interface TemplateProcessingOptions {
  debugMode?: boolean;
  validateVariables?: boolean;
}

export class PDFTemplateGenerator {
  private debugMode: boolean;
  private validateVariables: boolean;

  constructor(options: TemplateProcessingOptions = {}) {
    this.debugMode = options.debugMode || false;
    this.validateVariables = options.validateVariables || true;
  }

  /**
   * Main template processing function with two-pass variable replacement
   */
  async generateTemplate(
    templateHtml: string,
    proposalData: ProposalData,
    options: TemplateProcessingOptions = {}
  ): Promise<string> {
    try {
      this.debugMode = options.debugMode || this.debugMode;
      this.validateVariables = options.validateVariables ?? this.validateVariables;

      console.log('🔧 [CRITICAL DEBUG] Template generation STARTED');
      console.log('🔧 Template length:', templateHtml.length);
      console.log('🔧 Has ADD_ON_WORK_EXISTS in template:', templateHtml.includes('{{#if ADD_ON_WORK_EXISTS}}'));
      console.log('🔧 ProposalData:', proposalData);

      if (this.debugMode) {
        logger.info('Starting PDF template generation');
        logger.info('Template length:', templateHtml.length);
        logger.info('Proposal data keys:', Object.keys(proposalData));
      }

      // Step 0: Remove HTML comments that contain developer notes (they shouldn't appear in PDF)
      let cleanedTemplate = templateHtml.replace(/<!--[\s\S]*?-->/g, '');
      console.log('🔧 [DEBUG] HTML comments removed, new length:', cleanedTemplate.length);

      // Step 1: Create variable replacement map
      const variables = this.createVariableMap(proposalData);
      
      if (this.debugMode) {
        logger.info('Generated variables:', Object.keys(variables));
        console.log('[DEBUG] ALL VARIABLES CREATED:');
        Object.entries(variables).forEach(([key, value]) => {
          console.log(`  ${key}: "${value}"`);
        });
      }

      // Step 2: Two-pass variable replacement with conditional block handling
      console.log('🔧 [DEBUG] Starting two-pass replacement...');
      let processedHtml = await this.processTwoPassReplacement(cleanedTemplate, variables, proposalData);
      
      console.log('🔧 [DEBUG] After processing - still has {{#if}}?', processedHtml.includes('{{#if'));
      console.log('🔧 [DEBUG] After processing - has ADD_ON_ITEMS?', processedHtml.includes('ADD_ON_ITEMS'));

      // Step 3: Clean up any remaining unreplaced variables if validation is disabled
      if (!this.validateVariables) {
        processedHtml = this.cleanupUnreplacedVariables(processedHtml);
      }

      console.log('🔧 [CRITICAL DEBUG] Template generation COMPLETED');
      console.log('🔧 Final template length:', processedHtml.length);

      if (this.debugMode) {
        logger.info('Template processing completed');
        logger.info('Final template length:', processedHtml.length);
      }

      return processedHtml;
    } catch (error) {
      logger.error('Error in generateTemplate:', error);
      throw new Error(`Template generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Two-pass variable replacement with conditional block masking
   */
  private async processTwoPassReplacement(
    template: string,
    variables: Record<string, string>,
    proposalData: ProposalData
  ): Promise<string> {
    if (this.debugMode) {
      logger.info('Starting two-pass replacement process');
    }

    // PASS 1: Replace variables OUTSIDE conditional blocks only
    const { maskedTemplate, conditionalBlocks } = this.maskConditionalBlocks(template);
    
    if (this.debugMode) {
      logger.info(`Masked ${conditionalBlocks.length} conditional blocks`);
    }

    // Replace variables in the masked template (only affects variables outside conditionals)
    let passOneResult = this.replaceVariables(maskedTemplate, variables);
    
    // Restore conditional blocks
    passOneResult = this.restoreConditionalBlocks(passOneResult, conditionalBlocks);

    // Process conditionals ({{#if}} and {{#each}} blocks)
    const expandedTemplate = this.processConditionals(passOneResult, proposalData);

    // PASS 2: Replace ALL remaining variables (including those inside now-expanded blocks)
    const finalResult = this.replaceVariables(expandedTemplate, variables);

    if (this.debugMode) {
      logger.info('Two-pass replacement completed');
    }

    return finalResult;
  }

  /**
   * Mask conditional blocks to protect variables inside them during first pass
   */
  private maskConditionalBlocks(template: string): {
    maskedTemplate: string;
    conditionalBlocks: Array<{ placeholder: string; content: string }>;
  } {
    const conditionalBlocks: Array<{ placeholder: string; content: string }> = [];
    let maskedTemplate = template;
    let blockIndex = 0;

    // Regex to find conditional blocks ({{#if}}...{{/if}} and {{#each}}...{{/each}})
    const conditionalRegex = /\{\{#(if|each)\s+([^}]+)\}\}([\s\S]*?)\{\{\/(if|each)\}\}/g;
    
    maskedTemplate = maskedTemplate.replace(conditionalRegex, (match, openType, _condition, _content, closeType) => {
      if (openType !== closeType) {
        logger.warn(`Mismatched conditional block: #${openType} with /${closeType}`);
        return match; // Return original if mismatched
      }

      const placeholder = `__CONDITIONAL_BLOCK_${blockIndex}__`;
      conditionalBlocks.push({
        placeholder,
        content: match
      });
      blockIndex++;
      
      return placeholder;
    });

    return { maskedTemplate, conditionalBlocks };
  }

  /**
   * Restore conditional blocks after first pass variable replacement
   */
  private restoreConditionalBlocks(
    template: string,
    conditionalBlocks: Array<{ placeholder: string; content: string }>
  ): string {
    let restoredTemplate = template;
    
    conditionalBlocks.forEach(block => {
      restoredTemplate = restoredTemplate.replace(block.placeholder, block.content);
    });

    return restoredTemplate;
  }

  /**
   * Process conditional blocks ({{#if}} and {{#each}})
   */
  private processConditionals(template: string, proposalData: ProposalData): string {
    console.log('[DEBUG] Starting processConditionals...');
    let processedTemplate = template;

    // Process {{#if}} blocks
    console.log('[DEBUG] Processing #if blocks...');
    processedTemplate = this.processIfBlocks(processedTemplate, proposalData);
    
    // Process {{#each}} blocks
    console.log('[DEBUG] Processing #each blocks...');
    processedTemplate = this.processEachBlocks(processedTemplate, proposalData);

    console.log('[DEBUG] Finished processConditionals');
    return processedTemplate;
  }

  /**
   * Process {{#if}} conditional blocks
   */
  private processIfBlocks(template: string, proposalData: ProposalData): string {
    const ifRegex = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    
    return template.replace(ifRegex, (_match, condition, content) => {
      const shouldInclude = this.evaluateCondition(condition.trim(), proposalData);
      
      if (this.debugMode) {
        logger.info(`Evaluating condition "${condition}": ${shouldInclude}`);
      }
      
      return shouldInclude ? content : '';
    });
  }

  /**
   * Process {{#each}} iteration blocks
   */
  private processEachBlocks(template: string, proposalData: ProposalData): string {
    const eachRegex = /\{\{#each\s+([^}]+)\}\}([\s\S]*?)\{\{\/each\}\}/g;
    
    return template.replace(eachRegex, (_match, arrayPath, content) => {
      const arrayData = this.getNestedValue(proposalData, arrayPath.trim());
      
      if (!Array.isArray(arrayData)) {
        if (this.debugMode) {
          logger.warn(`Invalid array for {{#each ${arrayPath}}}: not an array`);
        }
        return '';
      }

      return arrayData.map((item, index) => {
        let itemContent = content;
        
        // Replace {{this.property}} with item properties
        itemContent = itemContent.replace(/\{\{this\.([^}]+)\}\}/g, (_: string, property: string) => {
          return this.getNestedValue(item, property) || '';
        });
        
        // Replace {{property}} format with item properties (for templates using {{name}}, {{cost}}, etc.)
        itemContent = itemContent.replace(/\{\{([^#/][^}]*)\}\}/g, (match: string, property: string) => {
          // Skip conditional markers and special patterns
          if (property.includes('#') || property.includes('/') || property.includes('this.') || property.includes('@')) {
            return match;
          }
          
          const value = this.getNestedValue(item, property.trim());
          if (value !== undefined) {
            console.log(`[DEBUG] Replaced {{${property}}} with "${value}" in each block`);
            return value.toString();
          }
          
          console.warn(`[DEBUG] Undefined property in each block: ${property}`);
          return match; // Keep original if undefined
        });
        
        // Replace {{@index}} with current index
        itemContent = itemContent.replace(/\{\{@index\}\}/g, index.toString());
        
        return itemContent;
      }).join('');
    });
  }

  /**
   * Standard variable replacement
   */
  private replaceVariables(template: string, variables: Record<string, string>): string {
    let result = template;
    let replacementCount = 0;
    
    console.log('[DEBUG] Starting variable replacement...');
    
    // Replace ${{VARIABLE}} format
    result = result.replace(/\$\{\{([^}]+)\}\}/g, (match, varName) => {
      const value = variables[varName.trim()];
      if (value === undefined) {
        console.warn(`[DEBUG] Undefined $-variable: ${varName}`);
        return match; // Keep original if undefined
      }
      console.log('[DEBUG] Replaced ${' + '{' + varName + '}} with "' + value + '"');
      replacementCount++;
      return value || '';
    });

    // Replace {{VARIABLE}} format  
    result = result.replace(/\{\{([^#/][^}]*)\}\}/g, (match, varName) => {
      // Skip conditional markers
      if (varName.includes('#') || varName.includes('/') || varName.includes('this.') || varName.includes('@')) {
        return match;
      }
      
      const value = variables[varName.trim()];
      if (value === undefined) {
        console.warn(`[DEBUG] Undefined regular variable: ${varName}`);
        return match;
      }
      console.log('[DEBUG] Replaced {{' + varName + '}} with "' + value + '"');
      replacementCount++;
      return value || '';
    });
    
    console.log(`[DEBUG] Variable replacement complete. ${replacementCount} replacements made.`);

    return result;
  }

  /**
   * Create comprehensive variable map from proposal data
   */
  private createVariableMap(proposalData: ProposalData): Record<string, string> {
    const variables: Record<string, string> = {};

    try {
      // Client information
      variables.CLIENT_NAME = proposalData.clientInfo?.name || '';
      variables.CLIENT_FIRST_NAME = proposalData.clientInfo?.name?.split(' ')[0] || '';
      variables.CLIENT_EMAIL = proposalData.clientInfo?.email || '';
      variables.CLIENT_PHONE = proposalData.clientInfo?.phone || '';
      variables.CLIENT_ADDRESS = proposalData.clientInfo?.address || '';

      // Project information
      variables.PROJECT_ADDRESS = proposalData.projectInfo?.address || '';
      variables.PROJECT_TYPE = proposalData.projectInfo?.type || '';
      variables.ADU_TYPE = proposalData.projectInfo?.type || '';
      variables.BEDROOMS = proposalData.projectInfo?.bedrooms?.toString() || '';
      
      // Dynamic bathroom count with add-on notation
      const baseBathrooms = proposalData.projectInfo?.bathrooms || 0;
      const hasExtraBathroom = proposalData.selectedAddOns?.includes('bathroom') || false;
      const totalBathrooms = hasExtraBathroom ? baseBathrooms + 1 : baseBathrooms;
      variables.BATHROOMS = hasExtraBathroom 
        ? `${totalBathrooms} (${baseBathrooms} + 1 add on)`
        : totalBathrooms.toString();
      
      variables.SQUARE_FOOTAGE = proposalData.projectInfo?.squareFootage?.toString() || '';
      
      // Dynamic utility connection details based on selections
      variables.HVAC_TYPE = 'Central AC'; // Default HVAC type
      
      // Dynamic electrical panel based on form selection
      const panelSize = proposalData.utilities?.electricalPanel || '200';
      variables.ELECTRICAL_PANEL = `New ${panelSize}A Panel`;
      
      // Dynamic utility connections based on form selections
      variables.ELECTRIC_CONNECTION_DETAIL = `New separate meter with ${panelSize}A panel`;
      variables.GAS_CONNECTION = proposalData.utilities?.gasMeter === 'separate' ? 'Separate meter' : 'Shared meter';
      variables.WATER_CONNECTION = proposalData.utilities?.waterMeter === 'separate' ? 'Separate meter' : 'Shared meter';
      variables.SEWER_CONNECTION_DETAIL = 'Existing lateral connection'; // Default sewer connection
      
      // Project details
      variables.PROJECT_OVERVIEW_TEXT = 'Custom ADU construction with modern design and premium finishes.';
      variables.TIMELINE = proposalData.pricing?.estimatedTimeline || '6-8 months';
      
      // Pricing information
      variables.BASE_COST = this.formatCurrency(proposalData.pricing?.baseCost || 0);
      variables.TOTAL_COST = this.formatCurrency(proposalData.pricing?.totalCost || 0);
      variables.GRAND_TOTAL = this.formatCurrency(proposalData.pricing?.totalCost || 0);
      variables.ESTIMATED_TIMELINE = proposalData.pricing?.estimatedTimeline || '';
      
      // Cost per square foot calculation
      const squareFootage = proposalData.projectInfo?.squareFootage || 1;
      const costPerSqFt = (proposalData.pricing?.totalCost || 0) / squareFootage;
      variables.COST_PER_SQFT = Math.round(costPerSqFt).toString();
      
      // Phase totals and design amount calculation - Fixed design fee
      const fixedDesignAmount = 12500; // Fixed $12,500 design fee (not percentage)
      const depositAmount = 1000; // Fixed $1,000 deposit
      variables.DESIGN_AMOUNT = this.formatCurrency(fixedDesignAmount);
      variables.DEPOSIT_AMOUNT = this.formatCurrency(depositAmount);
      variables.PHASE_1_TOTAL = this.formatCurrency(fixedDesignAmount); // Phase I: Design only (deposit separate)
      
      // Milestone payment breakdown using proper calculation with rounding
      const totalCost = proposalData.pricing?.totalCost || 0;
      
      // Calculate Phase 3 total as construction amount (same calculation as milestones)
      const constructionAmount = totalCost - fixedDesignAmount - depositAmount;
      variables.PHASE_3_TOTAL = this.formatCurrency(constructionAmount); // Construction amount
      const milestones = calculateMilestonePayments(totalCost, fixedDesignAmount, depositAmount);
      
      // Map milestone payments to template variables
      variables.MILESTONE_1 = milestones.length > 0 ? this.formatCurrency(milestones[0].amount) : this.formatCurrency(0);
      variables.MILESTONE_2 = milestones.length > 1 ? this.formatCurrency(milestones[1].amount) : this.formatCurrency(0);
      variables.MILESTONE_3 = milestones.length > 2 ? this.formatCurrency(milestones[2].amount) : this.formatCurrency(0);
      variables.MILESTONE_4 = milestones.length > 3 ? this.formatCurrency(milestones[3].amount) : this.formatCurrency(0);
      variables.MILESTONE_5 = milestones.length > 4 ? this.formatCurrency(milestones[4].amount) : this.formatCurrency(0);
      variables.MILESTONE_6 = milestones.length > 5 ? this.formatCurrency(milestones[5].amount) : this.formatCurrency(0);
      variables.MILESTONE_7 = milestones.length > 6 ? this.formatCurrency(milestones[6].amount) : this.formatCurrency(0);

      // Additional Services Total Calculation
      const addOnServices = proposalData.additionalServices || [];
      const addOnTotal = addOnServices.reduce((sum, service) => sum + (service.cost || 0), 0);
      variables.ADDITIONAL_SERVICES_TOTAL = this.formatCurrency(addOnTotal);

      // Conditional flags
      variables.ADD_ON_WORK_EXISTS = addOnServices.length > 0 ? 'true' : 'false';

      // Date information
      variables.PROPOSAL_DATE = new Date().toLocaleDateString();
      variables.EXPIRATION_DATE = this.calculateExpirationDate();
      
      // Proposal information
      variables.PROPOSAL_NUMBER = this.generateProposalNumber();
      variables.PROPOSAL_VALID_UNTIL = this.calculateExpirationDate(); // Same as expiration date

      if (this.debugMode) {
        logger.info('Generated variable map:', variables);
      }

    } catch (error) {
      logger.error('Error creating variable map:', error);
    }

    return variables;
  }

  /**
   * Evaluate conditional expressions
   */
  private evaluateCondition(condition: string, data: ProposalData): boolean {
    try {
      console.log(`[DEBUG] Evaluating condition: "${condition}"`);
      
      // Handle simple boolean properties
      if (condition === 'ADD_ON_WORK_EXISTS') {
        const hasAddOns = (data.additionalServices?.length || 0) > 0;
        console.log(`[DEBUG] ADD_ON_WORK_EXISTS = ${hasAddOns} (${data.additionalServices?.length || 0} services)`);
        return hasAddOns;
      }

      // Handle other conditions by checking if value exists and is truthy
      const value = this.getNestedValue(data, condition);
      console.log(`[DEBUG] Condition "${condition}" value: ${value} -> ${Boolean(value)}`);
      return Boolean(value);
      
    } catch (error) {
      logger.warn(`Error evaluating condition "${condition}":`, error);
      return false;
    }
  }

  /**
   * Get nested object value using dot notation
   */
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Format currency values
   */
  private formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Calculate expiration date (30 days from now)
   */
  private calculateExpirationDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 30);
    return date.toLocaleDateString();
  }

  /**
   * Generate unique proposal number
   */
  private generateProposalNumber(): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const timestamp = Date.now().toString().slice(-4); // Last 4 digits of timestamp
    
    return `AB-${year}${month}${day}-${timestamp}`;
  }

  /**
   * Clean up unreplaced variables when validation is disabled
   */
  private cleanupUnreplacedVariables(template: string): string {
    // Remove unreplaced ${{}} variables
    let cleaned = template.replace(/\$\{\{[^}]+\}\}/g, '');
    
    // Remove unreplaced {{}} variables (except conditionals)
    cleaned = cleaned.replace(/\{\{(?![#/])[^}]+\}\}/g, '');
    
    return cleaned;
  }
}

// Export factory function for backward compatibility
export function generatePDFTemplate(
  templateHtml: string,
  proposalData: ProposalData,
  options: TemplateProcessingOptions = {}
): Promise<string> {
  const generator = new PDFTemplateGenerator(options);
  return generator.generateTemplate(templateHtml, proposalData, options);
}

// Export default instance
export default new PDFTemplateGenerator();