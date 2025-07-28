# Anchor Builders ADU PDF Template - Design Specifications

**For Web Designer Review & Redesign**

## Current Template Overview

This document contains the complete design specifications for the Anchor Builders ADU PDF template. The template generates professional ADU construction proposals with dynamic content integration.

## Design Elements

### Color Palette
- **Primary Brand**: `#4f46e5` (Indigo)
- **Secondary Text**: `#374151` (Dark Gray)
- **Light Background**: `#f8fafc` (Light Blue-Gray)
- **Border Colors**: `#e2e8f0`, `#e5e7eb` (Light Gray variants)
- **Success Green**: `#059669` (for "included" items)
- **Warning Amber**: `#92400e` (design phase)
- **Purple**: `#7c3aed` (coordination phase)
- **Blue**: `#1d4ed8` (construction phase)

### Typography
- **Font Family**: Inter (Google Fonts)
- **Weights**: 300, 400, 500, 600, 700
- **Base Font Size**: 12px
- **Print Font Size**: 11px

### Layout Structure
- **Max Width**: 180mm (A4 optimized)
- **Padding**: 20px-28px sections
- **Grid System**: CSS Grid with responsive columns

## Template Sections

### 1. Header Section
- **Layout**: Logo left, contact/image right
- **Logo**: Anchor icon (⚓) with company name
- **Property Image**: 200x150px satellite view integration
- **Proposal Title**: Centered with borders
- **Date Badge**: Rounded with brand colors

### 2. Project Information
- **Background**: Light blue-gray (`#f8fafc`)
- **Grid**: 3-column layout
- **Cards**: White background with subtle shadows
- **Headers**: Brand purple with underlines

### 3. Scope & Specifications
- **Stats Cards**: 3-column feature display
- **Feature Lists**: 2-column grid with bullet points
- **Typography**: Small, condensed for detailed info

### 4. Cost Breakdown Table
- **Header**: Brand purple background
- **Phase Headers**: Color-coded by project phase
  - Design: Yellow (`#fef7cd`)
  - Coordination: Purple (`#f3e8ff`)
  - Construction: Blue (`#dbeafe`)
- **Totals Row**: Strong brand color emphasis

### 5. Footer Section
- **Background**: Full brand purple
- **Signature Section**: White embedded panel
- **Terms**: Small text with proper contrast

## Dynamic Content Variables

The template uses Handlebars syntax for dynamic content:

### Client Information
- `{{CLIENT_FIRST_NAME}}`
- `{{CLIENT_LAST_NAME}}`
- `{{CLIENT_PHONE}}`
- `{{CLIENT_EMAIL}}`

### Project Details
- `{{PROJECT_ADDRESS}}`
- `{{PROJECT_CITY}}`
- `{{PROJECT_STATE}}`
- `{{PROJECT_ZIP}}`
- `{{BEDROOMS}}`
- `{{BATHROOMS}}`
- `{{SQUARE_FOOTAGE}}`
- `{{ADU_TYPE}}`

### Pricing Variables
- `{{DESIGN_PRICE}}`
- `{{CONSTRUCTION_SUBTOTAL}}`
- `{{GRAND_TOTAL}}`
- `{{COST_PER_SQFT}}`
- `{{MILESTONE_1}}` through `{{MILESTONE_7}}`

### Special Features
- `{{PROPERTY_SATELLITE_IMAGE_BASE64}}` - Google Maps integration
- `{{PROPOSAL_DATE}}` - Formatted date display

## Print Optimization

### Page Break Controls
- Header: `page-break-after: avoid`
- Price section: `page-break-before: always`
- Footer: `page-break-inside: avoid`

### Print Styles
- Color preservation: `color-adjust: exact`
- Reduced margins for print
- Font size adjustments
- Enhanced table styling

## Current File Location

The live template is located at:
`/home/vinh/code/PiGroup-App/apps/anchor-builders-adu-generator/src/lib/pdf-template-generator.ts`

## Design Requirements

### Must-Have Features
1. **Professional Appearance**: Clean, modern business document
2. **Print Optimization**: Perfect A4 rendering
3. **Brand Consistency**: Anchor Builders visual identity
4. **Data Integration**: Seamless Handlebars templating
5. **Responsive Elements**: Proper spacing and alignment

### Design Constraints
- **Template Engine**: Handlebars syntax must be preserved
- **Print Size**: A4 paper (210mm × 297mm)
- **Color Support**: Print-safe color usage
- **Font Loading**: Web font compatibility

## Implementation Notes

The template is embedded as a template literal in TypeScript:
- Single HTML string with inline CSS
- Handlebars variables for dynamic content
- Print media queries included
- No external dependencies for styling

## Redesign Considerations

When redesigning, please maintain:
1. All existing Handlebars variables
2. Print-optimized structure
3. Professional business document aesthetics
4. Color accessibility standards
5. Proper page break handling

The new design should be provided as a complete HTML template with inline CSS that can replace the current template string in the TypeScript file.

---

**Contact**: This template serves Anchor Builders' ADU construction proposal generation system.
**Last Updated**: July 28, 2025