#!/bin/bash
set -e

# Wait for CouchDB to be up
until curl -s http://127.0.0.1:5984/ >/dev/null; do
  echo "Waiting for CouchDB..."
  sleep 2
done

# Create database if it doesn't exist
curl -u app:app -X PUT http://127.0.0.1:5984/geology-data || true

echo "CouchDB initialized with geology-data DB"
