# 📋 COMPLETE TEMPLATE VARIABLES REFERENCE

**Date**: 2025-08-08  
**Status**: ✅ ALL ENHANCED TEMPLATE VARIABLES IMPLEMENTED  
**Purpose**: Ensure no `{{VARIABLE}}` patterns remain unreplaced in PDF output

---

## 🎯 TEMPLATE VARIABLES ADDED (Latest Updates)

### **Proposal Information**
- `PROPOSAL_NUMBER` - Generated unique number (format: AB-YYYYMMDD-XXXX)
- `PROPOSAL_VALID_UNTIL` - Same as expiration date (30 days from now)

### **Project Details**  
- `ADU_TYPE` - Same as project type (detached/attached)
- `PROJECT_OVERVIEW_TEXT` - Default description text
- `TIMELINE` - Project timeline from pricing data
- `DESIGN_AMOUNT` - 5% of base cost for design phase

### **Utility & Connection Details** (Default Values)
- `HVAC_TYPE` - "Central AC"
- `ELECTRICAL_PANEL` - "New 200A Panel" 
- `ELECTRIC_CONNECTION_DETAIL` - "New separate meter"
- `GAS_CONNECTION` - "Shared meter"
- `WATER_CONNECTION` - "Shared meter" 
- `SEWER_CONNECTION_DETAIL` - "Existing lateral connection"

### **Milestone Payment Breakdown** (7 phases)
- `MILESTONE_1` - 10% of total (Contract signing)
- `MILESTONE_2` - 15% of total (Permits approved)
- `MILESTONE_3` - 20% of total (Foundation complete)
- `MILESTONE_4` - 20% of total (Framing complete) 
- `MILESTONE_5` - 15% of total (Rough plumbing/electrical)
- `MILESTONE_6` - 15% of total (Insulation/drywall)
- `MILESTONE_7` - 5% of total (Final inspection)

---

## 📊 EXISTING VARIABLES (Previously Working)

### **Client Information**
- `CLIENT_NAME` - Full client name
- `CLIENT_FIRST_NAME` - First name only
- `CLIENT_EMAIL` - Client email address
- `CLIENT_PHONE` - Client phone number
- `CLIENT_ADDRESS` - Client address

### **Project Information**
- `PROJECT_ADDRESS` - Project address
- `PROJECT_TYPE` - ADU type (detached/attached)
- `BEDROOMS` - Number of bedrooms
- `BATHROOMS` - Number of bathrooms  
- `SQUARE_FOOTAGE` - Living area square footage

### **Pricing Information**
- `BASE_COST` - Base construction cost
- `TOTAL_COST` - Total project cost
- `GRAND_TOTAL` - Same as total cost
- `COST_PER_SQFT` - Cost per square foot
- `ESTIMATED_TIMELINE` - Project timeline

### **Phase Totals**
- `PHASE_1_TOTAL` - Design & deposits phase
- `PHASE_3_TOTAL` - Construction phase

### **Additional Services** 
- `ADDITIONAL_SERVICES_TOTAL` - Total of all add-ons
- `ADD_ON_WORK_EXISTS` - Boolean flag for conditional display
- `ADD_ON_ITEMS` - Array for {{#each}} loops (with number, name, description, cost)

### **Date Information**
- `PROPOSAL_DATE` - Current date
- `EXPIRATION_DATE` - 30 days from now

---

## 🔧 IMPLEMENTATION DETAILS

### **File Location**: `src/lib/pdf-template-generator.ts`
**Method**: `createVariableMap()` (Lines 290-360)

### **Variable Generation Pattern**:
```typescript
// Basic data mapping
variables.VARIABLE_NAME = proposalData.source?.field || 'default_value';

// Calculated values
variables.CALCULATED_AMOUNT = this.formatCurrency(calculation_result);

// Generated values
variables.UNIQUE_ID = this.generateUniqueValue();
```

### **Template Usage Pattern**:
```html
<!-- Simple replacement -->
<span>{{VARIABLE_NAME}}</span>

<!-- Conditional display -->
{{#if CONDITION}}
  Content shows when condition is true
{{/if}}

<!-- Loop through arrays -->
{{#each ARRAY_NAME}}
  <div>{{property}} - {{another_property}}</div>
{{/each}}
```

---

## ✅ VERIFICATION CHECKLIST

### **Template Variable Completeness**:
- [x] All `{{VARIABLE}}` patterns from Enhanced template identified
- [x] All missing variables implemented in createVariableMap
- [x] Default values provided for utility connections  
- [x] Milestone payment breakdown calculated
- [x] Proposal numbering system implemented

### **Testing Requirements**:
- [ ] Generate PDF with Enhanced template
- [ ] Verify no `{{VARIABLE}}` patterns remain in output
- [ ] Check milestone amounts add up to total
- [ ] Confirm proposal number is unique
- [ ] Validate expiration date calculation

---

## 🎯 EXPECTED RESULT

**Before Fix**:
```
Proposal Date: 8/7/2025
Proposal #: {{PROPOSAL_NUMBER}}
Valid Until: {{PROPOSAL_VALID_UNTIL}}
```

**After Fix**:
```
Proposal Date: 8/7/2025  
Proposal #: AB-20250808-1234
Valid Until: 9/7/2025
```

---

## 🛡️ MAINTENANCE NOTES

### **Adding New Variables**:
1. Add to `createVariableMap()` method in pdf-template-generator.ts
2. Use appropriate data source from ProposalData
3. Format currency with `this.formatCurrency()` for money values
4. Provide default values for missing data

### **Variable Naming Convention**:
- Use ALL_CAPS with underscores
- Be descriptive but concise
- Match exactly what template expects
- Group related variables together in code

### **Testing New Variables**:
1. Add variable to createVariableMap method
2. Run TypeScript compilation check
3. Test PDF generation with Enhanced template  
4. Verify variable is replaced correctly
5. Update this documentation

---

**🔒 COMPREHENSIVE TEMPLATE VARIABLE SYSTEM COMPLETE**

*All Enhanced template variables now implemented. No more unreplaced `{{VARIABLE}}` patterns should appear in PDF output.*