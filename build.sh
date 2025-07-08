#!/bin/bash

# Build script for Render.com deployment

set -e

echo "🚀 Starting Render.com build process..."

# Install root dependencies
echo "📦 Installing root dependencies..."
npm ci

# Install server dependencies
echo "📦 Installing server dependencies..."
cd server && npm ci && cd ..

# Install client dependencies
echo "📦 Installing client dependencies..."
cd client && npm ci && cd ..

# Build client
echo "🏗️ Building client application..."
cd client && npm run build && cd ..

# Build server
echo "🏗️ Building server application..."
cd server && npm run build && cd ..

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads
mkdir -p logs

echo "✅ Build completed successfully!"
echo "📊 Build summary:"
echo "  - Client built to: client/dist/"
echo "  - Server built to: server/dist/"
echo "  - Uploads directory: uploads/"
echo "  - Logs directory: logs/"