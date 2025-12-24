#!/bin/bash

# Unraid Deployment Script for ProjectJS
# Usage: ./scripts/deploy_unraid.sh

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}Starting Unraid Deployment...${NC}"

# 1. Check for required tools
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Error: docker is not installed.${NC}"
    exit 1
fi

# Check for docker compose (v2) or docker-compose (v1)
DOCKER_COMPOSE_CMD=""
if docker compose version &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker compose"
elif command -v docker-compose &> /dev/null; then
    DOCKER_COMPOSE_CMD="docker-compose"
else
    echo -e "${RED}Error: docker compose is not installed.${NC}"
    exit 1
fi

# 2. Check for .env file
if [ ! -f .env ]; then
    echo -e "${RED}Warning: .env file not found in root directory.${NC}"
    echo "Creating .env from example..."
    
    # Create a basic .env if it doesn't exist, but prompt user to edit it
    cat <<EOT >> .env
DB_USER=postgres
DB_PASSWORD=change_me_securely
DB_NAME=projetjs_db
JWT_SECRET=change_me_to_a_very_long_secret
CLIENT_URL=http://YOUR_NAS_IP:8000
VITE_API_URL=http://YOUR_NAS_IP:5001/api
NODE_ENV=production
EOT
    echo -e "${GREEN}Created .env file. PLEASE EDIT IT before proceeding!${NC}"
    echo "Files are in $(pwd)/.env"
    exit 1
fi

# 3. Create necessary directories and set permissions
echo "Setting up directories..."
mkdir -p backend/uploads
mkdir -p db-data

# Set permissions for uploads (allow container node user to write)
chmod 777 backend/uploads

# 4. Run Docker Compose
echo -e "${GREEN}Building and starting containers...${NC}"
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml down --remove-orphans
$DOCKER_COMPOSE_CMD -f docker-compose.prod.yml up -d --build

# 5. Verify deployment
if [ $? -eq 0 ]; then
    echo -e "${GREEN}Deployment successful!${NC}"
    echo "Backend running on port 5001"
    echo "Frontend running on port 80 (mapped to host)"
    echo "Use 'docker logs projetjs-backend' to see server logs."
else
    echo -e "${RED}Deployment failed.${NC}"
    exit 1
fi
