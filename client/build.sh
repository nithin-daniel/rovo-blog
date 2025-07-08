#!/bin/bash

# Frontend build script for Render.com

set -e

echo "🚀 Building Frontend for Render.com..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Build React application
echo "🏗️ Building React application..."
npm run build

echo "✅ Frontend build completed!"
echo "📊 Build summary:"
echo "  - React app built to: dist/"
echo "  - Static files ready for nginx"