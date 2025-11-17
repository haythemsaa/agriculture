#!/bin/bash

###############################################################################
# AgriTech Tunisia - Monitoring Script
# This script checks the health and status of all services
###############################################################################

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

clear

echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║   AgriTech Tunisia - Monitor          ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"
echo ""

# Function to check service health
check_service() {
    local service=$1
    local url=$2
    local expected=$3

    printf "%-20s" "$service:"

    response=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)

    if [ "$response" == "$expected" ]; then
        echo -e "${GREEN}✓ Healthy (HTTP $response)${NC}"
        return 0
    else
        echo -e "${RED}✗ Unhealthy (HTTP $response)${NC}"
        return 1
    fi
}

# Function to check Docker container status
check_container() {
    local container=$1
    local status=$(docker-compose ps -q "$container" 2>/dev/null | xargs docker inspect -f '{{.State.Status}}' 2>/dev/null)

    printf "%-20s" "$container:"

    if [ "$status" == "running" ]; then
        echo -e "${GREEN}✓ Running${NC}"
        return 0
    elif [ "$status" == "restarting" ]; then
        echo -e "${YELLOW}⟳ Restarting${NC}"
        return 1
    elif [ -z "$status" ]; then
        echo -e "${RED}✗ Not found${NC}"
        return 1
    else
        echo -e "${RED}✗ $status${NC}"
        return 1
    fi
}

# Container Status
echo -e "${YELLOW}🐳 Docker Containers:${NC}"
echo "══════════════════════════════════════"
check_container "backend"
check_container "frontend"
check_container "postgres"
check_container "mongo"
check_container "redis"
check_container "elasticsearch"
check_container "mailhog"
echo ""

# Service Health Checks
echo -e "${YELLOW}🏥 Service Health:${NC}"
echo "══════════════════════════════════════"
check_service "Backend API" "http://localhost:8000/api/health" "200"
check_service "Frontend" "http://localhost:3000" "200"
check_service "Elasticsearch" "http://localhost:9200" "200"
check_service "MailHog" "http://localhost:8025" "200"
echo ""

# Database Connections
echo -e "${YELLOW}🗄️  Database Connections:${NC}"
echo "══════════════════════════════════════"

# PostgreSQL
printf "%-20s" "PostgreSQL:"
if docker-compose exec -T postgres pg_isready -U agritech >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Not connected${NC}"
fi

# MongoDB
printf "%-20s" "MongoDB:"
if docker-compose exec -T mongo mongo --eval "db.runCommand({ ping: 1 })" >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Not connected${NC}"
fi

# Redis
printf "%-20s" "Redis:"
if docker-compose exec -T redis redis-cli ping >/dev/null 2>&1; then
    echo -e "${GREEN}✓ Connected${NC}"
else
    echo -e "${RED}✗ Not connected${NC}"
fi
echo ""

# Resource Usage
echo -e "${YELLOW}💻 Resource Usage:${NC}"
echo "══════════════════════════════════════"
docker stats --no-stream --format "table {{.Name}}\t{{.CPUPerc}}\t{{.MemUsage}}" | grep -E "NAME|agritech" || echo "No containers running"
echo ""

# Disk Usage
echo -e "${YELLOW}💾 Disk Usage:${NC}"
echo "══════════════════════════════════════"
printf "%-20s" "Docker volumes:"
VOLUME_SIZE=$(docker system df -v --format "{{.Size}}" 2>/dev/null | tail -1 || echo "N/A")
echo "$VOLUME_SIZE"

printf "%-20s" "Backups:"
if [ -d "./backups" ]; then
    BACKUP_SIZE=$(du -sh ./backups 2>/dev/null | cut -f1 || echo "0B")
    echo "$BACKUP_SIZE"
else
    echo "0B"
fi
echo ""

# Recent Logs (errors only)
echo -e "${YELLOW}📋 Recent Errors (last 10):${NC}"
echo "══════════════════════════════════════"
docker-compose logs --tail=50 2>&1 | grep -i "error\|exception\|fatal" | tail -10 || echo "No recent errors"
echo ""

# Uptime
echo -e "${YELLOW}⏱️  Uptime:${NC}"
echo "══════════════════════════════════════"
docker-compose ps --format "table {{.Name}}\t{{.Status}}" | grep -E "NAME|agritech"
echo ""

# Summary
echo -e "${BLUE}"
echo "╔═══════════════════════════════════════╗"
echo "║           Monitor Summary             ║"
echo "╚═══════════════════════════════════════╝"
echo -e "${NC}"
echo "Last updated: $(date '+%Y-%m-%d %H:%M:%S')"
echo ""
echo "Useful commands:"
echo "  View live logs:     docker-compose logs -f"
echo "  Restart service:    docker-compose restart <service>"
echo "  View all logs:      docker-compose logs"
echo ""
