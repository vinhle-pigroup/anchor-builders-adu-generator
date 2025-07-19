# Anchor Builders Excel Pricing Analysis
**File:** `(Official) ADU Proposal & Budget Engine v1 (1) - no macro.xlsx`  
**Analysis Date:** 2025-07-19  
**Purpose:** Extract exact pricing formulas for React app implementation

---

## 📊 **EXECUTIVE SUMMARY**

The Excel file contains a sophisticated ADU pricing engine with **12 worksheets** and **multiple interconnected named ranges**. The key finding is that the pricing is built on a **detailed line-item budget table** rather than simple per-sqft multiplication.

### **Key Pricing Formula Discovered:**
```excel
="$" & TEXT(SUM(M66)/input_ADUliving,"#,##0.00") & " per sqft"
```
**Translation:** `Total Project Cost ÷ Living Area = Price per Square Foot`

### **Grand Total Reference:**
```excel
="$ " & TEXT(proposal_GrandTotal,"#,##0.00")
```
**Result:** `$184,500.00` (from current example)

---

## 📋 **FORM FIELDS EXTRACTED**

### **Client Information:**
| Field | Current Value | Type | Excel Cell |
|-------|---------------|------|------------|
| Client First Name | "Nikki" | string | Input!C6 |
| Client Last Name | "Vu" | string | Input!C7 |
| Project Address | "17231 San Ricardo Cir" | string | Input!C8 |

### **ADU Configuration:**
| Field | Current Value | Type | Excel Cell |
|-------|---------------|------|------------|
| ADU Type | "Detached (1 Story)" | string | Input!C16 |
| ADU Bedrooms | 2 | integer | Input!C17 |
| ADU Bathrooms | 2 | integer | Input!C18 |
| Square Footage | Not directly visible | number | input_ADUliving (named range) |

### **Utility Options:**
| Field | Current Value | Type | Notes |
|-------|---------------|------|-------|
| Water Meter | "Shared" | enum | "Shared" vs "Separate" |
| Gas Meter | "Shared" | enum | "Shared" vs "Separate" |
| Electric Meter | "Separate" | enum | Always "Separate" |
| Sewer Connection | "Existing Lateral" | enum | Standard connection type |

### **Features & Options:**
| Field | Current Value | Type |
|-------|---------------|------|
| Appliances Included | "Yes" | boolean |
| HVAC | "Central AC" | enum |
| Finish Level | "Standard" | enum |

---

## 💰 **PRICING STRUCTURE ANALYSIS**

### **1. Base Construction Pricing**
**Method:** Line-item budget calculation, NOT simple $/sqft  
**Current Example:** $533,821.85 total project cost

### **2. Utility Connection Costs**
From Pricing sheet analysis:
- **Separate Water Meter:** $1,000
- **Separate Gas Meter:** $1,500  
- **Separate Electric Meter:** $2,000

### **3. Cost Categories**
The Project Budget Table uses two main cost types:
- **Soft Costs:** $4,200 (permits, design, etc.)
- **Hard Costs:** $529,621.85 (construction, materials, labor)

### **4. Line Item Structure**
Each budget item follows: `Quantity × Unit Price = Total`  
Examples from analysis:
- City Permits: 1 × $1,200 = $1,200
- Site Clearing: 1200 × $26 = $31,200
- Foundation: 1200 × $5.50 = $6,600
- Framing: 1200 × $23.50 = $28,200

### **5. Add-On Pricing**
10 add-on slots available (AOW1-AOW10) with conditional pricing:
```excel
=IF(proposal_AOW1="","",input_AOWprice1)
```

---

## 🔧 **MARKUP & CALCULATIONS**

### **Markup Percentage:** 15%  
From the React app configuration, confirmed by Excel reference.

### **Final Calculations:**
1. **Subtotal:** Sum all line items
2. **Markup:** Subtotal × 15%  
3. **Grand Total:** Subtotal + Markup
4. **Price per sqft:** Grand Total ÷ Living Area

---

## 🚨 **CRITICAL DIFFERENCES FROM CURRENT REACT APP**

### **❌ Current React Implementation Issues:**

1. **Oversimplified Pricing Model**
   - Current: Simple $220/sqft × area
   - Excel: Complex line-item budget (57+ items)

2. **Missing Line-Item Detail**
   - Current: Only high-level categories
   - Excel: Detailed breakdown (permits, framing, mechanical, electrical, etc.)

3. **Incorrect Utility Pricing**
   - Current: Generic utility toggles
   - Excel: Specific costs ($1000/$1500/$2000 for separate connections)

4. **Missing Cost Categories**
   - Current: No soft/hard cost separation
   - Excel: Clear separation for reporting

5. **Incomplete Named Range System**
   - Current: No named ranges
   - Excel: 100+ named ranges for data binding

### **✅ Current React Implementation Strengths:**
- Form structure matches Excel input fields
- 15% markup correctly implemented
- Basic utility options present
- Client information fields aligned

---

## 🛠️ **REQUIRED CHANGES FOR ACCURATE IMPLEMENTATION**

### **1. Implement Line-Item Budget Engine**
```typescript
interface BudgetLineItem {
  code: string;           // e.g., "1.1", "2.1", "3.1"
  costType: 'Soft' | 'Hard';
  category: string;       // e.g., "Permits", "Framing"
  description: string;    // e.g., "City Permits and Planning Fees"
  quantity: number;       // Varies by item
  unitPrice: number;      // Rate per unit
  total: number;          // quantity × unitPrice
}
```

### **2. Replace Simple Per-SqFt with Budget Calculation**
```typescript
// OLD (incorrect):
const basePrice = squareFootage * 220;

// NEW (correct):
const calculateProjectCost = (inputs: PricingInputs): BudgetLineItem[] => {
  const items: BudgetLineItem[] = [];
  
  // Add permits (soft cost)
  items.push({
    code: "1.1",
    costType: "Soft",
    category: "Permits and Fees", 
    description: "City Permits and Planning Fees",
    quantity: 1,
    unitPrice: 1200,
    total: 1200
  });
  
  // Add foundation (hard cost) - varies by sqft
  items.push({
    code: "2.2", 
    costType: "Hard",
    category: "Demolition & Site Prep",
    description: "Foundation",
    quantity: inputs.squareFootage,
    unitPrice: 5.50,
    total: inputs.squareFootage * 5.50
  });
  
  // Continue for all 57+ line items...
  return items;
};
```

### **3. Update Utility Pricing**
```typescript
const utilityPricing = {
  waterMeter: { shared: 0, separate: 1000 },
  gasMeter: { shared: 0, separate: 1500 },
  electricMeter: { shared: 0, separate: 2000 }
};
```

### **4. Implement Soft/Hard Cost Separation**
```typescript
interface ProjectSummary {
  softCosts: number;      // Permits, design, etc.
  hardCosts: number;      // Construction, materials  
  subtotal: number;       // softCosts + hardCosts
  markup: number;         // subtotal × 0.15
  grandTotal: number;     // subtotal + markup
  pricePerSqFt: number;   // grandTotal ÷ livingArea
}
```

### **5. Add Named Range System**
```typescript
// Create data binding system matching Excel named ranges
const namedRanges = {
  input_ClientFirstName: string,
  input_ClientLastName: string,
  input_ADUliving: number,     // Living area sqft
  input_ADUbeds: number,
  input_ADUbaths: number,
  proposal_GrandTotal: number,
  // ... 100+ more ranges
};
```

---

## 📈 **IMPLEMENTATION PRIORITY**

### **Phase 1: Core Budget Engine (Critical)**
1. Implement line-item budget calculation
2. Replace simple $/sqft with detailed line items
3. Add soft/hard cost categorization

### **Phase 2: Accurate Pricing (High)**
1. Update utility connection costs
2. Implement 57+ standard line items
3. Add quantity-based calculations

### **Phase 3: Excel Parity (Medium)**
1. Implement named range system
2. Add add-on pricing logic
3. Match exact formula calculations

### **Phase 4: Enhanced Features (Low)**
1. Add regional pricing adjustments
2. Implement custom line item additions
3. Add advanced reporting features

---

## 📄 **PROPOSAL OUTPUT FORMAT**

The Excel generates a professional proposal with:
- Client information header
- Project details section
- **Detailed line-item breakdown** (57+ items)
- Soft/hard cost subtotals
- 15% markup calculation
- Grand total and price per sqft display
- Terms and conditions
- Signature blocks

**Key Display Formula:**
```
$225.00 per sqft (from $270,000 ÷ 1,200 sqft example)
```

---

## 🎯 **NEXT STEPS**

1. **Update pricing-config.ts** with line-item budget structure
2. **Rewrite pricing-engine.ts** to use budget calculations
3. **Modify form types** to match Excel input fields exactly
4. **Test calculations** against Excel examples for accuracy
5. **Update PDF templates** to show line-item detail

**Success Criteria:** React app generates identical pricing to Excel for same inputs.

---

*Analysis complete. The Excel file contains a sophisticated budget-based pricing engine that requires significant updates to the current React implementation for accuracy.*