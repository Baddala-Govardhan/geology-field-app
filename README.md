# Geology Field Data Collection System

# Live Link - https://baddala-govardhan.github.io/geology-field-app/#home 

As of now it's just a webpage which's connected to docker and storing data in pouchdb and couchdb

## Steps to run

### 1. Clone and Install Node Modules

```bash
npm install
```

### 2. Build React App

```bash
npm run build
```

### 3. Run Docker Containers

#### Start CouchDB

```bash
docker run -d \
  --name couchdb \
  -e COUCHDB_USER=app \
  -e COUCHDB_PASSWORD=app \
  -p 5984:5984 \
  couchdb
```

Use username and password **"app"** and check the default link for couchdb: http://localhost:5984/_utils

#### Start Frontend (React + Nginx)

```bash
docker build -t geology-field-app .
docker run -d -p 3000:80 geology-field-app
```

Frontend app URL: http://localhost:3000

## Screenshots

<img width="2940" height="1764" alt="Home Page" src="https://github.com/user-attachments/assets/7d19252b-cb09-41bf-9b4a-3058de5ecb4e" />

<img width="1470" height="882" alt="Grain Size Form" src="https://github.com/user-attachments/assets/10867e05-8193-4976-a855-771a78e160ec" />

<img width="2940" height="1764" alt="Flow Measurement Form" src="https://github.com/user-attachments/assets/1ac78238-a22c-4e68-9562-ec4bb9f60006" />

## Features

- Grain Size data collection with GPS coordinates
- Flow Measurement data collection
- Contact form
- Real-time data sync with CouchDB
- Offline-first with PouchDB
