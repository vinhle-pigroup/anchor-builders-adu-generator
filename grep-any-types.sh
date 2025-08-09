#!/bin/bash
echo "🔍 Searching for 'any' types in TypeScript files..."
echo "================================================="

# Search for 'any' types in all TypeScript files
grep -r ": any\|<any>\|any\[\]\|any =" src/ --include="*.ts" --include="*.tsx" -n || echo "No 'any' types found"

echo ""
echo "🔍 Searching for function parameters with 'any'..."
echo "================================================="
grep -r "(\w*: any" src/ --include="*.ts" --include="*.tsx" -n || echo "No function parameters with 'any' found"

echo ""
echo "🔍 Searching for React event handlers with 'any'..."
echo "================================================="
grep -r "event: any\|e: any" src/ --include="*.ts" --include="*.tsx" -n || echo "No event handlers with 'any' found"