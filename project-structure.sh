#!/bin/bash
echo "🏗️ Project Structure Analysis"
echo "============================"

echo "📂 Source directory structure:"
find src/ -type f -name "*.ts" -o -name "*.tsx" | sort

echo ""
echo "📂 Library files:"
ls -la src/lib/ 2>/dev/null || echo "No lib directory found"

echo ""
echo "📂 Type definitions:"
ls -la src/types/ 2>/dev/null || echo "No types directory found"

echo ""
echo "📂 Components:"
ls -la src/components/ 2>/dev/null || echo "No components directory found"