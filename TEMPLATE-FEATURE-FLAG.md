# 🚩 Template Feature Flag System

## Overview

The NEW-MODERN template has been implemented using a **safe feature flag system** that allows instant switching between templates without deployment risks.

## 🔧 How It Works

### Files Created:
- ✅ `/public/NEW-MODERN.html` - New template design
- ✅ `/src/lib/getActiveTemplate.ts` - Template switcher utility
- ✅ Updated `/src/lib/pdf-template-generator.ts` - Uses feature flag

### Feature Flag:
```bash
# Environment Variable Controls Template
VITE_TEMPLATE_VARIANT=LEGACY     # Uses MODERN-ENHANCED.html (default)
VITE_TEMPLATE_VARIANT=NEW-MODERN # Uses NEW-MODERN.html (new design)
```

## 🔄 Switching Templates

### To Enable New Template:
1. Set environment variable: `VITE_TEMPLATE_VARIANT=NEW-MODERN`
2. Restart application
3. Generate PDF to verify new template

### To Rollback (Emergency):
1. Set environment variable: `VITE_TEMPLATE_VARIANT=LEGACY`
2. Restart application
3. Verify PDFs use original template

## 🛡️ Safety Features

- ✅ **Legacy template untouched** - Original MODERN-ENHANCED.html preserved
- ✅ **Instant rollback** - One environment variable change
- ✅ **No deployment required** - Environment variable only
- ✅ **Debug logging** - Template selection logged to console

## 🧪 Testing Both Templates

The system automatically selects the template based on the environment variable:

```typescript
// src/lib/getActiveTemplate.ts
export const getActiveTemplate = (): string => {
  const variant = import.meta.env.VITE_TEMPLATE_VARIANT ?? 'LEGACY';
  return variant === 'NEW-MODERN' ? 'NEW-MODERN.html' : 'MODERN-ENHANCED.html';
};
```

## 📋 Rollback Procedure

**If new template has issues:**

1. **Immediate Action**: Set `VITE_TEMPLATE_VARIANT=LEGACY`
2. **Restart**: Restart development server or redeploy
3. **Verify**: Generate test PDF to confirm rollback
4. **Timeline**: Rollback complete in under 2 minutes

## ✅ Current Status

- [x] NEW-MODERN.html template created
- [x] Feature flag system implemented  
- [x] Template switcher utility created
- [x] PDF generator updated to use flags
- [x] Build validation passed (lint + TypeScript + build)
- [ ] User testing and confirmation needed

## 🔍 Debug Information

When generating PDFs, check browser console for:
```
🚩 [DEBUG] Feature flag active template: [Template Name]
🎨 [DEBUG] Template switching - Selected: modern, Active: NEW-MODERN.html, Path: /NEW-MODERN.html
```

This confirms which template is being loaded.