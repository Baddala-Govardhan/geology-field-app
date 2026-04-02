## Geology Field App

Simple React-based field data collection UI backed by CouchDB, fully containerized with Docker.

---

## Architecture (Docker-first)

- **frontend (Nginx + React)**  
  - Serves the React app at `/`.  
  - **`/couchdb/…`** — proxies to CouchDB **without** injecting credentials. The browser uses the **CouchDB session cookie** after you log in (same mechanism as localhost).  
  - **`/couchdb-login`** — shows the real **Fauxton “Log In to CouchDB”** UI in a frame (same as **`http://127.0.0.1:5984/_utils/#login`**). After logging in, click **Continue to Geology Field Data**. You can also open **`/couchdb/_utils/#login`** directly on the hosted site. PouchDB sync sends **`credentials: include`** so that session is used for **`/couchdb/geology-data`**. Unauthenticated **`curl`** to **`/couchdb/`** still gets **401**.  
  - **`server_name`** defaults to **`fielddb.roualdes.us`**; override with **`NGINX_SERVER_NAME`** in **`.env`** (e.g. `localhost` for local testing).

- **couchdb**  
  - On startup, creates the **`geology-data`** database if it does not exist (using **`COUCHDB_USER`** / **`COUCHDB_PASSWORD`**).  
  - CouchDB’s HTTP port **5984** is bound to **`127.0.0.1`** on the host so it is not exposed to the public internet; access is normally through nginx at **`/couchdb/`**.

All services are defined in **`docker-compose.yml`**. Copy **`.env.example`** to **`.env`** to set passwords, domain name, and port. Changing **`COUCHDB_USER`** / **`COUCHDB_PASSWORD`** updates the CouchDB accounts used at the Fauxton login — you do **not** need to rebuild the React app for that.

---

## Prerequisites

- **Docker** (Docker Desktop on macOS/Windows, or Docker Engine on Linux)  
- **Docker Compose v2** (command: `docker compose`)

You do **not** need Node.js, Nginx, or CouchDB installed on the deployment machine; the Docker image builds the React app and runs Nginx inside the container.

---

## Quick start (local machine)

From the project root:

```bash
cp .env.example .env
docker compose up --build
```

By default the app listens on **port 80** on the host (`FRONTEND_PORT=80` in `.env`). If port 80 is already in use, set e.g. `FRONTEND_PORT=8080` in `.env` and open `http://localhost:8080/`.

- **Web app:** `http://localhost/` (or `http://localhost:FRONTEND_PORT/`)  
- **Fauxton login:** **`http://localhost/couchdb/_utils/#login`** (or your `FRONTEND_PORT`) — same UI as **`127.0.0.1:5984/_utils`**. The app’s **`/couchdb-login`** route embeds this for you. For local dev you may set `NGINX_SERVER_NAME=localhost` in `.env` so the server name matches.

Background mode:

```bash
docker compose up -d --build
```

Stop:

```bash
docker compose down
```

---

## Deployment guide (step by step — for production / class demo)

Use this section to deploy on a cloud **Linux VM** (e.g. AWS EC2, DigitalOcean Droplet, university server) so the app is reachable on a **public IP** or **domain name**.

### Step 1 — Create a server

1. Create a **Linux** VM (Ubuntu 22.04 LTS is a good default).  
2. Note the **public IPv4 address** (e.g. `203.0.113.50`).  
3. **Security group / firewall:**  
   - Allow **SSH**: TCP **22** from **your IP** (or your campus VPN), not from `0.0.0.0/0` if you can avoid it.  
   - Allow **HTTP**: TCP **80** (and **443** if you will use HTTPS later) from the internet (or from the networks that must use the app).

### Step 2 — Connect with SSH

On your laptop (replace paths and IP):

```bash
chmod 400 /path/to/your-key.pem
ssh -i /path/to/your-key.pem ubuntu@YOUR_PUBLIC_IP
```

Use the username your cloud provider documents (`ubuntu`, `ec2-user`, etc.).

### Step 3 — Install Git and Docker on the server

```bash
sudo apt update && sudo apt install -y ca-certificates curl git
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
```

Log out and SSH in again (or run `newgrp docker`) so your user can run `docker` without `sudo`.

Verify:

```bash
docker --version
docker compose version
```

### Step 4 — Clone the repository

```bash
cd ~
git clone https://github.com/Baddala-Govardhan/geology-field-app.git
cd geology-field-app
```

If the repository is private, use SSH or a personal access token as your instructor requires.

### Step 5 — Configure environment variables

```bash
cp .env.example .env
nano .env
```

Edit at least:

| Variable | Meaning |
|----------|--------|
| `COUCHDB_USER` / `COUCHDB_PASSWORD` | CouchDB admin (change defaults before real production use). Used when signing in through **Fauxton** (`/couchdb-login` or `/couchdb/_utils/`). Not stored in the frontend bundle — the browser keeps a **session cookie** after login. |
| `NGINX_SERVER_NAME` | Your **domain name** (e.g. `fielddb.example.edu`) or `localhost` for IP-only testing. |
| `FRONTEND_PORT` | Host port mapped to the web server (default **80**). Use **8080** if 80 is taken. |
| `PUBLIC_URL` | URL path prefix for the React app. Use **`/`** if the app is at the root of the domain (recommended for Docker). |

Save and exit (`Ctrl+O`, Enter, `Ctrl+X` in nano).

### Offline (field use): what to do **before** and **after** deploy

There is **no separate “offline mode” switch** in `.env` or Docker. Local data and sync are built into the app. Use this checklist so students can **save data offline** and (where possible) **reload the page without internet**.

**Before you deploy (planning)**

1. **`PUBLIC_URL` in `.env`** — Must match how the site is served. For “app at the root of the domain” (typical), use **`PUBLIC_URL=/`**. A wrong value breaks asset URLs and can break **offline caching** of the app shell.  
2. **HTTPS for a public domain** — If you want **refresh / reopen the site while offline** on phones and laptops (not only `localhost`), plan **HTTPS** (see Step 9). Browsers generally **do not register the service worker** on plain **`http://your-domain`** (only `https://` and `http://localhost` / `127.0.0.1` are treated as secure enough). **Data entry still works offline** in PouchDB after the first load even without a service worker, but **reloading the tab** without network is much more reliable with HTTPS + service worker.  
3. **Nothing extra to build** — `docker compose up --build` already creates a **production** frontend build that includes the service worker (no extra `npm` flags).

**After deploy (tell students / test yourself)**

1. **Open the app once while online** on each device (classroom or lab Wi‑Fi). That lets the browser download and cache the app and register the service worker (on HTTPS).  
2. **Allow location** when the browser asks, if you need GPS on the grain form.  
3. **Optional:** In Chrome/Edge/Safari, check **Application → Service Workers** in DevTools on the deployed URL to confirm the worker is registered (helps debug “offline refresh doesn’t work”).

**Summary**

| Goal | Server requirement |
|------|-------------------|
| Enter data with no signal | Works after first successful load; PouchDB stores locally. |
| Reload the page with no signal | Best with **HTTPS** + one prior online visit. |

### Step 6 — (Optional) Point a domain name to the server

1. In your DNS provider, create an **A record**: hostname (e.g. `fielddb`) → your VM’s **public IP**.  
2. Wait for DNS to propagate (often minutes to a few hours).  
3. Set `NGINX_SERVER_NAME` in `.env` to that hostname (e.g. `fielddb.example.edu`).

### Step 7 — Build and start the stack

From the project directory:

```bash
docker compose up -d --build
```

This will:

- Build the **frontend** image (runs `npm run build` inside the image, then copies `nginx/nginx.conf` to Nginx).  
- Start **CouchDB** with persistent data under `./couchdb/data`.  
- Start **frontend** (Nginx) on the host port you configured (`FRONTEND_PORT`).

Check status:

```bash
docker compose ps
```

View logs if something fails:

```bash
docker compose logs -f
```

### Step 8 — Verify it works

In a browser (replace `YOUR_IP` or use your domain):

- **App:** `http://YOUR_PUBLIC_IP/` or `http://your.domain/`  
- **Fauxton:** **`https://your-domain/couchdb/_utils/#login`** on the host, or **`http://127.0.0.1:5984/_utils/`** via SSH/tunnel on the server.

If you used `FRONTEND_PORT=8080`, use `http://YOUR_PUBLIC_IP:8080/` instead.

### Step 9 — HTTPS (recommended for production)

- **HTTPS** encrypts traffic and allows the **service worker** (offline reload after install) to register on a **public HTTPS** origin.  
- Typical approach: put **Caddy** or **Nginx** on the host with **Let’s Encrypt**, or use a **reverse proxy** (e.g. Cloudflare, AWS ALB) in front of the VM.  
- That layer terminates TLS on **443** and forwards HTTP to **`localhost:80`** (or your `FRONTEND_PORT`).  
- Detailed TLS setup depends on your university/cloud policy; this repo ships HTTP on port 80 inside Compose by default.

### Step 10 — Updating the app after code changes

On the server:

```bash
cd ~/geology-field-app
git pull
docker compose up -d --build
```

---

## Data persistence (CouchDB)

CouchDB data is stored on the host:

- Host path: `./couchdb/data` (under the project folder)  
- Container path: `/opt/couchdb/data`

Stopping containers does **not** delete this folder. To **reset** the database completely: `docker compose down`, remove `couchdb/data` (backup first if needed), then `docker compose up -d --build`.

---

## Container layout

- **`frontend`** — Built from `Dockerfile` (`node` build stage + `nginx:alpine`). Serves React from `/usr/share/nginx/html` and proxies `/couchdb/` to the `couchdb` service.  
- **`couchdb`** — Official `couchdb` image; env vars and startup command in `docker-compose.yml`.

Both services are on the same Docker network; Nginx reaches CouchDB at hostname **`couchdb:5984`**.

---

## Offline use (field work)

For a **checklist of what to plan before deploy** (HTTPS, `PUBLIC_URL`, first online visit), see **Deployment guide → “Offline (field use): what to do before and after deploy”** above.

- **Data entry:** The app uses **PouchDB** in the browser; records can be saved locally and sync when the server is reachable again.  
- **Reloading the page without internet:** A **service worker** is registered in production builds. On a **public HTTPS** site, users should open the app **once while online** so the browser can cache the app; then **refresh** works more reliably offline. Plain **HTTP** on a non-localhost domain often **does not** register the service worker.  
- **Local development:** `http://localhost` / `http://127.0.0.1` are exceptions for service worker registration.

---

## Troubleshooting

```bash
docker compose ps
docker compose logs -f
docker compose down
docker compose up --build
```

If port **80** is in use, set `FRONTEND_PORT=8080` in `.env` and open the matching URL.

---

## Security notes (before wide production use)

- Change default **`COUCHDB_USER`** / **`COUCHDB_PASSWORD`**. Login is through **Fauxton** (hosted at **`/couchdb/_utils/`**); the app uses CouchDB’s **session cookie**, not passwords in the JS bundle. **Log out of CouchDB** in the app footer ends the session.  
- **One shared CouchDB password for the whole class** still means everyone who learns it can sync. For **per-person secrets**, create **separate CouchDB users** in **`_users`**, add them as **members** of **`geology-data`** (Fauxton → **Permissions**), and give each student only their account ([CouchDB security](https://docs.couchdb.org/en/stable/api/database/security.html)).  
- **Fauxton on the public URL** is an admin-capable UI; lock down **`COUCHDB_*`**, use **HTTPS**, and restrict SSH.  
- Prefer **HTTPS** on the public URL. Restrict who can SSH into the VM.
