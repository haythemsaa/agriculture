#!/bin/bash

###############################################################################
# AgriTech Tunisia - Initial Setup Script
# This script sets up the development/production environment
###############################################################################

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║   AgriTech Tunisia - Setup Script    ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"

# Determine environment
ENVIRONMENT="${1:-development}"
echo -e "${YELLOW}Environment: ${ENVIRONMENT}${NC}"
echo ""

# Step 1: Check prerequisites
echo -e "${YELLOW}📋 Step 1: Checking prerequisites...${NC}"

command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting."; exit 1; }
command -v docker-compose >/dev/null 2>&1 || { echo "❌ Docker Compose is required but not installed. Aborting."; exit 1; }

echo -e "${GREEN}✓ Docker: $(docker --version)${NC}"
echo -e "${GREEN}✓ Docker Compose: $(docker-compose --version)${NC}"
echo ""

# Step 2: Create environment files
echo -e "${YELLOW}🔧 Step 2: Setting up environment files...${NC}"

# Backend .env
if [ ! -f "backend/.env" ]; then
    echo "Creating backend/.env from .env.example..."
    cp backend/.env.example backend/.env

    # Generate APP_KEY
    echo "Generating Laravel application key..."
    docker-compose run --rm backend php artisan key:generate
    echo -e "${GREEN}✓ Backend .env created${NC}"
else
    echo -e "${YELLOW}⚠ backend/.env already exists, skipping...${NC}"
fi

# Frontend .env
if [ ! -f "frontend/.env" ]; then
    echo "Creating frontend/.env..."
    cat > frontend/.env << EOF
NUXT_PUBLIC_API_BASE=http://localhost:8000/api/v1
NUXT_PUBLIC_ENV=${ENVIRONMENT}
EOF
    echo -e "${GREEN}✓ Frontend .env created${NC}"
else
    echo -e "${YELLOW}⚠ frontend/.env already exists, skipping...${NC}"
fi

echo ""

# Step 3: Create necessary directories
echo -e "${YELLOW}📁 Step 3: Creating directories...${NC}"
mkdir -p backups
mkdir -p backend/storage/app/public
mkdir -p backend/storage/framework/cache
mkdir -p backend/storage/framework/sessions
mkdir -p backend/storage/framework/views
mkdir -p backend/storage/logs
echo -e "${GREEN}✓ Directories created${NC}"
echo ""

# Step 4: Build and start containers
echo -e "${YELLOW}🐳 Step 4: Building Docker containers...${NC}"
docker-compose build
echo -e "${GREEN}✓ Containers built${NC}"
echo ""

echo -e "${YELLOW}🚀 Step 5: Starting containers...${NC}"
docker-compose up -d
echo -e "${GREEN}✓ Containers started${NC}"
echo ""

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10
echo ""

# Step 6: Install dependencies
echo -e "${YELLOW}📚 Step 6: Installing backend dependencies...${NC}"
docker-compose exec backend composer install
echo -e "${GREEN}✓ Backend dependencies installed${NC}"
echo ""

echo -e "${YELLOW}📚 Step 6b: Installing frontend dependencies...${NC}"
docker-compose exec frontend npm install
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
echo ""

# Step 7: Run migrations
echo -e "${YELLOW}🗄️  Step 7: Running database migrations...${NC}"
docker-compose exec backend php artisan migrate:fresh
echo -e "${GREEN}✓ Migrations completed${NC}"
echo ""

# Step 8: Seed database (only in development)
if [ "$ENVIRONMENT" == "development" ]; then
    echo -e "${YELLOW}🌱 Step 8: Seeding database with sample data...${NC}"
    docker-compose exec backend php artisan db:seed
    echo -e "${GREEN}✓ Database seeded${NC}"
    echo ""
fi

# Step 9: Create storage link
echo -e "${YELLOW}🔗 Step 9: Creating storage symlink...${NC}"
docker-compose exec backend php artisan storage:link
echo -e "${GREEN}✓ Storage link created${NC}"
echo ""

# Step 10: Set permissions
echo -e "${YELLOW}🔐 Step 10: Setting permissions...${NC}"
docker-compose exec backend chmod -R 775 storage bootstrap/cache
echo -e "${GREEN}✓ Permissions set${NC}"
echo ""

# Health check
echo -e "${YELLOW}🏥 Running health checks...${NC}"
sleep 5

BACKEND_HEALTH=$(curl -s http://localhost:8000/api/health || echo "failed")
if [[ $BACKEND_HEALTH == *'"status":"ok"'* ]]; then
    echo -e "${GREEN}✓ Backend is healthy${NC}"
else
    echo -e "${YELLOW}⚠ Backend health check inconclusive${NC}"
fi

FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000 || echo "000")
if [ "$FRONTEND_STATUS" == "200" ]; then
    echo -e "${GREEN}✓ Frontend is accessible${NC}"
else
    echo -e "${YELLOW}⚠ Frontend may still be starting (HTTP $FRONTEND_STATUS)${NC}"
fi

echo ""
echo -e "${GREEN}"
echo "╔═══════════════════════════════════════╗"
echo "║     ✅ Setup Completed Successfully!  ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"
echo ""
echo "🌐 Application URLs:"
echo "   Frontend:     http://localhost:3000"
echo "   Backend API:  http://localhost:8000"
echo "   MailHog:      http://localhost:8025"
echo ""
echo "📊 Database Connections:"
echo "   PostgreSQL:   localhost:5432"
echo "   MongoDB:      localhost:27017"
echo "   Redis:        localhost:6379"
echo "   Elasticsearch: localhost:9200"
echo ""

if [ "$ENVIRONMENT" == "development" ]; then
    echo "👤 Test Accounts:"
    echo "   Admin:        admin@agritech.tn / password"
    echo "   Agriculteur:  ahmed@agritech.tn / password"
    echo "   Acheteur:     sarah@agritech.tn / password"
    echo ""
fi

echo "📚 Useful Commands:"
echo "   View logs:        docker-compose logs -f"
echo "   Stop services:    docker-compose down"
echo "   Restart:          docker-compose restart"
echo "   Backup DB:        ./scripts/backup.sh"
echo "   Deploy:           ./scripts/deploy.sh"
echo ""
echo "📖 For more information, see README.md"
echo ""
