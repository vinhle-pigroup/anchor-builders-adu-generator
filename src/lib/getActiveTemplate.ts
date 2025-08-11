/**
 * Template management utilities
 */

export function getActiveTemplate(): string {
  return 'anchor-proposal-template';
}

export function getTemplatePath(): string {
  return '/templates/proposal-template.html';
}

export function logTemplateSelection(templateId: string): void {
  console.log(`[Template] Active template: ${templateId}`);
}