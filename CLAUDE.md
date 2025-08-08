# CLAUDE.md - Anchor Builders ADU Generator
**Project-Specific Instructions for AI Development**

## 🚨 **CONTEXT MANAGEMENT PROTOCOL**

### **⚠️ CRITICAL: Chat History Preservation**
**WHEN CONTEXT REACHES 15% REMAINING:**

1. **Create Summary Document**:
   ```
   CHAT-HISTORY-YYYY-MM-DD.md (Executive summary + technical analysis)
   ```

2. **Create Verbatim Archive**:
   ```
   CHAT-VERBATIM-YYYY-MM-DD.md (Complete conversation copy)
   ```

3. **Content Requirements**:
   - Executive summary of all accomplishments
   - Technical changes with file paths and line numbers
   - Bug fixes with root cause analysis
   - Lessons learned and prevention strategies
   - Complete verbatim chat including tool calls

4. **Reminder Protocol**:
   ```
   "⚠️ CONTEXT AT 15% - Time to create chat history summary before compacting!"
   ```

**Location**: Save in project root directory  
**Purpose**: Preserve critical debugging patterns and technical knowledge  
**Frequency**: Every session when context fills up

---

## 🚀 **Development Server Protocol**

### **⚠️ CRITICAL: Server Management Rules**
- **NEVER run `npm run dev` automatically**
- **ALWAYS assume server is running at localhost:5000**
- **ONLY ask Vinh to restart server if I need to halt it for debugging**
- **Vinh manages all server operations and port assignments**

### **🎯 Default Assumptions**
- Server is active at: **http://localhost:5000**
- All features should be tested against this URL
- No need to start/stop server unless explicitly required for fixes

---

## 📋 **Project Overview**
- **App**: Anchor Builders ADU Generator
- **Port**: 5000 (http://localhost:5000)
- **Tech Stack**: React + TypeScript + Vite + Tailwind
- **Main Features**: PDF proposal generation, form validation, admin tools

---

## 🔧 **Development Workflow**

### **Code Quality Gates**
```bash
# Run these for verification (ask Vinh to run if needed)
npm run lint                    # Must pass with 0 warnings  
npx tsc --noEmit               # Must pass with 0 errors
npm run build                  # Must complete successfully
```

### **Feature Testing Protocol**
1. **Assume server running**: localhost:5000
2. **Manual testing**: Test all user-facing features
3. **Browser console**: Check for errors
4. **Screenshots**: Document working features
5. **User confirmation**: Get Vinh's verification

---

## 🎨 **Features Completed**

### **PDF Generation System**
- Multiple template designs (Enhanced, Modern, Historical)
- Real-time pricing calculations
- Template variable mapping system
- Debug mapping tools for troubleshooting

### **🚨 CRITICAL: Template File Mapping**
**When editing PDF templates, use the CORRECT files:**

| Template Button | File Path | Status |
|----------------|-----------|--------|
| **Enhanced** (DEFAULT) | `/public/ENHANCED-DESIGN.html` | ✅ ACTIVE - Edit this one! |
| Modern | `/public/MODERN-ENHANCED.html` | 🟡 Backup only |
| Historical | `/public/HISTORICAL-EXACT.html` | 🟡 Backup only |
| Premium | `/public/PREMIUM-LUXURY.html` | 🟡 Backup only |

**⚠️ ALWAYS EDIT:** `/public/ENHANCED-DESIGN.html` for the default Enhanced template
**❌ DO NOT EDIT:** Other templates unless specifically requested

### **🚨 CRITICAL: Additional Services PDF Solution**
**Date**: 2025-08-08  
**Status**: ✅ FIXED AND WORKING - SOLUTION DOCUMENTED  
**Critical Files**: NEVER modify these working solutions:

1. **`src/lib/pdf-template-generator.ts` (Lines 207-236)**
   - `processEachBlocks` method handles BOTH `{{this.property}}` AND `{{property}}` formats
   - This is what makes individual line items appear in PDF

2. **`src/types/proposal.ts` (Lines 80-86)**  
   - `ADD_ON_ITEMS` array interface matches template expectations
   - Template uses `{{#each ADD_ON_ITEMS}}` not ADDITIONAL_SERVICES_ITEMS

3. **`src/lib/pdf-generator.ts` (Lines 87-94)**
   - `ADD_ON_ITEMS` population with numbered rows and formatted costs
   - Creates exact data structure template requires

**📋 Reference Document**: `/CRITICAL-SOLUTION-DOCUMENTED.md`

### **🚨 CRITICAL: Template Dynamic Sections**
**When modifying dynamic content, use these exact patterns:**

| Template Pattern | Replacement Logic | File Location |
|-----------------|-------------------|---------------|
| `{{#if ADD_ON_WORK_EXISTS}}` | Shows if utilities OR add-ons selected | pdf-template-generator.ts:333 |
| `{{#each ADD_ON_ITEMS}}` | Replaced with dynamic rows | pdf-template-generator.ts:207-236 |
| `{{number}}`, `{{name}}`, `{{description}}`, `{{cost}}` | Individual item properties | processEachBlocks method |

**❌ NEVER hardcode add-on rows** - they will always show even if not selected
**✅ ALWAYS use dynamic patterns** - items appear only when selected in form
**✅ NEVER edit the working processEachBlocks method** - this is what makes line items work

### **Admin Tools**
- **Data Mapping Debug Tool**: Full-screen template variable visualization
- Template text editor
- Proposal management system
- Form validation with live feedback

### **Recent Major Updates**
- ✅ Additional Services line items WORKING (documented solution)
- ✅ Full-page debug mapping tool with color-coded sections
- ✅ Enhanced template with improved font sizing
- ✅ Fixed template width constraints in preview
- ✅ Color-coded number system for form field mapping

---

## 📋 **Persistent Issues Documentation Protocol**

### **⚠️ When to Use Comprehensive Issue Documentation**
Use this approach for issues that are:
- Reported multiple times by users
- Intermittent or hard to reproduce consistently  
- Previously "worked" but now broken without clear cause
- Complex enough to require team investigation
- Block user workflow or core functionality

### **🗂️ Documentation Structure**
```
troubleshooting/
├── persistent-issues/
│   ├── [issue-name]-[date].md
│   └── README.md (index of all issues)
├── resolved-issues/ 
│   └── [archived resolved issues]
└── investigation-templates/
    └── issue-template.md
```

### **📝 Required Documentation Sections**
Each persistent issue MUST include:

1. **Problem Statement**: Exact user report and symptoms
2. **Investigation Summary**: Coordinator agent findings
3. **Technical Analysis**: Code architecture and data flow
4. **Evidence Collection**: Generated files, logs, screenshots
5. **Root Cause Analysis**: Primary and secondary issues identified  
6. **Recommended Solutions**: Prioritized fix approaches
7. **Verification Plan**: L1-L4 testing requirements
8. **Reproduction Steps**: Exact steps to reproduce issue
9. **Follow-up Actions**: Immediate, short-term, long-term
10. **Escalation Criteria**: When to involve senior developers

### **🤖 Process for Persistent Issues**
```bash
# 1. Deploy coordinator agent for investigation
coordinator: "Investigate [issue] with comprehensive analysis"

# 2. Create documentation folder if doesn't exist
mkdir -p troubleshooting/persistent-issues

# 3. Document findings in ultra detail
# File: troubleshooting/persistent-issues/[issue-name].md

# 4. Update this CLAUDE.md with documentation approach

# 5. Hand off to team with complete investigation
```

### **📊 Current Persistent Issues**
- **PDF-ADDITIONAL-SERVICES-001** (2025-08-08): ✅ RESOLVED AND DOCUMENTED
  - **Solution**: `/CRITICAL-SOLUTION-DOCUMENTED.md`
  - **Status**: WORKING - Individual line items display correctly
  - **Protection**: Critical files marked as DO NOT MODIFY

---

## 🎯 **Quick Access Links**
- **Main App**: http://localhost:5000
- **Admin**: http://localhost:5000 → Admin Settings
- **Debug Tool**: Admin → Data Mapping → "Open Full-Page Debug Tool"
- **Templates**: Located in `public/` directory
- **Critical Solution**: `/CRITICAL-SOLUTION-DOCUMENTED.md`

---

**Last Updated**: 2025-08-08  
**Status**: Active Development - Additional Services PDF fix completed and documented