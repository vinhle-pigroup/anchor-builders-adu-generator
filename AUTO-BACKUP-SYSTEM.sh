#!/bin/bash

# AUTO-BACKUP SYSTEM for Anchor Builders ADU Generator
# Prevents loss of sophisticated designs through automatic versioning

set -e

BACKUP_DIR="src/design-backups/$(date +%Y-%m-%d-%H%M%S)"
CURRENT_TIME=$(date "+%Y-%m-%d %H:%M:%S")

echo "🔄 Creating automatic backup at $CURRENT_TIME..."

# Create timestamped backup directory
mkdir -p "$BACKUP_DIR"

# Backup critical design files
echo "📁 Backing up critical design files..."
cp src/components/EnhancedProductionGrid.tsx "$BACKUP_DIR/EnhancedProductionGrid.backup.tsx" 2>/dev/null || echo "⚠️ EnhancedProductionGrid.tsx not found"
cp src/components/DesktopCardSelector.tsx "$BACKUP_DIR/DesktopCardSelector.backup.tsx" 2>/dev/null || echo "⚠️ DesktopCardSelector.tsx not found"
cp src/components/HeaderProgressBar.tsx "$BACKUP_DIR/HeaderProgressBar.backup.tsx" 2>/dev/null || echo "⚠️ HeaderProgressBar.tsx not found"
cp src/components/SidebarWithPricing.tsx "$BACKUP_DIR/SidebarWithPricing.backup.tsx" 2>/dev/null || echo "⚠️ SidebarWithPricing.tsx not found"
cp src/components/CompactPricingSidebar.tsx "$BACKUP_DIR/CompactPricingSidebar.backup.tsx" 2>/dev/null || echo "⚠️ CompactPricingSidebar.tsx not found"
cp src/App.tsx "$BACKUP_DIR/App.backup.tsx" 2>/dev/null || echo "⚠️ App.tsx not found"

# Create backup metadata
cat > "$BACKUP_DIR/BACKUP-INFO.md" << EOF
# Automatic Backup - $CURRENT_TIME

## Context
- **Trigger**: Automatic preservation system
- **Files backed up**: All critical design components
- **Git status**: $(git rev-parse HEAD 2>/dev/null || echo "No git repository")
- **Current branch**: $(git branch --show-current 2>/dev/null || echo "Unknown")

## Files in this backup:
$(ls -la "$BACKUP_DIR/" | grep -v "BACKUP-INFO.md" || echo "No files backed up")

## How to restore:
\`\`\`bash
# Copy any file back to restore that component
cp "$BACKUP_DIR/[filename]" src/components/[original-filename]
\`\`\`
EOF

# Git commit the backup (if in a git repo)
if git rev-parse --git-dir > /dev/null 2>&1; then
    git add "$BACKUP_DIR/"
    git commit -m "🔄 AUTO-BACKUP: Design preservation at $CURRENT_TIME

- Backing up all critical design components
- Prevents accidental loss of sophisticated layouts
- Automated backup system active
    
📁 Backup location: $BACKUP_DIR" || echo "⚠️ Could not commit backup to git"
fi

echo "✅ Backup completed successfully!"
echo "📍 Location: $BACKUP_DIR"
echo "💡 Run this script regularly to preserve your work!"