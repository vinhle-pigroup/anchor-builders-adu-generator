/**
 * Design Tokens for Beautiful + Practical Hybrid Implementation
 *
 * Combines ChatGPT's smart density recommendations with beautiful visual styling
 *
 * Phase 1: Smart Density (ChatGPT suggestions)
 * - Tighter spacing for better information density
 * - Optimized input heights and typography
 * - More efficient use of screen real estate
 *
 * Phase 2: Beautiful Visuals (User requirements)
 * - Maintain gradient backgrounds and premium feel
 * - Sophisticated hover effects and animations
 * - Professional color palette and visual hierarchy
 */

// === PHASE 1: SMART DENSITY TOKENS ===
export const densityTokens = {
  // Card padding - reduced from p-4 to p-3 (ChatGPT suggestion)
  cardPadding: 'p-3',

  // Grid gaps - reduced from gap-3 to gap-2 (ChatGPT suggestion)
  gridGap: 'gap-2',

  // Input height - reduced from h-10 to h-9 (ChatGPT suggestion)
  inputHeight: 'h-9',

  // Label size - smaller for better density (ChatGPT suggestion)
  labelSize: 'text-[13px]',

  // Section spacing - 10-15% reduction
  sectionSpacing: 'space-y-2', // reduced from space-y-3

  // Form field vertical spacing
  fieldSpacing: 'space-y-1.5', // reduced from space-y-2

  // Button padding - more compact
  buttonPadding: 'px-3 py-1.5', // reduced from px-4 py-2
} as const;

// === PHASE 2: BEAUTIFUL VISUAL TOKENS ===
export const visualTokens = {
  // Gradient backgrounds (homepage-inspired stone/blue palette)
  gradients: {
    primary: 'bg-gradient-to-br from-stone-50 to-blue-50',
    secondary: 'bg-gradient-to-r from-stone-100 to-blue-50',
    accent: 'bg-gradient-to-br from-emerald-50 to-teal-50',
    warm: 'bg-gradient-to-br from-orange-50 to-amber-50',
    header: 'bg-gradient-to-r from-stone-600 to-blue-600', // For colored headers
  },

  // Sophisticated shadows and depth
  shadows: {
    subtle: 'shadow-sm',
    elevated: 'shadow-lg',
    floating: 'shadow-xl',
    dramatic: 'shadow-2xl',
  },

  // Premium border treatments
  borders: {
    subtle: 'border border-slate-200',
    accent: 'border-2 border-blue-300',
    success: 'border-2 border-emerald-300',
    warning: 'border-2 border-amber-300',
  },

  // Professional color palette (homepage-inspired)
  colors: {
    // Homepage stone palette
    stone: {
      50: '#fafaf9',
      100: '#f5f5f4',
      200: '#e7e5e4',
      500: '#78716c',
      600: '#57534e',
      700: '#44403c',
      800: '#292524',
    },
    // Homepage blue palette
    blue: {
      50: '#eff6ff',
      100: '#dbeafe',
      200: '#bfdbfe',
      400: '#60a5fa',
      500: '#3b82f6',
      600: '#2563eb',
      700: '#1d4ed8',
    },
    // Brand anchor colors
    anchor: {
      50: '#f0f7ff',
      100: '#e0efff',
      500: '#1b365d', // Brand navy
      600: '#14284a',
    },
    gold: {
      50: '#fefce8',
      100: '#fef3c7',
      500: '#d4a574', // Brand gold
      600: '#c69963',
    },
  },
} as const;

// === TYPOGRAPHY TOKENS ===
export const typographyTokens = {
  // Headings with premium styling (homepage-inspired colors)
  headings: {
    h1: 'text-2xl font-bold text-stone-800',
    h2: 'text-xl font-semibold text-stone-700',
    h3: 'text-lg font-medium text-stone-700',
    h4: 'text-base font-medium text-stone-700',
  },

  // Section headers with darker blue caps like screenshot
  sectionHeaders: {
    primary:
      'text-sm font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wide bg-blue-50 dark:bg-blue-900/30 px-4 py-2 rounded-t-lg border-b border-blue-200 dark:border-blue-700',
    secondary:
      'text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 px-3 py-1.5',
    accent: 'text-sm font-medium text-blue-700 dark:text-blue-400 px-3 py-1.5',
    subtle: 'text-sm font-medium text-gray-600 dark:text-gray-300 px-3 py-1.5',
  },

  // Body text with improved readability (homepage-inspired)
  body: {
    large: 'text-base text-stone-700',
    medium: 'text-sm text-stone-600',
    small: 'text-xs text-stone-500',
  },

  // Labels with better density (ChatGPT suggestion + homepage colors)
  labels: {
    primary: `${densityTokens.labelSize} font-medium text-stone-700 dark:text-gray-200`,
    secondary: 'text-xs font-normal text-stone-500 dark:text-gray-400',
    required: 'text-xs font-medium text-red-600 dark:text-red-400',
  },
} as const;

// === ANIMATION TOKENS ===
export const animationTokens = {
  // Smooth transitions for premium feel
  transitions: {
    fast: 'transition-all duration-150 ease-out',
    normal: 'transition-all duration-200 ease-out',
    slow: 'transition-all duration-300 ease-out',
  },

  // Hover effects maintaining beautiful visuals
  hover: {
    subtle: 'hover:shadow-md hover:scale-[1.02]',
    moderate: 'hover:shadow-lg hover:scale-105',
    dramatic: 'hover:shadow-2xl hover:scale-108', // pricing summary effect
  },

  // Focus states for accessibility
  focus: {
    ring: 'focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
    outline: 'focus-visible:outline-2 focus-visible:outline-blue-500',
  },
} as const;

// === VALIDATION TOKENS ===
export const validationTokens = {
  // Clean validation styling - minimal borders like original screenshot
  states: {
    empty:
      'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400', // Dark mode input fields
    filled:
      'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 text-gray-900 dark:text-gray-100', // Dark mode filled
    error:
      'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 text-gray-900 dark:text-gray-100', // Dark mode error
    success:
      'bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 focus:border-blue-400 dark:focus:border-blue-500 text-gray-900 dark:text-gray-100', // Dark mode success
    focus:
      'bg-white dark:bg-gray-700 border-blue-400 dark:border-blue-500 focus:ring-1 focus:ring-blue-200 dark:focus:ring-blue-600 text-gray-900 dark:text-gray-100',
  },

  // Validation message styling
  messages: {
    error: 'text-xs text-red-600 mt-1',
    success: 'text-xs text-green-600 mt-1',
    tip: 'text-xs text-slate-500 mt-1',
    required: 'text-xs text-red-500',
  },
} as const;

// === LAYOUT TOKENS ===
export const layoutTokens = {
  // Container widths and spacing
  containers: {
    form: 'max-w-7xl mx-auto',
    section: 'w-full',
    sidebar: 'w-80', // pricing sidebar
  },

  // Grid layouts with smart density
  grids: {
    threeColumn: `grid grid-cols-1 lg:grid-cols-3 ${densityTokens.gridGap}`,
    twoColumn: `grid grid-cols-1 md:grid-cols-2 ${densityTokens.gridGap}`,
    autoFit: `grid grid-cols-[repeat(auto-fit,minmax(300px,1fr))] ${densityTokens.gridGap}`,
  },

  // Spacing utilities
  spacing: {
    section: densityTokens.sectionSpacing,
    field: densityTokens.fieldSpacing,
    card: densityTokens.cardPadding,
  },
} as const;

// === COMPONENT-SPECIFIC TOKENS ===
export const componentTokens = {
  // Enhanced input styling
  input: {
    base: `${densityTokens.inputHeight} ${typographyTokens.labels.primary} ${animationTokens.transitions.normal}`,
    padding: 'px-3 py-2',
    placeholder: 'placeholder:text-slate-400 placeholder:font-normal',
  },

  // Beautiful button variants
  button: {
    primary: `${densityTokens.buttonPadding} bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md ${animationTokens.transitions.fast}`,
    secondary: `${densityTokens.buttonPadding} bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-md ${animationTokens.transitions.fast}`,
    success: `${densityTokens.buttonPadding} bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-md ${animationTokens.transitions.fast}`,
    warning: `${densityTokens.buttonPadding} bg-orange-500 hover:bg-orange-600 text-white font-medium rounded-md ${animationTokens.transitions.fast}`,
  },

  // Premium card styling
  card: {
    base: `${densityTokens.cardPadding} ${visualTokens.gradients.primary} rounded-lg ${visualTokens.shadows.elevated} ${visualTokens.borders.subtle}`,
    interactive: `${densityTokens.cardPadding} ${visualTokens.gradients.primary} rounded-lg ${visualTokens.shadows.elevated} ${visualTokens.borders.accent} ${animationTokens.hover.subtle}`,
    pricing: `${densityTokens.cardPadding} ${visualTokens.gradients.primary} rounded-lg ${visualTokens.shadows.dramatic} ${visualTokens.borders.accent} sticky top-4`,
  },
} as const;

// === UTILITY FUNCTIONS ===

/**
 * Merge design tokens with custom classes
 */
export function mergeTokens(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Get responsive spacing based on screen size
 */
export function responsiveSpacing(mobile: string, desktop: string): string {
  return `${mobile} lg:${desktop}`;
}

/**
 * Apply validation styling based on field state
 */
export function getValidationClasses(
  state: 'empty' | 'filled' | 'error' | 'success' | 'focus'
): string {
  return mergeTokens(
    componentTokens.input.base,
    validationTokens.states[state],
    animationTokens.transitions.normal
  );
}

// === EXPORT CONSOLIDATED TOKENS ===
export const designTokens = {
  density: densityTokens,
  visual: visualTokens,
  typography: typographyTokens,
  animation: animationTokens,
  validation: validationTokens,
  layout: layoutTokens,
  component: componentTokens,
  utils: {
    merge: mergeTokens,
    responsive: responsiveSpacing,
    validation: getValidationClasses,
  },
} as const;

export default designTokens;
