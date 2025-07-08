#!/bin/bash

# Restore script for production data

set -e

# Configuration
BACKUP_DIR="/backups"

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

echo "🔄 Restore Script"
echo "================"

# Check if backup directory exists
if [ ! -d "$BACKUP_DIR" ]; then
    print_error "Backup directory $BACKUP_DIR not found"
    exit 1
fi

# List available backups
print_status "Available backups:"
ls -la $BACKUP_DIR/*backup_*.tar.gz 2>/dev/null || {
    print_error "No backup files found in $BACKUP_DIR"
    exit 1
}

echo ""
read -p "Enter the backup timestamp (YYYYMMDD_HHMMSS) to restore: " BACKUP_DATE

if [ -z "$BACKUP_DATE" ]; then
    print_error "No backup date provided"
    exit 1
fi

# Validate backup files exist
MONGODB_BACKUP="$BACKUP_DIR/mongodb_backup_$BACKUP_DATE.tar.gz"
UPLOADS_BACKUP="$BACKUP_DIR/uploads_backup_$BACKUP_DATE.tar.gz"
CONFIG_BACKUP="$BACKUP_DIR/config_backup_$BACKUP_DATE.tar.gz"

if [ ! -f "$MONGODB_BACKUP" ]; then
    print_error "MongoDB backup file not found: $MONGODB_BACKUP"
    exit 1
fi

print_warning "This will overwrite existing data. Are you sure you want to continue?"
read -p "Type 'yes' to confirm: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    print_status "Restore cancelled"
    exit 0
fi

# Create temporary restore directory
TEMP_DIR="/tmp/restore_$BACKUP_DATE"
mkdir -p $TEMP_DIR

print_status "Starting restore process..."

# Restore MongoDB
if [ -f "$MONGODB_BACKUP" ]; then
    print_status "Restoring MongoDB..."
    
    # Extract backup
    tar -xzf $MONGODB_BACKUP -C $TEMP_DIR
    
    # Stop application to prevent data corruption
    print_status "Stopping application..."
    docker-compose down 2>/dev/null || true
    
    # Start only MongoDB
    print_status "Starting MongoDB for restore..."
    docker-compose up -d mongodb
    sleep 10
    
    # Restore database
    docker cp $TEMP_DIR/mongodb mongodb:/tmp/restore
    docker exec mongodb mongorestore --drop /tmp/restore
    docker exec mongodb rm -rf /tmp/restore
    
    print_status "MongoDB restore completed"
else
    print_warning "MongoDB backup not found, skipping"
fi

# Restore uploads
if [ -f "$UPLOADS_BACKUP" ]; then
    print_status "Restoring uploads..."
    
    # Backup current uploads
    if [ -d "uploads" ]; then
        mv uploads uploads_backup_$(date +%Y%m%d_%H%M%S)
    fi
    
    # Extract uploads backup
    tar -xzf $UPLOADS_BACKUP
    
    print_status "Uploads restore completed"
else
    print_warning "Uploads backup not found, skipping"
fi

# Restore configuration
if [ -f "$CONFIG_BACKUP" ]; then
    print_status "Restoring configuration..."
    
    # Extract config backup
    tar -xzf $CONFIG_BACKUP -C $TEMP_DIR
    
    # Backup current config
    if [ -f "server/.env" ]; then
        cp server/.env server/.env.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    if [ -f "client/.env" ]; then
        cp client/.env client/.env.backup.$(date +%Y%m%d_%H%M%S)
    fi
    
    # Restore config files
    cp $TEMP_DIR/config/server.env server/.env 2>/dev/null || print_warning "server/.env not found in backup"
    cp $TEMP_DIR/config/client.env client/.env 2>/dev/null || print_warning "client/.env not found in backup"
    
    print_status "Configuration restore completed"
else
    print_warning "Configuration backup not found, skipping"
fi

# Clean up temporary files
rm -rf $TEMP_DIR

# Restart application
print_status "Restarting application..."
docker-compose up -d

# Wait for services to be ready
print_status "Waiting for services to start..."
sleep 30

# Health check
print_status "Performing health check..."
if curl -f http://localhost:5000/health > /dev/null 2>&1; then
    print_status "✅ Restore completed successfully!"
    echo "Application is running at:"
    echo "  Frontend: http://localhost:3000"
    echo "  Backend:  http://localhost:5000"
else
    print_error "Health check failed. Please check the logs:"
    echo "  docker-compose logs"
fi

print_status "Restore process finished"