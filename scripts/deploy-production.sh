#!/bin/bash

# Production deployment script

set -e

echo "🚀 Production Deployment Script"
echo "==============================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [ "$EUID" -eq 0 ]; then
    print_error "Please don't run this script as root"
    exit 1
fi

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    print_error "Docker is not running. Please start Docker first."
    exit 1
fi

# Check if environment files exist
if [ ! -f "server/.env" ]; then
    print_error "server/.env file not found. Please create it from server/.env.example"
    exit 1
fi

if [ ! -f "client/.env" ]; then
    print_warning "client/.env file not found. Creating from template..."
    cp client/.env.example client/.env
fi

# Backup existing data
print_status "Creating backup of existing data..."
mkdir -p backups/$(date +%Y%m%d_%H%M%S)

if docker ps | grep -q mongodb; then
    print_status "Backing up MongoDB data..."
    docker exec mongodb mongodump --out /tmp/backup 2>/dev/null || print_warning "MongoDB backup failed"
fi

# Stop existing containers
print_status "Stopping existing containers..."
docker-compose down 2>/dev/null || true

# Pull latest images
print_status "Pulling latest base images..."
docker-compose pull

# Build and start production environment
print_status "Building and starting production environment..."
docker-compose up --build -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Health check
print_status "Performing health checks..."

# Check if containers are running
if ! docker-compose ps | grep -q "Up"; then
    print_error "Some containers failed to start. Check logs with: docker-compose logs"
    exit 1
fi

# Check MongoDB
if ! docker exec mongodb mongosh --quiet --eval "db.adminCommand('ping')" > /dev/null 2>&1; then
    print_error "MongoDB health check failed"
    exit 1
fi

# Check Redis
if ! docker exec redis redis-cli ping > /dev/null 2>&1; then
    print_error "Redis health check failed"
    exit 1
fi

# Check application
sleep 10
if ! curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_error "Application health check failed"
    exit 1
fi

# Check frontend
if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
    print_error "Frontend health check failed"
    exit 1
fi

print_status "✅ Deployment completed successfully!"
echo ""
echo "🌐 Your application is now running at:"
echo "   Frontend: http://localhost:3000"
echo "   Backend:  http://localhost:5000"
echo ""
echo "📊 Monitor your application:"
echo "   docker-compose logs -f"
echo "   npm run docker:health"
echo ""
echo "🛑 To stop the application:"
echo "   docker-compose down"

# Optional: Send notification (uncomment and configure as needed)
# curl -X POST -H 'Content-type: application/json' \
#   --data '{"text":"Blog application deployed successfully!"}' \
#   YOUR_SLACK_WEBHOOK_URL