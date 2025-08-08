`# Product Requirements Document (PRD)
## Anchor Builders ADU Generator - Data Mapping & Build Quality Improvements

**Date**: 2025-08-07  
**Priority**: HIGH  
**Status**: 🔴 CRITICAL FIXES NEEDED

---

## 🎯 **EXECUTIVE SUMMARY**

The Anchor Builders ADU Generator has a critical data mapping issue preventing add-ons from displaying correctly in generated PDFs. Additionally, the build quality analysis revealed several technical debt items that need addressing for production stability.

**Current State**: Add-ons are selected but not appearing in PDF due to naming mismatches  
**Desired State**: All selected add-ons display with correct pricing in generated PDFs  
**Impact**: Customer proposals showing incorrect pricing, missing selected services

---

## 🚨 **CRITICAL ISSUE #1: ADD-ON DATA MAPPING FAILURE**

### **Problem Statement**
When users select add-ons (Extra Bathroom, Driveway, Basic Landscaping), they don't appear in the generated PDF despite being selected in the form.

### **Root Cause Analysis**

#### **1. Name Mismatch Between Form and Pricing Engine**
```javascript
// FORM SENDS (App.tsx line 2180-2184):
selectedAddOns: ['bathroom', 'driveway', 'landscaping']

// PRICING ENGINE EXPECTS (pricing-config.ts):
'Extra Bathroom'    // NOT 'bathroom'
'Driveway'         // NOT 'driveway'  
'Basic Landscaping' // NOT 'landscaping'
```

#### **2. Template Processing Logic Issue**
The template processor has addon mapping but it's not correctly translating between form keys and pricing names:
```javascript
// pdf-template-generator.ts line 609-613
formData.project.selectedAddOns.forEach(addOnKey => {
  const addonInfo = addonMapping[addOnKey]; // This works
  // But pricing engine never finds the addon because names don't match
});
```

#### **3. Console Evidence**
From user's console output:
```
🔍 [PRICING ENGINE] selectedAddOns received: ['landscaping']
🔍 [PRICING ENGINE] Available addOnOptions: ['Extra Bathroom', 'Driveway', 'Basic Landscaping']
🔍 [PRICING ENGINE] Looking for "landscaping", found: undefined
```

### **SOLUTION: Fix Name Mapping**

**Option 1: Update Form to Send Full Names** ✅ RECOMMENDED
```typescript
// In App.tsx, update the standard addons array (line 3738-3761):
const standardAddons = [
  {
    key: 'Extra Bathroom',     // Changed from 'bathroom'
    label: 'Extra Bathroom',
    cost: 8000,
    desc: 'Additional bathroom beyond standard configuration.',
  },
  {
    key: 'Driveway',           // Changed from 'driveway'
    label: 'Dedicated Driveway',
    cost: 5000,
    desc: 'Dedicated driveway and parking space.',
  },
  {
    key: 'Basic Landscaping',  // Changed from 'landscaping'
    label: 'Basic Landscaping',
    cost: 10000,
    desc: 'Basic landscaping package.',
  },
];
```

**Option 2: Add Translation Layer in Pricing Engine**
```typescript
// In pricing-engine.ts calculateAddOns method:
private calculateAddOns(inputs: PricingInputs, lineItems: PricingLineItem[]) {
  const nameMapping: Record<string, string> = {
    'bathroom': 'Extra Bathroom',
    'driveway': 'Driveway',
    'landscaping': 'Basic Landscaping'
  };
  
  inputs.selectedAddOns.forEach(addOnKey => {
    const mappedName = nameMapping[addOnKey] || addOnKey;
    const addOn = addOnOptions.find(a => a.name === mappedName);
    // ... rest of logic
  });
}
```

---

## 🔧 **BUILD QUALITY IMPROVEMENTS**

### **HIGH PRIORITY FIXES**

#### **1. Remove Production Console Logs**
**Files to Fix**:
- `src/lib/pdf-template-generator.ts` (50+ console.log statements)
- `src/App.tsx` (20+ console.log statements)
- `src/lib/pricing-engine.ts` (5+ console.log statements)

**Implementation**:
```typescript
// Create src/lib/logger.ts
export const logger = {
  debug: (...args: any[]) => {
    if (import.meta.env.DEV) {
      console.log(...args);
    }
  },
  error: (...args: any[]) => {
    console.error(...args);
    // Send to error tracking service in production
  }
};

// Replace all console.log with logger.debug
```

#### **2. Fix TypeScript `any` Types**
**Create proper interfaces**:
```typescript
// src/types/pricing.ts
export interface PricingData {
  sqft: number;
  bedrooms: number;
  bathrooms: number;
  aduType: 'detached-1story' | 'detached-2story' | 'attached';
  utilities: UtilityConfig;
  selectedAddOns: string[];
  manualAddons: ManualAddon[];
  // ... complete interface
}

// src/types/proposals.ts
export interface ProposalData {
  id: string;
  date: string;
  client: ClientInfo;
  project: ProjectDetails;
  pricing: PricingBreakdown;
  // ... complete interface
}
```

#### **3. Break Up App.tsx Component**
**Extract components into separate files**:
```
src/components/
├── debug/
│   ├── FullPageDebugTool.tsx (400 lines)
│   └── DebugMappingTool.tsx (300 lines)
├── forms/
│   ├── ADUConfigurationForm.tsx
│   ├── ClientInfoForm.tsx
│   └── ProjectDetailsForm.tsx
└── admin/
    ├── AdminSettings.tsx
    └── ProposalManager.tsx
```

### **MEDIUM PRIORITY FIXES**

#### **4. Add Input Validation**
```typescript
// Use Zod for runtime validation
import { z } from 'zod';

const ProposalSchema = z.object({
  client: z.object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().email(),
    phone: z.string().regex(/^\d{10}$/),
  }),
  // ... complete schema
});

// Validate before localStorage
const saveProposal = (data: unknown) => {
  const validated = ProposalSchema.parse(data);
  localStorage.setItem('proposal', JSON.stringify(validated));
};
```

#### **5. Implement Error Boundaries**
```typescript
// src/components/ErrorBoundary.tsx
export class ErrorBoundary extends React.Component {
  componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('PDF Generation Error:', error, info);
    // Show user-friendly error message
  }
}
```

---

## 📋 **IMPLEMENTATION CHECKLIST**

### **IMMEDIATE (Today)**
- [ ] Fix add-on name mapping (Option 1 recommended)
- [ ] Test all add-on combinations
- [ ] Verify Additional Services total calculation
- [ ] Remove hardcoded template content

### **Week 1**
- [ ] Implement logger utility
- [ ] Replace all console.log statements
- [ ] Create TypeScript interfaces
- [ ] Extract FullPageDebugTool component
- [ ] Extract DebugMappingTool component

### **Week 2**
- [ ] Break up App.tsx into smaller components
- [ ] Add Zod validation
- [ ] Implement error boundaries
- [ ] Add loading states for PDF generation
- [ ] Create unit tests for pricing engine

### **Week 3**
- [ ] Add accessibility attributes
- [ ] Optimize mobile responsiveness
- [ ] Implement lazy loading for templates
- [ ] Add performance monitoring
- [ ] Create comprehensive documentation

---

## 🧪 **TESTING REQUIREMENTS**

### **Test Scenarios for Add-On Fix**
1. **Single Add-On Selection**
   - Select only "Extra Bathroom" → Verify $8,000 appears
   - Select only "Driveway" → Verify $5,000 appears
   - Select only "Basic Landscaping" → Verify $10,000 appears

2. **Multiple Add-On Selection**
   - Select all three → Verify $23,000 total
   - Select any two → Verify correct sum

3. **Utility + Add-On Combination**
   - Separate water + Extra Bathroom → Verify both appear
   - All utilities separate + all add-ons → Verify complete list

4. **Edge Cases**
   - No add-ons selected → Verify only utilities show
   - Deselect after selection → Verify removal from PDF

### **Verification Commands**
```bash
# After fixes, run:
npm run lint        # Should pass with 0 warnings
npx tsc --noEmit   # Should pass with 0 errors
npm run build      # Should complete successfully

# Test in browser:
1. Open http://localhost:5000
2. Fill form with test data
3. Select "Basic Landscaping" add-on
4. Generate PDF with Enhanced template
5. Verify Additional Services shows:
   - Electric Meter: $2,000
   - Basic Landscaping: $10,000
   - Total: $12,000
```

---

## 🎯 **SUCCESS CRITERIA**

### **For Data Mapping Fix**
- ✅ All selected add-ons appear in generated PDF
- ✅ Additional Services total matches sum of all items
- ✅ No hardcoded items appear when not selected
- ✅ User can see itemized list with descriptions
- ✅ Pricing matches configuration values

### **For Build Quality**
- ✅ Zero console.log statements in production build
- ✅ Zero TypeScript `any` types in core business logic
- ✅ App.tsx reduced to <500 lines
- ✅ All user inputs validated before processing
- ✅ Error boundaries prevent app crashes

---

## 📊 **METRICS & MONITORING**

### **Key Performance Indicators**
- PDF generation time: <3 seconds
- Form validation response: <100ms  
- Bundle size: <500KB gzipped
- Lighthouse score: >90
- TypeScript coverage: 100%

### **Error Tracking**
- Implement Sentry or similar for production
- Track PDF generation failures
- Monitor form submission errors
- Alert on validation failures

---

## 🚀 **DEPLOYMENT CONSIDERATIONS**

### **Pre-Deployment Checklist**
- [ ] All console.log removed or wrapped in logger
- [ ] TypeScript compilation passes without errors
- [ ] All tests passing
- [ ] Bundle size optimized
- [ ] Environment variables documented
- [ ] Railway deployment tested

### **Rollback Plan**
1. Keep previous working version tagged
2. Document rollback procedure
3. Test rollback in staging
4. Monitor after deployment for 24 hours

---

## 📚 **DOCUMENTATION UPDATES NEEDED**

1. **Update CLAUDE.md** with:
   - Correct template file mappings
   - Add-on name conventions
   - Debug procedure for data mapping

2. **Create README.md** with:
   - Setup instructions
   - Development workflow
   - Testing procedures
   - Deployment guide

3. **Add inline code comments** for:
   - Complex pricing calculations
   - Template processing logic
   - Add-on mapping system

---

## 👥 **STAKEHOLDER COMMUNICATION**

### **For Development Team**
- Share this PRD in team channel
- Schedule code review for fixes
- Plan pair programming for complex refactoring

### **For Product Team**
- Communicate timeline for fixes
- Share testing requirements
- Request UAT after implementation

### **For Users**
- Prepare release notes
- Document any breaking changes
- Create migration guide if needed

---

**Document Version**: 1.0  
**Last Updated**: 2025-08-07  
**Next Review**: After Week 1 implementation

_This PRD serves as the authoritative guide for fixing the data mapping issue and improving overall build quality of the Anchor Builders ADU Generator._