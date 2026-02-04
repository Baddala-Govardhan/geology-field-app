## Geology Field App

Simple React-based field data collection UI backed by CouchDB, fully containerized with Docker.

- **Live demo (GitHub Pages)**: `https://baddala-govardhan.github.io/geology-field-app/`

---

## Architecture (Docker-first)

- **frontend (Nginx + React)**:
  - Builds the React app inside the image.
  - Serves the static UI via Nginx.
  - Proxies all requests under `/couchdb/` to the CouchDB container.
- **couchdb**:
  - Official `couchdb:latest` image.
  - Database `geology-data` auto-created on startup.
  - Credentials: username `app`, password `app`.
  - Data persisted to a host folder via a Docker volume.

All services are started and wired together by `docker-compose.yml`. No host-level Nginx or extra install scripts are required.

---

## Prerequisites

- **Docker** (Docker Desktop on macOS/Windows, or Docker Engine on Linux)
- **Docker Compose v2** (`docker compose` command)

You do **not** need Node.js, Nginx, or CouchDB installed on your machine.

---

## Running the app with Docker

From the project root:

```bash
docker compose up --build
```

This will:

- Build the frontend image (React build + Nginx).
- Start the `couchdb` container.
- Start the `frontend` (Nginx) container.

Once the containers are up:

- **Frontend UI**: `http://localhost:3000`
- **CouchDB admin (Fauxton)**: `http://localhost:3000/couchdb/_utils`
  - Username: `app`
  - Password: `app`

To run in the background:

```bash
docker compose up -d --build
```

To stop everything:

```bash
docker compose down
```

---

## Data persistence (CouchDB volume)

CouchDB data is stored in a folder on your local machine via a bind-mounted Docker volume:

- Host path: `./couchdb/data`
- Container path: `/opt/couchdb/data`

This means:

- Stopping and starting containers does **not** delete your data.
- To completely reset the database, you can remove the `couchdb/data` folder (with containers stopped), then run `docker compose up --build` again.

---

## Container layout

- **`frontend` service**
  - Built from `Dockerfile`.
  - Uses `nginx/nginx.conf` to:
    - Serve the React build from `/usr/share/nginx/html`.
    - Proxy `/couchdb/…` requests to the `couchdb` service with proper CORS and auth headers.

- **`couchdb` service**
  - Configured via environment variables in `docker-compose.yml`.
  - Initialization script: `couchdb/init.sh`
    - Waits for CouchDB to be ready.
    - Creates the `geology-data` database if it does not already exist.

Both services share the default Docker network created by Compose, so `nginx` can reach CouchDB at the hostname `couchdb`.

---

## Troubleshooting

- **See running containers**

```bash
docker compose ps
```

- **View logs**

```bash
docker compose logs -f
```

- **Rebuild after code changes**

```bash
docker compose up --build
```

If you run into issues starting containers, try:

```bash
docker compose down
docker compose up --build
```

