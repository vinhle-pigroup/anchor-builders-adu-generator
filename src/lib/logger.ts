/**
 * Centralized logging utility for Anchor Builders ADU Generator
 * Removes console logs from production builds while maintaining debug capabilities
 */

export interface LogContext {
  component?: string;
  function?: string;
  user?: string;
  [key: string]: any;
}

export class Logger {
  private isDevelopment = import.meta.env.DEV;
  private isProduction = import.meta.env.PROD;

  /**
   * Debug logging - only shows in development
   */
  debug(message: string, data?: any, context?: LogContext): void {
    if (this.isDevelopment) {
      const prefix = this.formatPrefix('DEBUG', context);
      if (data !== undefined) {
        console.log(`${prefix} ${message}`, data);
      } else {
        console.log(`${prefix} ${message}`);
      }
    }
  }

  /**
   * Info logging - shows in all environments
   */
  info(message: string, data?: any, context?: LogContext): void {
    const prefix = this.formatPrefix('INFO', context);
    if (data !== undefined) {
      console.info(`${prefix} ${message}`, data);
    } else {
      console.info(`${prefix} ${message}`);
    }
  }

  /**
   * Warning logging - shows in all environments
   */
  warn(message: string, data?: any, context?: LogContext): void {
    const prefix = this.formatPrefix('WARN', context);
    if (data !== undefined) {
      console.warn(`${prefix} ${message}`, data);
    } else {
      console.warn(`${prefix} ${message}`);
    }
  }

  /**
   * Error logging - shows in all environments and sends to error tracking
   */
  error(message: string, error?: Error | any, context?: LogContext): void {
    const prefix = this.formatPrefix('ERROR', context);
    
    if (error !== undefined) {
      console.error(`${prefix} ${message}`, error);
    } else {
      console.error(`${prefix} ${message}`);
    }

    // In production, send to error tracking service
    if (this.isProduction) {
      this.sendToErrorTracking(message, error, context);
    }
  }

  /**
   * PDF Generation specific logging
   */
  pdfDebug(stage: string, message: string, data?: any): void {
    this.debug(message, data, { 
      component: 'PDF_GENERATOR', 
      stage 
    });
  }

  /**
   * Pricing Engine specific logging
   */
  pricingDebug(message: string, data?: any): void {
    this.debug(message, data, { 
      component: 'PRICING_ENGINE' 
    });
  }

  /**
   * Template processing specific logging
   */
  templateDebug(message: string, data?: any): void {
    this.debug(message, data, { 
      component: 'TEMPLATE_PROCESSOR' 
    });
  }

  private formatPrefix(level: string, context?: LogContext): string {
    const timestamp = new Date().toISOString().substring(11, 23);
    let prefix = `[${timestamp}] ${level}`;
    
    if (context?.component) {
      prefix += ` [${context.component}]`;
    }
    
    if (context?.function) {
      prefix += ` ${context.function}:`;
    }
    
    return prefix;
  }

  private sendToErrorTracking(_message: string, _error?: Error | any, _context?: LogContext): void {
    // TODO: Implement error tracking service integration (Sentry, etc.)
    // For now, just ensure it's logged to console in production
    try {
      // Future: Send to Sentry or similar service
      // Sentry.captureException(new Error(message), { contexts: context });
    } catch (trackingError) {
      console.error('Error tracking service failed:', trackingError);
    }
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience exports for common use cases
export const pdfLogger = {
  debug: (stage: string, message: string, data?: any) => logger.pdfDebug(stage, message, data),
  error: (stage: string, message: string, error?: any) => logger.error(`[PDF_${stage}] ${message}`, error),
};

export const pricingLogger = {
  debug: (message: string, data?: any) => logger.pricingDebug(message, data),
  error: (message: string, error?: any) => logger.error(`[PRICING] ${message}`, error),
};

export const templateLogger = {
  debug: (message: string, data?: any) => logger.templateDebug(message, data),
  error: (message: string, error?: any) => logger.error(`[TEMPLATE] ${message}`, error),
};