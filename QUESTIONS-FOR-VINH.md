# Questions for Vinh - Updated Analysis

## Completed Tasks Summary (2025-08-21)
 **Electrical Panel Section**: Added with 200A default (included), 100A (+$2,500), 400A (+$5,000) - COMPLETED
 **Save As Functionality**: Implemented with File System Access API - COMPLETED  
 **Base Price Manual Entry**: ADU type selection always asks for price per sqft - COMPLETED
 **Utilities Custom Pricing**: All utilities ask "What is the price?" when separate - COMPLETED
 **Horizontal Timeline Template**: Restored from design vault v1.1 - COMPLETED
 **PDF Generation Updates**: Electrical panel data passed to PDF - COMPLETED
 **Build Verification**: ESLint clean, TypeScript clean, Build successful - COMPLETED

## Pricing Validation Analysis

### Real Proposals Available for Testing
Based on files in `/docs/testing/files for price validation/`:

1. **My Le - 13351 Barney St (600sqft)**
   - File: `My Le+13351 Barney St.+ADU Proposal (600sqft).pdf`
   - Excel: `barney 600sqft.xlsm`
   - Test Case: Small unit (<600sqft) should use $250/sqft base price

2. **My Le - 13351 Barney St (750sqft)**
   - File: `My Le+13351 Barney St.+ADU Proposal (750sqft).pdf`
   - Excel: `barney 750sqft.xlsm`
   - Test Case: Standard unit should use $240/sqft base price

3. **My Le - 13351 Barney St (Garage Conversion)**
   - File: `My Le+13351 Barney St.+ADU Proposal (Garage Conversion).pdf`
   - Test Case: Garage conversion pricing model

4. **Christina Rubiano - 21848 S Margie Ln**
   - File: `Christtina Rubiano+21848 S Margie Ln+ADU Proposal.pdf`
   - Test Case: Standard detached ADU

5. **9677 Shamrock - 04/01/2025**
   - File: `ADU Proposal - 9677 Shamrock 04012025.pdf`
   - Test Case: Recent proposal with April 2025 date

### New Validation Files (Added 2025-08-21)
From `/new files for price validation and information/`:

6. **Anh Duong - 4061 Northpark Cir**
7. **Diane Bui - 10614 El Este Ave**
8. **Lillian Orellana - 9422 Grand Dr**
9. **Luis Galvan - 13582 Barnett Way**

Plus material boards:
- **ANCHOR BUILDERS STANDARD MATERIAL BOARD AS OF 08.07.2025-FINAL.pdf**
- **Anchor Builder Material Board ADU - updated 06.03.2025.pdf**

## Current Pricing Implementation

### Base Pricing Structure (As Configured)
- **Base Price**: $240/sqft (standard, user must enter manually)
- **Small Units** (<600 sqft): $250/sqft (should be entered manually)
- **Design Services**: $8,500-$12,500 range
- **Extra Bathroom**: $8,000
- **Dedicated Driveway**: $5,000
- **Basic Landscaping**: $10,000
- **Utilities (Separate)**: User must enter price (no defaults)
- **Electrical Panel**: 
  - 200A: Included in base price
  - 100A: +$2,500
  - 400A: +$5,000

### Milestone Payment Structure
- **D1 (Deposit)**: $1,000 fixed
- **D2 (Design)**: $12,500 fixed
- **M1-M7**: Calculated based on project total
- Construction milestones must total 100%
- All milestones are editable except D1 and D2

## Questions & Potential Discrepancies

### 1. PDF Template Validation
**Question**: Does the current horizontal timeline template (v1.1) match the format in the real proposals?
- Current template has 120px connecting line between phases
- Two-circle design (Design & Permitting ’ Construction)
- 9px compact font with Inter family

### 2. Pricing Accuracy
**Unable to validate exact pricing without PDF text extraction**
- Cannot read PDF content to verify exact amounts
- Excel files (.xlsm) may contain detailed breakdowns but cannot be parsed
- Recommend manual verification of:
  - 600sqft proposal should show ~$150,000 base ($250/sqft)
  - 750sqft proposal should show ~$180,000 base ($240/sqft)

### 3. Electrical Panel Pricing
**Question**: Are the electrical panel upgrade prices correct?
- 100A upgrade: $2,500 (is this the right amount?)
- 400A upgrade: $5,000 (is this the right amount?)
- Should there be other amperage options (150A, 300A)?

### 4. Utilities Pricing
**Current Implementation**: Always asks for custom price
**Question**: Should there be suggested amounts shown in the popup?
- Water meter separation: Typical cost?
- Gas meter separation: Typical cost?
- Sewer connection: Typical cost?
- Electric meter: Always separate (no cost?)

### 5. Two-Story ADU Pricing
**Current Implementation**: Custom price popup when 2-story selected
**Question**: What's the typical add-on percentage or amount for 2-story?
- Should it be a percentage of base (e.g., +10%)?
- Or fixed amount (e.g., +$25,000)?

### 6. FEMA Compliance
**Current Implementation**: Custom price popup
**Question**: What's the typical FEMA compliance cost?
- Should there be a default suggestion?
- Does it vary by square footage?

### 7. HVAC Custom Pricing
**Current Implementation**: Custom price for non-standard HVAC
**Question**: What are typical costs for:
- Central AC (currently included in base)
- Mini-split system upgrade?
- Other HVAC options?

## Testing Recommendations

### Manual Validation Needed
Since PDF text extraction is not available, recommend:

1. **Open each real proposal PDF** and compare:
   - Total price calculation
   - Milestone payment breakdown
   - Add-on pricing
   - Template layout and design

2. **Create test proposals** matching real ones:
   - 600sqft detached ADU
   - 750sqft detached ADU
   - Garage conversion
   - With various add-ons

3. **Compare side-by-side**:
   - Generated PDF vs Real PDF
   - Pricing breakdown
   - Milestone schedule
   - Visual layout

## Implementation Notes

### What's Working Well
- Fuzzy city matching with Orange County validation
- Custom pricing popups for flexibility
- Editable milestone system
- Friends & Family discount options
- Horizontal timeline template restored
- Electrical panel section integrated

### Areas Needing Clarification
1. Default/suggested prices for utilities
2. Two-story ADU pricing model
3. FEMA compliance typical costs
4. Electrical panel upgrade pricing verification
5. Template visual comparison with real proposals

## Next Steps
1. Manual comparison of generated PDFs with real proposals
2. Verify pricing calculations match Excel spreadsheets
3. Confirm electrical panel pricing is accurate
4. Test all utility combinations with custom pricing
5. Validate milestone calculations against real examples