#!/bin/bash

# Backend build script for Render.com

set -e

echo "🚀 Building Backend for Render.com..."

# Install dependencies
echo "📦 Installing dependencies..."
npm ci

# Copy shared types if they exist (for monorepo structure)
if [ -d "../shared" ]; then
    echo "📋 Copying shared types..."
    cp -r ../shared ./shared
fi

# Build TypeScript
echo "🏗️ Building TypeScript..."
npm run build

# Create necessary directories
echo "📁 Creating directories..."
mkdir -p uploads
mkdir -p logs

echo "✅ Backend build completed!"
echo "📊 Build summary:"
echo "  - TypeScript compiled to: dist/"
echo "  - Uploads directory: uploads/"
echo "  - Logs directory: logs/"