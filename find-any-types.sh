#!/bin/bash
echo "🔍 Comprehensive 'any' Type Search"
echo "=================================="

echo "📋 Searching for 'any' in TypeScript files..."

# Function to search for 'any' patterns in a file
search_any_in_file() {
    local file="$1"
    if [ -f "$file" ]; then
        echo "📁 $file:"
        # Search for various 'any' patterns
        grep -n -E "(: any|<any>|any\[\]|any =|any,|any\)|any\s*=>|event: any|data: any|props: any|state: any|params: any)" "$file" 2>/dev/null | head -10
        if [ $? -ne 0 ]; then
            echo "  ✅ No 'any' types found"
        fi
        echo ""
    fi
}

# Search in main source files
echo "🎯 Main application files:"
search_any_in_file "src/App.tsx"
search_any_in_file "src/main.tsx"
search_any_in_file "src/index.tsx"

echo "🎯 Library files:"
for file in src/lib/*.ts src/lib/*.tsx; do
    search_any_in_file "$file"
done

echo "🎯 Type definition files:"
for file in src/types/*.ts src/types/*.tsx; do
    search_any_in_file "$file"
done

echo "🎯 Component files (first 5):"
find src/components -name "*.ts" -o -name "*.tsx" 2>/dev/null | head -5 | while read file; do
    search_any_in_file "$file"
done

echo "📊 Summary:"
echo "Total TypeScript files found:"
find src/ -name "*.ts" -o -name "*.tsx" 2>/dev/null | wc -l