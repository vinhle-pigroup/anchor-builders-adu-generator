#!/bin/bash

# Anchor Builders ADU Generator - Railway Deployment Script

echo "🚀 Deploying Anchor Builders ADU Generator to Railway..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Make sure you're in the anchor-builders-adu-generator directory."
    exit 1
fi

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Railway CLI not found. Installing..."
    npm install -g @railway/cli
fi

# Build the application
echo "🔨 Building application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix errors before deploying."
    exit 1
fi

echo "✅ Build successful!"

# Login to Railway (if not already logged in)
echo "🔑 Checking Railway authentication..."
railway auth

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your Anchor Builders ADU Generator is now live!"
    echo ""
    echo "🔗 Check your Railway dashboard for the live URL"
    echo "📊 Monitor deployment: https://railway.app/"
else
    echo "❌ Deployment failed. Check the logs above for details."
    exit 1
fi