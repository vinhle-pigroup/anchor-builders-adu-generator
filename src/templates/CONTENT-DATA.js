// MASTER CONTENT DATA - Historical ADU Proposal Content
// This content stays identical across ALL template designs
// Only the visual styling changes, never the content

export const HISTORICAL_CONTENT = {
  // Exclusions Section - EXACT historical content
  EXCLUSIONS: {
    title: 'EXCLUSIONS',
    subtitle: '[Any work outside of the normal building of an ADU]',
    sections: {
      'City-Related Costs': [
        'City permits, planning approval fees, and third-party inspections',
        'Land grading, surveys, and soil testing (if required), including grading beyond the building foundation area',
      ],
      'Site Prep & Exterior Work': [
        'Cleaning or demolishing any existing or unpermitted structures',
        'Landscaping, fencing, driveways, patios, rain gutters',
        'Potential damage to underground irrigation or tree roots',
      ],
      'Utilities & Unexpected Conditions': [
        'Utility connections (gas, water, electric) or fire sprinkler system installation (if required)',
        'Unforeseen repairs like structural issues, pests, or water drainage',
        'Builder Risk insurance or city-required bonds for construction',
      ],
      'Security & Insurance': ['Job-site security or surveillance systems'],
    },
  },

  // Additional Services - EXACT historical content
  ADDITIONAL_SERVICES: {
    title: 'ADDITIONAL SERVICES (ADD ON)',
    subtitle: '[These are additional services that are not included]',
    services: {
      '1) Design Upgrades':
        'a. Customized option to personalize your project beyond our Standardized Material Package.',
      '2) Landscaping and Hardscaping Site Design':
        'a. Landscape and hardscaping services to improve the appearance and functionality of your property.',
      '3) Rental Plans':
        'a. Creation of a site plan to designate a parking spot for tenants, ensuring separation between rental units.',
    },
  },

  // Terms & Conditions - EXACT historical content
  TERMS_CONDITIONS: {
    title: 'TERMS & CONDITIONS',
    paragraphs: [
      'A formal construction contract will be prepared and executed upon acceptance of this bid. The pricing outlined in this proposal is valid for 30 days from the proposal date. A detailed payment schedule will be included in the formal contract.',
      "The overall project schedule is subject to factors such as city permitting timelines, material availability, and the client's responsiveness throughout the process.",
      'Any changes to the agreed-upon scope of work, materials, layout, or finish levels must be requested in writing and formally approved. Approved change orders may result in adjustments to both the total project cost and construction timeline. All changes will be documented and reflected with an updated scope, revised pricing, and adjusted schedule as needed.',
    ],
    disclaimer:
      '*This is a non-binding estimate. Final cost is subject to plan approval, scope adjustments, and change orders.*',
    footnotes:
      '¹ Interior Design – Includes 2 sessions (each session 2 hours). Additional sessions billed at $150/hour.',
  },

  // Scope of Work - Historical content structure
  SCOPE_SECTIONS: {
    'Design & Engineering': [
      'Complete architectural plans',
      'Structural engineering',
      'MEP design coordination',
      'Building permit assistance',
      'Plan check coordination',
    ],
    'Construction Features': [
      'Foundation & framing',
      'Complete electrical system',
      'Full plumbing system',
      'HVAC installation',
      'Standardized finishes package',
      'Kitchen appliances included',
    ],
    'Quality & Compliance': [
      'All building code compliance',
      'Professional inspections',
      'Testing & commissioning',
      'Certificate of Occupancy',
      '1-year construction warranty',
      'Licensed & insured contractor',
    ],
  },

  // License and Company Info
  COMPANY_INFO: {
    license_number: '1034567',
    phone: '(949) 396-6881',
    email: 'info@anchorbuilders.com',
    name: 'ANCHOR BUILDERS',
  },
};

// Usage Instructions:
// When creating ANY template design, import this file and use the content exactly as provided
// NEVER modify the content - only change the visual styling and layout
// This ensures all templates have identical, proven historical content
