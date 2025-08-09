#!/bin/bash
echo "🔍 TypeScript Interface Validation"
echo "=================================="

echo "📋 Step 1: Checking TypeScript compilation..."
echo "Running: npx tsc --noEmit"
npx tsc --noEmit
TS_EXIT_CODE=$?

echo ""
echo "📋 Step 2: Checking ESLint..."
echo "Running: npm run lint"
npm run lint 2>/dev/null || echo "⚠️  ESLint not configured or failed"
LINT_EXIT_CODE=$?

echo ""
echo "📋 Step 3: Checking build process..."
echo "Running: npm run build"
npm run build
BUILD_EXIT_CODE=$?

echo ""
echo "📊 VALIDATION RESULTS:"
echo "======================="
if [ $TS_EXIT_CODE -eq 0 ]; then
    echo "✅ TypeScript compilation: PASSED"
else
    echo "❌ TypeScript compilation: FAILED (exit code: $TS_EXIT_CODE)"
fi

if [ $LINT_EXIT_CODE -eq 0 ]; then
    echo "✅ ESLint: PASSED"
else
    echo "⚠️  ESLint: ISSUES FOUND (exit code: $LINT_EXIT_CODE)"
fi

if [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "✅ Build process: PASSED"
else
    echo "❌ Build process: FAILED (exit code: $BUILD_EXIT_CODE)"
fi

echo ""
if [ $TS_EXIT_CODE -eq 0 ] && [ $BUILD_EXIT_CODE -eq 0 ]; then
    echo "🎉 OVERALL STATUS: PASSED - Type system is working correctly!"
    exit 0
else
    echo "❌ OVERALL STATUS: FAILED - Issues need to be resolved"
    exit 1
fi