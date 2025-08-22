# 🔧 CLAUDE DEBUG TOOLKIT - Complete Guide

## 🚀 **ONE-CLICK DEBUGGING** (Easiest)

### **Step 1: Load Debug Toolkit**
```javascript
// Copy-paste this into browser console (once per session):
```
*Then copy-paste the entire contents of `debug-toolkit.js` into console*

### **Step 2: Capture Everything**
```javascript
// When you encounter an issue, run this:
captureEverything()
```
**Result**: Complete debug data automatically copied to clipboard!

### **Step 3: Give to Claude**
Just paste the clipboard data into Claude chat. Contains:
- ✅ React component state
- ✅ Console logs  
- ✅ Network requests
- ✅ Form data
- ✅ Performance metrics
- ✅ Errors
- ✅ Browser info

---

## 🎯 **QUICK TARGETED DEBUGGING**

For specific issues, use these shortcuts:

```javascript
// React component issues:
quickDebug.react()

// Form/state issues:  
quickDebug.form()

// Console log issues:
quickDebug.logs()
```

---

## ⚛️ **REACT PROFILING** (For Performance Issues)

### **Step 1: Wrap Component** (One-time setup)
```typescript
// In EnhancedProductionGrid.tsx:
import { DebugProfiler } from './DebugProfiler';

// Wrap your component:
<DebugProfiler id="EnhancedProductionGrid">
  <EnhancedProductionGrid {...props} />
</DebugProfiler>
```

### **Step 2: Capture Profile Data**
```javascript
// After reproducing issue:
exportReactProfileData()
```

### **Step 3: Clear Data** (Between tests)
```javascript
clearReactProfileData()
```

---

## 📋 **DEBUGGING WORKFLOWS**

### **🔴 When Clear Data Doesn't Work:**
1. Load debug toolkit in console
2. Fill form with test data  
3. Run `captureEverything()` → save as "before-clear.json"
4. Click Clear button
5. Run `captureEverything()` → save as "after-clear.json"  
6. Give both files to Claude

### **🔴 When Component Won't Update:**
1. Wrap component with `<DebugProfiler>`
2. Reproduce issue
3. Run `exportReactProfileData()`
4. Check for missing re-renders or slow performance

### **🔴 When Something Breaks:**
1. Open browser console
2. Run `captureEverything()`
3. Paste clipboard data to Claude
4. Include specific steps to reproduce

---

## 🛠️ **BROWSER SETUP** (One-time)

### **Install React DevTools Extension**
- Chrome: [React Developer Tools](https://chrome.google.com/webstore/detail/react-developer-tools/fmkadmapgofadopljbjfkapdkoienihi)
- Edge: Same link works
- Firefox: [Mozilla Add-ons](https://addons.mozilla.org/en-US/firefox/addon/react-devtools/)

### **Enable Advanced Console**
1. F12 → Console tab
2. Click gear icon ⚙️
3. Enable "Show timestamps"
4. Enable "Log XMLHttpRequests"

---

## 🎯 **WHAT EACH CAPTURE INCLUDES**

| Capture Type | Contains | Best For |
|--------------|----------|----------|
| `captureEverything()` | All data below | Any issue |
| `quickDebug.react()` | Component state, props, hooks | React issues |
| `quickDebug.form()` | Form fields, buttons, values | UI state issues |
| `quickDebug.logs()` | Console messages, errors | General debugging |
| `exportReactProfileData()` | Render timing, performance | Slow performance |

---

## 📱 **MOBILE/RESPONSIVE DEBUGGING**

### **For Mobile Issues:**
1. Chrome DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Select phone/tablet view
3. Run `captureEverything()`
4. Include viewport info (automatically captured)

### **For Touch Issues:**
1. DevTools → Console → Gear ⚙️ → "Enable custom formatters"
2. Touch events show in console
3. Use `captureEverything()` after issue

---

## 🚨 **EMERGENCY DEBUGGING**

If page crashes/freezes:
1. Open new tab → `localhost:5175`
2. Immediately paste debug toolkit
3. Navigate to broken page  
4. Run `captureEverything()` quickly
5. Page crashes are captured in error data

---

## 💡 **TIPS**

- **Run debug toolkit once per browser session**
- **Use `captureEverything()` right when issue occurs**
- **Clear data (`clearReactProfileData()`) between different tests**
- **Screenshots + debug data = perfect bug reports**
- **Console errors show automatically in captured data**

---

## 🎯 **WHAT TO SEND CLAUDE**

**For any issue, just send:**
1. **Steps to reproduce** (brief)
2. **Debug data** (from `captureEverything()`)  
3. **Screenshot** (if visual issue)

**That's it!** Claude gets everything needed to debug.