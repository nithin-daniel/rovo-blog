#!/bin/bash

# Quick start script for Docker setup

echo "🚀 Starting Modern Blog Application with Docker"
echo "=============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Create directories if they don't exist
mkdir -p uploads logs

# Run setup script
if [ -f "scripts/docker-setup.sh" ]; then
    ./scripts/docker-setup.sh
fi

echo ""
echo "🔧 Choose your environment:"
echo "1) Development (with hot reload)"
echo "2) Production"
echo ""
read -p "Enter your choice (1 or 2): " choice

case $choice in
    1)
        echo "🛠️  Starting development environment..."
        npm run docker:dev
        ;;
    2)
        echo "🚀 Starting production environment..."
        npm run docker:prod
        ;;
    *)
        echo "❌ Invalid choice. Starting development environment by default..."
        npm run docker:dev
        ;;
esac