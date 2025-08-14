# Anchor Builders Implementation Kit
## Pricing Editor, Confirmation Dialogs & Loading States

This guide will help you implement three key UX features from the HOL Proposal Generator:
1. **Dynamic Pricing Editor** - Edit prices without code changes
2. **Confirmation Dialogs** - Professional user confirmations  
3. **Loading States** - Smooth PDF generation feedback

---

## 📋 Table of Contents
1. [Pricing Editor System](#pricing-editor-system)
2. [Confirmation Modal](#confirmation-modal)
3. [Loading Window](#loading-window)
4. [Integration Steps](#integration-steps)
5. [File Reference](#file-reference)

---

## 🎯 Pricing Editor System

### Overview
The pricing editor allows non-technical staff to update pricing in real-time without deploying code changes. Changes are stored in browser localStorage and instantly reflected in calculations.

### Core Architecture
```
User Edits Price → Validation → localStorage → Custom Event → UI Updates → Recalculation
```

### Key Components

#### 1. **Pricing Storage Layer** (`pricing-storage-ANCHOR.ts`)
```typescript
// Core storage configuration
export const STORAGE_KEY = 'anchor-pricing-config';
export const SCHEMA_VERSION = '1.0.0';
export const MIN_PRICE = 100;
export const MAX_PRICE = 100000;

// Storage structure
interface StoredPricing {
  schemaVersion: string;
  data: PricingData;
  lastUpdated: string;
  updatedBy?: string;
}
```

#### 2. **Pricing Hook** (`usePricingConfig-ANCHOR.ts`)
Manages pricing state and persistence with validation:
- Load/save pricing to localStorage
- Validate price ranges ($100-$100,000)
- Dispatch custom events for live updates
- Export/import JSON backups

#### 3. **Pricing Editor UI** (`PricingEditor-ANCHOR.tsx`)
Click-to-edit interface with:
- Inline editing (click → edit → Enter to save)
- Real-time validation
- Export/import functionality
- Keyboard shortcut (Ctrl+Shift+A)

#### 4. **Pricing Engine Integration**
Update your existing pricing engine to reload from localStorage:
```typescript
// In your pricing calculation function
const loadPricingData = () => {
  const stored = localStorage.getItem('anchor-pricing-config');
  if (stored) {
    const parsed = JSON.parse(stored);
    return parsed.data;
  }
  return defaultPricingData; // Fallback to defaults
};
```

### Implementation Steps

1. **Install Dependencies**
```bash
npm install lucide-react
```

2. **Add Files to Your Project**
```
src/
├── lib/
│   └── pricing-storage-ANCHOR.ts
├── hooks/
│   └── usePricingConfig-ANCHOR.ts
├── components/
│   └── PricingEditor-ANCHOR.tsx
```

3. **Add Event Listener in App.tsx**
```typescript
// Listen for pricing updates to trigger re-renders
useEffect(() => {
  const handlePricingUpdate = () => {
    setPricingVersion(prev => prev + 1); // Force re-render
  };
  
  window.addEventListener('anchor:pricing-updated', handlePricingUpdate);
  return () => window.removeEventListener('anchor:pricing-updated', handlePricingUpdate);
}, []);
```

4. **Add Keyboard Shortcut**
```typescript
// Global keyboard shortcut for pricing editor
useEffect(() => {
  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.shiftKey && e.key === 'A') {
      e.preventDefault();
      setShowPricingEditor(true);
    }
  };
  
  window.addEventListener('keydown', handleKeyPress);
  return () => window.removeEventListener('keydown', handleKeyPress);
}, []);
```

---

## ✅ Confirmation Modal

### Overview
Professional confirmation dialog for destructive actions or important user decisions.

### Component Features
- Customizable title, message, and button text
- Danger/warning styling for destructive actions
- Backdrop click to cancel
- Accessible keyboard navigation

### Usage Example
```typescript
import { ConfirmationModal } from './components/ConfirmationModal-ANCHOR';

// In your component
const [showConfirm, setShowConfirm] = useState(false);

const handleDelete = () => {
  setShowConfirm(true);
};

const confirmDelete = () => {
  // Perform delete action
  performDelete();
  setShowConfirm(false);
};

// In render
{showConfirm && (
  <ConfirmationModal
    isOpen={showConfirm}
    onClose={() => setShowConfirm(false)}
    onConfirm={confirmDelete}
    title="Delete Proposal?"
    message="This action cannot be undone. All proposal data will be permanently deleted."
    confirmText="Delete"
    cancelText="Cancel"
    isDanger={true}
  />
)}
```

---

## ⏳ Loading Window

### Overview
Professional loading overlay for async operations like PDF generation.

### Component Features
- Customizable loading messages
- Progress stages display
- Smooth animations
- Auto-dismiss on completion

### Usage Example
```typescript
import { LoadingWindow } from './components/LoadingWindow-ANCHOR';

// In your component
const [isGenerating, setIsGenerating] = useState(false);
const [loadingStage, setLoadingStage] = useState('');

const generatePDF = async () => {
  setIsGenerating(true);
  
  try {
    setLoadingStage('Preparing document...');
    await prepareData();
    
    setLoadingStage('Generating PDF...');
    await generatePDFFile();
    
    setLoadingStage('Finalizing...');
    await finalize();
  } finally {
    setIsGenerating(false);
  }
};

// In render
{isGenerating && (
  <LoadingWindow
    message={loadingStage || "Generating your proposal..."}
    subMessage="This may take a few moments"
  />
)}
```

---

## 🔧 Integration Steps

### 1. Project Structure
```
anchor-builders-adu/
├── src/
│   ├── components/
│   │   ├── PricingEditor-ANCHOR.tsx
│   │   ├── ConfirmationModal-ANCHOR.tsx
│   │   └── LoadingWindow-ANCHOR.tsx
│   ├── hooks/
│   │   └── usePricingConfig-ANCHOR.ts
│   └── lib/
│       └── pricing-storage-ANCHOR.ts
```

### 2. Update Your Main App Component
```typescript
import { PricingEditor } from './components/PricingEditor-ANCHOR';
import { useState, useEffect } from 'react';

function App() {
  const [showPricingEditor, setShowPricingEditor] = useState(false);
  const [pricingVersion, setPricingVersion] = useState(0);
  
  // Add keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === 'A') {
        e.preventDefault();
        setShowPricingEditor(true);
      }
    };
    
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, []);
  
  // Listen for pricing updates
  useEffect(() => {
    const handlePricingUpdate = () => {
      setPricingVersion(prev => prev + 1);
      // Your pricing engine should reload here
    };
    
    window.addEventListener('anchor:pricing-updated', handlePricingUpdate);
    return () => window.removeEventListener('anchor:pricing-updated', handlePricingUpdate);
  }, []);
  
  return (
    <div>
      {/* Your existing app content */}
      
      {/* Pricing Editor Modal */}
      {showPricingEditor && (
        <PricingEditor
          isAdminMode={true}
          onClose={() => setShowPricingEditor(false)}
        />
      )}
    </div>
  );
}
```

### 3. Update Your Pricing Engine
```typescript
// Before calculation, reload pricing from localStorage
const calculateProposal = (formData) => {
  // Load fresh pricing data
  const stored = localStorage.getItem('anchor-pricing-config');
  const pricingData = stored 
    ? JSON.parse(stored).data 
    : defaultPricingData;
  
  // Use pricingData in calculations
  // ... your calculation logic
};
```

---

## 📁 File Reference

### Files Included in This Kit:

1. **`pricing-storage-ANCHOR.ts`** - Storage utilities and constants
2. **`usePricingConfig-ANCHOR.ts`** - React hook for pricing management
3. **`PricingEditor-ANCHOR.tsx`** - Main pricing editor UI component
4. **`ConfirmationModal-ANCHOR.tsx`** - Reusable confirmation dialog
5. **`LoadingWindow-ANCHOR.tsx`** - Loading state overlay component

### Naming Convention
All files have `-ANCHOR` suffix to avoid conflicts with your existing code. Rename them as needed for your project.

---

## 🎨 Styling Notes

### Required CSS/Tailwind Classes
The components use Tailwind CSS classes. Ensure you have:
- Tailwind CSS installed and configured
- Or map the classes to your existing styles

### Color Scheme Variables
```css
/* Add to your global CSS */
:root {
  --primary-color: #3b82f6;  /* Blue */
  --danger-color: #ef4444;   /* Red */
  --success-color: #10b981;  /* Green */
  --gray-light: #f3f4f6;
  --gray-dark: #374151;
}
```

---

## 🧪 Testing Checklist

After implementation, verify:

### Pricing Editor
- [ ] Ctrl+Shift+A opens editor
- [ ] Click to edit prices
- [ ] Enter saves, Esc cancels
- [ ] Changes persist on refresh
- [ ] Calculations update immediately
- [ ] Export/import works
- [ ] Reset to defaults works

### Confirmation Modal
- [ ] Shows on trigger
- [ ] Backdrop click cancels
- [ ] Esc key cancels
- [ ] Confirm button executes action
- [ ] Danger styling for destructive actions

### Loading Window
- [ ] Shows during async operations
- [ ] Displays current stage
- [ ] Prevents user interaction
- [ ] Dismisses on completion
- [ ] Handles errors gracefully

---

## 🚀 Advanced Features

### Multi-User Considerations
- Each browser maintains separate pricing
- No automatic sync between users
- Consider server-side storage for team use

### Audit Trail
To add pricing change history:
```typescript
// Store changes in an array
const logPriceChange = (item, oldPrice, newPrice, user) => {
  const log = JSON.parse(localStorage.getItem('pricing-log') || '[]');
  log.push({
    timestamp: new Date().toISOString(),
    item,
    oldPrice,
    newPrice,
    user
  });
  localStorage.setItem('pricing-log', JSON.stringify(log));
};
```

### Browser Compatibility
- Chrome/Edge: Full support
- Firefox: Full support
- Safari: Limited in private mode
- Mobile: View-only recommended

---

## 📞 Support

For questions or issues:
1. Check browser console for errors
2. Verify localStorage is enabled
3. Test in incognito mode (won't persist)
4. Review event listener setup

---

## 📄 License

These components are provided as reference implementations. Adapt them freely for your Anchor Builders project.

---

*Implementation kit prepared by HOL Development Team*
*Version 1.0 - August 2025*