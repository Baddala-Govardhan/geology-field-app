# Deploying on AWS (for instructor / IT)

This app runs as **two Docker containers**: **Nginx + React** (public website) and **CouchDB** (database). Students use one URL; the browser talks to CouchDB through `/couchdb/` on the same host.

## What you need on AWS

| Piece | Role |
|--------|------|
| **EC2** (Linux, e.g. Ubuntu 22.04) | Runs Docker Compose; hosts both services |
| **Security group** | Allow **SSH (22)** from your IP; allow **HTTP** to the app port (see below) |
| **Optional** | Elastic IP (stable public IP), Route 53 domain, ACM + ALB or nginx + Let’s Encrypt for HTTPS |

## Files that matter in this repository

These are required to build and run on the server:

- `docker-compose.yml` — starts CouchDB + frontend
- `Dockerfile` — builds the React app and nginx image
- `nginx/nginx.conf` — serves the UI and proxies `/couchdb/` to CouchDB
- `package.json`, `package-lock.json`, `src/`, `public/` — React application source

Data persists on the EC2 disk under `couchdb/data/` (bind mount).

## Step 1 — Launch EC2

1. In **AWS Console** → **EC2** → **Launch instance**.
2. **AMI:** Ubuntu Server 22.04 LTS (or newer).
3. **Instance type:** `t3.small` or larger is comfortable; `t3.micro` can work for light class use.
4. **Key pair:** Create or select an SSH key; download the `.pem`.
5. **Network:** Use a **security group** with:
   - **Inbound TCP 22** — your IP only (SSH).
   - **Inbound TCP 3000** — `0.0.0.0/0` for class access **or** restrict to campus/VPN if you prefer.
6. **Storage:** At least **20 GiB** gp3 (CouchDB + images + logs).
7. Launch the instance and note the **public IPv4 address**.

**Public URL (HTTP, no domain):** `http://YOUR_PUBLIC_IP:3000`

## Step 2 — Install Docker on the instance

SSH in (replace key path and host):

```bash
chmod 400 your-key.pem
ssh -i your-key.pem ubuntu@YOUR_PUBLIC_IP
```

Then:

```bash
sudo apt update && sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Log out and SSH in again (so `docker` works without `sudo`), or run `newgrp docker`.

## Step 3 — Clone and start the stack

```bash
git clone https://github.com/Baddala-Govardhan/geology-field-app.git
cd geology-field-app
docker compose up -d --build
```

First build may take several minutes.

## Step 4 — Verify

- **App:** open `http://YOUR_PUBLIC_IP:3000`
- **CouchDB UI (Fauxton):** `http://YOUR_PUBLIC_IP:3000/couchdb/_utils` — login `app` / `app` (change before production; see below)

**Admin login in the app:** default credentials are in `src/utils/auth.js` (or override with `REACT_APP_ADMIN_USER` / `REACT_APP_ADMIN_PASSWORD` at **build** time in `Dockerfile` if you add `ARG`/`ENV` and rebuild).

## Operations

| Action | Command |
|--------|---------|
| Logs | `docker compose logs -f` |
| Restart after code update | `git pull && docker compose up -d --build` |
| Stop | `docker compose down` |

## Security (before real students use it)

1. **Change CouchDB user/password** in `docker-compose.yml` and update `nginx/nginx.conf` if you inject Basic auth there (currently uses `app:app` in the proxy header).
2. **Change admin app password** — edit `src/utils/auth.js` defaults or build with env vars.
3. Prefer **HTTPS** (Application Load Balancer + ACM certificate, or Caddy/nginx on the host with Let’s Encrypt) and then use **port 443** instead of exposing 3000 directly.

## Optional: HTTPS on port 443 without ALB

Install **Caddy** or **nginx** on the EC2 host, obtain a certificate for your domain, and reverse-proxy to `http://127.0.0.1:3000`. Point your domain’s **A record** to the instance (or Elastic IP).

## Troubleshooting

- **Cannot reach :3000** — Check EC2 **security group** inbound rules and OS firewall (`sudo ufw status`).
- **Admin shows no data** — CouchDB must be reachable from the browser at `http(s)://same-host/couchdb/...`; with this Docker setup, that path is handled by the **frontend** container’s nginx.
