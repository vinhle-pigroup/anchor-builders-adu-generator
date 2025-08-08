#!/bin/bash
echo "🔍 Checking existing types directory structure..."
ls -la src/types/ 2>/dev/null || echo "Types directory doesn't exist yet"

echo ""
echo "🔍 Searching for 'any' types in source files..."
find src/ -name "*.ts" -o -name "*.tsx" | head -10