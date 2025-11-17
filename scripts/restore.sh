#!/bin/bash

###############################################################################
# AgriTech Tunisia - Database Restore Script
# This script restores databases from a backup
###############################################################################

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Check if backup timestamp provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Backup timestamp required${NC}"
    echo "Usage: $0 <backup_timestamp>"
    echo ""
    echo "Available backups:"
    ls -1 ./backups/*.tar.gz 2>/dev/null | sed 's/.*\///' | sed 's/.tar.gz//' || echo "No backups found"
    exit 1
fi

BACKUP_TIMESTAMP=$1
BACKUP_ROOT="./backups"
BACKUP_ARCHIVE="$BACKUP_ROOT/$BACKUP_TIMESTAMP.tar.gz"
BACKUP_DIR="$BACKUP_ROOT/$BACKUP_TIMESTAMP"

# Check if backup exists
if [ ! -f "$BACKUP_ARCHIVE" ]; then
    echo -e "${RED}Error: Backup not found: $BACKUP_ARCHIVE${NC}"
    exit 1
fi

echo "⚠️  WARNING: This will restore the database from backup!"
echo "Backup: $BACKUP_ARCHIVE"
echo ""
echo "This will OVERWRITE all current data!"
read -p "Are you sure you want to continue? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "Restore cancelled."
    exit 0
fi

echo ""
echo "🔄 Starting restore process..."
echo "=========================================="

# Extract backup
echo -e "${YELLOW}📦 Extracting backup archive...${NC}"
tar -xzf "$BACKUP_ARCHIVE" -C "$BACKUP_ROOT"
echo -e "${GREEN}✓ Backup extracted${NC}"
echo ""

# Restore PostgreSQL
echo -e "${YELLOW}🐘 Restoring PostgreSQL database...${NC}"
echo "Dropping existing database..."
docker-compose exec -T postgres psql -U agritech -c "DROP DATABASE IF EXISTS agritech_db;"
docker-compose exec -T postgres psql -U agritech -c "CREATE DATABASE agritech_db;"

echo "Restoring data..."
cat "$BACKUP_DIR/postgres_agritech.sql" | docker-compose exec -T postgres psql -U agritech agritech_db
echo -e "${GREEN}✓ PostgreSQL restore completed${NC}"
echo ""

# Restore MongoDB
if [ -f "$BACKUP_DIR/mongodb_dump.archive" ]; then
    echo -e "${YELLOW}🍃 Restoring MongoDB database...${NC}"
    docker-compose exec -T mongo mongorestore --archive="$BACKUP_DIR/mongodb_dump.archive" --gzip --drop
    echo -e "${GREEN}✓ MongoDB restore completed${NC}"
    echo ""
fi

# Restore Redis (optional)
if [ -f "$BACKUP_DIR/redis_dump.rdb" ]; then
    echo -e "${YELLOW}📮 Restoring Redis data...${NC}"
    docker-compose stop redis
    docker cp "$BACKUP_DIR/redis_dump.rdb" agritech_redis:/data/dump.rdb
    docker-compose start redis
    echo -e "${GREEN}✓ Redis restore completed${NC}"
    echo ""
fi

# Cleanup extracted backup
echo "🧹 Cleaning up temporary files..."
rm -rf "$BACKUP_DIR"
echo -e "${GREEN}✓ Cleanup completed${NC}"
echo ""

# Run migrations to ensure schema is up to date
echo -e "${YELLOW}🗄️  Running migrations...${NC}"
docker-compose exec backend php artisan migrate --force
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

echo -e "${GREEN}=========================================="
echo "✅ Restore completed successfully!"
echo "==========================================${NC}"
echo ""
echo "Please verify your data and application functionality."
echo ""
