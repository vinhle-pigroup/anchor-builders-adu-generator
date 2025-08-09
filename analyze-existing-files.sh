#!/bin/bash
echo "🔍 Analyzing Existing Files for 'any' Types"
echo "==========================================="

# Check if key files exist and analyze them
check_file_for_any() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "✅ Found $file"
        echo "   📊 Lines containing 'any':"
        grep -n -i "any" "$file" | head -5 || echo "   ✅ No 'any' types found"
        echo "   📊 Total lines:"
        wc -l < "$file"
        echo ""
    else
        echo "❌ File not found: $file"
    fi
}

echo "🎯 Checking key source files:"
check_file_for_any "src/App.tsx"
check_file_for_any "src/lib/pricing-engine.ts"
check_file_for_any "src/lib/pdf-template-generator.ts"
check_file_for_any "src/types/proposal.ts"

echo "🎯 Listing available files in src/:"
find src/ -name "*.ts" -o -name "*.tsx" | head -10 | while read file; do
    echo "📁 $file exists"
done