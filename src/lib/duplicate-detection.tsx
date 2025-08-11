// @ts-ignore - React import needed for JSX
import React from 'react';
import { designTokens } from './design-tokens';

interface ClientData {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
}

interface DuplicateMatch {
  score: number; // 0-100 confidence score
  reasons: string[]; // Why it might be a duplicate
  suggestion: string; // What to do about it
  severity: 'low' | 'medium' | 'high';
}

interface DuplicateWarning {
  isDuplicate: boolean;
  match?: DuplicateMatch;
  message?: string;
  action?: 'warning' | 'confirmation' | 'block';
}

/**
 * Soft duplicate detection for client entries
 *
 * Features:
 * - Fuzzy matching for names, emails, phones
 * - Address similarity detection
 * - Confidence scoring
 * - Helpful suggestions instead of blocking
 * - Privacy-conscious (no external services)
 */
export class DuplicateDetection {
  private static readonly STORAGE_KEY = 'anchor_client_history';
  private static readonly MAX_HISTORY = 50; // Keep last 50 clients

  /**
   * Check if client data might be a duplicate
   */
  static checkForDuplicates(currentClient: ClientData): DuplicateWarning {
    const history = this.getClientHistory();

    if (history.length === 0) {
      return { isDuplicate: false };
    }

    let bestMatch: { client: ClientData; score: number; reasons: string[] } | null = null;

    for (const historicalClient of history) {
      const match = this.compareClients(currentClient, historicalClient);

      if (match.score > 60 && (!bestMatch || match.score > bestMatch.score)) {
        bestMatch = { client: historicalClient, score: match.score, reasons: match.reasons };
      }
    }

    if (!bestMatch) {
      return { isDuplicate: false };
    }

    return this.createWarning(bestMatch);
  }

  /**
   * Add client to history after successful save
   */
  static addToHistory(client: ClientData): void {
    try {
      const history = this.getClientHistory();

      // Remove any existing similar entries to avoid accumulating near-duplicates
      const filtered = history.filter(existing => this.compareClients(client, existing).score < 90);

      // Add new client to beginning
      filtered.unshift({
        ...client,
        timestamp: new Date().toISOString(),
      });

      // Keep only recent entries
      const trimmed = filtered.slice(0, this.MAX_HISTORY);

      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(trimmed));
    } catch (error) {
      console.warn('Failed to update client history:', error);
    }
  }

  /**
   * Compare two clients and return similarity score
   */
  private static compareClients(
    client1: ClientData,
    client2: ClientData
  ): { score: number; reasons: string[] } {
    let score = 0;
    const reasons: string[] = [];

    // Email match (highest weight - 40 points)
    if (
      client1.email &&
      client2.email &&
      this.normalizeEmail(client1.email) === this.normalizeEmail(client2.email)
    ) {
      score += 40;
      reasons.push('Same email address');
    }

    // Phone match (high weight - 30 points)
    if (
      client1.phone &&
      client2.phone &&
      this.normalizePhone(client1.phone) === this.normalizePhone(client2.phone)
    ) {
      score += 30;
      reasons.push('Same phone number');
    }

    // Full name match (25 points)
    const name1 = this.normalizeName(`${client1.firstName || ''} ${client1.lastName || ''}`);
    const name2 = this.normalizeName(`${client2.firstName || ''} ${client2.lastName || ''}`);
    if (name1 && name2 && name1 === name2) {
      score += 25;
      reasons.push('Same full name');
    }

    // Address similarity (15 points for close match, 25 for exact)
    if (client1.address && client2.address) {
      const addressSimilarity = this.compareAddresses(client1.address, client2.address);
      if (addressSimilarity >= 0.9) {
        score += 25;
        reasons.push('Same or very similar address');
      } else if (addressSimilarity >= 0.7) {
        score += 15;
        reasons.push('Similar address');
      }
    }

    // Partial name matches (lower weight)
    if (
      client1.firstName &&
      client2.firstName &&
      this.normalizeName(client1.firstName) === this.normalizeName(client2.firstName)
    ) {
      score += 10;
      reasons.push('Same first name');
    }

    if (
      client1.lastName &&
      client2.lastName &&
      this.normalizeName(client1.lastName) === this.normalizeName(client2.lastName)
    ) {
      score += 10;
      reasons.push('Same last name');
    }

    return { score, reasons };
  }

  /**
   * Create user-friendly warning message
   */
  private static createWarning(match: {
    client: ClientData;
    score: number;
    reasons: string[];
  }): DuplicateWarning {
    const { client, score, reasons } = match;

    const severity = score >= 80 ? 'high' : score >= 70 ? 'medium' : 'low';

    let message = `This client might be similar to a previous entry:`;
    if (client.firstName || client.lastName) {
      message += ` "${client.firstName} ${client.lastName}".`;
    }
    message += ` Matches: ${reasons.join(', ')}.`;

    let suggestion = '';
    if (severity === 'high') {
      suggestion =
        'Double-check if this is a new project for an existing client or a duplicate entry.';
    } else if (severity === 'medium') {
      suggestion = 'This might be a returning client with slightly different information.';
    } else {
      suggestion = 'Possible match detected - please verify if needed.';
    }

    return {
      isDuplicate: true,
      match: {
        score,
        reasons,
        suggestion,
        severity,
      },
      message,
      action: severity === 'high' ? 'confirmation' : 'warning',
    };
  }

  /**
   * Get client history from localStorage
   */
  private static getClientHistory(): (ClientData & { timestamp?: string })[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.warn('Failed to load client history:', error);
      return [];
    }
  }

  /**
   * Normalize email for comparison
   */
  private static normalizeEmail(email: string): string {
    return email.toLowerCase().trim();
  }

  /**
   * Normalize phone for comparison (remove all non-digits)
   */
  private static normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  /**
   * Normalize name for comparison
   */
  private static normalizeName(name: string): string {
    return name.toLowerCase().trim().replace(/\s+/g, ' ');
  }

  /**
   * Compare address similarity using simple string matching
   */
  private static compareAddresses(addr1: string, addr2: string): number {
    const normalize = (addr: string) =>
      addr
        .toLowerCase()
        .replace(/\b(street|st|avenue|ave|road|rd|drive|dr|lane|ln|court|ct|place|pl)\b/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();

    const norm1 = normalize(addr1);
    const norm2 = normalize(addr2);

    if (norm1 === norm2) return 1.0;

    // Simple word overlap calculation
    const words1 = norm1.split(' ');
    const words2 = norm2.split(' ');
    const intersection = words1.filter(word => words2.includes(word));
    const union = [...new Set([...words1, ...words2])];

    return intersection.length / union.length;
  }
}

/**
 * React component for displaying duplicate warnings
 */
interface DuplicateWarningProps {
  warning: DuplicateWarning;
  onContinue: () => void;
  onCancel: () => void;
}

export function DuplicateWarningComponent({
  warning,
  onContinue,
  onCancel,
}: DuplicateWarningProps) {
  if (!warning.isDuplicate || !warning.match) {
    return null;
  }

  const { match } = warning;
  const severityColors = {
    low: 'bg-blue-50 border-blue-200 text-blue-800',
    medium: 'bg-amber-50 border-amber-200 text-amber-800',
    high: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div
      className={`${designTokens.density.cardPadding} rounded-lg border-2 ${severityColors[match.severity]} ${designTokens.animation.transitions.fast}`}
    >
      <div className='flex items-start space-x-3'>
        <div className='flex-shrink-0'>
          <div
            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              match.severity === 'high'
                ? 'bg-red-500 text-white'
                : match.severity === 'medium'
                  ? 'bg-amber-500 text-white'
                  : 'bg-blue-500 text-white'
            }`}
          >
            !
          </div>
        </div>

        <div className='flex-1 min-w-0'>
          <h3 className={`${designTokens.typography.headings.h4} mb-2`}>
            Possible Duplicate Detected ({match.score}% match)
          </h3>

          <p className={`${designTokens.typography.body.medium} mb-2`}>{warning.message}</p>

          <p className={`${designTokens.typography.body.small} italic mb-3`}>{match.suggestion}</p>

          <div className='flex space-x-2'>
            <button
              onClick={onContinue}
              className={`${designTokens.component.button.primary} text-xs`}
            >
              Continue Anyway
            </button>

            <button
              onClick={onCancel}
              className={`${designTokens.component.button.secondary} text-xs`}
            >
              Review Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
