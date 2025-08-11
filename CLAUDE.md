# CLAUDE.md – Anchor Builders ADU Generator
**Service**: `apps/anchor-builders-adu-generator` (React + Vite)  
**Platform**: Railway | **Status**: ✅ Active

> This is the Anchor Builders ADU proposal generator with ultra-compact design and complete form functionality.

---

## 📋 **FORM CONTENT - SINGLE SOURCE OF TRUTH**

**✅ CONTENT VERIFICATION COMPLETE (2025-08-10)**

All form content has been verified against user screenshots and is now stored in:
```
src/data/form-content.ts
```

### **Card 1 - CLIENT INFORMATION** (HOL Design Structure)
- [x] Proposal # (auto-generated AB-2025-######) and Date (auto-generated)
- [x] **Primary Client** section:
  - [x] First Name and Last Name (separate fields)
  - [x] Email and Phone (grid layout)
- [x] **Secondary Client (Optional)** section:
  - [x] First Name and Last Name (separate fields) 
  - [x] Email and Phone (grid layout)
- [x] **Property Address** section:
  - [x] Full address field
  - [x] City, State, ZIP (3-column grid)
- [x] **Friends & Family Discount** checkbox (10% off)

### **Card 2 - ADU CONFIGURATION** 
- [x] ADU Type buttons (Detached, Attached, JADU)
- [x] "▶ More types" link under ADU Type
- [x] Square Footage buttons (400, 800, 1000, 1200) + custom input
- [x] Bedrooms (Studio, 1, 2, 3, 4) and Bathrooms (0, 1, 2, 3)
- [x] ❄️ HVAC section (Central AC Available, Mini-Split Available)
- [x] ⚡ Utilities section (Water Shared, Sewer Separate, Gas Separate, Electric Shared)
- [x] ➕ Additional Services:
  - [x] Extra Bathroom (+$8,000)
  - [x] Dedicated Driveway (+$5,000) 
  - [x] Basic Landscaping (+$10,000)
  - [x] "+ Add More" text link
  - [x] "Click 'Add More' to create custom services" helper text

### **Card 3 - DESIGN SERVICES**
- [x] Professional Design Services checkbox (+$12,500)
  - [x] Description: "Architectural plans, structural engineering, and permit assistance"
- [x] Solar Ready checkbox
- [x] FEMA Compliance checkbox

### **Card 4 - ADDITIONAL NOTES**
- [x] Additional Notes text area
- [x] Placeholder: "Any special requirements, preferences, or project details..."

### **RIGHT SIDEBAR - PROJECT SUMMARY**
- [x] Project Summary section with detailed breakdown:
  - [x] Client name, Address, ADU Type, Size, Layout
  - [x] HVAC selection display
  - [x] Utilities status (All Shared)
  - [x] Design services status
  - [x] Add-ons breakdown with individual prices
- [x] Breakdown section:
  - [x] Base: $160,000
  - [x] Design: $12,500 (when selected)
  - [x] Utilities: $1,500
  - [x] Add-ons: Dynamic total based on selections
- [x] Total calculation: Base + Utilities + Design + Add-ons

---

## 🎨 **DESIGN SYSTEM**

### **HOL Design Integration:**
- **Client Information Card**: Follows HOL design structure with Primary/Secondary client sections
- **Field Organization**: Separate first/last name fields, proper grid layouts
- **Content Structure**: Matches HOL user experience patterns while maintaining Anchor Builders branding

### **Ultra-Compact Design Applied:**
- Font sizes: `text-[7px]` to `text-[12px]`
- Input heights: `h-6` 
- Spacing: `space-y-0.5`, `space-y-1.5`
- Padding: `p-1`, `p-1.5`, `px-2 py-1`

### **Color Theme:**
- Primary: Blue (`bg-blue-800`, `bg-blue-600`)
- Accents: Blue variations (`text-blue-600`, `border-blue-300`)
- Success: Blue (`bg-blue-500`)
- Text: Slate colors for hierarchy

### **Layout:**
- 2x2 card grid on desktop
- Numbered cards (1-4) with completion percentages
- Mobile accordion functionality
- 280px sidebar with project summary

---

## 🔧 **DEVELOPMENT NOTES**

### **Content Management:**
- **NEVER** hardcode form labels/options in components
- **ALWAYS** reference `src/data/form-content.ts` for content
- Use helper functions: `getFormSection()`, `getFormField()`, `getFieldOptions()`

### **Build Process:**
```bash
npm run build    # ✅ Passes successfully
npm run dev      # Local development
npm run lint     # Code quality checks
```

### **📌 ACTIVE FILES (Use These):**
- `src/components/EnhancedProductionGrid.tsx` - Main form component  
- `src/data/form-content.ts` - Single source of truth for ALL content
- `src/types/proposal.ts` - TypeScript interfaces
- `src/data/pricing-config.ts` - Pricing calculations
- `src/lib/pdf-template-generator.ts` - PDF generation engine
- `public/ENHANCED-DESIGN.html` - Active PDF template (21 variables)
- `src/App.tsx` - Main application component

### **⚠️ ARCHIVED FILES (Do Not Use):**
- `archive/2025-08-11-production-cleanup/` - All backup/duplicate files moved here
  - 14 component backup versions
  - 10 duplicate PDF templates  
  - 4 library backup files
  - Complete design-backups folder
- **Files archived**: EnhancedProductionGrid-*.tsx, *.backup, *-Clean.tsx, etc.
- **Recovery**: See `archive/2025-08-11-production-cleanup/README.md` for details

---

## 🚨 **CONTENT PROTECTION RULES**

1. **Before any redesign:** Check `src/data/form-content.ts` for complete content list
2. **Never delete content:** Move unused content to comments, don't delete
3. **Add new content:** Update `form-content.ts` FIRST, then implement UI
4. **Verify completeness:** Compare against screenshots in `/home/vinh/screenshots/`

### **Reference Screenshots:**
- `Screenshot 2025-08-10 011454.png` - Complete form with all content
- `Screenshot 2025-08-10 011510.png` - Alternate view with all fields

---

## 📋 **PENDING TASKS**

### **⚠️ PDF Template Updates Required:**
- [ ] **CRITICAL**: Update PDF template to include secondary client section
  - **File to edit**: `src/templates/anchor-proposal-template.html`
  - **Location**: Around lines 346-351 in the `.client-info-card` section
  - **Current structure**: Only has `{{CLIENT_NAME}}`, `{{CLIENT_ADDRESS}}`, `{{CLIENT_PHONE}}`, `{{CLIENT_EMAIL}}`
  - **Required changes**:
    - Add conditional secondary client section after primary client
    - Variables: `{{secondaryClientFirstName}}`, `{{secondaryClientLastName}}`, `{{secondaryClientEmail}}`, `{{secondaryClientPhone}}`
    - Use conditional logic to only show if secondary client data exists
    - Maintain visual consistency with existing client-info-card styling

### **Template Integration Notes:**
- Form now captures secondary client data but PDF template needs updating
- Consider conditional rendering: only show secondary client section if data exists
- Maintain consistent formatting with primary client section
- Test with both single client and dual client scenarios

---

## ✅ **VERIFICATION STATUS**

- [x] All content from screenshots implemented
- [x] Ultra-compact design applied  
- [x] Blue color theme implemented
- [x] Single source of truth created (`form-content.ts`)
- [x] Build passes successfully
- [x] TypeScript compilation successful
- [x] No content missing vs screenshots

**Last Content Audit**: 2025-08-10 by Claude
**Status**: ✅ Complete and Protected

---

## 🐛 **RECENT BUG FIXES (2025-08-11)**

### **Fixed Issues:**

1. **Studio/0 Bathroom Selection** ✅
   - **Issue**: Bedrooms and bathrooms were initializing at 2 instead of 0
   - **Fix**: Changed initialization in `App.tsx` to start at 0 (Studio/0 bathrooms)
   - **Files**: `src/App.tsx` (lines 2003-2005)

2. **Utilities Display** ✅
   - **Issue**: Utilities showing as "All Shared" regardless of selection
   - **Fix**: Updated utilities display logic to show actual selections
   - **Files**: 
     - `src/components/EnhancedProductionGrid.tsx` (lines 1399-1419, utilities display)
     - `src/components/EnhancedProductionGrid.tsx` (lines 213-217, pricing calculation)
     - `src/components/SidebarWithPricing.tsx` (lines 50-56, utilities data flow)

3. **Dynamic Pricing** ✅
   - **Issue**: Pricing appeared hardcoded, not updating with selections
   - **Fix**: Replaced hardcoded values with dynamic calculations from liveCalculation
   - **Files**: `src/components/EnhancedProductionGrid.tsx` (lines 1456-1461)

4. **Header Spacing** ✅
   - **Issue**: Form cards were tucked under the header
   - **Fix**: Increased padding-top from 60px to 80px
   - **Files**: `src/components/EnhancedProductionGrid.tsx` (line 613)

5. **PDF Generation Template** ✅
   - **Issue**: PDF was printing home page instead of proposal template
   - **Fix**: Updated template resolver to use existing `ENHANCED-DESIGN.html`
   - **Files**: 
     - `src/lib/getActiveTemplate.ts` (lines 20-23, template order)
     - `src/lib/pdf-template-generator.ts` (lines 813-822, template mapping)
   - **Template File**: `public/ENHANCED-DESIGN.html` (55KB, verified exists)