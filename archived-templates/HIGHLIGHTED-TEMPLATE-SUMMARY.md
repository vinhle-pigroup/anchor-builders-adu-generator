# Form Input Mapping Template

**File:** `anchor-proposal-compact-HIGHLIGHTED-TEMP.html`
**Purpose:** Temporary file highlighting all form input variables in light pink for data mapping analysis
**Created:** 2025-08-15

## 🔍 **Three-Check Verification Completed**

All template variables have been thoroughly checked **3 times** and highlighted with light pink background:

## 📋 **Complete List of Form Input Variables (32 instances)**

### **Client Information (4 variables)**
1. `{{CLIENT_NAME}}` - Client full name (header + signature)
2. `{{CLIENT_PHONE}}` - Contact phone number
3. `{{CLIENT_EMAIL}}` - Contact email address  
4. `{{CLIENT_ADDRESS}}` - Project address
5. `{{CLIENT_FIRST_NAME}}` - First name only (signature section)

### **Project Specifications (4 variables)**
6. `{{SQUARE_FOOTAGE}}` - Living area in square feet
7. `{{BEDROOMS}}` - Number of bedrooms
8. `{{BATHROOMS}}` - Number of bathrooms
9. `{{ADU_TYPE}}` - Type of ADU (Detached/Attached/JADU)

### **Project Summary (3 variables)**
10. `{{GRAND_TOTAL}}` - Total project cost (appears 4 times: header, pricing table, payment notes, signature)
11. `{{COST_PER_SQFT}}` - Cost per square foot (appears 2 times: header + pricing table)
12. `{{TIMELINE}}` - Project timeline duration

### **Project Description (1 variable)**
13. `{{PROJECT_OVERVIEW_TEXT}}` - Custom project description text

### **Technical Specifications (1 variable)**
14. `{{ELECTRICAL_PANEL}}` - Electrical panel type (appears 2 times: scope + utilities)

### **Pricing Breakdown (4 variables)**
15. `{{DESIGN_AMOUNT}}` - Design services cost (appears 2 times: pricing table + milestones)
16. `{{PHASE_1_TOTAL}}` - Phase 1 total cost
17. `{{PHASE_3_TOTAL}}` - Phase 3 total cost  
18. `{{ADDITIONAL_SERVICES_TOTAL}}` - Additional services total

### **Payment Milestones (7 variables)**
19. `{{MILESTONE_1}}` - Mobilization payment (appears 3 times: schedule + 2 in notes)
20. `{{MILESTONE_2}}` - Underground work payment
21. `{{MILESTONE_3}}` - Foundation payment
22. `{{MILESTONE_4}}` - Framing payment
23. `{{MILESTONE_5}}` - MEP payment
24. `{{MILESTONE_6}}` - Drywall payment
25. `{{MILESTONE_7}}` - Final payment

## 🎨 **Visual Highlighting Details**

**CSS Class:** `.form-input-highlight`
**Styling:**
- Background: `#fce4ec` (light pink)
- Border: `1px solid #f8bbd9` (pink border)
- Font: Bold with dark pink text (`#880e4f`)
- Box shadow for visibility
- Print-safe colors with `color-adjust: exact`

## 📍 **Variable Locations by Section**

### Header Section
- Client Name, Phone, Email, Address
- Square Footage, Bedrooms, Bathrooms, ADU Type
- Grand Total, Cost per Sq Ft, Timeline

### Project Overview
- Project Overview Text

### Scope of Work  
- Electrical Panel (2 instances)

### Pricing Table
- Design Amount, Phase Totals, Additional Services Total
- Grand Total, Cost per Sq Ft

### Payment Schedule
- Design Amount, All 7 Milestones

### Payment Notes
- Grand Total, Milestone 1 (examples)

### Signature Section
- Client First Name, Grand Total, Client Name

## ⚠️ **Important Notes**

1. **Temporary File Only** - Do not deploy this highlighted version
2. **Complete Coverage** - All 24 unique variables highlighted across 32 total instances
3. **Original Preserved** - Original template remains unchanged at `anchor-proposal-compact.html`
4. **Mapping Purpose** - Use this to understand which data flows from form to PDF
5. **Print Ready** - Pink highlighting will show in print/PDF for visual reference

## 🔄 **Next Steps**

Use this highlighted template to:
- Map form fields to template variables
- Validate data flow from input form to PDF generation
- Identify any missing or incorrect variable mappings
- Ensure all user input appears correctly in generated proposals

**Delete this file after mapping analysis is complete.**