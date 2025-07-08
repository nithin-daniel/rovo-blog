#!/bin/bash

# Docker cleanup script

set -e

echo "🧹 Cleaning up Docker environment..."

# Stop all containers
echo "🛑 Stopping containers..."
docker-compose -f docker-compose.yml down 2>/dev/null || true
docker-compose -f docker-compose.dev.yml down 2>/dev/null || true

# Remove containers
echo "🗑️  Removing containers..."
docker container prune -f

# Remove images (optional - uncomment if you want to remove images too)
# echo "🗑️  Removing images..."
# docker image prune -f

# Remove volumes (BE CAREFUL - this will delete all data)
read -p "⚠️  Do you want to remove volumes (this will delete all data)? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🗑️  Removing volumes..."
    docker volume prune -f
fi

# Remove networks
echo "🗑️  Removing networks..."
docker network prune -f

echo "✅ Cleanup completed!"