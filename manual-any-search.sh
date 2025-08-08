#!/bin/bash
echo "🔍 Manual search for 'any' types in key files..."
echo "================================================="

echo "📁 Checking src/App.tsx..."
grep -n "any" src/App.tsx 2>/dev/null || echo "No 'any' found in App.tsx"

echo ""
echo "📁 Checking src/lib files..."
find src/lib -name "*.ts" -o -name "*.tsx" 2>/dev/null | while read file; do
  if [ -f "$file" ]; then
    echo "Checking $file:"
    grep -n "any" "$file" 2>/dev/null || echo "  No 'any' types found"
  fi
done

echo ""
echo "📁 Checking src/components files..."
find src/components -name "*.ts" -o -name "*.tsx" 2>/dev/null | head -5 | while read file; do
  if [ -f "$file" ]; then
    echo "Checking $file:"
    grep -n "any" "$file" 2>/dev/null || echo "  No 'any' types found"
  fi
done