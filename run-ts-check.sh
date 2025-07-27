#!/bin/bash
cd /home/vinh/code/PiGroup-App/apps/anchor-builders-adu-generator

echo "=== TypeScript Compilation Check ===" > ts-errors.log
npx tsc --noEmit 2>&1 >> ts-errors.log

echo "=== File List ===" >> ts-errors.log
find src -name "*.ts" -o -name "*.tsx" >> ts-errors.log

echo "Done. Check ts-errors.log for results."
echo "First few lines of errors:"
head -20 ts-errors.log