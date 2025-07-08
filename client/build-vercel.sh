#!/bin/bash

# Frontend build script for Vercel deployment

set -e

echo "🚀 Building Frontend for Vercel..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Copy shared types if they exist (for monorepo structure)
if [ -d "../shared" ]; then
    echo "📋 Copying shared types..."
    cp -r ../shared ./shared
fi

# Build React application
echo "🏗️ Building React application..."
npm run build

echo "✅ Frontend build completed for Vercel!"
echo "📊 Build summary:"
echo "  - React app built to: dist/"
echo "  - Static files ready for Vercel"