# Design Vault - PDF Template Versions

This directory contains versioned PDF templates for the Anchor Builders ADU Proposal Generator.

## Current Active Template
**Version:** v1.1 (Dynamic Variables Update)  
**File:** `v1.1/anchor-proposal-compact-v1.1.html`  
**Deployed:** ⏳ Pending Deployment  
**Last Updated:** 2025-08-15

## Version History

### v1.1 - Dynamic Variables Update (2025-08-15)
- **Status:** 🆕 Latest Version
- **Major Features:**
  - Dynamic HVAC system variable ({{HVAC_SYSTEM}})
  - Dynamic utility connections ({{UTILITY_CONNECTIONS}})
  - Project deposit variable ({{DEPOSIT_AMOUNT}})
  - Extra bathroom and driveway cost variables
  - Updated terminology: "start to finish", "ADU Plan Design"

**Template Improvements:**
- **Text Updates:** Removed "Mini-Split" → Dynamic HVAC, "concept to completion" → "start to finish"
- **New Variables:** 5 new dynamic variables for form integration
- **Pricing Table:** Added deposit row with "D" identifier
- **Specifications:** Removed R-13/R-30 from insulation, removed bullet from appliances
- **Documentation:** Comprehensive inline documentation in template header

**Files:**
- `manifest.json` - Detailed change documentation and integration requirements
- `anchor-proposal-compact-v1.1.html` - Enhanced template with dynamic variables

### v1.0 - Timeline Enhanced (2025-08-15)
- **Status:** ✅ Active in Production
- **Major Features:**
  - Improved horizontal timeline with 120px connecting line
  - Single-line phase descriptions for consistency  
  - Centered vertical milestone line in Payment Schedule
  - Professional 9px compact font design
  - Optimized print layout with letter size margins

**Timeline Improvements:**
- **Horizontal Line:** Extended from 60px → 120px for better visual balance
- **Phase Descriptions:** "Plans, Engineering & City Approval Process" and "Complete Construction Phase" now single-line
- **Vertical Line:** Properly centered on milestone circles (D1 through M7)
- **Positioning:** left: 6px, top: 2px, height: calc(100% - 30px)

**Files:**
- `manifest.json` - Version metadata and deployment info
- `anchor-proposal-compact-v1.0.html` - Complete template file

**Git Commit:** `ad7fb547` - "fix: make horizontal timeline connecting line a bit longer"

---

## Design Vault Guidelines

### Versioning Schema
- **Major.Minor** format (e.g., 1.0, 1.1, 2.0)
- **Major:** Complete redesign or significant structural changes
- **Minor:** Incremental improvements to existing design

### File Structure
```
design-vault/
├── TEMPLATE_INDEX.md          # This file - tracks all versions
├── current/
│   └── index.json            # Points to active version
└── v1.0/
    ├── manifest.json         # Version metadata
    └── anchor-proposal-compact-v1.0.html
```

### Adding New Versions
1. Create new version directory: `mkdir design-vault/v1.1`
2. Copy updated template: `cp public/template.html design-vault/v1.1/template-v1.1.html`
3. Create manifest.json with version details
4. Update this TEMPLATE_INDEX.md
5. Update current/index.json pointer if making active
6. Git commit with descriptive message

### Backup Strategy
- All versions permanently stored in git history
- Production deployments tagged with git commits
- Manifest files track deployment status and feature changes
- Never delete versions (mark as deprecated instead)

---

## Template Recovery
If active template is lost or corrupted:

1. **From Design Vault:** `cp design-vault/v1.0/anchor-proposal-compact-v1.0.html public/anchor-proposal-compact.html`
2. **From Git History:** `git checkout <commit-hash> -- public/anchor-proposal-compact.html`
3. **From Server-side:** Check `apps/pdf-service/src/templates/` for server copies

## Current Active Configuration
```json
{
  "use": "v1.0",
  "active_file": "anchor-proposal-compact-v1.0.html",
  "deployment_date": "2025-08-15",
  "git_commit": "ad7fb547"
}
```