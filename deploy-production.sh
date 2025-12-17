#!/bin/bash

# Geology Field App - One-Command Production Deployment
# This script automates the entire deployment process

set -e  # Exit on error

echo "========================================="
echo "Geology Field App - Production Deployment"
echo "========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running as root or with sudo
if [ "$EUID" -ne 0 ]; then 
    echo -e "${YELLOW}Note: Some commands require sudo. You may be prompted for password.${NC}"
fi

# Step 1: Update system
echo -e "\n${GREEN}[1/12] Updating system packages...${NC}"
sudo apt update && sudo apt upgrade -y

# Step 2: Install Docker
echo -e "\n${GREEN}[2/12] Installing Docker...${NC}"
if ! command -v docker &> /dev/null; then
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo systemctl start docker
    sudo systemctl enable docker
    echo -e "${GREEN}Docker installed successfully${NC}"
else
    echo -e "${YELLOW}Docker is already installed${NC}"
fi

# Step 3: Install Docker Compose
echo -e "\n${GREEN}[3/12] Installing Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed successfully${NC}"
else
    echo -e "${YELLOW}Docker Compose is already installed${NC}"
fi

# Step 4: Install Node.js
echo -e "\n${GREEN}[4/12] Installing Node.js...${NC}"
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
    echo -e "${GREEN}Node.js installed successfully${NC}"
else
    echo -e "${YELLOW}Node.js is already installed${NC}"
fi

# Step 5: Install Git
echo -e "\n${GREEN}[5/12] Installing Git...${NC}"
if ! command -v git &> /dev/null; then
    sudo apt install -y git
    echo -e "${GREEN}Git installed successfully${NC}"
else
    echo -e "${YELLOW}Git is already installed${NC}"
fi

# Step 6: Clone or update repository
echo -e "\n${GREEN}[6/12] Setting up repository...${NC}"
REPO_DIR="/opt/geology-field-app"

if [ -d "$REPO_DIR" ]; then
    echo -e "${YELLOW}Repository exists, updating...${NC}"
    cd $REPO_DIR
    git pull origin main || echo "Note: Could not pull updates"
else
    echo -e "${GREEN}Cloning repository...${NC}"
    sudo mkdir -p /opt
    cd /opt
    sudo git clone https://github.com/Baddala-Govardhan/geology-field-app.git
    sudo chown -R $USER:$USER geology-field-app
    cd geology-field-app
fi

# Step 7: Build frontend
echo -e "\n${GREEN}[7/12] Building frontend...${NC}"
npm install
npm run build

# Step 8: Start Docker containers
echo -e "\n${GREEN}[8/12] Starting Docker containers...${NC}"
docker compose up -d --build

# Step 9: Wait for CouchDB to be ready
echo -e "\n${GREEN}[9/12] Waiting for CouchDB to start...${NC}"
sleep 10

# Step 10: Create database
echo -e "\n${GREEN}[10/12] Creating database...${NC}"
curl -X PUT http://app:app@localhost:5984/geology-data 2>/dev/null || echo "Database may already exist"

# Step 11: Install and configure Nginx
echo -e "\n${GREEN}[11/12] Installing and configuring Nginx...${NC}"
if ! command -v nginx &> /dev/null; then
    sudo apt install -y nginx
fi

# Create Nginx configuration
sudo tee /etc/nginx/sites-available/geology-app > /dev/null <<'EOF'
server {
    listen 80;
    server_name _;

    # Frontend
    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # CouchDB Proxy
    location /couchdb/ {
        rewrite ^/couchdb/(.*) /$1 break;
        proxy_pass http://127.0.0.1:5984;
        proxy_redirect off;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Authorization "Basic YXBwOmFwcA==";
        
        # CORS headers
        if ($request_method = 'OPTIONS') {
            add_header 'Access-Control-Allow-Origin' '*' always;
            add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
            add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;
            add_header 'Access-Control-Max-Age' 1728000;
            add_header 'Content-Type' 'text/plain; charset=utf-8';
            add_header 'Content-Length' 0;
            return 204;
        }
        
        add_header 'Access-Control-Allow-Origin' '*' always;
        add_header 'Access-Control-Allow-Methods' 'GET, POST, PUT, DELETE, OPTIONS' always;
        add_header 'Access-Control-Allow-Headers' 'Authorization, Content-Type, Accept' always;
        proxy_buffering off;
    }
}
EOF

# Enable site
sudo ln -sf /etc/nginx/sites-available/geology-app /etc/nginx/sites-enabled/
sudo rm -f /etc/nginx/sites-enabled/default  # Remove default site
sudo nginx -t && sudo systemctl restart nginx

# Step 12: Configure firewall
echo -e "\n${GREEN}[12/12] Configuring firewall...${NC}"
sudo ufw allow 22/tcp 2>/dev/null || true
sudo ufw allow 80/tcp 2>/dev/null || true
sudo ufw allow 443/tcp 2>/dev/null || true
sudo ufw --force enable 2>/dev/null || true

# Get server IP
SERVER_IP=$(curl -s ifconfig.me || hostname -I | awk '{print $1}')

# Summary
echo -e "\n${GREEN}========================================="
echo "Deployment Complete!"
echo "=========================================${NC}"
echo ""
echo "Your application is now live!"
echo ""
echo "Access URLs:"
echo "  - Frontend: http://$SERVER_IP"
echo "  - CouchDB Admin: http://$SERVER_IP/couchdb/_utils"
echo ""
echo "CouchDB Credentials:"
echo "  - Username: app"
echo "  - Password: app"
echo ""
echo "If you have a domain name, update the Nginx config:"
echo "  sudo nano /etc/nginx/sites-available/geology-app"
echo "  (Change 'server_name _;' to 'server_name your-domain.com;')"
echo "  sudo nginx -t && sudo systemctl reload nginx"
echo ""
echo "To set up SSL (HTTPS):"
echo "  sudo apt install -y certbot python3-certbot-nginx"
echo "  sudo certbot --nginx -d your-domain.com"
echo ""

