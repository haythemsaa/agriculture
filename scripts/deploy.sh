#!/bin/bash

###############################################################################
# AgriTech Tunisia - Production Deployment Script
# This script handles the deployment of the application to production
###############################################################################

set -e  # Exit on error

echo "🚀 Starting AgriTech Tunisia Deployment..."
echo "=========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
ENVIRONMENT="${1:-production}"
BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"

echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Create backup directory
mkdir -p "$BACKUP_DIR"

# Step 1: Backup database
echo -e "${YELLOW}📦 Step 1: Creating database backup...${NC}"
docker-compose exec -T postgres pg_dump -U agritech agritech_db > "$BACKUP_DIR/database.sql"
echo -e "${GREEN}✓ Database backup created${NC}"
echo ""

# Step 2: Pull latest code
echo -e "${YELLOW}📥 Step 2: Pulling latest code...${NC}"
git pull origin main
echo -e "${GREEN}✓ Code updated${NC}"
echo ""

# Step 3: Build and restart containers
echo -e "${YELLOW}🐳 Step 3: Building and restarting containers...${NC}"
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo -e "${GREEN}✓ Containers restarted${NC}"
echo ""

# Step 4: Install dependencies
echo -e "${YELLOW}📚 Step 4: Installing backend dependencies...${NC}"
docker-compose exec backend composer install --optimize-autoloader --no-dev
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

echo -e "${YELLOW}📚 Step 4b: Installing frontend dependencies...${NC}"
docker-compose exec frontend npm ci --production
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Step 5: Run migrations
echo -e "${YELLOW}🗄️  Step 5: Running database migrations...${NC}"
docker-compose exec backend php artisan migrate --force
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Step 6: Clear and optimize caches
echo -e "${YELLOW}🧹 Step 6: Clearing and optimizing caches...${NC}"
docker-compose exec backend php artisan config:cache
docker-compose exec backend php artisan route:cache
docker-compose exec backend php artisan view:cache
docker-compose exec backend php artisan optimize
echo -e "${GREEN}✓ Caches optimized${NC}"
echo ""

# Step 7: Build frontend
echo -e "${YELLOW}🏗️  Step 7: Building frontend for production...${NC}"
docker-compose exec frontend npm run build
echo -e "${GREEN}✓ Frontend built${NC}"
echo ""

# Step 8: Health check
echo -e "${YELLOW}🏥 Step 8: Running health checks...${NC}"
sleep 5  # Wait for services to be ready

# Check backend health
BACKEND_HEALTH=$(curl -s http://localhost:8000/api/health | grep -o '"status":"ok"' || echo "failed")
if [ "$BACKEND_HEALTH" == '"status":"ok"' ]; then
    echo -e "${GREEN}✓ Backend health check passed${NC}"
else
    echo -e "${RED}✗ Backend health check failed${NC}"
    exit 1
fi

# Check frontend
FRONTEND_HEALTH=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000)
if [ "$FRONTEND_HEALTH" == "200" ]; then
    echo -e "${GREEN}✓ Frontend health check passed${NC}"
else
    echo -e "${RED}✗ Frontend health check failed (HTTP $FRONTEND_HEALTH)${NC}"
    exit 1
fi

echo ""
echo -e "${GREEN}=========================================="
echo "🎉 Deployment completed successfully!"
echo "==========================================${NC}"
echo ""
echo "Backup location: $BACKUP_DIR"
echo "Backend: http://localhost:8000"
echo "Frontend: http://localhost:3000"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Test the application thoroughly"
echo "2. Monitor logs: docker-compose logs -f"
echo "3. Check metrics and performance"
echo ""
