#!/bin/bash
cd /home/vinh/code/PiGroup-App/apps/anchor-builders-adu-generator

echo "=== Checking TypeScript compilation errors ==="
npx tsc --noEmit 2>&1 | head -50

echo -e "\n=== Checking main files ==="
echo "App.tsx:"
head -10 src/App.tsx

echo -e "\nProjectDetailsForm.tsx first 20 lines:"
head -20 src/components/ProjectDetailsForm.tsx

echo -e "\nChecking for data/pricing-config.ts:"
ls -la src/data/ 2>/dev/null || echo "data directory not found"

echo -e "\nChecking all TypeScript files:"
find src -name "*.ts" -o -name "*.tsx" | head -10