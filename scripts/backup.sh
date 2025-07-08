#!/bin/bash

# Backup script for production data

set -e

# Configuration
BACKUP_DIR="/backups"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=7

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

echo "💾 Backup Script"
echo "================"

# Create backup directory
mkdir -p $BACKUP_DIR/$DATE

print_status "Starting backup process..."

# Backup MongoDB
if docker ps | grep -q mongodb; then
    print_status "Backing up MongoDB..."
    docker exec mongodb mongodump --out /tmp/backup_$DATE
    docker cp mongodb:/tmp/backup_$DATE $BACKUP_DIR/$DATE/mongodb
    docker exec mongodb rm -rf /tmp/backup_$DATE
    
    # Compress MongoDB backup
    tar -czf $BACKUP_DIR/mongodb_backup_$DATE.tar.gz -C $BACKUP_DIR/$DATE mongodb
    rm -rf $BACKUP_DIR/$DATE/mongodb
    print_status "MongoDB backup completed"
else
    print_warning "MongoDB container not found"
fi

# Backup uploads directory
if [ -d "uploads" ]; then
    print_status "Backing up uploads directory..."
    tar -czf $BACKUP_DIR/uploads_backup_$DATE.tar.gz uploads/
    print_status "Uploads backup completed"
else
    print_warning "Uploads directory not found"
fi

# Backup environment files
print_status "Backing up configuration files..."
mkdir -p $BACKUP_DIR/$DATE/config
cp server/.env $BACKUP_DIR/$DATE/config/server.env 2>/dev/null || print_warning "server/.env not found"
cp client/.env $BACKUP_DIR/$DATE/config/client.env 2>/dev/null || print_warning "client/.env not found"
cp docker-compose.yml $BACKUP_DIR/$DATE/config/ 2>/dev/null || true

# Compress config backup
if [ -d "$BACKUP_DIR/$DATE/config" ]; then
    tar -czf $BACKUP_DIR/config_backup_$DATE.tar.gz -C $BACKUP_DIR/$DATE config
    rm -rf $BACKUP_DIR/$DATE/config
fi

# Clean up old backups
print_status "Cleaning up old backups (older than $RETENTION_DAYS days)..."
find $BACKUP_DIR -name "*backup_*.tar.gz" -mtime +$RETENTION_DAYS -delete

# Remove empty backup directory
rmdir $BACKUP_DIR/$DATE 2>/dev/null || true

# Calculate backup sizes
print_status "Backup summary:"
if [ -f "$BACKUP_DIR/mongodb_backup_$DATE.tar.gz" ]; then
    MONGO_SIZE=$(du -h "$BACKUP_DIR/mongodb_backup_$DATE.tar.gz" | cut -f1)
    echo "  MongoDB: $MONGO_SIZE"
fi

if [ -f "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" ]; then
    UPLOADS_SIZE=$(du -h "$BACKUP_DIR/uploads_backup_$DATE.tar.gz" | cut -f1)
    echo "  Uploads: $UPLOADS_SIZE"
fi

if [ -f "$BACKUP_DIR/config_backup_$DATE.tar.gz" ]; then
    CONFIG_SIZE=$(du -h "$BACKUP_DIR/config_backup_$DATE.tar.gz" | cut -f1)
    echo "  Config: $CONFIG_SIZE"
fi

print_status "✅ Backup completed successfully!"
echo "Backup location: $BACKUP_DIR"
echo "Backup timestamp: $DATE"

# Optional: Upload to cloud storage (uncomment and configure as needed)
# print_status "Uploading to cloud storage..."
# aws s3 cp $BACKUP_DIR/mongodb_backup_$DATE.tar.gz s3://your-backup-bucket/mongodb/
# aws s3 cp $BACKUP_DIR/uploads_backup_$DATE.tar.gz s3://your-backup-bucket/uploads/
# aws s3 cp $BACKUP_DIR/config_backup_$DATE.tar.gz s3://your-backup-bucket/config/