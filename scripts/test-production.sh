#!/bin/bash

# Production deployment test script for anchor-builders-adu-generator
set -e

echo "🧪 Testing anchor-builders-adu-generator production deployment..."

# Configuration
RAILWAY_URL="https://anchor-builders-adu-generator-production.up.railway.app"
LOCAL_URL="http://localhost:8080"

# Function to test endpoint
test_endpoint() {
  local url=$1
  local endpoint=$2
  local expected_status=$3
  local description=$4
  
  echo "Testing $description..."
  
  response=$(curl -s -w "\n%{http_code}" "$url$endpoint" || echo "000")
  status_code=$(echo "$response" | tail -n1)
  body=$(echo "$response" | head -n -1)
  
  if [ "$status_code" = "$expected_status" ]; then
    echo "✅ $description - Status: $status_code"
    return 0
  else
    echo "❌ $description - Expected: $expected_status, Got: $status_code"
    echo "Response: $body"
    return 1
  fi
}

# Function to test full deployment
test_deployment() {
  local base_url=$1
  local deployment_type=$2
  
  echo "🌐 Testing $deployment_type deployment at $base_url"
  
  # Test health endpoint
  test_endpoint "$base_url" "/health" "200" "Health check"
  
  # Test healthz endpoint (Railway alias)
  test_endpoint "$base_url" "/healthz" "200" "Health check (Railway)"
  
  # Test main app (should return HTML)
  echo "Testing main application..."
  main_response=$(curl -s -w "\n%{http_code}" "$base_url/" || echo "000")
  main_status=$(echo "$main_response" | tail -n1)
  main_body=$(echo "$main_response" | head -n -1)
  
  if [ "$main_status" = "200" ] && echo "$main_body" | grep -q "<!DOCTYPE html"; then
    echo "✅ Main application - Status: $main_status (HTML content detected)"
  else
    echo "❌ Main application - Status: $main_status"
    echo "Response preview: $(echo "$main_body" | head -c 200)..."
    return 1
  fi
  
  # Test 404 handling
  test_endpoint "$base_url" "/nonexistent-route" "404" "404 handling"
  
  echo "✅ All $deployment_type tests passed!"
}

# Parse command line arguments
ENVIRONMENT=${1:-"both"}

case $ENVIRONMENT in
  "local")
    echo "🏠 Testing local deployment only..."
    test_deployment "$LOCAL_URL" "local"
    ;;
  "production" | "railway")
    echo "🚀 Testing Railway production deployment only..."
    test_deployment "$RAILWAY_URL" "Railway production"
    ;;
  "both")
    echo "🧪 Testing both local and production deployments..."
    
    # Test local first (if available)
    if curl -s -f "$LOCAL_URL/health" > /dev/null 2>&1; then
      test_deployment "$LOCAL_URL" "local"
    else
      echo "⚠️  Local server not running, skipping local tests"
    fi
    
    # Test production
    test_deployment "$RAILWAY_URL" "Railway production"
    ;;
  *)
    echo "Usage: $0 [local|production|railway|both]"
    echo "  local      - Test local server only"
    echo "  production - Test Railway production only"  
    echo "  railway    - Same as production"
    echo "  both       - Test both (default)"
    exit 1
    ;;
esac

echo ""
echo "🎉 All deployment tests completed successfully!"
echo ""
echo "📋 Production URL: $RAILWAY_URL"
echo "🏠 Local URL: $LOCAL_URL"
echo ""
echo "Next steps:"
echo "  • Verify app functionality in browser"
echo "  • Test ADU generator form submission"
echo "  • Monitor Railway logs: railway logs --tail"