# Geology Field Data Collection System

# Live Link - https://baddala-govardhan.github.io/geology-field-app/    I just deployed in my github 

## Deployment steps

## One-Command Deployment

Deploy the entire application (website + CouchDB) with a single command:

### Step 1: Connect to Server

```bash
ssh username@your-server-ip
```

### Step 2: Run Deployment Script

```bash
curl -fsSL https://raw.githubusercontent.com/Baddala-Govardhan/geology-field-app/main/deploy-production.sh | bash
```

**OR** if you prefer to download first:

```bash
wget https://raw.githubusercontent.com/Baddala-Govardhan/geology-field-app/main/deploy-production.sh
chmod +x deploy-production.sh
./deploy-production.sh
```

That's it! The script will automatically:
- Install Docker and Docker Compose
- Install Node.js
- Clone the repository
- Build the frontend
- Start CouchDB and frontend containers
- Create the database
- Configure Nginx reverse proxy
- Set up firewall

### Step 3: Access Your Application

After deployment completes, you'll see the access URLs:

- **Frontend**: `http://your-server-ip`
- **CouchDB Admin**: `http://your-server-ip/couchdb/_utils`
  - Username: `app`
  - Password: `app`

---

## Optional: Use Domain Name

If you have a domain name:

1. Edit Nginx config:
   ```bash
   sudo nano /etc/nginx/sites-available/geology-app
   ```

2. Change this line:
   ```nginx
   server_name _;
   ```
   To:
   ```nginx
   server_name your-domain.com;
   ```

3. Test and reload:
   ```bash
   sudo nginx -t
   sudo systemctl reload nginx
   ```

4. Update DNS: Point your domain to the server IP

---

## Optional: Set Up SSL (HTTPS)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

---

## Troubleshooting

### Check if services are running:
```bash
docker compose ps
```

### View logs:
```bash
docker compose logs -f
```

### Restart services:
```bash
cd /opt/geology-field-app
docker compose restart
```

### Update application:
```bash
cd /opt/geology-field-app
git pull origin main
npm install
npm run build
docker compose up -d --build frontend
```

---

## That's All!

The deployment script handles everything automatically. Just run the one command and wait for it to complete!

