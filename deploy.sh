#!/bin/bash

# Geology Field App - Deployment Script
# Run this script on your production server

set -e  # Exit on error

echo "========================================="
echo "Geology Field App - Deployment Script"
echo "========================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Note: Some commands require sudo. You may be prompted for password.${NC}"
fi

# Step 1: Update system
echo -e "\n${GREEN}[1/8] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Step 2: Install Docker
echo -e "\n${GREEN}[2/8] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    echo -e "${GREEN}Docker installed successfully${NC}"
else
    echo -e "${YELLOW}Docker is already installed${NC}"
fi

# Step 3: Install Docker Compose
echo -e "\n${GREEN}[3/8] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed successfully${NC}"
else
    echo -e "${YELLOW}Docker Compose is already installed${NC}"
fi

# Step 4: Install Node.js
echo -e "\n${GREEN}[4/8] Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}Node.js installed successfully${NC}"
else
    echo -e "${YELLOW}Node.js is already installed${NC}"
fi

# Step 5: Install Git
echo -e "\n${GREEN}[5/8] Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    echo -e "${GREEN}Git installed successfully${NC}"
else
    echo -e "${YELLOW}Git is already installed${NC}"
fi

# Step 6: Clone or update repository
echo -e "\n${GREEN}[6/8] Setting up repository...${NC}"
REPO_DIR="/opt/geology-field-app"

if [ -d "$REPO_DIR" ]; then
    echo -e "${YELLOW}Repository exists, updating...${NC}"
    cd $REPO_DIR
    git pull origin main
else
    echo -e "${GREEN}Cloning repository...${NC}"
    sudo mkdir -p /opt
    cd /opt
    sudo git clone https://github.com/Baddala-Govardhan/geology-field-app.git
    sudo chown -R $USER:$USER geology-field-app
    cd geology-field-app
fi

# Step 7: Build frontend
echo -e "\n${GREEN}[7/8] Building frontend...${NC}"
npm install
npm run build

# Step 8: Start Docker containers
echo -e "\n${GREEN}[8/8] Starting Docker containers...${NC}"
docker compose up -d --build

# Summary
echo -e "\n${GREEN}========================================="
echo "Deployment Complete!"
echo "=========================================${NC}"
echo ""
echo "Your application is now running!"
echo ""
echo "Access URLs:"
echo "  - Frontend: http://$(hostname -I | awk '{print $1}'):3000"
echo "  - CouchDB: http://$(hostname -I | awk '{print $1}'):5984/_utils"
echo ""
echo "Next steps:"
echo "  1. Set up Nginx reverse proxy (see DEPLOYMENT_GUIDE.md)"
echo "  2. Configure SSL certificate (optional)"
echo "  3. Update CouchDB credentials in docker-compose.yml"
echo ""
echo "For detailed instructions, see:"
echo "  - DEPLOYMENT_GUIDE.md (complete guide)"
echo "  - QUICK_DEPLOY.md (quick reference)"
echo ""

