# Design Systems Reference - ADU Generator

## **GitHub Design System (Current)**
**Status**: ✅ Active  
**Last Updated**: 2025-01-XX  
**Best For**: Professional internal tools, developer-focused interfaces

### Key Features:
- **Colors**: `#f6f8fa` background, `#d0d7de` borders, `#0969da` blue accent
- **Typography**: Bold black (`text-black`), high contrast
- **Buttons**: Flat, no shadows, sharp corners (`rounded`)
- **Design**: Minimal, stark, professional
- **Focus**: Single blue outline, no rings

### CSS Classes Used:
```css
/* Background */
background: #f6f8fa

/* Cards */
bg-white rounded border-gray-300 (no shadows)

/* Typography */
text-black (primary text)
text-gray-600 (secondary text)
font-bold (headers)

/* Buttons */
bg-blue-600 border-blue-600 text-white (selected)
bg-white border-gray-300 text-black hover:bg-gray-50 (default)

/* Inputs */
px-3 py-2 border border-gray-300 rounded text-black bg-white
focus:border-blue-500 focus:outline-none
```

---

## **Ant Design System (Latest)**
**Status**: ✅ Active  
**Last Updated**: 2025-01-XX  
**Best For**: Enterprise applications, business software, structured workflows

### Key Features:
- **Colors**: `#f0f2f5` background, `#d9d9d9` borders, `#1890FF` blue
- **Typography**: 16px headers, 14px body, font-normal weights
- **Components**: Standardized 32px height (`h-8`) for all interactive elements
- **Design**: Structured, enterprise-focused, consistent spacing
- **Spacing**: `gap-3 px-4 py-3` for touch targets, `px-3` for inputs

### CSS Classes Used:
```css
/* Background */
background: #f0f2f5

/* Cards */
bg-white rounded border-gray-300 
boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.03), 0 1px 6px -1px rgba(0, 0, 0, 0.02)'

/* Typography */
text-[16px] font-medium text-gray-900 (headers)
text-[14px] font-normal text-gray-800 (body)

/* Buttons */
h-8 px-3 rounded border leading-6 inline-flex items-center justify-center
bg-blue-600 border-blue-600 text-white shadow-sm (primary)
bg-white border-gray-300 hover:bg-blue-50 hover:text-blue-600 (secondary)

/* Inputs */
h-8 px-3 py-1 border border-gray-300 rounded text-[14px]
focus:border-blue-500 focus:ring-2 focus:ring-blue-200
transition-all duration-200
```

---

## **Previous Design Systems Tested**

### **1. Atlassian Design System**
- **Colors**: `#0052CC` blue, `#DFE1E6` borders
- **Style**: Clean, professional, rounded corners
- **Focus**: Blue rings, smooth transitions
- **Status**: Replaced by Stripe

### **2. Stripe Design System** 
- **Colors**: `#635BFF` purple, `#fafbff` background
- **Style**: Ultra-clean, minimal shadows
- **Focus**: Purple accents, elegant forms
- **Status**: Replaced by GitHub

---

## **Design Evolution Notes**

**User Feedback**:
- Wanted scrolling header fixed ✅
- Needed custom services popup working ✅  
- Preferred compact design that fits one screen ✅
- Requested keyboard navigation (Tab + Arrow keys) ✅

**Best Design Approach**:
- GitHub's high-contrast style works best for professional internal tools
- Compact 4-card layout is optimal for workflow efficiency
- Flat design reduces visual distraction
- Bold typography improves readability during long work sessions

**Keyboard Navigation**:
- Tab progression through all inputs
- Arrow keys for field navigation
- `data-navigation` attributes on interactive elements