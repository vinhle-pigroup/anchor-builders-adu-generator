#!/bin/bash
cd /home/vinh/code/PiGroup-App/apps/anchor-builders-adu-generator

echo "Current directory: $(pwd)"
echo "Package.json exists: $(test -f package.json && echo "YES" || echo "NO")"
echo "tsconfig.json exists: $(test -f tsconfig.json && echo "YES" || echo "NO")"

echo -e "\n=== TypeScript errors ==="
npx tsc --noEmit

echo -e "\n=== File structure ==="
find src -name "*.ts" -o -name "*.tsx" | sort