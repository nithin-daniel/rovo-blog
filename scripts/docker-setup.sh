#!/bin/bash

# Docker setup script for the blog application

set -e

echo "🚀 Setting up Docker environment for Blog Application"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Create necessary directories
echo "📁 Creating necessary directories..."
mkdir -p uploads
mkdir -p logs

# Set permissions
chmod 755 uploads
chmod 755 logs

# Copy environment file if it doesn't exist
if [ ! -f server/.env ]; then
    echo "📝 Creating environment file..."
    cp server/.env.example server/.env 2>/dev/null || echo "⚠️  Please create server/.env file manually"
fi

echo "✅ Docker setup completed!"
echo ""
echo "🔧 Available commands:"
echo "  npm run docker:dev     - Start development environment"
echo "  npm run docker:prod    - Start production environment"
echo "  npm run docker:stop    - Stop all containers"
echo "  npm run docker:clean   - Clean up containers and volumes"
echo ""
echo "🌐 Once started, access:"
echo "  Frontend: http://localhost:3000"
echo "  Backend API: http://localhost:5000"
echo "  MongoDB: localhost:27017"
echo "  Redis: localhost:6379"