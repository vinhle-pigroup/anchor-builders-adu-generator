#!/bin/bash
cd /home/vinh/code/PiGroup-App/apps/anchor-builders-adu-generator
echo "=== Running TypeScript check ==="
npx tsc --noEmit
echo "=== TypeScript check complete ==="