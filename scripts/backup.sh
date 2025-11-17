#!/bin/bash

###############################################################################
# AgriTech Tunisia - Database Backup Script
# This script creates backups of all databases
###############################################################################

set -e

echo "📦 Starting backup process..."

# Configuration
BACKUP_ROOT="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_ROOT/$TIMESTAMP"
RETENTION_DAYS=30

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Create backup directory
mkdir -p "$BACKUP_DIR"

echo -e "${YELLOW}Backup directory: $BACKUP_DIR${NC}"
echo ""

# Backup PostgreSQL
echo "🐘 Backing up PostgreSQL database..."
docker-compose exec -T postgres pg_dump -U agritech agritech_db > "$BACKUP_DIR/postgres_agritech.sql"
docker-compose exec -T postgres pg_dumpall -U agritech > "$BACKUP_DIR/postgres_all.sql"
echo -e "${GREEN}✓ PostgreSQL backup completed${NC}"
echo ""

# Backup MongoDB
echo "🍃 Backing up MongoDB database..."
docker-compose exec -T mongo mongodump --archive="$BACKUP_DIR/mongodb_dump.archive" --gzip
echo -e "${GREEN}✓ MongoDB backup completed${NC}"
echo ""

# Backup Redis data (optional)
echo "📮 Backing up Redis data..."
docker-compose exec -T redis redis-cli --rdb "$BACKUP_DIR/redis_dump.rdb" SAVE 2>/dev/null || true
echo -e "${GREEN}✓ Redis backup completed${NC}"
echo ""

# Create compressed archive
echo "🗜️  Creating compressed archive..."
tar -czf "$BACKUP_DIR.tar.gz" -C "$BACKUP_ROOT" "$TIMESTAMP"
echo -e "${GREEN}✓ Compressed archive created: $BACKUP_DIR.tar.gz${NC}"
echo ""

# Calculate sizes
ARCHIVE_SIZE=$(du -h "$BACKUP_DIR.tar.gz" | cut -f1)
echo "📊 Backup size: $ARCHIVE_SIZE"
echo ""

# Cleanup old backups
echo "🧹 Cleaning up old backups (older than $RETENTION_DAYS days)..."
find "$BACKUP_ROOT" -name "*.tar.gz" -type f -mtime +$RETENTION_DAYS -delete
find "$BACKUP_ROOT" -type d -mtime +$RETENTION_DAYS -empty -delete
echo -e "${GREEN}✓ Cleanup completed${NC}"
echo ""

# List recent backups
echo "📋 Recent backups:"
ls -lht "$BACKUP_ROOT"/*.tar.gz 2>/dev/null | head -5 || echo "No backups found"
echo ""

echo -e "${GREEN}=========================================="
echo "✅ Backup completed successfully!"
echo "==========================================${NC}"
echo "Backup file: $BACKUP_DIR.tar.gz"
echo "Size: $ARCHIVE_SIZE"
echo ""
echo "To restore this backup, run:"
echo "  ./scripts/restore.sh $TIMESTAMP"
echo ""
