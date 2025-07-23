export const THEME_COLORS = {
  // Primary brand colors
  primary: 'blue-600',
  primaryHover: 'blue-700',
  anchor: 'anchor-600',
  anchorHover: 'anchor-700',

  // UI colors
  slate: {
    50: 'slate-50',
    100: 'slate-100',
    200: 'slate-200',
    600: 'slate-600',
    700: 'slate-700',
    800: 'slate-800',
  },

  // Status colors
  success: 'green-600',
  warning: 'amber-600',
  error: 'red-600',

  // Background gradients
  gradients: {
    welcome: 'from-stone-100 to-blue-50',
    button: 'from-blue-500 to-anchor-500',
    buttonHover: 'from-blue-600 to-anchor-600',
  },
} as const;

export const COMPONENT_STYLES = {
  button: {
    primary:
      'bg-gradient-to-r from-blue-500 to-anchor-500 text-white hover:from-blue-600 hover:to-anchor-600 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-1',
    secondary:
      'bg-white text-stone-700 hover:bg-stone-50 transition-all shadow-lg border border-stone-200',
  },
  card: {
    base: 'bg-white rounded-lg shadow-sm',
    interactive: 'hover:shadow-md transition-shadow',
  },
  form: {
    input:
      'w-full px-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-anchor-500 focus:border-anchor-500 transition-colors',
    label: 'block text-sm font-medium text-slate-700 mb-2',
  },
} as const;
